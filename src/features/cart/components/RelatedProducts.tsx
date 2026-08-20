import {
  Check,
  Plus,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  supabase,
} from "@/shared/lib/supabase";

import {
  useCartActions,
} from "@/features/cart/hooks/useCartActions";


interface RelatedProductsProps {

  cartItems: Array<{
    productId?: string;
  }>;

}





export default function RelatedProducts({

  cartItems,

}: RelatedProductsProps) {


  /*
   * =========================================================
   * CART
   * =========================================================
   */

  const {
    addToCart,
  } = useCartActions();


  const [
    addedProductId,
    setAddedProductId,
  ] = useState<string | null>(
    null
  );


  /*
   * =========================================================
   * CART PRODUCT IDS
   * =========================================================
   */

  const productIds =
    cartItems
      .map(
        (
          item
        ) =>
          item.productId
      )
      .filter(
        Boolean
      ) as string[];


  /*
   * =========================================================
   * RELATED PRODUCTS
   * =========================================================
   */

  const {
    data: products = [],
    isLoading,
  } = useQuery({

    queryKey: [
      "cart-related-products",
      ...productIds.sort(),
    ],


    queryFn: async () => {

      if (
        productIds.length ===
        0
      ) {

        return [];

      }


      /*
       * =====================================================
       * CART PRODUCT CATEGORIES
       * =====================================================
       */

      const {
        data: cartProducts,
        error:
          cartProductsError,
      } = await supabase

        .from(
          "products"
        )

        .select(
          "id, category_id, subcategory_id"
        )

        .in(
          "id",
          productIds
        );


      if (
        cartProductsError
      ) {

        throw cartProductsError;

      }


      const categoryIds = [

        ...new Set(

          (
            cartProducts ??
            []
          )

            .map(
              (
                product: any
              ) =>
                product.category_id
            )

            .filter(
              Boolean
            )

        ),

      ];


      const subcategoryIds = [

        ...new Set(

          (
            cartProducts ??
            []
          )

            .map(
              (
                product: any
              ) =>
                product.subcategory_id
            )

            .filter(
              Boolean
            )

        ),

      ];


      /*
       * =====================================================
       * PRODUCT QUERY
       * =====================================================
       *
       * Prefer products from the same category.
       * =====================================================
       */

      let query =
        supabase

          .from(
            "products"
          )

          .select(
            `
              id,
              name,
              price,
              compare_price,
              stock,
              category_id,
              subcategory_id,
              best_seller,
              trending,
              sales_count,
              product_images(
                image_url,
                sort_order,
                is_primary
              )
            `
          )

          .eq(
            "status",
            "active"
          )

          .gt(
            "stock",
            0
          )

          .not(
            "id",
            "in",
            `(${productIds.join(",")})`
          );


      if (
        categoryIds.length >
        0
      ) {

        query =
          query.in(
            "category_id",
            categoryIds
          );

      }


      const {
        data: candidates,
        error:
          candidatesError,
      } = await query

        .order(
          "best_seller",
          {
            ascending:
              false,
          }
        )

        .order(
          "trending",
          {
            ascending:
              false,
          }
        )

        .order(
          "sales_count",
          {
            ascending:
              false,
          }
        )

        .limit(
          12
        );


      if (
        candidatesError
      ) {

        throw candidatesError;

      }


      /*
       * =====================================================
       * SCORE PRODUCTS
       * =====================================================
       *
       * Same subcategory:
       * +5
       *
       * Same category:
       * +3
       *
       * Best seller:
       * +2
       *
       * Trending:
       * +1
       *
       * Sales:
       * Small additional score
       * =====================================================
       */

      const scored = (

        candidates ??
        []

      )

        .map(
          (
            product: any
          ) => {

            const sameSubcategory =
              subcategoryIds.includes(
                product.subcategory_id
              );


            const sameCategory =
              categoryIds.includes(
                product.category_id
              );


            const score =

              (
                sameSubcategory
                  ? 5
                  : 0
              ) +

              (
                sameCategory
                  ? 3
                  : 0
              ) +

              (
                product.best_seller
                  ? 2
                  : 0
              ) +

              (
                product.trending
                  ? 1
                  : 0
              ) +

              Math.min(
                Number(
                  product.sales_count
                ) || 0,
                20
              ) / 20;


            return {

              ...product,

              _score:
                score,

            };

          }
        )

        .sort(
          (
            a: any,
            b: any
          ) =>
            b._score -
            a._score
        )

        .slice(
          0,
          6
        );


      /*
       * =====================================================
       * FALLBACK PRODUCTS
       * =====================================================
       */

      if (
        scored.length ===
        0
      ) {

        const {
          data:
            fallbackProducts,
          error:
            fallbackError,
        } = await supabase

          .from(
            "products"
          )

          .select(
            `
              id,
              name,
              price,
              compare_price,
              stock,
              category_id,
              subcategory_id,
              best_seller,
              trending,
              sales_count,
              product_images(
                image_url,
                sort_order,
                is_primary
              )
            `
          )

          .eq(
            "status",
            "active"
          )

          .gt(
            "stock",
            0
          )

          .not(
            "id",
            "in",
            `(${productIds.join(",")})`
          )

          .order(
            "best_seller",
            {
              ascending:
                false,
            }
          )

          .order(
            "trending",
            {
              ascending:
                false,
            }
          )

          .order(
            "sales_count",
            {
              ascending:
                false,
            }
          )

          .limit(
            6
          );


        if (
          fallbackError
        ) {

          throw fallbackError;

        }


        return (
          fallbackProducts ??
          []
        );

      }


      return scored;

    },


    enabled:
      productIds.length >
      0,


    staleTime:
      5 * 60 * 1000,

  });


  /*
   * =========================================================
   * ADDED STATE RESET
   * =========================================================
   */

  useEffect(() => {

    if (
      !addedProductId
    ) {

      return;

    }


    const timer =
      window.setTimeout(
        () => {

          setAddedProductId(
            null
          );

        },

        1400
      );


    return () => {

      window.clearTimeout(
        timer
      );

    };

  }, [
    addedProductId,
  ]);


  /*
   * =========================================================
   * LOADING / EMPTY
   * =========================================================
   */

  if (
    isLoading ||
    products.length === 0
  ) {

    return null;

  }


  /*
   * =========================================================
   * GET PRODUCT IMAGE
   * =========================================================
   */

  const getImage = (
    product: any
  ) => {

    const images =
      product.product_images ??
      [];


    const primary =
      images.find(
        (
          image: any
        ) =>
          image.is_primary
      );


    const sorted =
      [
        ...images,
      ].sort(
        (
          a: any,
          b: any
        ) =>
          (
            a.sort_order ??
            0
          ) -
          (
            b.sort_order ??
            0
          )
      );


    return (

      primary?.image_url ||

      sorted[0]?.image_url ||

      ""

    );

  };


  /*
   * =========================================================
   * ADD PRODUCT
   * =========================================================
   */

  const handleAdd = (
    product: any
  ) => {

    addToCart(
      product
    );


    setAddedProductId(
      product.id
    );

  };


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <section
      className="
        shrink-0
        border-t
        border-neutral-100
        bg-white
        px-4
        pb-3
        pt-4
      "
    >

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-3
        "
      >

        <div
          className="
            flex
            min-w-0
            items-center
            gap-1.5
          "
        >

          <Sparkles
            size={14}
            className="
              shrink-0
              text-[#C8A44D]
            "
          />


          <h3
            className="
              truncate
              text-sm
              font-semibold
              leading-5
            "
          >

            You may also like

          </h3>

        </div>


        <span
          className="
            shrink-0
            text-[10px]
            font-medium
            text-neutral-400
          "
        >

          Swipe →

        </span>

      </div>


      <p
        className="
          mt-0.5
          text-[10px]
          leading-4
          text-neutral-500
        "
      >

        Complete your look with these picks

      </p>


      {/* =====================================================
          HORIZONTAL PRODUCT CAROUSEL
      ====================================================== */}

      <div
        className="
          -mr-4
          mt-3
          flex
          gap-2.5
          overflow-x-auto
          overscroll-x-contain
          pb-1
          pr-4
          snap-x
          snap-mandatory
          [-ms-overflow-style:none]
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >

        {
          products.map(
            (
              product: any,
              index: number
            ) => {

              const image =
                getImage(
                  product
                );


              const isAdded =
                addedProductId ===
                product.id;


              return (

                <div
                  key={
                    product.id
                  }
                  className="
                    flex
                    h-[286px]
                    w-[132px]
                    min-w-[132px]
                    shrink-0
                    snap-start
                    flex-col
                    overflow-hidden
                    rounded-2xl
                    border
                    border-neutral-200
                    bg-white
                    shadow-[0_2px_8px_rgba(0,0,0,0.06)]
                    animate-in
                    fade-in
                    slide-in-from-right-2
                    duration-300
                  "
                  style={{
                    animationDelay:
                      `${index * 55}ms`,
                  }}
                >

                  {/* =========================================
                      PRODUCT IMAGE
                  ========================================== */}

                  <div
                    className="
                      relative
                      h-[164px]
                      shrink-0
                      overflow-hidden
                      bg-neutral-100
                    "
                  >

                    {
                      image ? (

                        <img
                          src={
                            image
                          }
                          alt={
                            product.name
                          }
                          loading="lazy"
                          className="
                            h-full
                            w-full
                            object-contain
                            transition-transform
                            duration-500
                            hover:scale-105
                            active:scale-[1.02]
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
                            text-xl
                          "
                        >

                          ✨

                        </div>

                      )
                    }

                  </div>


                  {/* =========================================
                      PRODUCT DETAILS
                  ========================================== */}

                  <div
                    className="
                      flex
                      min-h-0
                      flex-1
                      flex-col
                      p-2
                    "
                  >

                    <p
                      className="
                        line-clamp-2
                        min-h-[28px]
                        text-[10px]
                        font-medium
                        leading-[14px]
                        text-neutral-900
                      "
                    >

                      {
                        product.name
                      }

                    </p>


                    {/* =======================================
                        PRICE
                    ======================================== */}

                    <div
                      className="
                        mt-1.5
                        flex
                        h-4
                        min-w-0
                        shrink-0
                        items-center
                        gap-1
                      "
                    >

                      <span
                        className="
                          text-[12px]
                          font-semibold
                          leading-4
                        "
                      >

                        ₹
                        {
                          Number(
                            product.price
                          ).toFixed(0)
                        }

                      </span>


                      {
                        product.compare_price &&
                        Number(
                          product.compare_price
                        ) >
                        Number(
                          product.price
                        ) && (

                          <span
                            className="
                              truncate
                              text-[8px]
                              leading-4
                              text-neutral-400
                              line-through
                            "
                          >

                            ₹
                            {
                              Number(
                                product.compare_price
                              ).toFixed(0)
                            }

                          </span>

                        )
                      }

                    </div>


                    {/* =======================================
                        ADD BUTTON
                    ======================================== */}

                    <button
                      type="button"
                      onClick={() =>
                        handleAdd(
                          product
                        )
                      }
                      className={`
                        mt-auto
                        pt-2
                        flex
                        h-8
                        w-full
                        items-center
                        justify-center
                        gap-1
                        rounded-lg
                        text-[10px]
                        font-semibold
                        transition-all
                        duration-200
                        active:scale-[0.96]

                        ${
                          isAdded

                            ? `
                              bg-green-600
                              text-white
                            `

                            : `
                              bg-black
                              text-white
                              hover:bg-neutral-800
                            `
                        }
                      `}
                    >

                      {
                        isAdded ? (

                          <>

                            <Check
                              size={11}
                              strokeWidth={2.7}
                              className="
                                animate-in
                                zoom-in-50
                                duration-200
                              "
                            />

                            Added

                          </>

                        ) : (

                          <>

                            <Plus
                              size={11}
                              strokeWidth={2.5}
                            />

                            Add

                          </>

                        )
                      }

                    </button>

                  </div>

                </div>

              );

            }
          )
        }

      </div>

    </section>

  );

}