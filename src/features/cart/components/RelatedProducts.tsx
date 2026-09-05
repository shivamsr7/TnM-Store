import {
  Check,
  Plus,
  Sparkles,
  Timer,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

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

  onProductNavigate?: (
    product: any
  ) => void;

}





export default function RelatedProducts({

  cartItems,
  onProductNavigate,

}: RelatedProductsProps) {


  const navigate =
    useNavigate();


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


  const [
    countdownNow,
    setCountdownNow,
  ] = useState(
    Date.now()
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
              slug,
              price,
              compare_price,
              special_discount_enabled,
              special_discount_type,
              special_discount_value,
              special_discount_ends_at,
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
              slug,
              price,
              compare_price,
              special_discount_enabled,
              special_discount_type,
              special_discount_value,
              special_discount_ends_at,
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



  useEffect(() => {

    const hasActiveSpecial =
      products.some(
        (product: any) =>
          Boolean(
            product.special_discount_enabled
          ) &&
          product.special_discount_ends_at
      );

    if (!hasActiveSpecial) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setCountdownNow(
          Date.now()
        );
      }, 1000);

    return () => {
      window.clearInterval(
        timer
      );
    };

  }, [products]);


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
   * SPECIAL PRICE
   * =========================================================
   */

  const getSpecialPrice =
    (product: any) => {

      const enabled =
        Boolean(
          product.special_discount_enabled
        );

      const basePrice =
        Number(
          product.price ?? 0
        );

      const value =
        Number(
          product.special_discount_value ?? 0
        );

      if (
        !enabled ||
        basePrice <= 0 ||
        value <= 0
      ) {
        return null;
      }

      const specialPrice =
        product.special_discount_type ===
        "fixed"
          ? Math.max(
              0,
              basePrice - value
            )
          : Math.max(
              0,
              basePrice -
                (basePrice * value) /
                  100
            );

      const endsAt =
        product.special_discount_ends_at
          ? new Date(
              product.special_discount_ends_at
            )
          : null;

      if (
        endsAt &&
        endsAt.getTime() <=
          Date.now()
      ) {
        return null;
      }

      if (
        specialPrice >= basePrice
      ) {
        return null;
      }

      return {
        price: specialPrice,
        regularPrice: basePrice,
        endsAt,
      };
    };


  const formatSpecialCountdown =
    (
      endsAt: Date | null
    ) => {

      if (!endsAt) {
        return "";
      }

      const remaining =
        Math.max(
          0,
          endsAt.getTime() -
            countdownNow
        );

      if (remaining <= 0) {
        return "Offer ended";
      }

      const totalSeconds =
        Math.floor(
          remaining / 1000
        );

      const days =
        Math.floor(
          totalSeconds / 86400
        );

      const hours =
        Math.floor(
          (totalSeconds % 86400) /
            3600
        );

      const minutes =
        Math.floor(
          (totalSeconds % 3600) /
            60
        );

      const seconds =
        totalSeconds % 60;

      if (days > 0) {
        return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
      }

      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    };


  const handleProductClick =
    (
      product: any
    ) => {

      if (!product.slug) {
        return;
      }

      onProductNavigate?.(
        product
      );

      navigate(
        `/product/${product.slug}`
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
                  role="link"
                  tabIndex={0}
                  onClick={() =>
                    handleProductClick(
                      product
                    )
                  }
                  onKeyDown={(event) => {

                    if (
                      event.key ===
                        "Enter" ||
                      event.key ===
                        " "
                    ) {

                      event.preventDefault();

                      handleProductClick(
                        product.id
                      );

                    }

                  }}
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

                    {
                      getSpecialPrice(
                        product
                      ) && (

                        <span
                          className="
                            absolute
                            left-1.5
                            top-1.5
                            z-10
                            inline-flex
                            items-center
                            gap-1
                            rounded-md
                            border
                            border-[#D8C27A]
                            bg-[#F5E6B8]
                            px-1.5
                            py-1
                            text-[7px]
                            font-bold
                            uppercase
                            leading-none
                            tracking-[0.06em]
                            text-[#8C6B0A]
                            shadow-sm
                          "
                        >
                          ✦ Special Price
                        </span>

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

                    {(() => {

                      const specialPrice =
                        getSpecialPrice(
                          product
                        );

                      const displayPrice =
                        specialPrice
                          ? specialPrice.price
                          : Number(
                              product.price
                            );

                      const regularPrice =
                        specialPrice
                          ? specialPrice.regularPrice
                          : Number(
                              product.price
                            );

                      const mrp =
                        Number(
                          product.compare_price ?? 0
                        );

                      const hasNormalDiscount =
                        !specialPrice &&
                        mrp >
                          displayPrice;

                      return (

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
                            {displayPrice.toFixed(0)}
                          </span>


                          {specialPrice ? (

                            <>

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
                                {regularPrice.toFixed(0)}
                              </span>

                              <span
                                className="
                                  inline-flex
                                  shrink-0
                                  items-center
                                  rounded-full
                                  border
                                  border-[#D8C27A]
                                  bg-[#F5E6B8]
                                  px-1.5
                                  py-0.5
                                  text-[7px]
                                  font-bold
                                  uppercase
                                  leading-none
                                  tracking-[0.06em]
                                  text-[#8C6B0A]
                                "
                              >
                                ✦ Special Price
                              </span>

                            </>

                          ) : hasNormalDiscount ? (

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
                              {mrp.toFixed(0)}
                            </span>

                          ) : null}

                        </div>

                      );

                    })()}


                    {
                      (() => {

                        const specialPrice =
                          getSpecialPrice(
                            product
                          );

                        if (!specialPrice) {
                          return null;
                        }

                        return (

                          <div
                            className="
                              mt-1.5
                              inline-flex
                              h-5
                              w-fit
                              max-w-full
                              items-center
                              self-start
                              gap-1
                              rounded-full
                              border
                              border-[#D8C27A]/80
                              bg-[#FFF8E7]
                              px-2
                              text-[7px]
                              font-semibold
                              leading-none
                              text-[#8C6B0A]
                            "
                          >
                            <Timer
                              size={9}
                              strokeWidth={2.2}
                              className="shrink-0"
                            />
                            <span className="truncate">
                              {
                                formatSpecialCountdown(
                                  specialPrice.endsAt
                                )
                              }
                            </span>
                          </div>

                        );

                      })()
                    }


                    {/* =======================================
                        ADD BUTTON
                    ======================================== */}

                    <button
                      type="button"
                      onClick={(event) => {

                        event.stopPropagation();

                        handleAdd(
                          product
                        );

                      }}
                      className={`
                        mt-auto
                        flex
                        h-9
                        w-full
                        shrink-0
                        items-center
                        justify-center
                        gap-1.5
                        rounded-lg
                        text-[10px]
                        font-semibold
                        leading-none
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

                      <span
                        className="
                          inline-flex
                          items-center
                          justify-center
                          gap-1.5
                          leading-none
                        "
                      >

                        {
                          isAdded ? (

                            <>

                              <Check
                                size={11}
                                strokeWidth={2.7}
                                className="
                                  shrink-0
                                  animate-in
                                  zoom-in-50
                                  duration-200
                                "
                              />

                              <span>
                                Added
                              </span>

                            </>

                          ) : (

                            <>

                              <Plus
                                size={11}
                                strokeWidth={2.5}
                                className="
                                  shrink-0
                                "
                              />

                              <span>
                                Add
                              </span>

                            </>

                          )
                        }

                      </span>

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