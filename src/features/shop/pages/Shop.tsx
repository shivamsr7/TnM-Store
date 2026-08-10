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
   * "All" is a UI option, not a database category.
   *
   * Every other category comes from Supabase.
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
   * CATEGORY PARAM
   * =========================================================
   */

  const categoryParam =
    searchParams.get(
      "category"
    );


  /*
   * =========================================================
   * FIND CATEGORY / SUBCATEGORY FROM URL
   * =========================================================
   *
   * This is completely dynamic.
   *
   * Example:
   *
   * /shop?category=bracelets-bangles
   *
   * finds the category whose slug is
   * "bracelets-bangles".
   *
   * /shop?category=haath-phool
   *
   * finds Haath Phool inside its parent category.
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


      /*
       * First check main categories.
       */

      const mainCategory =
        shopCategories.find(
          (category) =>
            slugify(
              category.slug
            ) ===
            value
        );


      if (
        mainCategory
      ) {

        return mainCategory;

      }


      /*
       * Then check all subcategories.
       */

      const parentCategory =
        shopCategories.find(
          (category) =>
            category.subcategories.some(
              (subcategory) =>
                slugify(
                  subcategory.slug ??
                  subcategory.name
                ) ===
                value
            )
        );


      return (
        parentCategory ??
        null
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
   */

  const activeSubcategory =
    useMemo(() => {

      if (
        !activeShopCategory ||
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


      /*
       * If URL belongs to the parent category,
       * there is no active subcategory.
       */

      if (
        slugify(
          activeShopCategory.slug
        ) ===
        value
      ) {

        return null;

      }


      /*
       * Find matching subcategory.
       */

      return (
        activeShopCategory
          .subcategories
          .find(
            (subcategory) =>
              slugify(
                subcategory.slug ??
                subcategory.name
              ) ===
              value
          ) ??
        null
      );

    }, [
      categoryParam,
      activeShopCategory,
    ]);


  /*
   * =========================================================
   * ACTIVE SUBCATEGORY NAMES
   * =========================================================
   *
   * These come directly from the database.
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
     * All
     */

    if (
      value === "All"
    ) {

      updateParams({

        category: null,

      });

      return;

    }


    /*
     * Find category dynamically.
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


    updateParams({

      category:
        category.slug,

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
     * "All" inside a category.
     */

    if (
      value === null
    ) {

      if (
        !activeShopCategory
      ) {

        return;

      }


      updateParams({

        category:
          activeShopCategory.slug,

      });

      return;

    }


    /*
     * Find subcategory dynamically.
     */

    const subcategory =
      activeShopCategory
        ?.subcategories
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
     * Prefer database slug.
     *
     * Fallback to generated slug only
     * if slug is null.
     */

    const slug =
      subcategory.slug ??
      slugify(
        subcategory.name
      );


    updateParams({

      category:
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

        minPrice: null,

        maxPrice: null,

      });

      return;

    }


    updateParams({

      [key]: null,

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

      if (value) {

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


    setSearchParams(
      next
    );


    setFilterOpen(
      false
    );

  }


  /*
   * =========================================================
   * SEARCH
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
             *
             * We now use the actual database IDs/relationships
             * instead of category names being hardcoded.
             * -------------------------------------------------
             */

            if (
              activeShopCategory
            ) {

              /*
               * If a subcategory is selected,
               * filter by that subcategory.
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
               * If parent category is selected,
               * show all products belonging to
               * that category.
               *
               * When there is no subcategory selected,
               * we only check the parent category.
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


      switch (sort) {

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
              getDiscount(b) -
              getDiscount(a)
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
                md:grid-cols-3
                lg:grid-cols-4
              "
            >

              {[
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
              ].map(
                (item) => (

                  <div
                    key={item}
                    className="
                      overflow-hidden
                      rounded-2xl
                      bg-neutral-900
                    "
                  >

                    <div
                      className="
                        aspect-[4/5]
                        bg-neutral-800
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

          /*
           * Dynamic subcategories
           */

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