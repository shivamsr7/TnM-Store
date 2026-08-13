import {
  Loader2,
  Search,
} from "lucide-react";

import RecentSearches from "./RecentSearches";
import TrendingSearches from "./TrendingSearches";


/*
 * =========================================================
 * SEARCH PRODUCT TYPE
 * =========================================================
 */

export interface SearchProduct {

  id: string;

  name: string;

  slug: string;

  sku?: string | null;

  price: number;

  compare_price?: number | null;

  description?: string | null;

  short_description?: string | null;

  product_images?: {

    image_url: string;

    is_primary: boolean;

    sort_order: number;

  }[];

}


/*
 * =========================================================
 * PROPS
 * =========================================================
 */

interface SearchDropdownProps {

  open: boolean;

  query: string;

  recentSearches: string[];

  results: SearchProduct[];

  isLoading: boolean;

  onSelectRecent: (
    value: string
  ) => void;

  onRemoveRecent: (
    value: string
  ) => void;

  onClearRecent: () => void;

  onSelectProduct: (
    product: SearchProduct
  ) => void;

  onViewAll: () => void;

}


/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function SearchDropdown({

  open,

  query,

  recentSearches,

  results,

  isLoading,

  onSelectRecent,

  onRemoveRecent,

  onClearRecent,

  onSelectProduct,

  onViewAll,

}: SearchDropdownProps) {


  /*
   * =========================================================
   * CLOSED
   * =========================================================
   */

  if (!open) {

    return null;

  }


  /*
   * =========================================================
   * TRENDING SEARCHES
   * =========================================================
   */

  const trendingSearches = [

    "Snake Pendant",

    "Kashmiri Watch",

    "Anti Tarnish Ring",

    "Minimal Necklace",

    "Bracelet",

    "Gold Earrings",

  ];


  /*
   * =========================================================
   * PRODUCT IMAGE
   * =========================================================
   */

  const getProductImage = (
    product: SearchProduct
  ) => {

    const primaryImage =
      product.product_images?.find(
        (
          image
        ) =>
          image.is_primary
      );


    return (

      primaryImage?.image_url ??

      product.product_images?.[0]
        ?.image_url ??

      null

    );

  };


  /*
   * =========================================================
   * DISCOUNT
   * =========================================================
   */

  const getDiscount = (
    product: SearchProduct
  ) => {

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
        )

        /

        product.compare_price

      ) * 100

    );

  };


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <div

      className="

        absolute

        left-0
        right-0

        top-[calc(100%+12px)]

        z-50

        overflow-hidden

        rounded-2xl

        border

        border-neutral-200

        bg-white

        shadow-2xl

      "

    >

      <div

        className="

          max-h-[420px]

          overflow-y-auto

          p-5

        "

      >

        {/* =================================================
            EMPTY SEARCH
        ================================================== */}

        {!query.trim() && (

          <>

            {recentSearches.length > 0 ? (

              <RecentSearches

                searches={
                  recentSearches
                }

                onSelect={
                  onSelectRecent
                }

                onRemove={
                  onRemoveRecent
                }

                onClear={
                  onClearRecent
                }

              />

            ) : (

              <TrendingSearches

                searches={
                  trendingSearches
                }

                onSelect={
                  onSelectRecent
                }

              />

            )}

          </>

        )}


        {/* =================================================
            LOADING
        ================================================== */}

        {query.trim() &&
          isLoading && (

            <div

              className="

                flex

                items-center
                justify-center

                gap-2

                py-10

                text-sm

                text-neutral-500

              "

            >

              <Loader2

                className="

                  h-5

                  w-5

                  animate-spin

                "

              />

              Searching products...

            </div>

          )}


        {/* =================================================
            RESULTS
        ================================================== */}

        {query.trim() &&
          !isLoading &&
          results.length > 0 && (

            <div>

              <div

                className="

                  mb-3

                  flex

                  items-center

                  gap-2

                  text-sm

                  font-semibold

                  text-neutral-800

                "

              >

                <Search

                  className="

                    h-4

                    w-4

                    text-[#C8A44D]

                  "

                />

                Products

              </div>


              <div

                className="

                  space-y-1

                "

              >

                {results.map(
                  (
                    product
                  ) => {

                    const image =
                      getProductImage(
                        product
                      );


                    const discount =
                      getDiscount(
                        product
                      );


                    return (

                      <button

                        key={
                          product.id
                        }

                        type="button"

                        onClick={() =>
                          onSelectProduct(
                            product
                          )
                        }

                        className="

                          flex

                          w-full

                          items-center

                          gap-3

                          rounded-xl

                          p-2

                          text-left

                          transition

                          hover:bg-neutral-100

                        "

                      >

                        {/* =================================================
                            PRODUCT IMAGE
                        ================================================== */}

                        <div

                          className="

                            h-14

                            w-14

                            shrink-0

                            overflow-hidden

                            rounded-xl

                            bg-neutral-100

                          "

                        >

                          {image ? (

                            <img

                              src={
                                image
                              }

                              alt={
                                product.name
                              }

                              className="

                                h-full

                                w-full

                                object-cover

                              "

                            />

                          ) : (

                            <div

                              className="

                                flex

                                h-full

                                w-full

                                items-center

                                justify-center

                                text-xs

                                text-neutral-400

                              "

                            >

                              No image

                            </div>

                          )}

                        </div>


                        {/* =================================================
                            PRODUCT DETAILS
                        ================================================== */}

                        <div

                          className="

                            min-w-0

                            flex-1

                          "

                        >

                          <p

                            className="

                              truncate

                              text-sm

                              font-medium

                              text-neutral-900

                            "

                          >

                            {
                              product.name
                            }

                          </p>


                          <div

                            className="

                              mt-1

                              flex

                              items-center

                              gap-2

                            "

                          >

                            <span

                              className="

                                text-sm

                                font-semibold

                                text-neutral-900

                              "

                            >

                              ₹
                              {
                                product.price
                              }

                            </span>


                            {product.compare_price && (

                              <span

                                className="

                                  text-xs

                                  text-neutral-400

                                  line-through

                                "

                              >

                                ₹
                                {
                                  product.compare_price
                                }

                              </span>

                            )}


                            {discount > 0 && (

                              <span

                                className="

                                  text-[10px]

                                  font-semibold

                                  text-[#B58A22]

                                "

                              >

                                {
                                  discount
                                }% OFF

                              </span>

                            )}

                          </div>

                        </div>


                        {/* =================================================
                            ARROW
                        ================================================== */}

                        <span

                          className="

                            shrink-0

                            text-lg

                            text-neutral-400

                          "

                        >

                          →

                        </span>

                      </button>

                    );

                  }
                )}

              </div>


              {/* =================================================
                  VIEW ALL
              ================================================== */}

              <button

                type="button"

                onClick={
                  onViewAll
                }

                className="

                  mt-3

                  flex

                  w-full

                  items-center

                  justify-center

                  border-t

                  border-neutral-200

                  pt-4

                  text-sm

                  font-medium

                  text-[#B58A22]

                  transition

                  hover:text-[#8F6D18]

                "

              >

                View all results for
                {" "}
                "{query.trim()}"

                <span
                  className="
                    ml-1
                  "
                >

                  →

                </span>

              </button>

            </div>

          )}


        {/* =================================================
            NO RESULTS
        ================================================== */}

        {query.trim() &&
          !isLoading &&
          results.length === 0 && (

            <div

              className="

                py-10

                text-center

              "

            >

              <Search

                className="

                  mx-auto

                  h-6

                  w-6

                  text-neutral-300

                "

              />


              <p

                className="

                  mt-3

                  text-sm

                  font-medium

                  text-neutral-800

                "

              >

                No products found

              </p>


              <p

                className="

                  mt-1

                  text-xs

                  text-neutral-500

                "

              >

                Try another product name or keyword.

              </p>

            </div>

          )}

      </div>

    </div>

  );

}