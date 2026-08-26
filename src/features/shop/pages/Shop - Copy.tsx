import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import ShopHeader from "../components/ShopHeader";

import ProductGrid from "../components/ProductGrid";

import ShopFilterDrawer, {
  type ShopFilterValues,
} from "../components/ShopFilterDrawer";

import ActiveFilterChips from "../components/ActiveFilterChips";

import {
  useShopProducts,
} from "../hooks/useShopProducts";

import {
  collectionSearchService,
} from "@/features/collections/services/collectionSearch.service";

import type {
  SearchCollection,
} from "@/features/collections/services/collectionSearch.service";

import {
  useShopCategories,
} from "../hooks/useShopCategories";

import type {
  ShopProduct,
} from "../types/shop.types";


type SortOption =
  | "featured"
  | "newest"
  | "best-selling"
  | "trending"
  | "price-low"
  | "price-high"
  | "discount"
  | "rating";


/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function slugify(
  value?: string | null
) {
  return (
    value
      ?.trim()
      .toLowerCase()
      .replace(
        /[-_\s]+/g,
        "-"
      ) ?? ""
  );
}


function getDiscount(
  product: ShopProduct
) {
  if (
    !product.compare_price ||
    product.compare_price <= product.price
  ) {
    return 0;
  }

  return Math.round(
    (
      (
        product.compare_price -
        product.price
      ) /
      product.compare_price
    ) * 100
  );
}


/*
 * =========================================================
 * SPECIFICATIONS SEARCH HELPER
 * =========================================================
 *
 * specifications is a JSONB field in products.
 *
 * Example:
 *
 * {
 *   "Material": "Stainless Steel",
 *   "Finish": "18K Gold Plated",
 *   "Features": [
 *      "Anti Tarnish",
 *      "Water Resistant"
 *   ]
 * }
 *
 * This helper recursively converts all keys and values
 * into searchable text.
 */

function getSpecificationsSearchText(
  specifications: unknown
): string {

  if (
    specifications === null ||
    specifications === undefined
  ) {
    return "";
  }


  if (
    typeof specifications === "string" ||
    typeof specifications === "number" ||
    typeof specifications === "boolean"
  ) {
    return String(
      specifications
    );
  }


  if (
    Array.isArray(
      specifications
    )
  ) {

    return specifications
      .map(
        (
          item
        ) =>
          getSpecificationsSearchText(
            item
          )
      )
      .join(" ");

  }


  if (
    typeof specifications === "object"
  ) {

    return Object.entries(
      specifications as Record<
        string,
        unknown
      >
    )
      .map(
        (
          [
            key,
            value,
          ]
        ) =>
          `${key} ${getSpecificationsSearchText(
            value
          )}`
      )
      .join(" ");

  }


  return "";

}


/*
 * =========================================================
 * NORMALIZED SEARCH
 * =========================================================
 *
 * Makes search tolerant of:
 *
 * Anti Tarnish
 * Anti-Tarnish
 * anti_tarnish
 * ANTITARNISH
 *
 * It also collapses repeated whitespace.
 */

function normalizeSearchText(
  value?: unknown
): string {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }


  return String(
    value
  )
    .toLowerCase()
    .normalize("NFKC")
    .replace(
      /[-_]+/g,
      " "
    )
    .replace(
      /[^\p{L}\p{N}]+/gu,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


/*
 * Compact version used as a fallback so:
 *
 * anti tarnish
 * anti-tarnish
 * antitarnish
 *
 * can all match one another.
 */

function compactSearchText(
  value?: unknown
): string {

  return normalizeSearchText(
    value
  ).replace(
    /\s+/g,
    ""
  );

}


/*
 * Search a product field using both normal and compact
 * normalized forms.
 */

function matchesSearch(
  field: unknown,
  normalizedQuery: string,
  compactQuery: string
): boolean {

  const normalizedField =
    normalizeSearchText(
      field
    );


  if (
    !normalizedField
  ) {
    return false;
  }


  if (
    normalizedField.includes(
      normalizedQuery
    )
  ) {
    return true;
  }


  return compactSearchText(
    normalizedField
  ).includes(
    compactQuery
  );

}


/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function Shop() {


  /*
   * =======================================================
   * PRODUCTS
   * =======================================================
   */

  const {
    data: products = [],
    isLoading,
    isError,
  } = useShopProducts();


  /*
   * =======================================================
   * CATEGORIES
   * =======================================================
   */

  const {
    data: shopCategories = [],
    isLoading:
      isCategoriesLoading,
    isError:
      isCategoriesError,
  } = useShopCategories();


  /*
   * =======================================================
   * SEARCH
   * =======================================================
   */

  const [
    search,
    setSearch,
  ] = useState("");


  /*
   * =======================================================
   * DATABASE COLLECTION MAPPINGS
   * =======================================================
   *
   * Curated collections are the source of truth for: 
   * Best Sellers, New Arrivals, Trending, Editor's Pick
   * and Featured. Products are mapped through:
   *
   * collections -> product_collections -> products
   */

  const [
    collectionMappings,
    setCollectionMappings,
  ] = useState<
    Record<string, SearchCollection | null>
  >({});

  const [
    areCollectionsLoading,
    setAreCollectionsLoading,
  ] = useState(true);


  /*
   * =======================================================
   * URL PARAMS
   * =======================================================
   */

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();


  /*
   * =======================================================
   * SYNC SEARCH FROM URL
   * =======================================================
   */

  useEffect(() => {

    const searchParam =
      searchParams.get(
        "search"
      ) ?? "";


    setSearch(
      searchParam
    );

  }, [
    searchParams,
  ]);


  /*
   * =======================================================
   * COLLECTION PARAM
   * =======================================================
   */

  const collectionParam =
    searchParams.get(
      "collection"
    );


  /*
   * =======================================================
   * LOAD CURATED COLLECTIONS
   * =======================================================
   */

  useEffect(() => {

    let cancelled = false;

    const loadCollections = async () => {

      setAreCollectionsLoading(true);

      try {

        const collectionNames = [
          "Best Sellers",
          "New Arrivals",
          "Trending",
          "Editor's Pick",
          "Featured",
        ];

        const entries = await Promise.all(
          collectionNames.map(
            async (name) => {
              try {
                const collection =
                  await collectionSearchService.findCollection(
                    name
                  );

                return [
                  slugify(name),
                  collection,
                ] as const;
              } catch {
                return [
                  slugify(name),
                  null,
                ] as const;
              }
            }
          )
        );

        if (!cancelled) {
          setCollectionMappings(
            Object.fromEntries(entries)
          );
        }

      } finally {

        if (!cancelled) {
          setAreCollectionsLoading(false);
        }

      }

    };

    void loadCollections();

    return () => {
      cancelled = true;
    };

  }, []);


  /*
   * =======================================================
   * ACTIVE URL COLLECTION
   * =======================================================
   */

  const [
    activeUrlCollection,
    setActiveUrlCollection,
  ] = useState<SearchCollection | null>(null);

  useEffect(() => {

    let cancelled = false;

    const loadUrlCollection = async () => {

      if (!collectionParam) {
        setActiveUrlCollection(null);
        return;
      }

      try {
        const collection =
          await collectionSearchService.findCollection(
            collectionParam
          );

        if (!cancelled) {
          setActiveUrlCollection(collection);
        }
      } catch {
        if (!cancelled) {
          setActiveUrlCollection(null);
        }
      }

    };

    void loadUrlCollection();

    return () => {
      cancelled = true;
    };

  }, [
    collectionParam,
  ]);


  /*
   * =======================================================
   * COLLECTION HELPERS
   * =======================================================
   */

  const getMappedCollection = (
    name: string
  ) =>
    collectionMappings[
      slugify(name)
    ] ?? null;


  const productInCollection = (
    product: ShopProduct,
    collection: SearchCollection | null
  ) =>
    Boolean(
      collection &&
      collection.productIds.includes(
        product.id
      )
    );


  /*
   * =======================================================
   * FILTER DRAWER
   * =======================================================
   */

  const [
    filterOpen,
    setFilterOpen,
  ] = useState(false);


  /*
   * =======================================================
   * VISIBLE PRODUCT COUNT
   * =======================================================
   */

  const [
    visibleProductCount,
    setVisibleProductCount,
  ] = useState(
    Math.min(
      8,
      products.length
    )
  );


  /*
   * =======================================================
   * DYNAMIC CATEGORY NAMES
   * =======================================================
   */

  const categories =
    useMemo(() => {

      return [

        "All",

        ...shopCategories.map(
          (
            category
          ) =>
            category.name
        ),

      ];

    }, [
      shopCategories,
    ]);


  /*
   * =======================================================
   * CATEGORY PARAM
   * =======================================================
   */

  const categoryParam =
    searchParams.get(
      "category"
    );


  /*
   * =======================================================
   * SUBCATEGORY PARAM
   * =======================================================
 */

  const subcategoryParam =
    searchParams.get(
      "subcategory"
    );


  /*
   * =======================================================
   * ACTIVE PARENT CATEGORY
   * =======================================================
   */

  const activeShopCategory =
    useMemo(() => {

      if (
        !categoryParam
      ) {

        return null;

      }


      const value =
        slugify(
          decodeURIComponent(
            categoryParam
          )
        );


      return (

        shopCategories.find(
          (
            category
          ) =>
            slugify(
              category.slug
            ) ===
            value
        ) ??

        null

      );

    }, [
      categoryParam,
      shopCategories,
    ]);


  /*
   * =======================================================
   * ACTIVE CATEGORY NAME
   * =======================================================
   */

  const activeCategory =
    activeShopCategory?.name ??
    "All";


  /*
   * =======================================================
   * ACTIVE SUBCATEGORY
   * =======================================================
   */

  const activeSubcategory =
    useMemo(() => {

      if (
        !activeShopCategory ||
        !subcategoryParam
      ) {

        return null;

      }


      const rawValue =
        decodeURIComponent(
          subcategoryParam
        ).trim();


      const normalizedValue =
        slugify(
          rawValue
        );


      return (

        activeShopCategory
          .subcategories
          .find(
            (
              subcategory
            ) => {

              if (
                subcategory.id ===
                rawValue
              ) {

                return true;

              }


              if (
                subcategory.slug &&
                slugify(
                  subcategory.slug
                ) ===
                normalizedValue
              ) {

                return true;

              }


              return (

                slugify(
                  subcategory.name
                ) ===
                normalizedValue

              );

            }
          ) ??

        null

      );

    }, [
      subcategoryParam,
      activeShopCategory,
    ]);


  /*
   * =======================================================
   * SUBCATEGORY NAMES
   * =======================================================
   */

  const activeSubcategoryNames =
    useMemo(() => {

      if (
        !activeShopCategory
      ) {

        return [];

      }


      return (

        activeShopCategory
          .subcategories
          .map(
            (
              subcategory
            ) =>
              subcategory.name
          )

      );

    }, [
      activeShopCategory,
    ]);


  /*
   * =======================================================
   * SORT
   * =======================================================
   */

  const sort =
    (
      searchParams.get(
        "sort"
      ) as SortOption
    ) || "featured";


  /*
   * =======================================================
   * PRICE
   * =======================================================
   */

  const minPrice =
    Number(
      searchParams.get(
        "minPrice"
      ) || 0
    );


  const maxPriceParam =
    searchParams.get(
      "maxPrice"
    );


  const maxPrice =
    maxPriceParam !== null
      ? Number(
          maxPriceParam
        )
      : null;


  /*
   * =======================================================
   * AVAILABILITY
   * =======================================================
   */

  const inStock =
    searchParams.get(
      "inStock"
    ) === "true";


  /*
   * =======================================================
   * SALE
   * =======================================================
   */

  const onSale =
    searchParams.get(
      "onSale"
    ) === "true";


  /*
   * =======================================================
   * DISCOUNT
   * =======================================================
   */

  const minDiscount =
    Number(
      searchParams.get(
        "discount"
      ) || 0
    );


  /*
   * =======================================================
   * RATING
   * =======================================================
   */

  const minRating =
    Number(
      searchParams.get(
        "rating"
      ) || 0
    );


  /*
   * =======================================================
   * COLLECTION FLAGS
   * =======================================================
   */

  const bestSeller =
    searchParams.get(
      "bestSeller"
    ) === "true";


  const newArrival =
    searchParams.get(
      "newArrival"
    ) === "true";


  const trending =
    searchParams.get(
      "trending"
    ) === "true";


  const editorsPick =
    searchParams.get(
      "editorsPick"
    ) === "true";


  const featured =
    searchParams.get(
      "featured"
    ) === "true";


  /*
   * =======================================================
   * FILTER COUNT
   * =======================================================
   */

  const filterCount =
    Number(
      inStock
    ) +

    Number(
      onSale
    ) +

    Number(
      minDiscount > 0
    ) +

    Number(
      minRating > 0
    ) +

    Number(
      bestSeller
    ) +

    Number(
      newArrival
    ) +

    Number(
      trending
    ) +

    Number(
      editorsPick
    ) +

    Number(
      featured
    ) +

    Number(
      minPrice > 0 ||
      maxPrice !== null
    );


  /*
   * =======================================================
   * UPDATE URL PARAMS
   * =======================================================
   */

  function updateParams(
    updates: Record<
      string,
      string | null
    >
  ) {

    const next =
      new URLSearchParams(
        searchParams
      );


    Object.entries(
      updates
    ).forEach(
      (
        [
          key,
          value,
        ]
      ) => {

        if (
          value === null ||
          value === ""
        ) {

          next.delete(
            key
          );

        } else {

          next.set(
            key,
            value
          );

        }

      }
    );


    setSearchParams(
      next
    );

  }


  /*
   * =======================================================
   * SHOP SEARCH CHANGE
   * =======================================================
   */

  function handleSearchChange(
    value: string
  ) {

    setSearch(
      value
    );


    updateParams({

      search:
        value.trim()
          ? value
          : null,

    });

  }


  /*
   * =======================================================
   * CATEGORY CHANGE
   * =======================================================
   */

  function handleCategoryChange(
    value: string
  ) {

    if (
      value === "All"
    ) {

      updateParams({

        category:
          null,

        subcategory:
          null,

      });

      return;

    }


    const category =
      shopCategories.find(
        (
          item
        ) =>
          item.name ===
          value
      );


    if (
      !category
    ) {

      return;

    }


    updateParams({

      category:
        category.slug,

      subcategory:
        null,

    });

  }


  /*
   * =======================================================
   * SUBCATEGORY CHANGE
   * =======================================================
   */

  function handleSubcategoryChange(
    value: string | null
  ) {

    if (
      !activeShopCategory
    ) {

      return;

    }


    if (
      value === null
    ) {

      updateParams({

        category:
          activeShopCategory.slug,

        subcategory:
          null,

      });

      return;

    }


    const subcategory =
      activeShopCategory
        .subcategories
        .find(
          (
            item
          ) =>
            item.name ===
            value
        );


    if (
      !subcategory
    ) {

      return;

    }


    updateParams({

      category:
        activeShopCategory.slug,

      subcategory:
        subcategory.id,

    });

  }


  /*
   * =======================================================
   * SORT CHANGE
   * =======================================================
   */

  function handleSortChange(
    value: SortOption
  ) {

    updateParams({

      sort:
        value === "featured"
          ? null
          : value,

    });

  }


  /*
   * =======================================================
   * CLEAR FILTERS
   * =======================================================
   */

  function clearFilters() {

    const next =
      new URLSearchParams(
        searchParams
      );


    [
      "minPrice",
      "maxPrice",
      "inStock",
      "onSale",
      "discount",
      "rating",
      "bestSeller",
      "newArrival",
      "trending",
      "editorsPick",
      "featured",
    ].forEach(
      (
        key
      ) => {

        next.delete(
          key
        );

      }
    );


    setSearchParams(
      next
    );

  }


  /*
   * =======================================================
   * REMOVE FILTER
   * =======================================================
   */

  function removeFilter(
    key: string
  ) {

    if (
      key === "price"
    ) {

      updateParams({

        minPrice:
          null,

        maxPrice:
          null,

      });

      return;

    }


    updateParams({

      [key]:
        null,

    });

  }


  /*
   * =======================================================
   * DRAWER FILTERS
   * =======================================================
   */

  function applyDrawerFilters(
    filters: ShopFilterValues
  ) {

    const next =
      new URLSearchParams(
        searchParams
      );


    function setBooleanParam(
      key: string,
      value: boolean
    ) {

      if (
        value
      ) {

        next.set(
          key,
          "true"
        );

      } else {

        next.delete(
          key
        );

      }

    }


    if (
      filters.minPrice > 0
    ) {

      next.set(
        "minPrice",
        String(
          filters.minPrice
        )
      );

    } else {

      next.delete(
        "minPrice"
      );

    }


    if (
      filters.maxPrice !== null
    ) {

      next.set(
        "maxPrice",
        String(
          filters.maxPrice
        )
      );

    } else {

      next.delete(
        "maxPrice"
      );

    }


    setBooleanParam(
      "inStock",
      filters.inStock
    );


    setBooleanParam(
      "onSale",
      filters.onSale
    );


    if (
      filters.minDiscount > 0
    ) {

      next.set(
        "discount",
        String(
          filters.minDiscount
        )
      );

    } else {

      next.delete(
        "discount"
      );

    }


    if (
      filters.minRating > 0
    ) {

      next.set(
        "rating",
        String(
          filters.minRating
        )
      );

    } else {

      next.delete(
        "rating"
      );

    }


    setBooleanParam(
      "bestSeller",
      filters.bestSeller
    );


    setBooleanParam(
      "newArrival",
      filters.newArrival
    );


    setBooleanParam(
      "trending",
      filters.trending
    );


    setBooleanParam(
      "editorsPick",
      filters.editorsPick
    );


    setBooleanParam(
      "featured",
      filters.featured
    );


    setSearchParams(
      next
    );


    setFilterOpen(
      false
    );

  }


  /*
   * =======================================================
   * SEARCH VALUE
   * =======================================================
   */

  const searchValue =
    normalizeSearchText(
      search
    );

  const compactSearchValue =
    compactSearchText(
      search
    );


  /*
   * =======================================================
   * FILTER PRODUCTS
   * =======================================================
   */

  const filteredProducts =
    useMemo(() => {

      let result =
        products.filter(
          (
            product
          ) => {

            /*
             * =================================================
             * SEARCH
             * =================================================
             *
             * Search across:
             *
             * 1. Product name
             * 2. SKU
             * 3. Slug
             * 4. Short description
             * 5. Full description
             * 6. Care instructions
             * 7. Specifications JSONB
             */

            const specificationSearchText =
              getSpecificationsSearchText(
                product.specifications
              );


            /*
             * A database collection URL is a dedicated
             * collection view, so it must not also be narrowed
             * by a stale/previous text-search value.
             */
            if (!collectionParam) {

              const searchMatch =
                !searchValue ||

                matchesSearch(
                  product.name,
                  searchValue,
                  compactSearchValue
                ) ||

                matchesSearch(
                  product.short_description,
                  searchValue,
                  compactSearchValue
                ) ||

                matchesSearch(
                  product.description,
                  searchValue,
                  compactSearchValue
                ) ||

                matchesSearch(
                  product.care_instructions,
                  searchValue,
                  compactSearchValue
                ) ||

                matchesSearch(
                  product.sku,
                  searchValue,
                  compactSearchValue
                ) ||

                matchesSearch(
                  product.slug,
                  searchValue,
                  compactSearchValue
                ) ||

                matchesSearch(
                  specificationSearchText,
                  searchValue,
                  compactSearchValue
                );


              if (!searchMatch) {
                return false;
              }

            }


            /*
             * =================================================
             * URL COLLECTION
             * =================================================
             */

            if (
              collectionParam
            ) {

              if (
                !activeUrlCollection ||
                !activeUrlCollection.productIds.includes(
                  product.id
                )
              ) {
                return false;
              }

            }


            /*
             * =================================================
             * CATEGORY
             * =================================================
             */

            if (
              activeShopCategory
            ) {

              if (
                activeSubcategory
              ) {

                const productSubcategoryId =
                  product
                    .subcategories
                    ?.id;


                const productSubcategorySlug =
                  product
                    .subcategories
                    ?.slug
                    ? slugify(
                        product
                          .subcategories
                          .slug
                      )
                    : product
                        .subcategories
                        ?.name
                    ? slugify(
                        product
                          .subcategories
                          .name
                      )
                    : "";


                const selectedSubcategorySlug =
                  slugify(
                    activeSubcategory
                      .slug ??
                    activeSubcategory
                      .name
                  );


                const subcategoryMatch =
                  productSubcategoryId ===
                    activeSubcategory.id ||

                  productSubcategorySlug ===
                    selectedSubcategorySlug;


                if (
                  !subcategoryMatch
                ) {

                  return false;

                }

              }

              else {

                const productCategoryId =
                  product
                    .categories
                    ?.id;


                const productCategorySlug =
                  product
                    .categories
                    ?.slug
                    ? slugify(
                        product
                          .categories
                          .slug
                      )
                    : product
                        .categories
                        ?.name
                    ? slugify(
                        product
                          .categories
                          .name
                      )
                    : "";


                const selectedCategorySlug =
                  slugify(
                    activeShopCategory
                      .slug
                  );


                const categoryMatch =
                  productCategoryId ===
                    activeShopCategory.id ||

                  productCategorySlug ===
                    selectedCategorySlug;


                if (
                  !categoryMatch
                ) {

                  return false;

                }

              }

            }


            /*
             * =================================================
             * PRICE
             * =================================================
             */

            if (
              product.price <
              minPrice
            ) {

              return false;

            }


            if (
              maxPrice !== null &&
              product.price >
                maxPrice
            ) {

              return false;

            }


            /*
             * =================================================
             * STOCK
             * =================================================
             */

            if (
              inStock &&
              product.track_inventory &&
              product.stock <= 0 &&
              !product.allow_backorders
            ) {

              return false;

            }


            /*
             * =================================================
             * DISCOUNT
             * =================================================
             */

            const discount =
              getDiscount(
                product
              );


            if (
              onSale &&
              discount <= 0
            ) {

              return false;

            }


            if (
              minDiscount > 0 &&
              discount <
                minDiscount
            ) {

              return false;

            }


            /*
             * =================================================
             * RATING
             * =================================================
             */

            if (
              minRating > 0 &&
              product.rating <
                minRating
            ) {

              return false;

            }


            /*
             * =================================================
             * DATABASE COLLECTION FILTERS
             * =================================================
             *
             * Do NOT use products.best_seller, new_arrival,
             * trending, editors_pick or featured here.
             *
             * Curated membership is controlled by the
             * product_collections junction table.
             */

            const bestSellerCollection =
              getMappedCollection(
                "Best Sellers"
              );

            const newArrivalCollection =
              getMappedCollection(
                "New Arrivals"
              );

            const trendingCollection =
              getMappedCollection(
                "Trending"
              );

            const editorsPickCollection =
              getMappedCollection(
                "Editor's Pick"
              );

            const featuredCollection =
              getMappedCollection(
                "Featured"
              );

            if (
              bestSeller &&
              !productInCollection(
                product,
                bestSellerCollection
              )
            ) {
              return false;
            }

            if (
              newArrival &&
              !productInCollection(
                product,
                newArrivalCollection
              )
            ) {
              return false;
            }

            if (
              trending &&
              !productInCollection(
                product,
                trendingCollection
              )
            ) {
              return false;
            }

            if (
              editorsPick &&
              !productInCollection(
                product,
                editorsPickCollection
              )
            ) {
              return false;
            }

            if (
              featured &&
              !productInCollection(
                product,
                featuredCollection
              )
            ) {
              return false;
            }


            return true;

          }
        );


      /*
       * =======================================================
       * SORT
       * =======================================================
       */

      result = [
        ...result,
      ];


      switch (
        sort
      ) {

        case "newest":

          result.sort(
            (
              a,
              b
            ) =>
              new Date(
                b.created_at
              ).getTime() -
              new Date(
                a.created_at
              ).getTime()
          );

          break;


        case "best-selling": {

          /*
           * Best Selling is a curated collection, not a
           * sales_count calculation. There is no customer
           * sales history to rank by yet.
           */

          const bestSellerIds =
            new Set(
              getMappedCollection(
                "Best Sellers"
              )?.productIds ?? []
            );

          result = result.filter(
            (product) =>
              bestSellerIds.has(
                product.id
              )
          );

          result.sort(
            (a, b) =>
              new Date(
                b.created_at
              ).getTime() -
              new Date(
                a.created_at
              ).getTime()
          );

          break;

        }


        case "trending": {

          const trendingIds =
            new Set(
              getMappedCollection(
                "Trending"
              )?.productIds ?? []
            );

          result = result.filter(
            (product) =>
              trendingIds.has(
                product.id
              )
          );

          result.sort(
            (a, b) =>
              new Date(
                b.created_at
              ).getTime() -
              new Date(
                a.created_at
              ).getTime()
          );

          break;

        }


        case "price-low":

          result.sort(
            (
              a,
              b
            ) =>
              a.price -
              b.price
          );

          break;


        case "price-high":

          result.sort(
            (
              a,
              b
            ) =>
              b.price -
              a.price
          );

          break;


        case "discount":

          result.sort(
            (
              a,
              b
            ) =>
              getDiscount(
                b
              ) -
              getDiscount(
                a
              )
          );

          break;


        case "rating":

          result.sort(
            (
              a,
              b
            ) =>
              b.rating -
              a.rating
          );

          break;


        case "featured":

        default:

          result.sort(
            (
              a,
              b
            ) => {

              const featuredIds =
                new Set(
                  getMappedCollection(
                    "Featured"
                  )?.productIds ?? []
                );

              const aFeatured =
                featuredIds.has(
                  a.id
                );

              const bFeatured =
                featuredIds.has(
                  b.id
                );

              if (
                aFeatured !==
                bFeatured
              ) {

                return aFeatured
                  ? -1
                  : 1;

              }

              return (
                new Date(
                  b.created_at
                ).getTime() -
                new Date(
                  a.created_at
                ).getTime()
              );

            }
          );

          break;

      }


      return result;

    }, [

      products,

      searchValue,

      compactSearchValue,

      activeShopCategory,

      activeSubcategory,

      minPrice,

      maxPrice,

      inStock,

      onSale,

      minDiscount,

      minRating,

      bestSeller,

      newArrival,

      trending,

      editorsPick,

      featured,

      sort,

      collectionParam,

      activeUrlCollection,

      collectionMappings,

    ]);


  /*
   * =======================================================
   * LOADING
   * =======================================================
   */

  if (
    isLoading ||
    isCategoriesLoading ||
    areCollectionsLoading
  ) {

    return (

      <div
        className="
          min-h-screen
          bg-black
          px-4
          py-10
          sm:px-5
          lg:py-16
        "
      >

        <div
          className="
            mx-auto
            max-w-7xl
          "
        >

          <div
            className="
              animate-pulse
            "
          >

            <div
              className="
                mx-auto
                h-10
                w-52
                rounded
                bg-neutral-900
              "
            />


            <div
              className="
                mx-auto
                mt-4
                h-4
                max-w-md
                rounded
                bg-neutral-900
              "
            />


            <div
              className="
                mt-10
                grid
                grid-cols-2
                gap-4
                sm:grid-cols-3
                lg:grid-cols-4
              "
            >

              {Array.from(
                {
                  length: 8,
                }
              ).map(
                (
                  _,
                  index
                ) => (

                  <div
                    key={
                      index
                    }
                    className="
                      overflow-hidden
                      rounded-2xl
                      border
                      border-white/[0.06]
                      bg-white/[0.02]
                    "
                  >

                    <div
                      className="
                        aspect-square
                        bg-neutral-900
                      "
                    />


                    <div
                      className="
                        space-y-3
                        p-4
                      "
                    >

                      <div
                        className="
                          h-4
                          w-3/4
                          rounded
                          bg-neutral-800
                        "
                      />


                      <div
                        className="
                          h-3
                          w-1/2
                          rounded
                          bg-neutral-800
                        "
                      />

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </div>

      </div>

    );

  }


  /*
   * =======================================================
   * ERROR
   * =======================================================
   */

  if (
    isError ||
    isCategoriesError
  ) {

    return (

      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-black
          text-red-400
        "
      >

        Unable to load Shop.

      </div>

    );

  }


  /*
   * =======================================================
   * PAGE
   * =======================================================
   */

  return (

    <main
      className="
        min-h-screen
        bg-black
        px-4
        py-10
        sm:px-5
        sm:py-12
        lg:py-16
      "
    >

      <div
        className="
          mx-auto
          max-w-7xl
        "
      >

        {/* =================================================
            SHOP HEADER
        ================================================== */}

        <ShopHeader

          search={
            search
          }

          setSearch={
            handleSearchChange
          }

          productCount={
            filteredProducts.length
          }

          visibleProductCount={
            visibleProductCount
          }

          categories={
            categories
          }

          activeCategory={
            activeCategory
          }

          setCategory={
            handleCategoryChange
          }

          subcategories={
            activeSubcategoryNames
          }

          activeSubcategory={
            activeSubcategory?.name ??
            null
          }

          setSubcategory={
            handleSubcategoryChange
          }

          sort={
            sort
          }

          setSort={
            handleSortChange
          }

          onFilterOpen={() =>
            setFilterOpen(
              true
            )
          }

          filterCount={
            filterCount
          }

        />


        {/* =================================================
            ACTIVE FILTER CHIPS
        ================================================== */}

        <ActiveFilterChips

          minPrice={
            minPrice
          }

          maxPrice={
            maxPrice
          }

          inStock={
            inStock
          }

          onSale={
            onSale
          }

          minDiscount={
            minDiscount
          }

          minRating={
            minRating
          }

          bestSeller={
            bestSeller
          }

          newArrival={
            newArrival
          }

          trending={
            trending
          }

          editorsPick={
            editorsPick
          }

          featured={
            featured
          }

          onRemove={
            removeFilter
          }

          onClear={
            clearFilters
          }

        />


        {/* =================================================
            PRODUCT GRID
        ================================================== */}

        <ProductGrid

          products={
            filteredProducts
          }

          hasSearch={
            Boolean(
              search.trim()
            )
          }

          hasFilters={
            filterCount > 0
          }

          onClearFilters={
            clearFilters
          }

          onVisibleCountChange={
            setVisibleProductCount
          }

        />


      </div>

      {/* =================================================
          FILTER DRAWER
          Keep the drawer OUTSIDE the max-width content
          container so its overlay/dialog is positioned
          relative to the viewport, not the Shop content.
      ================================================== */}

      <ShopFilterDrawer

        open={
          filterOpen
        }

        onClose={() =>
          setFilterOpen(
            false
          )
        }

        values={{

          inStock,

          onSale,

          minDiscount,

          minRating,

          bestSeller,

          newArrival,

          trending,

          editorsPick,

          featured,

          minPrice,

          maxPrice,

        }}

        onApply={
          applyDrawerFilters
        }

        onClear={
          clearFilters
        }

      />

    </main>

  );

}