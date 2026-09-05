import {
  X,
  Trash2,
  Minus,
  Plus,
  Check,
  Loader2,
  Sparkles,
  ChevronDown,
  Gift,
  MessageCircle,
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
  useUnlockCoupon,
} from "@/features/coupons/hooks/useUnlockCoupon";

import CheckoutDialog from "@/features/checkout/components/CheckoutDialog";

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/shared/lib/supabase";

import RelatedProducts from "@/features/cart/components/RelatedProducts";

import { useWishlistActions } from "@/features/wishlist/hooks/useWishlistActions";


interface CartBannerCoupon {
  id: string;
  code: string;
  cart_display_text: string | null;
  cart_display_priority: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
}

interface CartProductPricing {
  id: string;
  price: number | null;
  compare_price: number | null;
  special_discount_ends_at: string | null;
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

    giftWrapSelected,
    giftMessage,
    setGiftWrapSelected,
    setGiftMessage,

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
   * TOTALS
   * =========================================================
   */

  const total =
    getTotal();

  const finalTotal =
    getFinalTotal();


  /*
   * =========================================================
   * SYNC APPLIED COUPON WITH CART CHANGES
   * =========================================================
   *
   * When an eligible item is removed/changed, the persisted
   * coupon must be recalculated against the new cart.
   *
   * - Still eligible → refresh the coupon discount.
   * - No longer eligible → remove the coupon and show the
   *   existing cart-level error.
   * =========================================================
   */

  useEffect(() => {

    if (
      !isCartOpen ||
      !customer?.id ||
      !appliedCoupon
    ) {
      return;
    }

    let cancelled = false;

    const syncAppliedCoupon =
      async () => {

        try {

          const result =
            await validateCoupon(
              appliedCoupon.code,
              total,
              customer.id,
              items
            );

          if (cancelled) {
            return;
          }

          /*
           * Refresh the stored discount when the eligible
           * portion of the cart changes.
           */
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

          setCouponError("");

          setCouponMessage(
            result.freeShipping
              ? "🎉 Free shipping coupon applied!"
              : result.freeGift
                ? "🎁 Free gift coupon applied!"
                : `Coupon applied! You saved ₹${result.discount}`
          );

        } catch (error: any) {

          if (cancelled) {
            return;
          }

          /*
           * The cart no longer contains an eligible item
           * for this coupon.
           */
          removeCoupon();

          setCouponMessage("");
          setCouponError("");

          setCouponRemovedDialog(
            appliedCoupon.code
          );

          window.setTimeout(() => {
            setCouponRemovedDialog(null);
          }, 2800);

        }

      };

    void syncAppliedCoupon();

    return () => {
      cancelled = true;
    };

  }, [
    isCartOpen,
    customer?.id,
    appliedCoupon?.code,
    items,
    total,
    applyCoupon,
    removeCoupon,
  ]);



  /*
   * =========================================================
   * SPECIAL PRICE COUNTDOWN
   * =========================================================
   */

  const [countdownNow, setCountdownNow] = useState(Date.now());


  /*
   * =========================================================
   * WISHLIST ACTIONS
   * =========================================================
   */

  const {
    addToWishlist,
    isAdding: isAddingToWishlist,
  } = useWishlistActions();


  /*
   * =========================================================
   * CLEAR COUPON ON LOGOUT
   * =========================================================
   *
   * Keep the customer's cart items when they log out, but
   * remove any coupon that was applied during the previous
   * customer's authenticated session. This prevents a
   * customer-specific coupon from remaining visible after
   * logout and being carried into another session.
   * =========================================================
   */

  const previousCustomerIdRef =
    useRef<string | null>(null);


  useEffect(() => {

    const previousCustomerId =
      previousCustomerIdRef.current;

    const currentCustomerId =
      customer?.id ?? null;


    /*
     * Customer has logged out.
     *
     * Keep the cart products, but remove the coupon that
     * belonged to the previous customer's session.
     */

    if (
      previousCustomerId &&
      !currentCustomerId &&
      appliedCoupon
    ) {

      removeCoupon();

      setCouponCode("");
      setCouponMessage("");
      setCouponError("");

    }

    previousCustomerIdRef.current =
      currentCustomerId;

  }, [
    customer?.id,
    appliedCoupon,
    removeCoupon,
  ]);


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
   * CART PRODUCT PRICING
   * =========================================================
   *
   * item.price is the customer's cart price snapshot.
   * We only fetch the current regular price / MRP here so the
   * cart can show the price hierarchy without replacing the
   * customer's snapped Special Price.
   * =========================================================
   */

  const {
    data: cartProductPricing = [],
  } = useQuery<CartProductPricing[]>({

    queryKey: [
      "cart-product-pricing",
      items
        .map(item => item.productId)
        .sort()
        .join("|"),
    ],

    queryFn: async () => {

      const productIds =
        [
          ...new Set(
            items.map(
              item => item.productId
            )
          ),
        ];

      if (
        productIds.length === 0
      ) {
        return [];
      }

      const {
        data,
        error,
      } = await supabase

        .from("products")

        .select(
          "id, price, compare_price, special_discount_ends_at"
        )

        .in(
          "id",
          productIds
        );

      if (error) {
        throw error;
      }

      return (
        data ?? []
      ) as CartProductPricing[];

    },

    enabled:
      isCartOpen &&
      items.length > 0,

    staleTime:
      5 * 60 * 1000,

  });


  const cartProductPricingMap =
    new Map(
      cartProductPricing.map(
        product => [
          product.id,
          product,
        ]
      )
    );

  /*
   * =========================================================
   * CART PRICE BREAKDOWN
   * =========================================================
   *
   * Total Amount = sum of all product MRP values × quantity.
   *
   * Item Discount = normal product discount from MRP to the
   * current regular/our price.
   *
   * Special Offer Discount = additional discount from the
   * regular/our price to the customer's snapped Special Price.
   *
   * Subtotal remains the cart store total, so the existing
   * checkout pricing flow is not changed.
   * =========================================================
   */

  let totalAmount = 0;
  let itemDiscount = 0;
  let specialOfferDiscount = 0;

  items.forEach(item => {

    const pricing =
      cartProductPricingMap.get(
        item.productId
      );

    const regularPrice =
      Number(
        pricing?.price ??
        item.price
      );

    const mrp =
      Number(
        pricing?.compare_price ??
        regularPrice
      );

    const quantity =
      Number(item.quantity) || 0;

    const productMrp =
      mrp > 0
        ? mrp
        : regularPrice;

    totalAmount +=
      productMrp *
      quantity;

    const hasSpecialPrice =
      item.price <
      regularPrice;

    if (hasSpecialPrice) {

      specialOfferDiscount +=
        Math.max(
          0,
          regularPrice -
          item.price
        ) *
        quantity;

      itemDiscount +=
        Math.max(
          0,
          productMrp -
          regularPrice
        ) *
        quantity;

    } else {

      itemDiscount +=
        Math.max(
          0,
          productMrp -
          item.price
        ) *
        quantity;

    }

  });



  useEffect(() => {

    const hasSpecialTimer = cartProductPricing.some(
      product => Boolean(product.special_discount_ends_at)
    );

    if (!isCartOpen || !hasSpecialTimer) {
      return;
    }

    const interval = window.setInterval(() => {
      setCountdownNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    isCartOpen,
    cartProductPricing,
  ]);


  const formatSpecialCountdown = (
    endsAt: string | null | undefined
  ) => {

    if (!endsAt) {
      return null;
    }

    const remainingSeconds = Math.max(
      0,
      Math.floor(
        (new Date(endsAt).getTime() - countdownNow) / 1000
      )
    );

    if (remainingSeconds <= 0) {
      return null;
    }

    const days = Math.floor(remainingSeconds / 86400);
    const hours = Math.floor(
      (remainingSeconds % 86400) / 3600
    );
    const minutes = Math.floor(
      (remainingSeconds % 3600) / 60
    );
    const seconds = remainingSeconds % 60;

    if (days > 0) {
      return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
    }

    return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
  };


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
   * BEST ELIGIBLE COUPON
   * =========================================================
   *
   * Do not trust useBestCoupon(total) for customer-facing
   * recommendations because it does not know the current
   * customer's targeting rules or the current cart items.
   *
   * Instead, validate every active coupon against the current
   * customer + current cart and choose the one with the highest
   * real saving.
   * =========================================================
   */

  const {
    data: eligibleBestCoupon = null,
    isFetching:
      isCheckingBestCoupon,
  } = useQuery({

    queryKey: [
      "eligible-best-coupon",
      customer?.id ?? null,
      total,
      items.map(
        item =>
          `${item.id}:${item.quantity}`
      ).join("|"),
    ],

    queryFn: async () => {

      if (
        !customer?.id ||
        items.length === 0
      ) {
        return null;
      }


      const {
        data: coupons,
        error,
      } = await supabase
        .from("coupons")
        .select("*")
        .eq("is_active", true);


      if (error) {
        throw error;
      }


      const validated =
        await Promise.all(
          (coupons ?? []).map(
            async coupon => {

              try {

                const result =
                  await validateCoupon(
                    coupon.code,
                    total,
                    customer.id,
                    items
                  );

                const shippingSaving =
                  result.freeShipping
                    ? Number(
                        storeSettings?.shipping_charge ??
                        0
                      )
                    : 0;

                const estimatedSaving =
                  Number(
                    result.discount ?? 0
                  ) +
                  shippingSaving;

                return {
                  ...result.coupon,
                  discount:
                    result.discount,
                  freeShipping:
                    result.freeShipping,
                  freeGift:
                    result.freeGift,
                  estimatedSaving,
                };

              } catch {
                /*
                 * Any validation failure means the coupon is
                 * not eligible for this customer/cart.
                 */
                return null;
              }

            }
          )
        );


      const eligible =
        validated.filter(
          Boolean
        ) as any[];


      if (
        eligible.length === 0
      ) {
        return null;
      }


      eligible.sort(
        (a, b) => {
          const savingDifference =
            Number(
              b.estimatedSaving ?? 0
            ) -
            Number(
              a.estimatedSaving ?? 0
            );

          if (
            savingDifference !== 0
          ) {
            return savingDifference;
          }

          /*
           * If savings are equal, prefer the coupon with the
           * higher configured discount value, then newest.
           */
          const discountDifference =
            Number(
              b.discount_value ?? 0
            ) -
            Number(
              a.discount_value ?? 0
            );

          if (
            discountDifference !== 0
          ) {
            return discountDifference;
          }

          return (
            new Date(
              b.created_at ?? 0
            ).getTime() -
            new Date(
              a.created_at ?? 0
            ).getTime()
          );
        }
      );


      return eligible[0] ?? null;

    },

    enabled:
      isCartOpen &&
      !!customer?.id &&
      items.length > 0,

    staleTime: 0,
    refetchOnWindowFocus: true,
  });


  const bestCoupon =
    eligibleBestCoupon;


  const bestCouponAvailable =
    !!bestCoupon &&
    !appliedCoupon &&
    !isCheckingBestCoupon;

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
    total,
    items
  );


  /*
   * =========================================================
   * REMOVE → WISHLIST PROMPT
   * =========================================================
   *
   * Keep the removed cart item locally so the customer can
   * save it to the wishlist after removing it from the cart.
   * =========================================================
   */

  const [
    removedWishlistItem,
    setRemovedWishlistItem,
  ] = useState<
    (typeof items)[number] | null
  >(null);


  const [
    wishlistSaveSuccess,
    setWishlistSaveSuccess,
  ] = useState(false);


  const [
    wishlistSaveError,
    setWishlistSaveError,
  ] = useState("");


  const wishlistPromptTimerRef =
    useRef<number | null>(null);


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



  /*
   * =========================================================
   * CLEAR STALE COUPON ERROR WHEN AN ELIGIBLE OFFER RETURNS
   * =========================================================
   *
   * If an eligible item is added again, the best coupon can
   * become available again. Clear the previous "does not apply"
   * error so the coupon section reflects the current cart.
   * =========================================================
   */

  useEffect(() => {

    if (
      bestCouponAvailable &&
      couponError
    ) {
      setCouponError("");
    }

  }, [
    bestCouponAvailable,
    couponError,
  ]);


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
   * GIFT WRAP SETTINGS
   * =========================================================
   */

  const {
    data: giftWrapSettings,
  } = useQuery({

    queryKey: [
      "gift-wrap-settings",
    ],

    queryFn: async () => {

      const {
        data,
        error,
      } = await supabase
        .from(
          "gift_wrap_settings"
        )
        .select(
          "enabled, price, gift_message_enabled, max_message_length, title, description"
        )
        .limit(1)
        .maybeSingle();

      if (error) {

        throw error;

      }

      return {

        enabled:
          Boolean(
            data?.enabled
          ),

        price:
          Number(
            data?.price ?? 0
          ),

        giftMessageEnabled:
          Boolean(
            data?.gift_message_enabled
          ),

        maxMessageLength:
          Number(
            data?.max_message_length ?? 180
          ),

        title:
          data?.title ||
          "Make it gift-ready",

        description:
          data?.description ||
          "Premium gift wrapping for your order",

      };

    },

    staleTime:
      5 * 60 * 1000,

    enabled:
      isCartOpen,

  });


  const giftWrapEnabled =
    Boolean(
      giftWrapSettings?.enabled
    );

  const giftWrapPrice =
    Number(
      giftWrapSettings?.price ?? 0
    );


  const estimatedTotal =
    finalTotal +
    (
      giftWrapSelected &&
      giftWrapEnabled
        ? giftWrapPrice
        : 0
    );


  useEffect(() => {

    if (
      giftWrapSettings &&
      !giftWrapSettings.enabled &&
      giftWrapSelected
    ) {

      setGiftWrapSelected(
        false
      );

    }

  }, [
    giftWrapSettings,
    giftWrapSelected,
    setGiftWrapSelected,
  ]);


  const giftWrapSectionRef =
    useRef<HTMLDivElement | null>(null);


  const [
    showGiftWrapNavigator,
    setShowGiftWrapNavigator,
  ] = useState(true);


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


  /*
   * =========================================================
   * BEST OFFER APPLY FEEDBACK
   * =========================================================
   */

  const [
    applyingBestCoupon,
    setApplyingBestCoupon,
  ] = useState(false);

  const [
    bestCouponAppliedDialog,
    setBestCouponAppliedDialog,
  ] = useState<{
    code: string;
    discount: number;
  } | null>(null);


  const [
    couponRemovedDialog,
    setCouponRemovedDialog,
  ] = useState<string | null>(null);


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


  const handleApplyBestCoupon =
    async () => {

      if (!bestCoupon) {
        return;
      }

      if (!customer) {
        setCouponError(
          "Please log in to use a coupon"
        );
        return;
      }

      try {

        setApplyingBestCoupon(true);
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

        setBestCouponAppliedDialog({
          code:
            result.coupon.code,
          discount:
            Number(
              result.discount ?? 0
            ),
        });

        window.setTimeout(() => {
          setBestCouponAppliedDialog(
            null
          );
        }, 2600);

      } catch (error: any) {

        setCouponError(
          error?.message ||
          "Unable to apply this coupon right now."
        );

      } finally {

        setApplyingBestCoupon(false);

      }

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


  /*
   * =========================================================
   * RELATED PRODUCTS SCROLL NAVIGATION
   * =========================================================
   */

  const relatedProductsRef =
    useRef<HTMLDivElement | null>(null);


  const scrollContainerRef =
    useRef<HTMLDivElement | null>(null);


  const [
    showRelatedNavigator,
    setShowRelatedNavigator,
  ] = useState(true);


  const scrollToRelatedProducts = () => {

    relatedProductsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setShowRelatedNavigator(false);

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


  useEffect(() => {

    if (
      !isCartOpen ||
      items.length === 0
    ) {

      setShowRelatedNavigator(false);
      return;

    }


    const relatedSection =
      relatedProductsRef.current;

    const scrollContainer =
      scrollContainerRef.current;


    if (
      !relatedSection ||
      !scrollContainer
    ) {

      setShowRelatedNavigator(true);
      return;

    }


    const observer =
      new IntersectionObserver(
        ([entry]) => {

          setShowRelatedNavigator(
            !entry.isIntersecting
          );

        },
        {
          root:
            scrollContainer,

          threshold:
            0.15,
        }
      );


    observer.observe(
      relatedSection
    );


    return () => {

      observer.disconnect();

    };

  }, [
    isCartOpen,
    items.length,
  ]);


  /*
   * =========================================================
   * GIFT WRAP NAVIGATOR
   * =========================================================
   *
   * Keeps the gift-wrap option discoverable even when the
   * customer has added several products and the gift-wrap
   * card has moved below the fold.
   * =========================================================
   */

  useEffect(() => {

    if (
      !isCartOpen ||
      items.length === 0 ||
      giftWrapSelected
    ) {

      setShowGiftWrapNavigator(false);
      return;

    }


    const giftWrapSection =
      giftWrapSectionRef.current;

    const scrollContainer =
      scrollContainerRef.current;


    if (
      !giftWrapSection ||
      !scrollContainer
    ) {

      setShowGiftWrapNavigator(true);
      return;

    }


    const observer =
      new IntersectionObserver(
        ([entry]) => {

          setShowGiftWrapNavigator(
            !entry.isIntersecting
          );

        },
        {
          root:
            scrollContainer,

          threshold:
            0.15,
        }
      );


    observer.observe(
      giftWrapSection
    );


    return () => {

      observer.disconnect();

    };

  }, [
    isCartOpen,
    items.length,
    giftWrapSelected,
  ]);


  const scrollToGiftWrap = () => {

    giftWrapSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    setShowGiftWrapNavigator(false);

  };


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
   * REMOVE ITEM + OFFER WISHLIST
   * =========================================================
   */

  const handleRemoveItem = (
    item: (typeof items)[number]
  ) => {

    /*
     * Remove from cart first. We keep a local snapshot of the
     * item so the wishlist prompt can still show its details
     * after the cart item disappears.
     */

    removeItem(item.id);

    setRemovedWishlistItem(item);
    setWishlistSaveSuccess(false);
    setWishlistSaveError("");

    if (
      wishlistPromptTimerRef.current
    ) {
      window.clearTimeout(
        wishlistPromptTimerRef.current
      );
    }

    /*
     * Give the customer a few seconds to choose. If they do
     * nothing, the prompt quietly disappears.
     */

    wishlistPromptTimerRef.current =
      window.setTimeout(() => {

        setRemovedWishlistItem(null);
        setWishlistSaveError("");

      }, 6500);

  };


  const handleAddRemovedItemToWishlist =
    async () => {

      if (!removedWishlistItem) {
        return;
      }


      /*
       * Wishlist requires an authenticated customer.
       */

      if (!customer?.id) {

        setWishlistSaveError(
          "Please log in to save this piece to your wishlist."
        );

        return;

      }


      try {

        setWishlistSaveError("");

        await addToWishlist(
          removedWishlistItem.id
        );

        setWishlistSaveSuccess(true);


        if (
          wishlistPromptTimerRef.current
        ) {

          window.clearTimeout(
            wishlistPromptTimerRef.current
          );

        }


        /*
         * Keep the success state visible briefly so the
         * customer gets clear feedback before it disappears.
         */

        wishlistPromptTimerRef.current =
          window.setTimeout(() => {

            setRemovedWishlistItem(null);
            setWishlistSaveSuccess(false);

          }, 2200);

      } catch (
        error: any
      ) {

        setWishlistSaveError(
          error?.message ||
          "Unable to save this piece to your wishlist."
        );

      }

    };


  const dismissWishlistPrompt = () => {

    if (
      wishlistPromptTimerRef.current
    ) {

      window.clearTimeout(
        wishlistPromptTimerRef.current
      );

    }

    setRemovedWishlistItem(null);
    setWishlistSaveSuccess(false);
    setWishlistSaveError("");

  };


  useEffect(() => {

    return () => {

      if (
        wishlistPromptTimerRef.current
      ) {

        window.clearTimeout(
          wishlistPromptTimerRef.current
        );

      }

    };

  }, []);


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

          ref={
            scrollContainerRef
          }

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
                                    (
                                      item.price *
                                      item.quantity
                                    ).toLocaleString("en-IN")
                                  }

                                </span>

                              </div>


                              {(() => {

                                const pricing =
                                  cartProductPricingMap.get(
                                    item.productId
                                  );

                                const regularPrice =
                                  Number(
                                    pricing?.price ??
                                    item.price
                                  );

                                const mrp =
                                  Number(
                                    pricing?.compare_price ??
                                    0
                                  );

                                const hasSpecialPrice =
                                  item.price <
                                  regularPrice;

                                // Normal product discount: compare_price is the MRP
                                // and the product price is the regular/sale price.
                                const hasNormalDiscount =
                                  !hasSpecialPrice &&
                                  mrp > item.price;

                                const discountBase =
                                  hasSpecialPrice
                                    ? regularPrice
                                    : mrp;

                                const discountPercent =
                                  discountBase > 0
                                    ? Math.round(
                                        (
                                          (discountBase -
                                            item.price) /
                                          discountBase
                                        ) *
                                        100
                                      )
                                    : 0;

                                if (
                                  !hasSpecialPrice &&
                                  !hasNormalDiscount
                                ) {
                                  return null;
                                }

                                return (

                                  <div
                                    className="
                                      mt-2
                                      space-y-1
                                    "
                                  >

                                    {mrp > 0 && (
                                      <div
                                        className="
                                          text-[10px]
                                          font-medium
                                          uppercase
                                          tracking-[0.12em]
                                          text-neutral-500
                                        "
                                      >
                                        MRP ₹
                                        {mrp.toLocaleString(
                                          "en-IN"
                                        )}
                                      </div>
                                    )}

                                    <div
                                      className="
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-x-2
                                        gap-y-1
                                        text-xs
                                      "
                                    >

                                      <span
                                        className="
                                          text-neutral-500
                                        "
                                      >
                                        {hasSpecialPrice
                                          ? "Regular Price"
                                          : "Our Price"}
                                      </span>

                                      <span
                                        className={
                                          hasSpecialPrice
                                            ? "text-neutral-500 line-through"
                                            : "font-semibold text-neutral-800"
                                        }
                                      >
                                        ₹
                                        {Number(
                                          regularPrice
                                        ).toLocaleString(
                                          "en-IN"
                                        )}
                                      </span>

                                      {hasSpecialPrice && (
                                        <span
                                          className="
                                            rounded-md
                                            border
                                            border-[#D4AF37]/50
                                            bg-[#D4AF37]/10
                                            px-1.5
                                            py-0.5
                                            text-[10px]
                                            font-semibold
                                            tracking-wide
                                            text-[#A07D16]
                                          "
                                        >
                                          {discountPercent}% OFF
                                        </span>
                                      )}

                                    </div>

                                    {hasSpecialPrice ? (
                                      <div
                                        className="
                                          flex
                                          flex-wrap
                                          items-center
                                          gap-x-2
                                          gap-y-1
                                        "
                                      >
                                        <span
                                          className="
                                            text-[10px]
                                            font-medium
                                            uppercase
                                            tracking-[0.12em]
                                            text-[#A07D16]
                                          "
                                        >
                                          Special Price
                                        </span>

                                        <span
                                          className="
                                            text-sm
                                            font-semibold
                                          "
                                        >
                                          ₹
                                          {Number(
                                            item.price
                                          ).toLocaleString(
                                            "en-IN"
                                          )}
                                        </span>
                                      </div>
                                    ) : (
                                      <div
                                        className="
                                          flex
                                          flex-wrap
                                          items-center
                                          gap-x-2
                                          gap-y-1
                                        "
                                      >
                                        <span
                                          className="
                                            text-[10px]
                                            font-medium
                                            uppercase
                                            tracking-[0.12em]
                                            text-[#A07D16]
                                          "
                                        >
                                          {discountPercent}% OFF
                                        </span>
                                      </div>
                                    )}

                                    {hasSpecialPrice && (
                                      (() => {
                                        const specialCountdown =
                                          formatSpecialCountdown(
                                            pricing?.special_discount_ends_at
                                          );

                                        if (!specialCountdown) {
                                          return null;
                                        }

                                        return (
                                          <div
                                            className="
                                              mt-1
                                              inline-flex
                                              w-fit
                                              items-center
                                              gap-1.5
                                              rounded-md
                                              border
                                              border-[#D4AF37]/40
                                              bg-[#D4AF37]/10
                                              px-2
                                              py-1
                                              text-[10px]
                                              font-semibold
                                              text-[#8C6B0A]
                                            "
                                          >
                                            <span aria-hidden="true">⏱</span>
                                            <span>Offer ends in {specialCountdown}</span>
                                          </div>
                                        );
                                      })()
                                    )}

                                  </div>

                                );

                              })()}


                              {/* =========================================
                                  RING SIZE
                              ========================================== */}

                              {item.ringSize && (
                                <p
                                  className="
                                    mt-1.5
                                    text-xs
                                    text-neutral-500
                                  "
                                >
                                  Ring Size:{" "}
                                  <span className="font-medium text-neutral-800">
                                    {item.ringSize}
                                  </span>
                                </p>
                              )}


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
                                    handleRemoveItem(
                                      item
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
              GIFT WRAP
          ================================================== */}

          {
            items.length > 0 &&
            giftWrapEnabled && (
              <div
                ref={giftWrapSectionRef}
                className="
                  mt-6 overflow-hidden rounded-2xl
                  border border-[#C8A44D]/25
                  bg-gradient-to-br from-[#FFFCF4] via-white to-[#FBF6E8]
                  shadow-[0_4px_18px_rgba(0,0,0,0.05)]
                "
              >
                <button
                  type="button"
                  onClick={() => setGiftWrapSelected(!giftWrapSelected)}
                  aria-pressed={giftWrapSelected}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left transition active:scale-[0.995]"
                >
                  <div
                    className={`
                      flex h-11 w-11 shrink-0 items-center justify-center rounded-full
                      transition-all duration-300
                      ${
                        giftWrapSelected
                          ? "bg-[#C8A44D] text-white shadow-[0_6px_18px_rgba(200,164,77,0.28)]"
                          : "bg-[#C8A44D]/10 text-[#A27B16]"
                      }
                    `}
                  >
                    <Gift size={21} strokeWidth={1.8} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-900">
                          Make it gift-ready
                        </p>
                        <p className="mt-0.5 text-xs leading-4 text-neutral-500">
                          Premium gift wrapping for your order
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-[#9A761C]">
                        ₹{giftWrapPrice}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`
                      flex h-6 w-6 shrink-0 items-center justify-center rounded-full border
                      transition-all duration-200
                      ${
                        giftWrapSelected
                          ? "border-[#C8A44D] bg-[#C8A44D] text-white"
                          : "border-neutral-300 bg-white"
                      }
                    `}
                  >
                    {giftWrapSelected && (
                      <Check size={14} strokeWidth={2.8} />
                    )}
                  </div>
                </button>

                {giftWrapSelected &&
                  giftWrapSettings?.giftMessageEnabled && (
                  <div
                    className="
                      border-t border-[#C8A44D]/15 px-4 pb-4 pt-3
                      animate-in fade-in slide-in-from-top-2 duration-200
                    "
                  >
                    <div className="flex items-center gap-2 text-xs font-medium text-[#8A6D25]">
                      <MessageCircle size={14} strokeWidth={1.8} />
                      Add a personal gift message
                      <span className="text-neutral-400">(optional)</span>
                    </div>

                    <textarea
                      value={giftMessage}
                      onChange={event =>
                        setGiftMessage(event.target.value.slice(0, giftWrapSettings?.maxMessageLength ?? 180))
                      }
                      placeholder="Write a sweet note for the recipient..."
                      rows={2}
                      maxLength={giftWrapSettings?.maxMessageLength ?? 180}
                      className="
                        mt-2 w-full resize-none rounded-xl border border-neutral-200
                        bg-white px-3 py-2.5 text-sm text-neutral-800 outline-none
                        transition placeholder:text-neutral-400
                        focus:border-[#C8A44D] focus:ring-2 focus:ring-[#C8A44D]/10
                      "
                    />

                    <div className="mt-1 text-right text-[10px] text-neutral-400">
                      {giftMessage.length}/180
                    </div>
                  </div>
                )}
              </div>
            )
          }


          {/* =================================================
              MORE FOR YOU CUE + RELATED PRODUCTS
          ================================================== */}

          {
            items.length > 0 && (

              <>

                {/* =============================================
                    RELATED PRODUCTS
                ============================================== */}

                <div
                  ref={relatedProductsRef}
                  className="
                    mt-1
                    scroll-mt-5
                  "
                >

                  <RelatedProducts
                    cartItems={items}
                    onProductNavigate={() => {
                      closeCart();
                    }}
                  />

                </div>

              </>

            )
          }


          {/* =================================================
              LOGIN TO USE COUPONS
          ================================================== */}

          {
            items.length > 0 &&
            !customer &&
            !appliedCoupon && (

              <div

                className="

                  mt-6

                  rounded-2xl

                  border
                  border-[#C8A44D]/20

                  bg-[#FBF7EA]

                  p-4

                  animate-in
                  fade-in
                  duration-200

                "

              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-[#B28A20]
                      shadow-sm
                    "
                  >

                    ✨

                  </div>


                  <div className="min-w-0">

                    <p
                      className="
                        text-sm
                        font-semibold
                        text-neutral-900
                      "
                    >

                      Login to unlock your best offer

                    </p>


                    <p
                      className="
                        mt-0.5
                        text-xs
                        leading-4
                        text-neutral-500
                      "
                    >

                      Sign in to check and apply coupons available for you.

                    </p>

                  </div>

                </div>

              </div>

            )
          }


          {/* =================================================
              BEST COUPON LOADING
          ================================================== */}

          {
            items.length > 0 &&
            isCheckingBestCoupon &&
            !appliedCoupon && (

              <div

                className="

                  mt-6

                  rounded-2xl

                  border
                  border-neutral-200

                  bg-neutral-50

                  p-4

                  animate-in
                  fade-in
                  duration-200

                "

              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-[#B28A20]
                      shadow-sm
                    "
                  >

                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                  </div>


                  <div className="min-w-0">

                    <p
                      className="
                        text-sm
                        font-semibold
                        text-neutral-900
                      "
                    >

                      Finding your best offer...

                    </p>


                    <p
                      className="
                        mt-0.5
                        text-xs
                        text-neutral-500
                      "
                    >

                      Checking available coupons and your savings

                    </p>

                  </div>

                </div>

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
                    handleApplyBestCoupon
                  }

                  disabled={
                    applyingBestCoupon
                  }

                  className="

                    disabled:cursor-not-allowed
                    disabled:opacity-70

                    mt-3

                    rounded-xl

                    bg-black

                    px-4
                    py-2

                    text-sm
                    text-white

                  "

                >

                  {
                    applyingBestCoupon ? (
                      <span
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                        Applying...
                      </span>
                    ) : (
                      "Apply"
                    )
                  }

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
            FLOATING GIFT WRAP CUE
        ==================================================== */}

        {
          items.length > 0 &&
          !giftWrapSelected &&
          showGiftWrapNavigator && (

            <button
              type="button"
              onClick={scrollToGiftWrap}
              aria-label="Add gift wrapping"
              className="
                absolute
                left-1/2
                bottom-[calc(92px+env(safe-area-inset-bottom))]
                z-40
                -translate-x-1/2

                flex
                w-max
                max-w-[calc(100%-32px)]
                items-center
                gap-2

                rounded-full

                border
                border-[#C8A44D]/35

                bg-white

                px-3
                py-2

                text-left

                shadow-[0_8px_24px_rgba(0,0,0,0.14)]
                ring-1
                ring-[#C8A44D]/10

                transition-all
                duration-300

                hover:-translate-x-1/2
                hover:-translate-y-0.5
                hover:shadow-[0_12px_28px_rgba(0,0,0,0.18)]

                active:scale-95

                animate-in
                fade-in
                slide-in-from-bottom-3
                duration-300

                sm:gap-2.5
                sm:px-4
                sm:py-2.5
              "
            >

              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#FBF4DE]
                  text-[#A27B16]
                "
              >
                <Gift
                  size={17}
                  strokeWidth={1.9}
                />
              </span>

              <span className="min-w-0">

                <span
                  className="
                    block
                    whitespace-nowrap
                    text-[10px]
                    font-semibold
                    leading-4
                    text-neutral-900
                    sm:text-[11px]
                  "
                >
                  Gift wrap your order
                </span>

                <span
                  className="
                    block
                    whitespace-nowrap
                    text-[9px]
                    font-medium
                    leading-4
                    text-[#A27B16]
                    sm:text-[10px]
                  "
                >
                  Add for ₹{giftWrapPrice} · Tap to add
                </span>

              </span>

              <ChevronDown
                size={15}
                strokeWidth={2.5}
                className="
                  shrink-0
                  -rotate-90
                  text-[#A27B16]
                "
              />

            </button>

          )
        }


        {/* ===================================================
            REMOVE → WISHLIST PROMPT
        ==================================================== */}

        {removedWishlistItem && (
          <div
            className="
              absolute
              left-4
              right-4
              bottom-[calc(112px+env(safe-area-inset-bottom))]
              z-[80]

              overflow-hidden
              rounded-[22px]

              border
              border-[#C8A44D]/25

              bg-white/95
              shadow-[0_16px_45px_rgba(0,0,0,0.18)]
              backdrop-blur-xl

              animate-in
              fade-in
              slide-in-from-bottom-4
              zoom-in-[0.98]
              duration-300
            "
          >

            <div
              className="
                pointer-events-none
                absolute
                -right-10
                -top-12
                h-28
                w-28
                rounded-full
                bg-[#C8A44D]/10
                blur-2xl
              "
            />

            <div className="relative p-3.5">

              {wishlistSaveSuccess ? (

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    py-1
                    animate-in
                    fade-in
                    zoom-in-95
                    duration-300
                  "
                >

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-green-50
                      text-green-600
                      ring-1
                      ring-green-100
                    "
                  >

                    <Check
                      size={20}
                      strokeWidth={2.6}
                    />

                  </div>

                  <div className="min-w-0 flex-1">

                    <p
                      className="
                        text-sm
                        font-semibold
                        text-neutral-900
                      "
                    >
                      Saved to your wishlist ♡
                    </p>

                    <p
                      className="
                        mt-0.5
                        truncate
                        text-xs
                        text-neutral-500
                      "
                    >
                      {removedWishlistItem.name}
                    </p>

                  </div>

                </div>

              ) : (

                <>

                  <div className="flex items-start gap-3">

                    <div
                      className="
                        h-12
                        w-12
                        shrink-0
                        overflow-hidden
                        rounded-xl
                        bg-[#FBF7EA]
                        ring-1
                        ring-[#C8A44D]/15
                      "
                    >

                      <img
                        src={removedWishlistItem.image}
                        alt={removedWishlistItem.name}
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />

                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-2">

                        <div className="min-w-0">

                          <p
                            className="
                              text-[10px]
                              font-semibold
                              uppercase
                              tracking-[0.16em]
                              text-[#A27B16]
                            "
                          >
                            Removed from cart
                          </p>

                          <p
                            className="
                              mt-0.5
                              line-clamp-1
                              text-sm
                              font-semibold
                              text-neutral-900
                            "
                          >
                            {removedWishlistItem.name}
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={dismissWishlistPrompt}
                          className="
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            text-neutral-400
                            transition
                            hover:bg-neutral-100
                            hover:text-neutral-700
                            active:scale-90
                          "
                          aria-label="Dismiss"
                        >
                          <X size={15} />
                        </button>

                      </div>

                      <p
                        className="
                          mt-1
                          text-xs
                          leading-4
                          text-neutral-500
                        "
                      >
                        Would you like to keep this piece in your wishlist?
                      </p>

                    </div>

                  </div>


                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <button
                      type="button"
                      onClick={
                        handleAddRemovedItemToWishlist
                      }
                      disabled={isAddingToWishlist}
                      className="
                        flex
                        min-h-9
                        flex-1
                        items-center
                        justify-center
                        gap-1.5
                        rounded-xl
                        bg-black
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        text-white
                        shadow-sm
                        transition-all
                        duration-200
                        hover:bg-neutral-800
                        active:scale-[0.98]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >

                      {isAddingToWishlist ? (

                        <>
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                          Saving...
                        </>

                      ) : (

                        <>
                          <span className="text-sm">
                            ♡
                          </span>
                          Add to Wishlist
                        </>

                      )}

                    </button>


                    <button
                      type="button"
                      onClick={dismissWishlistPrompt}
                      disabled={isAddingToWishlist}
                      className="
                        min-h-9
                        shrink-0
                        rounded-xl
                        border
                        border-neutral-200
                        bg-white
                        px-3
                        py-2
                        text-xs
                        font-medium
                        text-neutral-600
                        transition
                        hover:bg-neutral-50
                        hover:text-neutral-900
                        active:scale-[0.98]
                        disabled:opacity-50
                      "
                    >
                      No, thanks
                    </button>

                  </div>


                  {wishlistSaveError && (
                    <p
                      className="
                        mt-2
                        px-1
                        text-[11px]
                        leading-4
                        text-red-500
                        animate-in
                        fade-in
                        slide-in-from-top-1
                        duration-200
                      "
                    >
                      {wishlistSaveError}
                    </p>
                  )}

                </>

              )}

            </div>

          </div>
        )}


        {/* ===================================================
            FIXED FOOTER
        ==================================================== */}

        <div

          className="

            relative
            shrink-0

            border-t

            bg-white

            px-4

            pb-[env(safe-area-inset-bottom)]

            pt-4

          "

        >

          {
            items.length > 0 &&
            showRelatedNavigator && (

              <button
                type="button"
                onClick={
                  scrollToRelatedProducts
                }
                aria-label="View You may also like products"
                className="
                  absolute
                  left-1/2
                  top-[-52px]
                  z-30
                  -translate-x-1/2

                  flex
                  items-center
                  gap-2

                  rounded-full
                  border
                  border-[#C8A44D]/25
                  bg-white/95
                  px-3.5
                  py-2

                  text-[10px]
                  font-semibold
                  tracking-wide
                  text-[#8A6D25]

                  shadow-[0_6px_22px_rgba(0,0,0,0.14)]
                  backdrop-blur-md

                  transition-all
                  duration-200

                  hover:-translate-x-1/2
                  hover:-translate-y-0.5
                  hover:shadow-[0_9px_26px_rgba(0,0,0,0.17)]

                  active:scale-95
                "
              >

                <span>
                  More for you
                </span>

                <span
                  className="
                    flex
                    h-6
                    w-6
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#C8A44D]/15
                    text-[#8A6D25]
                  "
                >

                  <ChevronDown
                    size={14}
                    strokeWidth={2.5}
                    className="
                      motion-safe:animate-bounce
                    "
                  />

                </span>

              </button>

            )
          }


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

                    {/* PRICE BREAKDOWN */}

                    <div
                      className="
                        space-y-2
                        text-sm
                      "
                    >

                      {/* TOTAL AMOUNT / MRP TOTAL */}

                      <div
                        className="
                          flex
                          justify-between
                        "
                      >
                        <span>
                          Total Amount
                        </span>

                        <span>
                          ₹
                          {
                            totalAmount.toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )
                          }
                        </span>
                      </div>


                      {/* ITEM DISCOUNT */}

                      {itemDiscount > 0 && (
                        <div
                          className="
                            flex
                            justify-between
                            text-green-600
                          "
                        >
                          <span>
                            Item Discount
                          </span>

                          <span>
                            -₹
                            {
                              itemDiscount.toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )
                            }
                          </span>
                        </div>
                      )}


                      {/* SPECIAL OFFER DISCOUNT */}

                      {specialOfferDiscount > 0 && (
                        <div
                          className="
                            flex
                            justify-between
                            text-[#A07D16]
                          "
                        >
                          <span>
                            Special Offer Discount
                          </span>

                          <span>
                            -₹
                            {
                              specialOfferDiscount.toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )
                            }
                          </span>
                        </div>
                      )}


                      {/* SUBTOTAL */}

                      <div
                        className="
                          flex
                          justify-between
                          border-t
                          pt-2
                          font-medium
                        "
                      >
                        <span>
                          Subtotal
                        </span>

                        <span>
                          ₹
                          {
                            total.toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )
                          }
                        </span>
                      </div>

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


                    {/* GIFT WRAP */}

                    {giftWrapSelected && (
                      <div className="flex items-center justify-between text-neutral-600">
                        <span className="flex items-center gap-1.5">
                          <Gift
                            size={14}
                            className="text-[#B28A20]"
                            strokeWidth={1.8}
                          />
                          Gift Wrap
                        </span>
                        <span>₹{giftWrapPrice.toFixed(2)}</span>
                      </div>
                    )}


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
                          estimatedTotal.toFixed(2)
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

        cartItems={
          items
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


      {couponRemovedDialog && (

        <div
          className="
            fixed
            inset-0
            z-[1400]
            flex
            items-center
            justify-center
            bg-black/30
            px-5
            backdrop-blur-[2px]
            animate-in
            fade-in
            duration-200
          "
        >

          <div
            className="
              w-full
              max-w-sm
              rounded-3xl
              border
              border-[#D8C27A]/60
              bg-white
              px-6
              py-7
              text-center
              shadow-2xl
              animate-in
              zoom-in-95
              slide-in-from-bottom-2
              duration-300
            "
          >

            <div
              className="
                relative
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-[#F5E6B8]
                text-[#8C6B0A]
                animate-in
                zoom-in
                duration-500
              "
            >

              <div
                className="
                  absolute
                  inset-0
                  rounded-full
                  border-2
                  border-[#D8C27A]
                  animate-ping
                  opacity-40
                "
              />

              <X
                size={28}
                strokeWidth={2.5}
              />

            </div>


            <div
              className="
                mt-5
              "
            >

              <p
                className="
                  text-lg
                  font-semibold
                  text-neutral-900
                "
              >
                Coupon removed
              </p>

              <p
                className="
                  mt-2
                  text-sm
                  leading-relaxed
                  text-neutral-500
                "
              >
                <span
                  className="font-semibold text-neutral-800"
                >
                  {couponRemovedDialog}
                </span>
                {" "}was removed because the item currently in your cart
                is not eligible for this coupon.
              </p>

            </div>


            <div
              className="
                mt-5
                text-[11px]
                text-neutral-400
              "
            >
              Your cart total has been updated
            </div>

          </div>

        </div>

      )}


      {bestCouponAppliedDialog && (

        <div
          className="
            fixed
            inset-0
            z-[1400]
            flex
            items-center
            justify-center
            bg-black/30
            px-5
            backdrop-blur-[2px]
            animate-in
            fade-in
            duration-200
          "
        >

          <div
            className="
              w-full
              max-w-sm
              rounded-3xl
              border
              border-green-200
              bg-white
              px-6
              py-7
              text-center
              shadow-2xl
              animate-in
              zoom-in-95
              slide-in-from-bottom-2
              duration-300
            "
          >

            <div
              className="
                relative
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-green-100
                text-green-600
                animate-in
                zoom-in
                duration-500
              "
            >

              <div
                className="
                  absolute
                  inset-0
                  rounded-full
                  border-2
                  border-green-200
                  animate-ping
                  opacity-50
                "
              />

              <Check
                size={30}
                strokeWidth={2.5}
              />

            </div>


            <div
              className="
                mt-5
              "
            >

              <p
                className="
                  text-lg
                  font-semibold
                  text-neutral-900
                "
              >
                Coupon applied!
              </p>

              <p
                className="
                  mt-1.5
                  text-sm
                  leading-relaxed
                  text-neutral-500
                "
              >
                <span
                  className="font-semibold text-neutral-800"
                >
                  {bestCouponAppliedDialog.code}
                </span>
                {" "}has been applied to the eligible item
                {bestCouponAppliedDialog.discount > 0 ? "s" : ""}.
              </p>

              {
                bestCouponAppliedDialog.discount > 0 && (
                  <div
                    className="
                      mx-auto
                      mt-4
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      bg-green-50
                      px-4
                      py-2
                      text-sm
                      font-semibold
                      text-green-700
                    "
                  >
                    <Sparkles
                      size={15}
                    />
                    You saved ₹
                    {
                      bestCouponAppliedDialog.discount
                    }
                  </div>
                )
              }

            </div>


            <div
              className="
                mt-5
                text-[11px]
                text-neutral-400
              "
            >
              Your cart total has been updated
            </div>

          </div>

        </div>

      )}


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