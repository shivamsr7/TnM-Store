import {
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
    product.compare_price <=
      product.price
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
 * COMPONENT
 * =========================================================
 */

export default function Shop() {


  /*
   * =========================================================
   * PRODUCTS
   * =========================================================
   */

  const {
    data: products = [],
    isLoading,
    isError,
  } = useShopProducts();


  /*
   * =========================================================
   * CATEGORIES
   * =========================================================
   */

  const {
    data: shopCategories = [],
    isLoading:
      isCategoriesLoading,
    isError:
      isCategoriesError,
  } = useShopCategories();


  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */

  const [
    search,
    setSearch,
  ] = useState("");


  /*
   * =========================================================
   * URL PARAMS
   * =========================================================
   */

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();


  /*
   * =========================================================
   * FILTER DRAWER
   * =========================================================
   */

  const [
    filterOpen,
    setFilterOpen,
  ] = useState(false);


  /*
   * =========================================================
   * DYNAMIC CATEGORY NAMES
   * =========================================================
   *
   * "All" is a UI option.
   *
   * All actual categories come from Supabase.
   *
   * =========================================================
   */

  const categories =
    useMemo(() => {

      return [

        "All",

        ...shopCategories.map(
          (category) =>
            category.name
        ),

      ];

    }, [
      shopCategories,
    ]);


  /*
   * =========================================================
   * URL CATEGORY
   * =========================================================
   */

  const categoryParam =
    searchParams.get(
      "category"
    );


  /*
   * =========================================================
   * URL SUBCATEGORY
   * =========================================================
   *
   * IMPORTANT:
   *
   * Parent category:
   *
   * /shop?category=watches
   *
   * Subcategory:
   *
   * /shop?category=watches&subcategory=women-watches
   *
   * =========================================================
   */

  const subcategoryParam =
    searchParams.get(
      "subcategory"
    );


  /*
   * =========================================================
   * ACTIVE SHOP CATEGORY
   * =========================================================
   *
   * We ONLY use the category parameter to find the
   * parent category.
   *
   * We no longer try to interpret the subcategory as
   * the category parameter.
   * =========================================================
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
          (category) =>
            slugify(
              category.slug
            ) === value
        ) ?? null
      );

    }, [
      categoryParam,
      shopCategories,
    ]);


  /*
   * =========================================================
   * ACTIVE CATEGORY NAME
   * =========================================================
   */

  const activeCategory =
    activeShopCategory?.name ??
    "All";


  /*
   * =========================================================
   * ACTIVE SUBCATEGORY
   * =========================================================
   *
   * Looks up the subcategory from the separate
   * `subcategory` URL parameter.
   * =========================================================
   */

  const activeSubcategory =
    useMemo(() => {

      if (
        !activeShopCategory ||
        !subcategoryParam
      ) {

        return null;

      }


      const value =
        slugify(
          decodeURIComponent(
            subcategoryParam
          )
        );


      return (
        activeShopCategory
          .subcategories
          .find(
            (subcategory) =>
              slugify(
                subcategory.slug ??
                subcategory.name
              ) === value
          ) ?? null
      );

    }, [
      activeShopCategory,
      subcategoryParam,
    ]);


  /*
   * =========================================================
   * ACTIVE SUBCATEGORY NAMES
   * =========================================================
   *
   * Only subcategories returned by shopService are shown.
   *
   * shopService already removes subcategories that have
   * zero active products.
   * =========================================================
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
            (subcategory) =>
              subcategory.name
          )
      );

    }, [
      activeShopCategory,
    ]);


  /*
   * =========================================================
   * SORT
   * =========================================================
   */

  const sort =
    (
      searchParams.get(
        "sort"
      ) as SortOption
    ) || "featured";


  /*
   * =========================================================
   * PRICE
   * =========================================================
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
   * =========================================================
   * AVAILABILITY
   * =========================================================
   */

  const inStock =
    searchParams.get(
      "inStock"
    ) === "true";


  /*
   * =========================================================
   * SALE
   * =========================================================
   */

  const onSale =
    searchParams.get(
      "onSale"
    ) === "true";


  /*
   * =========================================================
   * DISCOUNT
   * =========================================================
   */

  const minDiscount =
    Number(
      searchParams.get(
        "discount"
      ) || 0
    );


  /*
   * =========================================================
   * RATING
   * =========================================================
   */

  const minRating =
    Number(
      searchParams.get(
        "rating"
      ) || 0
    );


  /*
   * =========================================================
   * COLLECTION FLAGS
   * =========================================================
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
   * =========================================================
   * FILTER COUNT
   * =========================================================
   */

  const filterCount =
    Number(inStock) +
    Number(onSale) +
    Number(
      minDiscount > 0
    ) +
    Number(
      minRating > 0
    ) +
    Number(bestSeller) +
    Number(newArrival) +
    Number(trending) +
    Number(editorsPick) +
    Number(featured) +
    Number(
      minPrice > 0 ||
      maxPrice !== null
    );


  /*
   * =========================================================
   * UPDATE URL PARAMS
   * =========================================================
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
      ([key, value]) => {

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
   * =========================================================
   * CATEGORY CHANGE
   * =========================================================
   */

  function handleCategoryChange(
    value: string
  ) {

    /*
     * -------------------------------------------------------
     * ALL
     * -------------------------------------------------------
     */

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


    /*
     * -------------------------------------------------------
     * FIND CATEGORY
     * -------------------------------------------------------
     */

    const category =
      shopCategories.find(
        (item) =>
          item.name ===
          value
      );


    if (
      !category
    ) {

      return;

    }


    /*
     * -------------------------------------------------------
     * CHANGE CATEGORY
     *
     * IMPORTANT:
     *
     * Remove previous subcategory.
     * -------------------------------------------------------
     */

    updateParams({

      category:
        category.slug,

      subcategory:
        null,

    });

  }


  /*
   * =========================================================
   * SUBCATEGORY CHANGE
   * =========================================================
   */

  function handleSubcategoryChange(
    value: string | null
  ) {

    /*
     * -------------------------------------------------------
     * NO PARENT CATEGORY
     * -------------------------------------------------------
     */

    if (
      !activeShopCategory
    ) {

      return;

    }


    /*
     * -------------------------------------------------------
     * ALL SUBCATEGORIES
     * -------------------------------------------------------
     */

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


    /*
     * -------------------------------------------------------
     * FIND SUBCATEGORY
     * -------------------------------------------------------
     */

    const subcategory =
      activeShopCategory
        .subcategories
        .find(
          (item) =>
            item.name ===
            value
        );


    if (
      !subcategory
    ) {

      return;

    }


    /*
     * -------------------------------------------------------
     * DATABASE SLUG
     *
     * Fallback to generated slug only when the
     * database slug is null.
     * -------------------------------------------------------
     */

    const slug =
      subcategory.slug ??
      slugify(
        subcategory.name
      );


    /*
     * -------------------------------------------------------
     * IMPORTANT:
     *
     * Keep parent category in `category`.
     *
     * Put subcategory in `subcategory`.
     * -------------------------------------------------------
     */

    updateParams({

      category:
        activeShopCategory.slug,

      subcategory:
        slug,

    });

  }


  /*
   * =========================================================
   * SORT CHANGE
   * =========================================================
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
   * =========================================================
   * CLEAR FILTERS
   * =========================================================
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
      (key) => {

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
   * =========================================================
   * REMOVE FILTER
   * =========================================================
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
   * =========================================================
   * DRAWER FILTERS
   * =========================================================
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


    /*
     * Price
     */

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


    /*
     * Availability
     */

    setBooleanParam(
      "inStock",
      filters.inStock
    );


    /*
     * Sale
     */

    setBooleanParam(
      "onSale",
      filters.onSale
    );


    /*
     * Discount
     */

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


    /*
     * Rating
     */

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


    /*
     * Collections
     */

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


    /*
     * Apply once
     */

    setSearchParams(
      next
    );


    setFilterOpen(
      false
    );

  }


  /*
   * =========================================================
   * SEARCH VALUE
   * =========================================================
   */

  const searchValue =
    search
      .trim()
      .toLowerCase();


  /*
   * =========================================================
   * FILTER PRODUCTS
   * =========================================================
   */

  const filteredProducts =
    useMemo(() => {

      let result =
        products.filter(
          (product) => {


            /*
             * -------------------------------------------------
             * SEARCH
             * -------------------------------------------------
             */

            const searchMatch =
              !searchValue ||

              product.name
                ?.toLowerCase()
                .includes(
                  searchValue
                ) ||

              product.short_description
                ?.toLowerCase()
                .includes(
                  searchValue
                ) ||

              product.sku
                ?.toLowerCase()
                .includes(
                  searchValue
                );


            if (
              !searchMatch
            ) {

              return false;

            }


            /*
             * -------------------------------------------------
             * CATEGORY / SUBCATEGORY
             * -------------------------------------------------
             */

            if (
              activeShopCategory
            ) {


              /*
               * ===============================================
               * SUBCATEGORY SELECTED
               * ===============================================
               */

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


              /*
               * ===============================================
               * PARENT CATEGORY SELECTED
               * ===============================================
               */

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
             * -------------------------------------------------
             * PRICE
             * -------------------------------------------------
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
             * -------------------------------------------------
             * STOCK
             * -------------------------------------------------
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
             * -------------------------------------------------
             * SALE
             * -------------------------------------------------
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
             * -------------------------------------------------
             * RATING
             * -------------------------------------------------
             */

            if (
              minRating > 0 &&
              product.rating <
                minRating
            ) {

              return false;

            }


            /*
             * -------------------------------------------------
             * COLLECTIONS
             * -------------------------------------------------
             */

            if (
              bestSeller &&
              !product.best_seller
            ) {

              return false;

            }


            if (
              newArrival &&
              !product.new_arrival
            ) {

              return false;

            }


            if (
              trending &&
              !product.trending
            ) {

              return false;

            }


            if (
              editorsPick &&
              !product.editors_pick
            ) {

              return false;

            }


            if (
              featured &&
              !product.featured
            ) {

              return false;

            }


            return true;

          }
        );


      /*
       * =====================================================
       * SORT
       * =====================================================
       */

      result = [
        ...result,
      ];


      switch (
        sort
      ) {

        case "newest":

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


        case "best-selling":

          result.sort(
            (a, b) =>
              b.sales_count -
              a.sales_count
          );

          break;


        case "trending":

          result.sort(
            (a, b) =>
              Number(
                b.trending
              ) -
              Number(
                a.trending
              )
          );

          break;


        case "price-low":

          result.sort(
            (a, b) =>
              a.price -
              b.price
          );

          break;


        case "price-high":

          result.sort(
            (a, b) =>
              b.price -
              a.price
          );

          break;


        case "discount":

          result.sort(
            (a, b) =>
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
            (a, b) =>
              b.rating -
              a.rating
          );

          break;


        case "featured":

        default:

          result.sort(
            (a, b) => {

              if (
                a.featured !==
                b.featured
              ) {

                return a.featured
                  ? -1
                  : 1;

              }


              return (
                b.sales_count -
                a.sales_count
              );

            }
          );

          break;

      }


      return result;

    }, [

      products,

      searchValue,

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

    ]);


  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (
    isLoading ||
    isCategoriesLoading
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

              {Array.from({
                length: 8,
              }).map(
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
                      border-neutral-900
                      bg-neutral-950
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
                        space-y-2
                        p-3
                      "
                    >

                      <div
                        className="
                          h-3
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
   * =========================================================
   * ERROR
   * =========================================================
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
   * =========================================================
   * PAGE
   * =========================================================
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
            setSearch
          }

          productCount={
            filteredProducts.length
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

        />


        {/* =================================================
            FILTER DRAWER
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

      </div>

    </main>

  );

}