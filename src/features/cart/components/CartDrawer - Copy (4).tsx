import {
  X,
  Trash2,
  Minus,
  Plus,
  Check,
  Loader2,
  Sparkles,
  ChevronDown,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  validateCoupon,
} from "@/features/coupons/services/coupon.service";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import {
  useCartStore,
} from "../store/cart.store";

import CouponModal from "@/features/coupons/components/CouponModal";

import {
  useBestCoupon,
} from "@/features/coupons/hooks/useBestCoupon";

import {
  useUnlockCoupon,
} from "@/features/coupons/hooks/useUnlockCoupon";

import CheckoutDialog from "@/features/checkout/components/CheckoutDialog";

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/shared/lib/supabase";

import RelatedProducts from "@/features/cart/components/RelatedProducts";


interface CartBannerCoupon {
  id: string;
  code: string;
  cart_display_text: string | null;
  cart_display_priority: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
}

export default function CartDrawer() {

  /*
   * =========================================================
   * CART STORE
   * =========================================================
   */

  const {
    items,
    isCartOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getTotal,
    applyCoupon,
    removeCoupon,
    appliedCoupon,
    discount,
    getFinalTotal,
    clearStockError,
  } = useCartStore();


  /*
   * =========================================================
   * CUSTOMER AUTH
   * =========================================================
   */

  const {
    customer,
  } = useAuth();


  /*
   * =========================================================
   * STORE SETTINGS
   * =========================================================
   */

  const {
    data: storeSettings,
  } = useQuery({

    queryKey: [
      "store-settings",
    ],

    queryFn: async () => {

      const {
        data,
        error,
      } = await supabase

        .from(
          "store_settings"
        )

        .select(
          "free_shipping_threshold, free_gift_threshold, shipping_charge"
        )

        .single();


      if (error) {

        throw error;

      }


      return data;

    },

    staleTime:
      5 * 60 * 1000,

  });


  /*
   * =========================================================
   * CART BANNER COUPON
   * =========================================================
   *
   * Reads the promotional cart banner from the Coupons
   * section. Only coupons explicitly marked Show in Cart
   * and currently valid are eligible.
   *
   * The highest cart_display_priority wins.
   * =========================================================
   */

  const {
    data: cartBannerCoupons = [],
  } = useQuery<CartBannerCoupon[]>({
    queryKey: [
      "cart-banner-coupons",
    ],

    queryFn: async () => {
      const {
        data,
        error,
      } = await supabase
        .from("coupons")
        .select(
          "id, code, cart_display_text, cart_display_priority, is_active, starts_at, expires_at"
        )
        .eq(
          "show_in_cart",
          true
        )
        .eq(
          "is_active",
          true
        )
        .order(
          "cart_display_priority",
          {
            ascending: false,
          }
        );

      if (error) {
        throw error;
      }

      const now =
        new Date();

      return (data ?? []).filter(
        (coupon) => {
          const startsAt =
            coupon.starts_at
              ? new Date(
                  coupon.starts_at
                )
              : null;

          const expiresAt =
            coupon.expires_at
              ? new Date(
                  coupon.expires_at
                )
              : null;

          if (
            startsAt &&
            startsAt > now
          ) {
            return false;
          }

          if (
            expiresAt &&
            expiresAt < now
          ) {
            return false;
          }

          return true;
        }
      );
    },

    staleTime:
      5 * 60 * 1000,

    enabled:
      isCartOpen,
  });


  /*
   * =========================================================
   * CART BANNER ROTATION
   * =========================================================
   *
   * Shows every active cart promotion one after another.
   * The list comes from Admin > Coupons > Show in Cart.
   * =========================================================
   */

  const [
    activeCartBannerIndex,
    setActiveCartBannerIndex,
  ] = useState(0);


  useEffect(() => {
    if (cartBannerCoupons.length <= 1) {
      setActiveCartBannerIndex(0);
      return;
    }

    setActiveCartBannerIndex(
      current =>
        current >= cartBannerCoupons.length
          ? 0
          : current
    );

    const interval =
      window.setInterval(() => {
        setActiveCartBannerIndex(
          current =>
            (current + 1) %
            cartBannerCoupons.length
        );
      }, 3200);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    cartBannerCoupons.length,
  ]);


  const activeCartBanner =
    cartBannerCoupons[
      activeCartBannerIndex
    ] ?? null;


  /*
   * =========================================================
   * TOTALS
   * =========================================================
   */

  const total =
    getTotal();

  const finalTotal =
    getFinalTotal();


  /*
   * =========================================================
   * STOCK LIMIT MESSAGE
   * =========================================================
   *
   * Stores the ID of the product whose + button was clicked
   * after reaching its maximum available stock.
   * =========================================================
   */

  const [
    stockLimitItemId,
    setStockLimitItemId,
  ] = useState<string | null>(null);


  /*
   * =========================================================
   * STOCK LIMIT MESSAGE TIMER
   * =========================================================
   */

  useEffect(() => {

    if (!stockLimitItemId) {
      return;
    }


    const timer =
      window.setTimeout(() => {

        setStockLimitItemId(
          null
        );

      }, 3000);


    return () => {

      window.clearTimeout(
        timer
      );

    };

  }, [
    stockLimitItemId,
  ]);


  /*
   * =========================================================
   * MOBILE BODY SCROLL LOCK
   * =========================================================
   */

  useEffect(() => {

    if (isCartOpen) {

      document.body.style.overflow =
        "hidden";

      document.body.style.position =
        "fixed";

      document.body.style.width =
        "100%";

    } else {

      document.body.style.overflow =
        "";

      document.body.style.position =
        "";

      document.body.style.width =
        "";

    }


    return () => {

      document.body.style.overflow =
        "";

      document.body.style.position =
        "";

      document.body.style.width =
        "";

    };

  }, [
    isCartOpen,
  ]);


  /*
   * =========================================================
   * BEST COUPON
   * =========================================================
   */

  const {
    bestCoupon,
  } = useBestCoupon(
    total
  );


  /*
   * =========================================================
   * CUSTOMER COUPON USAGE
   * =========================================================
   *
   * Used only for visibility. Coupon validation remains the
   * source of truth when applying a coupon.
   * =========================================================
   */

  const {
    data: usedCouponRows = [],
  } = useQuery({

    queryKey: [
      "customer-coupon-usage",
      customer?.id,
    ],

    queryFn: async () => {

      if (!customer?.id) {
        return [];
      }


      const {
        data,
        error,
      } = await supabase

        .from("coupon_usage")

        .select("coupon_id")

        .eq(
          "customer_id",
          customer.id
        );


      if (error) {
        throw error;
      }


      return data ?? [];

    },

    enabled: !!customer?.id && isCartOpen,

    staleTime: 0,

    refetchOnWindowFocus: true,

  });


  const usedCouponIds = new Set(
    usedCouponRows.map(
      (row: any) => row.coupon_id
    )
  );


  const bestCouponAvailable =
    !!bestCoupon &&
    !(
      bestCoupon.one_use_per_customer === true &&
      usedCouponIds.has(bestCoupon.id)
    );


  /*
   * =========================================================
   * COUPON ERROR
   * =========================================================
   */

  const {
    couponErrorMessage,
  } = useCartStore();


  /*
   * =========================================================
   * UNLOCK COUPON
   * =========================================================
   */

  const {
    unlockCoupon,
    remainingAmount,
  } = useUnlockCoupon(
    total
  );


  /*
   * =========================================================
   * LOCAL STATE
   * =========================================================
   */

  const [
    couponCode,
    setCouponCode,
  ] = useState("");


  const [
    couponLoading,
    setCouponLoading,
  ] = useState(false);


  const [
    couponMessage,
    setCouponMessage,
  ] = useState("");


  const [
    couponError,
    setCouponError,
  ] = useState("");


  const [
    showCoupons,
    setShowCoupons,
  ] = useState(false);


  const [
    checkoutOpen,
    setCheckoutOpen,
  ] = useState(false);


  /*
   * =========================================================
   * CHECKOUT COUPON REMINDER
   * =========================================================
   */

  const [
    showCheckoutCouponReminder,
    setShowCheckoutCouponReminder,
  ] = useState(false);

  const [
    dismissedCouponReminderKey,
  ] = useState("");

  const [
    applyingCheckoutCoupon,
    setApplyingCheckoutCoupon,
  ] = useState(false);


  const checkoutCouponReminderKey =
    bestCoupon
      ? `${bestCoupon.id}-${Math.round(total)}`
      : "";


  const handleProceedToCheckout = () => {

    if (
      !bestCouponAvailable ||
      appliedCoupon ||
      !bestCoupon ||
      dismissedCouponReminderKey ===
        checkoutCouponReminderKey
    ) {
      setCheckoutOpen(true);
      return;
    }

    setShowCheckoutCouponReminder(true);

  };


  const handleApplyCheckoutCoupon =
    async () => {

      if (!bestCoupon) {
        setShowCheckoutCouponReminder(false);
        setCheckoutOpen(true);
        return;
      }

      if (!customer) {
        setShowCheckoutCouponReminder(false);
        setShowCoupons(true);
        return;
      }

      try {

        setApplyingCheckoutCoupon(true);
        setCouponError("");

        const result =
          await validateCoupon(
            bestCoupon.code,
            total,
            customer.id,
            items
          );

        applyCoupon({

          id:
            result.coupon.id,

          code:
            result.coupon.code,

          title:
            result.coupon.title,

          discount:
            result.discount,

          freeShipping:
            result.freeShipping,

          freeGift:
            result.freeGift,

          minimumOrderAmount:
            result.coupon
              .minimum_order_amount,

        });

        setShowCheckoutCouponReminder(false);
        showCouponSuccess();

        window.setTimeout(() => {
          setCheckoutOpen(true);
        }, 350);

      } catch (error: any) {

        setCouponError(
          error?.message ||
          "Unable to apply this coupon right now."
        );

      } finally {

        setApplyingCheckoutCoupon(false);

      }

    };


  const handleContinueWithoutCoupon = () => {

    setShowCheckoutCouponReminder(false);
    setCheckoutOpen(true);

  };


  /*
   * =========================================================
   * COUPON SCROLL NAVIGATION
   * =========================================================
   */

  const couponSectionRef =
    useRef<HTMLDivElement | null>(null);


  const [
    showCouponNavigator,
    setShowCouponNavigator,
  ] = useState(true);


  const scrollToCoupons = () => {

    couponSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    setShowCouponNavigator(false);

  };


  useEffect(() => {

    /*
     * The coupon navigator should never appear when there
     * is no currently valid/available coupon for this cart
     * and customer.
     */

    if (
      !isCartOpen ||
      !bestCouponAvailable
    ) {
      setShowCouponNavigator(false);
      return;
    }


    setShowCouponNavigator(true);


    const couponSection =
      couponSectionRef.current;

    if (!couponSection) {
      return;
    }


    const observer =
      new IntersectionObserver(
        ([entry]) => {

          setShowCouponNavigator(
            !entry.isIntersecting
          );

        },
        {
          threshold: 0.2,
        }
      );


    observer.observe(
      couponSection
    );


    return () => {
      observer.disconnect();
    };

  }, [
    isCartOpen,
    items.length,
    bestCouponAvailable,
  ]);


  const [
    couponSuccess,
    setCouponSuccess,
  ] = useState(false);


  const [
    couponAnimationKey,
    setCouponAnimationKey,
  ] = useState(0);


  /*
   * =========================================================
   * COUPON SUCCESS ANIMATION
   * =========================================================
   */

  const showCouponSuccess = () => {

    setCouponSuccess(true);

    setCouponAnimationKey(
      value => value + 1
    );

    window.setTimeout(() => {
      setCouponSuccess(false);
    }, 1800);

  };


  /*
   * =========================================================
   * COMBINED OFFER PROGRESS
   * =========================================================
   */

  const freeGiftAmount =
    Number(
      storeSettings?.free_gift_threshold
    ) || 0;


  const freeShippingAmount =
    Number(
      storeSettings?.free_shipping_threshold
    ) || 0;


  const freeGiftUnlocked =
    freeGiftAmount > 0 &&
    total >=
      freeGiftAmount;


  const freeShippingUnlocked =
    freeShippingAmount > 0 &&
    total >=
      freeShippingAmount;


  const amountToFreeGift =
    Math.max(
      freeGiftAmount -
        total,
      0
    );


  const amountToFreeShipping =
    Math.max(
      freeShippingAmount -
        total,
      0
    );


  /*
   * Progress:
   *
   * ₹0 → Free Gift → Free Shipping
   */

  const combinedProgress =
    freeShippingAmount > 0

      ? Math.min(

          (
            total /
            freeShippingAmount
          ) * 100,

          100

        )

      : 0;


  /*
   * =========================================================
   * COUPON APPLY
   * =========================================================
   */

  const handleApplyCoupon =
    async () => {

      if (
        !couponCode.trim()
      ) {

        return;

      }


      try {

        setCouponLoading(
          true
        );

        setCouponError(
          ""
        );

        setCouponMessage(
          ""
        );


        if (!customer) {

          throw new Error(
            "Please log in to use a coupon"
          );

        }


        const result =
          await validateCoupon(
            couponCode,
            total,
            customer.id,
            items
          );


        applyCoupon({

          id:
            result.coupon.id,

          code:
            result.coupon.code,

          title:
            result.coupon.title,

          discount:
            result.discount,

          freeShipping:
            result.freeShipping,

          freeGift:
            result.freeGift,

          minimumOrderAmount:
            result.coupon
              .minimum_order_amount,

        });


        setCouponMessage(

          result.freeShipping

            ? "🎉 Free shipping coupon applied!"

            : result.freeGift

              ? "🎁 Free gift coupon applied!"

              : `Coupon applied! You saved ₹${result.discount}`

        );

        showCouponSuccess();

      }

      catch (
        error: any
      ) {

        setCouponError(
          error.message ||
          "Invalid coupon"
        );

      }

      finally {

        setCouponLoading(
          false
        );

      }

    };


  /*
   * =========================================================
   * HANDLE PLUS CLICK
   * =========================================================
   */

  const handleIncreaseQuantity =
    async (
      item: (typeof items)[number]
    ) => {

      /*
       * If we already know the latest database stock
       * and the cart has reached that limit, don't make
       * another request.
       */

      if (
        item.stock !== null &&
        item.stock !== Infinity &&
        item.quantity >= item.stock
      ) {

        setStockLimitItemId(
          item.id
        );

        return;

      }


      /*
       * Try to increase quantity.
       */

      const updated =
        await updateQuantity(
          item.id,
          item.quantity + 1
        );


      /*
       * If the store rejected the increase because the
       * database stock was reached, show our friendly
       * product-specific message.
       */

      if (!updated) {

        setStockLimitItemId(
          item.id
        );


        /*
         * Clear the generic store message because we're
         * showing the nicer inline message instead.
         */

        clearStockError();

      }

    };


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <>

      {/* =====================================================
          OVERLAY
      ====================================================== */}

      <div

        onClick={
          closeCart
        }

        className={`

          fixed
          inset-0
          z-[999]

          bg-black/40

          transition-opacity
          duration-300

          ${
            isCartOpen
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }

        `}

      />


      {/* =====================================================
          CART DRAWER
      ====================================================== */}

      <div

        className={`

          fixed
          right-0
          top-0
          z-[1000]

          flex
          h-[100dvh]
          w-full
          max-w-md
          flex-col

          bg-white
          text-black

          shadow-2xl

          transition-transform
          duration-300
          ease-in-out

          ${
            isCartOpen
              ? "translate-x-0"
              : "translate-x-full"
          }

        `}

      >

        {/* ===================================================
            HEADER
        ==================================================== */}

        <div

          className="

            flex
            h-[76px]
            shrink-0

            items-center
            justify-between

            border-b
            bg-white

            px-4

            pt-[env(safe-area-inset-top)]

          "

        >

          <h2
            className="
              text-lg
              font-semibold
            "
          >

            Your Cart (
            {items.length}
            )

          </h2>


          <button

            onClick={
              closeCart
            }

            className="

              flex
              h-10
              w-10

              items-center
              justify-center

              rounded-full

              transition
              hover:bg-neutral-100

            "

            aria-label="Close cart"

          >

            <X
              size={22}
            />

          </button>

        </div>


        {/* ===================================================
            SCROLL CONTENT
        ==================================================== */}

        <div

          className="

            min-h-0
            flex-1

            overflow-y-auto
            overscroll-contain

            px-4
            pb-6
            pt-5

          "

        >

          {/* =================================================
              CART OFFERS
          ================================================== */}

          {
            items.length > 0 && (

              <>

                {/* OFFER BANNER */}

                {activeCartBanner && (
                  <div
                    key={activeCartBanner.id}
                    className="

                      relative
                      overflow-hidden

                      rounded-2xl

                      bg-black

                      px-4
                      py-4

                      text-center
                      text-sm
                      font-semibold
                      text-white

                    "
                  >

                    <div
                      key={`${activeCartBanner.id}-${activeCartBannerIndex}`}
                      className="
                        animate-in
                        fade-in
                        slide-in-from-right-4
                        duration-500
                      "
                    >

                      ✨{" "}
                      {activeCartBanner.cart_display_text?.trim() ||
                        "Special offer available"}{" "}
                      | Use Code :{" "}
                      {activeCartBanner.code}

                    </div>

                  </div>
                )}


                {/* =================================================
                    COMBINED FREE GIFT + FREE SHIPPING
                ================================================== */}

                <div
                  className="
                    mt-6
                  "
                >

                  {/* STATUS */}

                  <p
                    className="
                      text-sm
                      font-medium
                    "
                  >

                    {
                      freeShippingUnlocked ? (

                        <span
                          className="
                            text-green-600
                          "
                        >

                          ✓ Free Gift Unlocked

                          <span
                            className="
                              text-neutral-400
                            "
                          >
                            {" • "}
                          </span>

                          ✓ Free Shipping Unlocked

                        </span>

                      ) : freeGiftUnlocked ? (

                        <>

                          <span
                            className="
                              text-green-600
                            "
                          >

                            ✓ Free Gift Unlocked

                          </span>


                          <span
                            className="
                              text-neutral-500
                            "
                          >

                            {" • "}
                            Add ₹
                            {
                              amountToFreeShipping
                            }
                            {" "}
                            more for Free Shipping

                          </span>

                        </>

                      ) : (

                        <span>

                          Add ₹
                          {
                            amountToFreeGift
                          }
                          {" "}
                          more to unlock Free Gift

                        </span>

                      )
                    }

                  </p>


                  {/* =================================================
                      PROGRESS AREA
                  ================================================== */}

                  <div

                    className="

                      relative
                      mt-5
                      w-full
                      pb-9

                    "

                  >

                    {/* PROGRESS BAR */}

                    <div

                      className="

                        relative
                        h-2
                        w-full
                        rounded-full
                        bg-neutral-200

                      "

                    >

                      {/* FILLED */}

                      <div

                        className="

                          absolute
                          left-0
                          top-0

                          h-full

                          rounded-full

                          bg-black

                          transition-all
                          duration-500

                        "

                        style={{
                          width:
                            `${combinedProgress}%`,
                        }}

                      />


                      {/* FREE GIFT MILESTONE */}

                      <div

                        className="

                          absolute
                          left-1/2
                          top-1/2
                          z-20

                          -translate-x-1/2
                          -translate-y-1/2

                        "

                      >

                        <div

                          className={`

                            flex
                            h-6
                            w-6

                            items-center
                            justify-center

                            rounded-full

                            border-2
                            border-white

                            text-[11px]
                            font-bold

                            shadow-sm

                            ${
                              freeGiftUnlocked

                                ? "bg-green-500 text-white"

                                : "bg-neutral-300 text-neutral-600"
                            }

                          `}

                        >

                          {
                            freeGiftUnlocked
                              ? "✓"
                              : ""
                          }

                        </div>

                      </div>


                      {/* FREE SHIPPING MILESTONE */}

                      <div

                        className="

                          absolute
                          right-0
                          top-1/2
                          z-20

                          -translate-y-1/2

                        "

                      >

                        <div

                          className={`

                            flex
                            h-6
                            w-6

                            items-center
                            justify-center

                            rounded-full

                            border-2
                            border-white

                            text-[11px]
                            font-bold

                            shadow-sm

                            ${
                              freeShippingUnlocked

                                ? "bg-green-500 text-white"

                                : "bg-neutral-300 text-neutral-600"
                            }

                          `}

                        >

                          {
                            freeShippingUnlocked
                              ? "✓"
                              : ""
                          }

                        </div>

                      </div>

                    </div>


                    {/* LABEL ROW */}

                    <div

                      className="

                        pointer-events-none

                        absolute

                        left-0
                        right-0

                        top-5

                        h-10

                      "

                    >

                      {/* FREE GIFT LABEL */}

                      <div

                        className="

                          absolute

                          left-1/2

                          -translate-x-1/2

                          whitespace-nowrap

                          text-center

                        "

                      >

                        <p

                          className="

                            text-[11px]
                            font-medium
                            leading-4
                            text-black

                          "

                        >

                          ₹{freeGiftAmount.toFixed(0)}

                        </p>


                        <p

                          className="

                            text-[11px]
                            leading-4
                            text-neutral-500

                          "

                        >

                          Free Gift

                        </p>

                      </div>


                      {/* FREE SHIPPING LABEL */}

                      <div

                        className="

                          absolute

                          right-0

                          w-[82px]

                          whitespace-nowrap

                          text-center

                        "

                      >

                        <p

                          className="

                            text-[11px]
                            font-medium
                            leading-4
                            text-black

                          "

                        >

                          ₹{freeShippingAmount.toFixed(0)}

                        </p>


                        <p

                          className="

                            text-[11px]
                            leading-4
                            text-neutral-500

                          "

                        >

                          Free Shipping

                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </>

            )
          }


          {/* =================================================
              EMPTY CART / CART ITEMS
          ================================================== */}

          {
            items.length === 0

              ? (

                <div

                  className="

                    mt-10

                    rounded-3xl

                    border
                    border-neutral-200

                    bg-neutral-50

                    px-5
                    py-10

                    text-center

                  "

                >

                  <div

                    className="

                      mx-auto

                      flex
                      h-16
                      w-16

                      items-center
                      justify-center

                      rounded-full

                      bg-white

                      text-3xl

                      shadow-sm

                    "

                  >

                    🛍️

                  </div>


                  <h3

                    className="
                      mt-5
                      text-lg
                      font-semibold
                    "

                  >

                    Your cart is empty

                  </h3>


                  <p

                    className="

                      mt-2

                      text-sm
                      leading-relaxed
                      text-neutral-500

                    "

                  >

                    Looks like you haven't added
                    anything yet. Explore our
                    jewellery collection and find
                    your perfect piece.

                  </p>


                  <button

                    onClick={
                      closeCart
                    }

                    className="

                      mt-5

                      rounded-xl

                      bg-black

                      px-6
                      py-3

                      text-sm
                      font-medium
                      text-white

                    "

                  >

                    Continue Shopping

                  </button>

                </div>

              )

              : (

                <div

                  className="
                    mt-6
                    space-y-3
                  "

                >

                  {
                    items.map(
                      item => (

                        <div

                          key={
                            item.id
                          }

                          className="

                            rounded-2xl

                            border
                            border-neutral-200

                            p-3

                            sm:p-4

                          "

                        >

                          <div

                            className="
                              flex
                              gap-3
                            "

                          >

                            <img

                              src={
                                item.image
                              }

                              alt={
                                item.name
                              }

                              className="

                                h-20
                                w-20

                                shrink-0

                                rounded-xl

                                object-cover

                                sm:h-24
                                sm:w-24

                              "

                            />


                            <div

                              className="
                                min-w-0
                                flex-1
                              "

                            >

                              <div

                                className="
                                  flex
                                  justify-between
                                  gap-2
                                "

                              >

                                <p

                                  className="

                                    line-clamp-2

                                    text-sm
                                    font-medium
                                    leading-tight

                                  "

                                >

                                  {
                                    item.name
                                  }

                                </p>


                                <span

                                  className="
                                    shrink-0
                                    text-sm
                                    font-semibold
                                  "

                                >

                                  ₹
                                  {
                                    item.price
                                  }

                                </span>

                              </div>


                              {/* =========================================
                                  QUANTITY CONTROLS
                              ========================================== */}

                              <div

                                className="

                                  mt-4

                                  flex
                                  items-center
                                  gap-2

                                "

                              >

                                {/* MINUS */}

                                <button

                                  disabled={
                                    item.quantity === 1
                                  }

                                  onClick={() => {

                                    if (
                                      item.quantity <= 1
                                    ) {

                                      return;

                                    }


                                    void updateQuantity(
                                      item.id,
                                      item.quantity - 1
                                    );

                                  }}

                                  className={`

                                    flex
                                    h-8
                                    w-8

                                    items-center
                                    justify-center

                                    rounded-lg
                                    border

                                    transition

                                    ${
                                      item.quantity === 1

                                        ? "cursor-not-allowed opacity-30"

                                        : "hover:bg-neutral-100"
                                    }

                                  `}

                                  aria-label="Decrease quantity"

                                >

                                  <Minus
                                    size={14}
                                  />

                                </button>


                                {/* QUANTITY */}

                                <span

                                  className="

                                    min-w-5

                                    text-center

                                    text-sm

                                    font-medium

                                  "

                                >

                                  {
                                    item.quantity
                                  }

                                </span>


                                {/* PLUS */}

                                <button

                                  onClick={() =>
                                    handleIncreaseQuantity(
                                      item
                                    )
                                  }

                                  className="

                                    flex
                                    h-8
                                    w-8

                                    items-center
                                    justify-center

                                    rounded-lg
                                    border

                                    transition

                                    hover:bg-neutral-100

                                    active:scale-95

                                  "

                                  aria-label="Increase quantity"

                                >

                                  <Plus
                                    size={14}
                                  />

                                </button>


                                {/* DELETE */}

                                <button

                                  onClick={() =>
                                    removeItem(
                                      item.id
                                    )
                                  }

                                  className="

                                    ml-auto

                                    rounded-lg
                                    p-1

                                    text-red-500

                                    transition

                                    hover:bg-red-50
                                    active:scale-90

                                  "

                                  aria-label="Remove item"

                                >

                                  <Trash2
                                    size={17}
                                  />

                                </button>

                              </div>


                              {/* =========================================
                                  STOCK LIMIT MESSAGE
                              ========================================== */}

                              {
                                stockLimitItemId ===
                                  item.id && (

                                  <div

                                    className="

                                      mt-3

                                      flex
                                      items-start
                                      gap-2

                                      rounded-xl

                                      border
                                      border-[#C8A44D]/20

                                      bg-[#C8A44D]/[0.07]

                                      px-3
                                      py-2.5

                                      text-[11px]
                                      leading-4

                                      text-[#8A6D25]

                                      animate-in
                                      fade-in
                                      slide-in-from-top-1

                                      duration-200

                                    "

                                  >

                                    <span
                                      className="
                                        mt-0.5
                                        shrink-0
                                      "
                                    >
                                      ✨
                                    </span>

                                    <p>

                                      Only{" "}
                                      <span
                                        className="
                                          font-semibold
                                        "
                                      >
                                        {
                                          item.stock
                                        }
                                      </span>
                                      {" "}
                                      piece
                                      {
                                        item.stock !== 1
                                          ? "s"
                                          : ""
                                      }
                                      {" "}
                                      available —
                                      you've added them all. ♡

                                    </p>

                                  </div>

                                )
                              }


                              {/* =========================================
                                  AVAILABLE STOCK
                              ========================================== */}

                              {
                                item.stock !== null &&
                                item.stock !== Infinity &&
                                item.stock > 0 && (

                                  <p

                                    className="

                                      mt-2

                                      text-[10px]
                                      text-neutral-400

                                    "

                                  >

                                    {
                                      item.stock -
                                      item.quantity > 0

                                        ? `${item.stock - item.quantity} more available`

                                        : "Maximum available quantity added"

                                    }

                                  </p>

                                )
                              }

                            </div>

                          </div>

                        </div>

                      )
                    )
                  }

                </div>

              )
          }


          {/* =================================================
              RELATED PRODUCTS
              Compact upsell rail shown immediately after
              cart items and before coupon offers.
          ================================================== */}

          {
            items.length > 0 && (
              <div className="mt-6">
                <RelatedProducts
                  cartItems={items}
                />
              </div>
            )
          }


          {/* =================================================
              BEST COUPON
          ================================================== */}

          {
            items.length > 0 &&
            bestCouponAvailable &&
            !appliedCoupon && (

              <div

                className="

                  mt-6

                  rounded-2xl

                  bg-green-50

                  p-4

                "

              >

                <p
                  className="
                    font-medium
                  "
                >

                  🎉 Best offer available

                </p>


                <p

                  className="

                    mt-1

                    text-sm
                    text-neutral-600

                  "

                >

                  Use{" "}
                  {
                    bestCoupon.code
                  }
                  {" "}
                  and save ₹
                  {
                    bestCoupon.estimatedSaving
                  }

                </p>


                <button

                  onClick={
                    async () => {

                      if (!customer) {

                        throw new Error(
                          "Please log in to use a coupon"
                        );

                      }


                      const result =
                        await validateCoupon(
                          bestCoupon.code,
                          total,
                          customer.id,
                          items
                        );


                      applyCoupon({

                        id:
                          result.coupon.id,

                        code:
                          result.coupon.code,

                        title:
                          result.coupon.title,

                        discount:
                          result.discount,

                        freeShipping:
                          result.freeShipping,

                        freeGift:
                          result.freeGift,

                        minimumOrderAmount:
                          result.coupon
                            .minimum_order_amount,

                      });

                      showCouponSuccess();

                    }
                  }

                  className="

                    mt-3

                    rounded-xl

                    bg-black

                    px-4
                    py-2

                    text-sm
                    text-white

                  "

                >

                  Apply

                </button>

              </div>

            )
          }


          {/* =================================================
              UNLOCK COUPON
          ================================================== */}

          {
            items.length > 0 &&
            unlockCoupon &&
            !appliedCoupon && (

              <div

                className="

                  mt-5

                  rounded-2xl

                  bg-yellow-50

                  p-4

                "

              >

                <p
                  className="
                    font-medium
                  "
                >

                  🎁 Unlock{" "}
                  {
                    unlockCoupon.code
                  }

                </p>


                <p

                  className="

                    mt-1

                    text-sm
                    text-neutral-700

                  "

                >

                  Add ₹
                  {
                    remainingAmount
                  }
                  {" "}
                  more to get this offer

                </p>


                <button

                  onClick={() =>
                    setShowCoupons(
                      true
                    )
                  }

                  className="

                    mt-3

                    text-sm
                    font-semibold

                  "

                >

                  View Offer →

                </button>

              </div>

            )
          }


          {/* =================================================
              COUPON BOX
          ================================================== */}

          {
            items.length > 0 && (

              <div

                ref={couponSectionRef}

                className="

                  mt-6

                  scroll-mt-6

                  rounded-2xl

                  border
                  border-neutral-200

                  p-4

                "

              >

                {
                  appliedCoupon

                    ? (

                      <div

                        className="

                          flex
                          items-start
                          justify-between
                          gap-3

                          rounded-xl

                          border
                          border-green-200

                          bg-green-50

                          p-3

                          animate-in
                          fade-in
                          slide-in-from-top-2
                          duration-300
                          shadow-sm

                        "

                      >

                        <div>

                          <p
                            className="
                              font-medium
                            "
                          >

                            ✓{" "}
                            {
                              appliedCoupon.code
                            }

                          </p>


                          <p

                            className="

                              mt-1

                              text-sm
                              text-green-700

                            "

                          >

                            {
                              appliedCoupon.freeShipping

                                ? "🎉 Free shipping unlocked"

                                : appliedCoupon.freeGift

                                  ? "🎁 Free gift unlocked"

                                  : `You saved ₹${discount}`
                            }

                          </p>

                        </div>


                        <button

                          onClick={() => {

                            removeCoupon();

                            setCouponCode(
                              ""
                            );

                            setCouponMessage(
                              ""
                            );

                            setCouponError(
                              ""
                            );

                          }}

                          className="
                            text-sm
                            text-red-500
                          "

                        >

                          Remove

                        </button>

                      </div>

                    )

                    : (

                      <>

                        {/* COUPON INPUT */}

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >

                          <input

                            value={
                              couponCode
                            }

                            onChange={(
                              e
                            ) =>
                              setCouponCode(
                                e.target.value
                              )
                            }

                            placeholder="Enter Coupon Code"

                            className="

                              min-w-0
                              flex-1

                              rounded-xl

                              border

                              px-4
                              py-3

                              text-left
                              text-sm

                              placeholder:text-sm
                              placeholder:text-neutral-500

                              outline-none

                              focus:border-black

                            "

                          />


                          <button

                            onClick={
                              handleApplyCoupon
                            }

                            disabled={
                              couponLoading
                            }

                            className="

                              shrink-0

                              rounded-xl

                              bg-black

                              px-4

                              py-3

                              text-sm
                              font-medium
                              text-white

                              disabled:opacity-50

                            "

                          >

                            {
                              couponLoading
                                ? (
                                  <span className="flex items-center gap-1.5">
                                    <Loader2 size={14} className="animate-spin" />
                                    Applying
                                  </span>
                                )
                                : "Apply"
                            }

                          </button>

                        </div>


                        <button

                          onClick={() =>
                            setShowCoupons(
                              true
                            )
                          }

                          className="

                            mt-4

                            w-full

                            text-sm
                            font-medium

                          "

                        >

                          View All Offers →

                        </button>

                      </>

                    )
                }


                {
                  couponMessage && (

                    <p

                      className="

                        mt-3

                        text-sm
                        text-green-600

                      "

                    >

                      {
                        couponMessage
                      }

                    </p>

                  )
                }


                {
                  couponErrorMessage && (

                    <p

                      className="

                        mt-3

                        text-sm
                        text-red-500

                      "

                    >

                      {
                        couponErrorMessage
                      }

                    </p>

                  )
                }


                {
                  couponError && (

                    <p

                      className="

                        mt-3

                        text-sm
                        text-red-500

                      "

                    >

                      {
                        couponError
                      }

                    </p>

                  )
                }

              </div>

            )
          }

        </div>


        {/* ===================================================
            SIDE COUPON NAVIGATOR
        ==================================================== */}

        {
          items.length > 0 &&
          bestCouponAvailable &&
          showCouponNavigator && (

            <button
              type="button"
              onClick={scrollToCoupons}
              aria-label="Tap to view coupons"
              className="
                absolute
                right-3
                bottom-[292px]
                z-30

                flex
                items-center
                gap-1.5

                rounded-full
                border
                border-neutral-200

                bg-white/95
                px-2
                py-2

                text-[10px]
                font-semibold
                text-neutral-800

                shadow-[0_6px_20px_rgba(0,0,0,0.14)]
                backdrop-blur

                transition-all
                duration-200

                hover:-translate-y-0.5
                hover:shadow-[0_8px_24px_rgba(0,0,0,0.16)]

                active:scale-95

                animate-in
                fade-in
                slide-in-from-right-2
                duration-300
              "
            >

              <span className="
                whitespace-nowrap
                leading-none
              ">
                Tap to view coupons
              </span>

              <span
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-black
                  text-white
                  shadow-sm
                  animate-bounce
                "
              >

                <ChevronDown
                  size={15}
                  strokeWidth={2.5}
                />

              </span>

            </button>

          )
        }


        {/* ===================================================
            FIXED FOOTER
        ==================================================== */}

        <div

          className="

            shrink-0

            border-t

            bg-white

            px-4

            pb-[env(safe-area-inset-bottom)]

            pt-4

          "

        >

          {
            items.length > 0

              ? (

                <>

                  <div

                    className="
                      space-y-3
                      text-sm
                    "

                  >

                    {/* SUBTOTAL */}

                    <div

                      className="
                        flex
                        justify-between
                      "

                    >

                      <span>
                        Subtotal
                      </span>


                      <span>

                        ₹
                        {
                          total.toFixed(2)
                        }

                      </span>

                    </div>


                    {/* COUPON */}

                    {
                      appliedCoupon && (

                        <div

                          className="

                            flex
                            justify-between

                            text-green-600

                          "

                        >

                          <span>

                            Coupon (
                            {
                              appliedCoupon.code
                            }
                            )

                          </span>


                          <span>

                            -₹
                            {
                              discount.toFixed(2)
                            }

                          </span>

                        </div>

                      )
                    }


                    {/* SHIPPING */}

                    <div

                      className="

                        flex
                        justify-between

                        text-neutral-600

                      "

                    >

                      <span>
                        Shipping
                      </span>


                      <span>

                        {
                          freeShippingUnlocked ||
                          appliedCoupon?.freeShipping

                            ? "FREE"

                            : "Calculated at checkout"
                        }

                      </span>

                    </div>


                    {/* TOTAL */}

                    <div

                      className="

                        flex
                        justify-between

                        border-t

                        pt-3

                        text-lg
                        font-bold

                      "

                    >

                      <span>
                        Estimated Total
                      </span>


                      <span>

                        ₹
                        {
                          finalTotal.toFixed(2)
                        }

                      </span>

                    </div>

                  </div>


                  {/* CHECKOUT */}

                  <button

                    onClick={
                      handleProceedToCheckout
                    }

                    className="

                      mt-4

                      flex
                      w-full

                      items-center
                      justify-center

                      rounded-xl

                      bg-black

                      py-3.5

                      text-sm
                      font-semibold
                      text-white

                      transition

                      active:scale-[0.98]

                      hover:bg-neutral-800

                    "

                  >

                    Continue To Checkout

                  </button>


                  <p

                    className="

                      mt-2

                      text-center

                      text-xs
                      text-neutral-500

                    "

                  >

                    ⚡ Dispatched in 1 day

                  </p>

                </>

              )

              : (

                <div
                  className="
                    text-center
                  "
                >

                  <p

                    className="
                      text-sm
                      text-neutral-500
                    "

                  >

                    Add jewellery pieces to continue shopping

                  </p>


                  <button

                    onClick={
                      closeCart
                    }

                    className="

                      mt-4

                      w-full

                      rounded-xl

                      bg-black

                      py-3.5

                      text-sm
                      font-semibold
                      text-white

                    "

                  >

                    Start Shopping

                  </button>

                </div>

              )
          }

        </div>

      </div>


      {/* =====================================================
          CHECKOUT COUPON REMINDER
      ====================================================== */}

      {showCheckoutCouponReminder &&
        bestCoupon && (

        <div
          className="
            fixed inset-0 z-[1400]
            flex items-center justify-center
            bg-black/45 px-4
            backdrop-blur-[3px]
            animate-in fade-in duration-200
          "
        >

          <div
            className="
              relative w-full max-w-sm
              overflow-hidden rounded-[28px]
              bg-white
              shadow-[0_24px_80px_rgba(0,0,0,0.25)]
              animate-in zoom-in-95 slide-in-from-bottom-3
              duration-300
            "
          >

            <div
              className="
                pointer-events-none absolute -right-16 -top-16
                h-40 w-40 rounded-full
                bg-[#D4AF37]/15 blur-2xl
              "
            />

            <div
              className="
                pointer-events-none absolute -bottom-20 -left-16
                h-40 w-40 rounded-full
                bg-[#D4AF37]/10 blur-2xl
              "
            />

            <button
              type="button"
              onClick={handleContinueWithoutCoupon}
              className="
                absolute right-3 top-3 z-10
                flex h-9 w-9 items-center justify-center
                rounded-full text-neutral-500
                transition hover:bg-neutral-100 hover:text-black
                active:scale-95
              "
              aria-label="Close coupon reminder"
            >
              <X size={18} />
            </button>

            <div className="relative px-6 pb-6 pt-8 text-center">

              <div
                className="
                  mx-auto flex h-14 w-14 items-center justify-center
                  rounded-full bg-[#D4AF37]/10 text-[#B28A20]
                  shadow-inner animate-in zoom-in duration-500
                "
              >
                <Sparkles size={27} strokeWidth={1.8} />
              </div>

              <p
                className="
                  mt-4 text-[11px] font-semibold uppercase
                  tracking-[0.18em] text-[#A27B16]
                "
              >
                Don't miss your savings
              </p>

              <h3
                className="
                  mt-2 text-2xl font-semibold tracking-tight
                  text-neutral-900
                "
              >
                Wait! You can save{" "}
                <span className="text-[#B28A20]">
                  ₹{Number(
                    bestCoupon.estimatedSaving ?? 0
                  ).toLocaleString("en-IN")}
                </span>
              </h3>

              <p
                className="
                  mx-auto mt-2 max-w-[280px]
                  text-sm leading-5 text-neutral-500
                "
              >
                You have an available offer for this order.
                Apply it before checking out.
              </p>

              <div
                className="
                  relative mt-5 overflow-hidden rounded-2xl
                  border border-[#D4AF37]/30 bg-[#FBF7EA]
                  px-4 py-4 text-left shadow-sm
                "
              >

                <div className="flex items-center justify-between gap-3">

                  <div className="min-w-0">

                    <p className="text-xs font-medium text-[#8B6B18]">
                      Available offer
                    </p>

                    <p className="mt-1 truncate text-base font-semibold text-neutral-900">
                      {bestCoupon.title}
                    </p>

                  </div>

                  <span
                    className="
                      shrink-0 rounded-full bg-black
                      px-3 py-1.5 text-[11px] font-semibold
                      tracking-wide text-white
                    "
                  >
                    {bestCoupon.code}
                  </span>

                </div>

                <div
                  className="
                    mt-3 flex items-center gap-2
                    text-xs text-neutral-600
                  "
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                  Save ₹{Number(
                    bestCoupon.estimatedSaving ?? 0
                  ).toLocaleString("en-IN")} on this order
                </div>

              </div>

              <button
                type="button"
                onClick={handleApplyCheckoutCoupon}
                disabled={applyingCheckoutCoupon}
                className="
                  mt-5 flex w-full items-center justify-center gap-2
                  rounded-2xl bg-black px-5 py-3.5
                  text-sm font-semibold text-white shadow-lg
                  transition hover:bg-neutral-800 active:scale-[0.98]
                  disabled:cursor-not-allowed disabled:opacity-60
                "
              >

                {applyingCheckoutCoupon ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    Apply & Save ₹{Number(
                      bestCoupon.estimatedSaving ?? 0
                    ).toLocaleString("en-IN")}
                  </>
                )}

              </button>

              <button
                type="button"
                onClick={handleContinueWithoutCoupon}
                disabled={applyingCheckoutCoupon}
                className="
                  mt-3 w-full py-2 text-xs font-medium
                  text-neutral-500 transition hover:text-black
                  disabled:opacity-50
                "
              >
                Continue without saving
              </button>

              {couponError && (
                <p className="mt-2 text-xs text-red-500">
                  {couponError}
                </p>
              )}

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          COUPON MODAL
      ====================================================== */}

      <CouponModal

        open={
          showCoupons
        }

        onClose={() =>
          setShowCoupons(
            false
          )
        }

        cartTotal={
          total
        }

        appliedCoupon={
          appliedCoupon
        }

        onApply={
          async (
            coupon
          ) => {

            try {

              setCouponLoading(
                true
              );

              setCouponError(
                ""
              );

              setCouponMessage(
                ""
              );


              if (!customer) {

                throw new Error(
                  "Please log in to use a coupon"
                );

              }


              const result =
                await validateCoupon(
                  coupon.code,
                  total,
                  customer.id,
                  items
                );


              applyCoupon({

                id:
                  result.coupon.id,

                code:
                  result.coupon.code,

                title:
                  result.coupon.title,

                discount:
                  result.discount,

                freeShipping:
                  result.freeShipping,

                freeGift:
                  result.freeGift,

                minimumOrderAmount:
                  result.coupon
                    .minimum_order_amount,

              });


              setCouponMessage(

                result.freeShipping

                  ? "🎉 Free shipping coupon applied!"

                  : result.freeGift

                    ? "🎁 Free gift coupon applied!"

                    : `Coupon applied! You saved ₹${result.discount}`

              );

              showCouponSuccess();

              setShowCoupons(
                false
              );

            }

            catch (
              error: any
            ) {

              setCouponError(
                error.message ||
                "Invalid coupon"
              );

            }

            finally {

              setCouponLoading(
                false
              );

            }

          }
        }

      />


      {couponSuccess && (

        <div
          key={couponAnimationKey}
          className="
            fixed
            left-1/2
            top-5
            z-[1300]
            w-[calc(100%-32px)]
            max-w-sm
            -translate-x-1/2
            animate-in
            fade-in
            slide-in-from-top-3
            duration-300
          "
        >

          <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-white px-4 py-3 shadow-xl">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 animate-in zoom-in duration-300">
              <Check size={18} strokeWidth={2.5} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-900">Coupon applied</p>
              <p className="mt-0.5 text-xs text-neutral-500">Your savings have been updated.</p>
            </div>

            <Sparkles size={17} className="shrink-0 text-[#C8A44D] animate-pulse" />

          </div>

        </div>

      )}


      {/* =====================================================
          CHECKOUT DIALOG
      ====================================================== */}

      <CheckoutDialog

        open={
          checkoutOpen
        }

        onClose={() =>
          setCheckoutOpen(
            false
          )
        }

      />

    </>

  );

}