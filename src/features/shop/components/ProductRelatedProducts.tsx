import {
  useQuery,
} from "@tanstack/react-query";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  supabase,
} from "@/shared/lib/supabase";

import {
  useCartActions,
} from "@/features/cart/hooks/useCartActions";

import {
  getEffectiveProductPrice,
  getSpecialDiscountAmount,
  hasSpecialProductDiscount,
} from "@/features/products/utils/specialDiscount";


interface ProductRelatedProductsProps {
  productId: string;
  categoryId?: string | null;
  subcategoryId?: string | null;
}


export default function ProductRelatedProducts({
  productId,
  categoryId,
  subcategoryId,
}: ProductRelatedProductsProps) {

  const {
    addToCart,
  } = useCartActions();


  const carouselRef =
    useRef<HTMLDivElement | null>(null);


  const [
    addedProductId,
    setAddedProductId,
  ] = useState<string | null>(null);

  /*
   * =========================================================
   * SPECIAL OFFER COUNTDOWN
   *
   * One shared clock keeps every related-product card in sync
   * without creating an interval for every card.
   * =========================================================
   */

  const [
    now,
    setNow,
  ] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);


  const {
    data: products = [],
    isLoading,
  } = useQuery({

    queryKey: [
      "product-related-products",
      productId,
      categoryId,
      subcategoryId,
    ],

    queryFn: async () => {

      const excludedIds = [
        productId,
      ];


      let candidates: any[] = [];


      /*
       * Same subcategory gets first priority.
       */

      if (subcategoryId) {

        const {
          data,
          error,
        } = await supabase

          .from("products")

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

          .eq(
            "subcategory_id",
            subcategoryId
          )

          .not(
            "id",
            "in",
            `(${excludedIds.join(",")})`
          )

          .order(
            "best_seller",
            {
              ascending: false,
            }
          )

          .order(
            "trending",
            {
              ascending: false,
            }
          )

          .order(
            "sales_count",
            {
              ascending: false,
            }
          )

          .limit(
            8
          );


        if (error) {
          throw error;
        }


        candidates = data ?? [];

      }


      /*
       * Fill remaining slots with same-category products.
       */

      if (
        candidates.length < 8 &&
        categoryId
      ) {

        const existingIds = [
          productId,
          ...candidates.map(
            (product) =>
              product.id
          ),
        ];


        const {
          data,
          error,
        } = await supabase

          .from("products")

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

          .eq(
            "category_id",
            categoryId
          )

          .not(
            "id",
            "in",
            `(${existingIds.join(",")})`
          )

          .order(
            "best_seller",
            {
              ascending: false,
            },
          )

          .order(
            "trending",
            {
              ascending: false,
            },
          )

          .order(
            "sales_count",
            {
              ascending: false,
            },
          )

          .limit(
            8 - candidates.length
          );


        if (error) {
          throw error;
        }


        candidates = [
          ...candidates,
          ...(data ?? []),
        ];

      }


      /*
       * Store-wide fallback if there aren't enough related products.
       */

      if (
        candidates.length < 4
      ) {

        const existingIds = [
          productId,
          ...candidates.map(
            (product) =>
              product.id
          ),
        ];


        const {
          data,
          error,
        } = await supabase

          .from("products")

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
            `(${existingIds.join(",")})`
          )

          .order(
            "best_seller",
            {
              ascending: false,
            }
          )

          .order(
            "trending",
            {
              ascending: false,
            }
          )

          .order(
            "sales_count",
            {
              ascending: false,
            }
          )

          .limit(
            8 - candidates.length
          );


        if (error) {
          throw error;
        }


        candidates = [
          ...candidates,
          ...(data ?? []),
        ];

      }


      return candidates.slice(
        0,
        8
      );

    },

    enabled:
      !!productId,

    staleTime:
      5 * 60 * 1000,

  });


  if (
    isLoading ||
    products.length === 0
  ) {

    return null;

  }


  /*
   * =========================================================
   * SPECIAL PRICE HELPERS
   * =========================================================
   */

  const getCountdownSeconds = (
    product: any
  ) => {
    if (
      !hasSpecialProductDiscount(product) ||
      !product.special_discount_ends_at
    ) {
      return null;
    }

    const endsAt =
      new Date(
        product.special_discount_ends_at
      ).getTime();

    if (!Number.isFinite(endsAt)) {
      return null;
    }

    return Math.max(
      0,
      Math.ceil(
        (endsAt - now) / 1000
      )
    );
  };


  const formatCountdown = (
    totalSeconds: number
  ) => {
    const days =
      Math.floor(
        totalSeconds / 86400
      );

    const hours =
      Math.floor(
        (totalSeconds % 86400) / 3600
      );

    const minutes =
      Math.floor(
        (totalSeconds % 3600) / 60
      );

    const seconds =
      totalSeconds % 60;

    const paddedHours =
      String(hours).padStart(2, "0");

    const paddedMinutes =
      String(minutes).padStart(2, "0");

    const paddedSeconds =
      String(seconds).padStart(2, "0");

    if (days > 0) {
      return `${days}d ${paddedHours}h ${paddedMinutes}m ${paddedSeconds}s`;
    }

    if (hours > 0) {
      return `${paddedHours}h ${paddedMinutes}m ${paddedSeconds}s`;
    }

    if (minutes > 0) {
      return `${paddedMinutes}m ${paddedSeconds}s`;
    }

    return `${paddedSeconds}s`;
  };


  const getSpecialPriceDetails = (
    product: any
  ) => {
    const hasSpecialDiscount =
      hasSpecialProductDiscount(
        product
      );

    const effectivePrice =
      getEffectiveProductPrice(
        product
      );

    const originalPrice =
      Number(product.price ?? 0);

    const comparePrice =
      Number(
        product.compare_price ?? 0
      );

    const mrp =
      comparePrice > originalPrice
        ? comparePrice
        : 0;

    const specialDiscountAmount =
      hasSpecialDiscount
        ? getSpecialDiscountAmount(
            product
          )
        : 0;

    const countdownSeconds =
      hasSpecialDiscount
        ? getCountdownSeconds(
            product
          )
        : null;

    return {
      hasSpecialDiscount,
      effectivePrice,
      originalPrice,
      mrp,
      specialDiscountAmount,
      countdownSeconds,
    };
  };


  /*
   * =========================================================
   * IMAGE
   * =========================================================
   */

  const getImage = (
    product: any
  ) => {

    const images =
      product.product_images ?? [];


    const primary =
      images.find(
        (image: any) =>
          image.is_primary
      );


    const sorted =
      [...images].sort(
        (
          a: any,
          b: any
        ) =>
          (
            a.sort_order ?? 0
          ) -
          (
            b.sort_order ?? 0
          )
      );


    return (
      primary?.image_url ||
      sorted[0]?.image_url ||
      ""
    );

  };


  const handleAddToCart = (
    product: any
  ) => {

    if (
      Number(product.stock ?? 0) <= 0
    ) {
      return;
    }


    addToCart(
      product
    );


    setAddedProductId(
      product.id
    );


    window.setTimeout(
      () => {
        setAddedProductId(
          null
        );
      },
      1400
    );

  };


  const scrollLeft = () => {

    carouselRef.current?.scrollBy({

      left:
        -(carouselRef.current.clientWidth * 0.92),

      behavior:
        "smooth",

    });

  };


  const scrollRight = () => {

    carouselRef.current?.scrollBy({

      left:
        carouselRef.current.clientWidth * 0.92,

      behavior:
        "smooth",

    });

  };


  return (

    <section
      className="
        mt-14
        border-t
        border-white/10
        pt-10

        sm:mt-16
        sm:pt-12
      "
    >

      {/* =================================================
          HEADER
      ================================================== */}

      <div
        className="
          flex
          items-end
          justify-between
          gap-4
        "
      >

        <div>

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <Sparkles
              size={17}
              className="
                text-[#C8A44D]
              "
            />

            <h2
              className="
                text-lg
                font-semibold
                tracking-tight

                sm:text-xl
              "
            >

              You May Also Like

            </h2>

          </div>


          <p
            className="
              mt-1
              text-xs
              text-white/50

              sm:text-sm
            "
          >

            Complete your look with these picks

          </p>

        </div>


        {/* DESKTOP CAROUSEL ARROWS */}

        {
          products.length > 4 && (

            <div
              className="
                hidden
                items-center
                gap-2

                sm:flex
              "
            >

              {/* BACK */}

              <button
                type="button"
                onClick={
                  scrollLeft
                }
                aria-label="View previous related products"
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center

                  rounded-full
                  border
                  border-[#C8A44D]/50

                  bg-black

                  text-[#C8A44D]

                  shadow-[0_6px_20px_rgba(0,0,0,0.28)]

                  transition-all
                  duration-200

                  hover:border-[#C8A44D]
                  hover:bg-[#C8A44D]
                  hover:text-black
                  hover:shadow-[0_8px_24px_rgba(200,164,77,0.22)]

                  active:scale-95
                "
              >

                <ChevronLeft
                  size={20}
                  strokeWidth={2}
                />

              </button>


              {/* NEXT */}

              <button
                type="button"
                onClick={
                  scrollRight
                }
                aria-label="View more related products"
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center

                  rounded-full
                  border
                  border-[#C8A44D]/50

                  bg-black

                  text-[#C8A44D]

                  shadow-[0_6px_20px_rgba(0,0,0,0.28)]

                  transition-all
                  duration-200

                  hover:border-[#C8A44D]
                  hover:bg-[#C8A44D]
                  hover:text-black
                  hover:shadow-[0_8px_24px_rgba(200,164,77,0.22)]

                  active:scale-95
                "
              >

                <ChevronRight
                  size={20}
                  strokeWidth={2}
                />

              </button>

            </div>

          )
        }

      </div>


      {/* =================================================
          PRODUCT CAROUSEL
      ================================================== */}

      <div
        className="
          relative
          mt-6
        "
      >

        <div
          ref={
            carouselRef
          }

          className="
            flex
            gap-3
            overflow-x-auto
            overscroll-x-contain
            pb-2

            snap-x
            snap-mandatory

            [-ms-overflow-style:none]
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden

            sm:gap-5
          "
        >

          {
            products.map(
              (
                product: any
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
                      group
                      w-[calc((100vw-51px)/2)]
                      min-w-[calc((100vw-51px)/2)]
                      shrink-0
                      snap-start

                      sm:w-[calc((100%-15px)/2)]
                      sm:min-w-[calc((100%-15px)/2)]

                      lg:w-[calc((100%-60px)/4)]
                      lg:min-w-[calc((100%-60px)/4)]
                    "
                  >

                    {/* IMAGE */}

                    <Link
                      to={
                        `/product/${product.slug}`
                      }

                      className="
                        block
                      "
                    >

                      <div
                        className="
                          relative
                          aspect-square
                          overflow-hidden
                          rounded-2xl

                          border
                          border-white/10

                          bg-white/[0.05]

                          shadow-[0_8px_24px_rgba(0,0,0,0.14)]
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
                                object-cover

                                transition-transform
                                duration-500
                                ease-out

                                group-hover:scale-105
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

                                text-2xl
                              "
                            >

                              ✨

                            </div>

                          )
                        }

                      </div>

                    </Link>


                    {/* DETAILS */}

                    <div
                      className="
                        pt-3
                      "
                    >

                      <Link
                        to={
                          `/product/${product.slug}`
                        }

                        className="
                          block
                        "
                      >

                        <p
                          className="
                            line-clamp-2
                            min-h-[40px]

                            text-xs
                            font-medium
                            leading-5
                            text-white

                            transition-colors
                            duration-200

                            group-hover:text-[#D4AF37]

                            sm:text-sm
                          "
                        >

                          {
                            product.name
                          }

                        </p>

                      </Link>


                      {(() => {
                        const {
                          hasSpecialDiscount,
                          effectivePrice,
                          originalPrice,
                          mrp,
                          specialDiscountAmount,
                          countdownSeconds,
                        } =
                          getSpecialPriceDetails(
                            product
                          );

                        const regularDiscount =
                          product.compare_price &&
                          Number(
                            product.compare_price
                          ) >
                          effectivePrice
                            ? Math.round(
                                (
                                  (
                                    Number(
                                      product.compare_price
                                    ) -
                                    effectivePrice
                                  ) /
                                  Number(
                                    product.compare_price
                                  )
                                ) *
                                100
                              )
                            : 0;

                        return (
                          <>
                            {hasSpecialDiscount &&
                              mrp > 0 && (
                                <div
                                  className="
                                    mb-0.5
                                    text-[9px]
                                    font-medium
                                    uppercase
                                    tracking-[0.1em]
                                    text-white/40

                                    sm:text-[10px]
                                  "
                                >
                                  MRP ₹
                                  {mrp.toFixed(0)}
                                </div>
                              )}

                            <div
                              className="
                                flex
                                flex-wrap
                                items-baseline
                                gap-x-1.5
                                gap-y-1
                              "
                            >
                              <span
                                className="
                                  text-sm
                                  font-semibold
                                  text-white

                                  sm:text-base
                                "
                              >
                                ₹
                                {effectivePrice.toFixed(0)}
                              </span>

                              {hasSpecialDiscount && (
                                <span
                                  className="
                                    text-[10px]
                                    text-white/40
                                    line-through

                                    sm:text-xs
                                  "
                                >
                                  ₹
                                  {originalPrice.toFixed(0)}
                                </span>
                              )}

                              {!hasSpecialDiscount &&
                                product.compare_price &&
                                Number(
                                  product.compare_price
                                ) >
                                  Number(
                                    product.price
                                  ) && (
                                  <span
                                    className="
                                      text-[10px]
                                      text-white/40
                                      line-through

                                      sm:text-xs
                                    "
                                  >
                                    ₹
                                    {Number(
                                      product.compare_price
                                    ).toFixed(0)}
                                  </span>
                                )}

                              {hasSpecialDiscount && (
                                <span
                                  className="
                                    rounded-md
                                    border
                                    border-[#D4AF37]/50
                                    bg-[#D4AF37]/10
                                    px-1
                                    py-0.5
                                    text-[8px]
                                    font-semibold
                                    tracking-wide
                                    text-[#D4AF37]

                                    sm:px-1.5
                                    sm:text-[9px]
                                  "
                                >
                                  {product.special_discount_type ===
                                  "percentage"
                                    ? `${Math.min(
                                        Number(
                                          product.special_discount_value
                                        ) || 0,
                                        100
                                      )}% OFF`
                                    : `₹${specialDiscountAmount.toFixed(
                                        0
                                      )} OFF`}
                                </span>
                              )}

                              {!hasSpecialDiscount &&
                                regularDiscount > 0 && (
                                  <span
                                    className="
                                      text-[9px]
                                      font-medium
                                      text-[#D4AF37]

                                      sm:text-[10px]
                                    "
                                  >
                                    {regularDiscount}% OFF
                                  </span>
                                )}
                            </div>

                            {hasSpecialDiscount && (
                              <div
                                className="
                                  mt-1
                                  flex
                                  items-center
                                  gap-1.5
                                "
                              >
                                <span
                                  className="
                                    inline-flex
                                    items-center
                                    rounded-md
                                    bg-[#D4AF37]
                                    px-1.5
                                    py-0.5
                                    text-[8px]
                                    font-bold
                                    uppercase
                                    tracking-[0.1em]
                                    text-black

                                    sm:px-2
                                    sm:text-[9px]
                                  "
                                >
                                  ✦ SPECIAL PRICE
                                </span>

                                {countdownSeconds !== null &&
                                  countdownSeconds > 0 && (
                                    <span
                                      className="
                                        whitespace-nowrap
                                        text-[8px]
                                        font-medium
                                        text-[#D4AF37]

                                        sm:text-[9px]
                                      "
                                    >
                                      ⏱{" "}
                                      {formatCountdown(
                                        countdownSeconds
                                      )}
                                    </span>
                                  )}
                              </div>
                            )}
                          </>
                        );
                      })()}


                      {/* ADD TO CART */}

                      <button
                        type="button"

                        onClick={() =>
                          handleAddToCart(
                            product
                          )
                        }

                        disabled={
                          Number(
                            product.stock ?? 0
                          ) <= 0
                        }

                        className={`
                          mt-3
                          flex
                          h-10
                          w-full

                          items-center
                          justify-center
                          gap-1.5

                          rounded-xl

                          text-[11px]
                          font-semibold

                          transition-all
                          duration-200

                          active:scale-[0.97]

                          disabled:cursor-not-allowed
                          disabled:opacity-50

                          ${
                            isAdded
                              ? `
                                bg-green-500
                                text-white
                              `
                              : `
                                bg-[#D4AF37]
                                text-black

                                hover:bg-[#E5C45A]
                              `
                          }
                        `}
                      >

                        {
                          isAdded ? (

                            <>

                              <Check
                                size={14}
                                strokeWidth={2.7}
                                className="
                                  animate-in
                                  zoom-in-75
                                  duration-200
                                "
                              />

                              ADDED

                            </>

                          ) : (

                            <>

                              <ShoppingBag
                                size={14}
                                strokeWidth={2.2}
                              />

                              ADD TO CART

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


        {/* DESKTOP RIGHT-EDGE SWIPE CUE */}

        {
          products.length > 4 && (

            <div
              className="
                pointer-events-none
                absolute
                right-0
                top-0
                hidden
                h-full
                w-20

                bg-gradient-to-l
                from-black
                to-transparent

                lg:block
              "
            />

          )
        }

      </div>

    </section>

  );

}
