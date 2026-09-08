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
  HelpCircle,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

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

import NotifyDialog from "@/features/notify/components/NotifyDialog";

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
  stock: number | null;
  track_inventory: boolean | null;
  allow_backorders: boolean | null;
}

export default function CartDrawer() {

  const navigate = useNavigate();

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
    refreshCartStock,

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
   * ESTIMATED DISPATCH DATE
   * =========================================================
   *
   * The dispatch date is calculated server-side/database-side.
   * The frontend only reads and formats the returned date.
   * =========================================================
   */

  const {
    data: estimatedDispatchDate,
  } = useQuery<string | null>({

    queryKey: [
      "estimated-dispatch-date",
    ],

    queryFn: async () => {

      const {
        data,
        error,
      } = await supabase.rpc(
        "get_estimated_dispatch_date"
      );

      if (error) {
        throw error;
      }

      return data ?? null;

    },

    enabled:
      isCartOpen &&
      items.length > 0,

    staleTime:
      5 * 60 * 1000,

  });


  const formattedEstimatedDispatchDate =
    estimatedDispatchDate
      ? new Intl.DateTimeFormat(
          "en-IN",
          {
            day: "numeric",
            month: "long",
            timeZone: "Asia/Kolkata",
          }
        ).format(
          new Date(`${estimatedDispatchDate}T00:00:00+05:30`)
        )
      : null;


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
   * REFRESH CART STOCK / PRICE SNAPSHOTS
   * =========================================================
   *
   * The cart store checks the latest product stock and also
   * restores an expired Special Price to the current regular
   * product price.
   *
   * Run this immediately whenever the drawer opens so a stale
   * cart is corrected without requiring a product-page refresh.
   * The existing product query below continues to refresh the
   * visible stock state while the drawer remains open.
   * =========================================================
   */

  useEffect(() => {

    if (!isCartOpen || items.length === 0) {
      return;
    }

    void refreshCartStock();

  }, [
    isCartOpen,
    refreshCartStock,
  ]);


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
    isFetching: isCartProductPricingFetching,
    isFetched: isCartProductPricingFetched,
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
          "id, price, compare_price, special_discount_ends_at, stock, track_inventory, allow_backorders"
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

    /*
     * Stock may change because another customer can purchase
     * the same product after it was added to this cart.
     * Keep the stock snapshot fresh while the drawer is open.
     */
    staleTime:
      0,

    refetchOnWindowFocus:
      true,

    refetchInterval:
      isCartOpen
        ? 10000
        : false,

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
   * OUT-OF-STOCK NOTIFICATION
   * =========================================================
   *
   * When another customer buys the last available piece,
   * give the current customer a clear message before removing
   * the stale item from their cart.
   * =========================================================
   */

  const [
    outOfStockItem,
    setOutOfStockItem,
  ] = useState<(typeof items)[number] | null>(null);

  const [
    showOutOfStockNotify,
    setShowOutOfStockNotify,
  ] = useState(false);

  const outOfStockRemovalTimerRef =
    useRef<number | null>(null);


  /*
   * =========================================================
   * RECONCILE CART STOCK
   * =========================================================
   *
   * Another customer may purchase a product after it was
   * already added to this cart. Reconcile the cart whenever
   * the latest product stock is fetched.
   *
   * - Missing product → remove from cart.
   * - Stock 0 → remove from cart.
   * - Stock lower than cart quantity → reduce quantity.
   *
   * Backorder-enabled and non-inventory-tracked products are
   * intentionally left unchanged.
   *
   * Checkout still performs its own authoritative server-side
   * stock validation; this only keeps the cart UI current.
   * =========================================================
   */

  useEffect(() => {

    if (
      !isCartOpen ||
      items.length === 0 ||
      cartProductPricing.length === 0 ||
      isCartProductPricingFetching ||
      !isCartProductPricingFetched
    ) {
      return;
    }

    /*
     * The pricing query can temporarily contain the previous
     * result while a new cart item is being fetched. Never treat
     * a temporarily missing product as deleted/out of stock.
     * Reconcile only after the response contains every product
     * currently in the cart.
     */
    const cartProductIds =
      new Set(
        items.map(
          item => item.productId
        )
      );

    const pricingProductIds =
      new Set(
        cartProductPricing.map(
          product => product.id
        )
      );

    const hasCompletePricingResponse =
      Array.from(cartProductIds).every(
        productId =>
          pricingProductIds.has(productId)
      );

    if (!hasCompletePricingResponse) {
      return;
    }

    let cancelled = false;

    const reconcileCartStock = async () => {

      for (const item of items) {

        if (cancelled) {
          return;
        }

        const pricing =
          cartProductPricingMap.get(
            item.productId
          );

        if (!pricing) {

          try {
            await removeItem(item.id);
          } catch {
            // Keep reconciliation running for other items.
          }

          continue;
        }

        if (
          pricing.track_inventory === false ||
          pricing.allow_backorders === true
        ) {
          continue;
        }

        const currentStock =
          Math.max(
            0,
            Number(
              pricing.stock ?? 0
            )
          );

        if (currentStock <= 0) {

          /*
           * Tell the customer what happened, but do not remove
           * the item automatically. The customer explicitly
           * confirms the removal with the OK button.
           */
          setOutOfStockItem(item);

          continue;
        }

        if (
          item.quantity > currentStock
        ) {

          try {
            await updateQuantity(
              item.id,
              currentStock
            );
          } catch {
            // Checkout remains the final server-side guard.
          }

        }

      }

    };

    void reconcileCartStock();

    return () => {
      cancelled = true;
    };

  }, [
    isCartOpen,
    items,
    cartProductPricing,
    isCartProductPricingFetching,
    isCartProductPricingFetched,
    removeItem,
    updateQuantity,
  ]);


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

    const hasCartBannerTimer = cartBannerCoupons.some(
      coupon => {
        if (!coupon.expires_at) {
          return false;
        }

        const remainingMs =
          new Date(coupon.expires_at).getTime() -
          Date.now();

        return (
          remainingMs > 0 &&
          remainingMs <= 24 * 60 * 60 * 1000
        );
      }
    );

    if (
      !isCartOpen ||
      (!hasSpecialTimer && !hasCartBannerTimer)
    ) {
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
    cartBannerCoupons,
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
   * CART BANNER COUPON COUNTDOWN
   * =========================================================
   *
   * Show the countdown only during the final 24 hours of
   * the currently displayed cart promotion.
   *
   * The expiry comes directly from the coupon record, so the
   * timer is based on the real coupon expiry instead of a
   * hardcoded duration.
   * =========================================================
   */

  const formatCartBannerCouponCountdown = (
    expiresAt: string | null | undefined
  ) => {

    if (!expiresAt) {
      return null;
    }

    const remainingSeconds = Math.max(
      0,
      Math.floor(
        (new Date(expiresAt).getTime() - countdownNow) / 1000
      )
    );

    /*
     * Only show the timer during the final 24 hours.
     */
    if (
      remainingSeconds <= 0 ||
      remainingSeconds > 24 * 60 * 60
    ) {
      return null;
    }

    const hours = Math.floor(
      remainingSeconds / 3600
    );

    const minutes = Math.floor(
      (remainingSeconds % 3600) / 60
    );

    const seconds =
      remainingSeconds % 60;

    return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
  };


  const cartBannerCouponCountdown =
    formatCartBannerCouponCountdown(
      activeCartBanner?.expires_at
    );


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


  /*
   * =========================================================
   * REMOVE ITEM CONFIRMATION
   * =========================================================
   *
   * Ask before removing a product so the customer does not
   * accidentally lose a limited-stock piece from the cart.
   * =========================================================
   */

  const [
    removeConfirmItem,
    setRemoveConfirmItem,
  ] = useState<
    (typeof items)[number] | null
  >(null);


  /*
   * =========================================================
   * CLEAR CART CONFIRMATION
   * =========================================================
   *
   * Ask before clearing the complete cart so the customer
   * cannot accidentally remove every item with one tap.
   * =========================================================
   */

  const [
    showClearCartConfirm,
    setShowClearCartConfirm,
  ] = useState(false);


  const [
    clearingCart,
    setClearingCart,
  ] = useState(false);


  const [
    clearCartError,
    setClearCartError,
  ] = useState("");


  const handleClearCart = () => {

    if (items.length === 0 || clearingCart) {
      return;
    }

    setClearCartError("");
    setShowClearCartConfirm(true);

  };


  const handleConfirmedClearCart = async () => {

    if (items.length === 0 || clearingCart) {
      setShowClearCartConfirm(false);
      return;
    }

    try {

      setClearingCart(true);
      setClearCartError("");

      /*
       * Remove from a stable snapshot so every item that was
       * present when the customer confirmed is cleared even
       * though each removal updates the store independently.
       */
      const itemsToClear = [...items];

      for (const item of itemsToClear) {
        await removeItem(item.id);
      }

      setShowClearCartConfirm(false);

    } catch (error: any) {

      setClearCartError(
        error?.message ||
        "Unable to clear your cart right now. Please try again."
      );

    } finally {

      setClearingCart(false);

    }

  };


  const handleKeepCartItems = () => {

    if (clearingCart) {
      return;
    }

    setClearCartError("");
    setShowClearCartConfirm(false);

  };


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
   * LOGIN OFFER GUIDANCE
   * =========================================================
   *
   * The guest offer card is clickable, but it does not start
   * a separate login flow. It highlights the existing checkout
   * button and explains that login happens during checkout.
   * =========================================================
   */

  const [
    loginOfferHighlight,
    setLoginOfferHighlight,
  ] = useState(false);

  const loginOfferHighlightTimerRef =
    useRef<number | null>(null);


  const handleLoginOfferClick = () => {

    if (loginOfferHighlightTimerRef.current) {
      window.clearTimeout(
        loginOfferHighlightTimerRef.current
      );
    }

    setLoginOfferHighlight(true);

    loginOfferHighlightTimerRef.current =
      window.setTimeout(() => {
        setLoginOfferHighlight(false);
        loginOfferHighlightTimerRef.current = null;
      }, 3500);

  };


  useEffect(() => {

    return () => {

      if (loginOfferHighlightTimerRef.current) {
        window.clearTimeout(
          loginOfferHighlightTimerRef.current
        );
      }

    };

  }, []);


  /*
   * =========================================================
   * COMPACT CHECKOUT SUMMARY
   * =========================================================
   *
   * Keep the footer compact by default. Customers can expand
   * the arrow on Estimated Total to view the full price
   * breakdown when they want to review the details.
   * =========================================================
   */

  const [
    showPriceBreakdown,
    setShowPriceBreakdown,
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
    showCheckoutOfferChoice,
    setShowCheckoutOfferChoice,
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

    if (loginOfferHighlightTimerRef.current) {
      window.clearTimeout(
        loginOfferHighlightTimerRef.current
      );
      loginOfferHighlightTimerRef.current = null;
    }

    setLoginOfferHighlight(false);

    /*
     * When an unlockable offer is available, give the customer
     * a clear choice before checkout.
     *
     * If another coupon is already available, both choices are
     * presented together in the same modal.
     */
    if (
      !appliedCoupon &&
      unlockCoupon &&
      Number(remainingAmount) > 0
    ) {
      setShowCheckoutOfferChoice(true);
      return;
    }

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


  const handleContinueToCheckoutOfferChoice = () => {

    setShowCheckoutOfferChoice(false);
    setCheckoutOpen(true);

  };


  const handleShopToUnlockCheckoutOffer = () => {

    setShowCheckoutOfferChoice(false);
    scrollToRelatedProducts();

  };


  const handleApplyAvailableCheckoutOffer =
    async () => {

      await handleApplyCheckoutCoupon();

      /*
       * handleApplyCheckoutCoupon opens checkout after the
       * coupon has been successfully applied.
       */
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

          /*
           * The navigator is meant to help the customer find
           * "You may also like" when that section is still
           * BELOW the current scroll position.
           *
           * Previously we used `!entry.isIntersecting`, which
           * also becomes true after the customer scrolls PAST
           * the section. That is why "More for you" remained
           * visible while the customer was already below it.
           */
          const rootBounds =
            entry.rootBounds;

          const relatedIsBelowViewport =
            Boolean(rootBounds) &&
            entry.boundingClientRect.top >=
              rootBounds!.bottom;

          setShowRelatedNavigator(
            relatedIsBelowViewport
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
     * Do not remove immediately. Show a confirmation first so
     * the customer has a chance to keep a limited-stock piece.
     */

    setRemoveConfirmItem(item);

  };


  const handleConfirmedRemoveItem = async (
    item: (typeof items)[number]
  ) => {

    try {

      await removeItem(item.id);

    } finally {

      setRemoveConfirmItem(current =>
        current?.id === item.id
          ? null
          : current
      );

    }

  };


  const handleRemoveAndWishlistItem =
    async (
      item: (typeof items)[number]
    ) => {

      if (!customer?.id) {

        setWishlistSaveError(
          "Please log in to save this piece to your wishlist."
        );

        return;

      }

      try {

        setWishlistSaveError("");

        /*
         * IMPORTANT:
         * Wishlist expects the real product ID, not the cart
         * row ID.
         */
        await addToWishlist(
          item.productId
        );

        await removeItem(
          item.id
        );

        setRemoveConfirmItem(null);

        setRemovedWishlistItem(item);
        setWishlistSaveSuccess(true);

        if (
          wishlistPromptTimerRef.current
        ) {

          window.clearTimeout(
            wishlistPromptTimerRef.current
          );

        }

        wishlistPromptTimerRef.current =
          window.setTimeout(() => {

            setRemovedWishlistItem(null);
            setWishlistSaveSuccess(false);
            setWishlistSaveError("");

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
          removedWishlistItem.productId
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
   * NOTIFY ME — OUT-OF-STOCK ITEM
   * =========================================================
   */

  const handleOutOfStockNotify = () => {

    if (!outOfStockItem) {
      return;
    }

    setShowOutOfStockNotify(true);

  };


  /*
   * =========================================================
   * CONFIRM OUT-OF-STOCK REMOVAL
   * =========================================================
   */

  const handleConfirmOutOfStockRemoval =
    async () => {

      if (!outOfStockItem) {
        return;
      }

      const itemId =
        outOfStockItem.id;

      if (outOfStockRemovalTimerRef.current) {
        window.clearTimeout(
          outOfStockRemovalTimerRef.current
        );
        outOfStockRemovalTimerRef.current = null;
      }

      try {

        await removeItem(itemId);

      } finally {

        setOutOfStockItem(current =>
          current?.id === itemId
            ? null
            : current
        );

      }

    };


  useEffect(() => {

    return () => {

      if (outOfStockRemovalTimerRef.current) {
        window.clearTimeout(
          outOfStockRemovalTimerRef.current
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

                      <div>
                        ✨{" "}
                        {activeCartBanner.cart_display_text?.trim() ||
                          "Special offer available"}{" "}
                        | Use Code :{" "}
                        {activeCartBanner.code}
                      </div>

                      {cartBannerCouponCountdown && (
                        <div
                          className="
                            mt-2
                            inline-flex
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-white/20
                            bg-white/10
                            px-3
                            py-1
                            text-[11px]
                            font-semibold
                            tracking-wide
                            text-white
                          "
                        >
                          <span aria-hidden="true" className="mr-1.5">
                            ⏳
                          </span>
                          Offer ends in {cartBannerCouponCountdown}
                        </div>
                      )}

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

                    onClick={() => {
                      closeCart();
                      navigate("/shop");
                    }}

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

              <button
                type="button"
                onClick={handleLoginOfferClick}
                aria-expanded={loginOfferHighlight}
                className={`
                  mt-6
                  w-full
                  rounded-2xl
                  border
                  p-4
                  text-left
                  transition-all
                  duration-300
                  animate-in
                  fade-in
                  duration-200

                  ${
                    loginOfferHighlight
                      ? "border-[#C8A44D]/55 bg-[#FFF9E8] shadow-[0_8px_26px_rgba(200,164,77,0.18)] ring-2 ring-[#C8A44D]/20"
                      : "border-[#C8A44D]/20 bg-[#FBF7EA] hover:border-[#C8A44D]/40 hover:bg-[#FFFDF6]"
                  }
                `}
              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className={`
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
                      transition-transform
                      duration-300
                      ${
                        loginOfferHighlight
                          ? "scale-110"
                          : ""
                      }
                    `}
                  >

                    ✨

                  </div>


                  <div className="min-w-0 flex-1">

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

                      Sign in at checkout to check exclusive coupons and member benefits.

                    </p>

                  </div>

                  <span
                    className={`
                      shrink-0
                      text-[10px]
                      font-semibold
                      text-[#8A6D25]
                      transition-all
                      duration-300
                      ${
                        loginOfferHighlight
                          ? "translate-x-0 opacity-100"
                          : "translate-x-1 opacity-70"
                      }
                    `}
                  >
                    {loginOfferHighlight ? "↓" : "Tap"}
                  </span>

                </div>


                {loginOfferHighlight && (
                  <div
                    className="
                      mt-3
                      rounded-xl
                      border
                      border-[#C8A44D]/20
                      bg-white/80
                      px-3
                      py-2.5
                      animate-in
                      fade-in
                      slide-in-from-top-1
                      duration-250
                    "
                  >

                    <p
                      className="
                        text-xs
                        font-semibold
                        text-neutral-900
                      "
                    >
                      Continue to checkout to sign in
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-[11px]
                        leading-4
                        text-neutral-500
                      "
                    >
                      Your login and OTP options will appear there.
                    </p>

                  </div>
                )}

              </button>

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
                bottom-[calc(150px+env(safe-area-inset-bottom))]
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
            CLEAR CART CONFIRMATION
        ==================================================== */}

        {showClearCartConfirm && (
          <div
            className="
              absolute
              inset-0
              z-[130]
              flex
              items-center
              justify-center
              bg-black/40
              px-4
              backdrop-blur-[3px]
              animate-in
              fade-in
              duration-200
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-cart-confirm-title"
          >
            <div
              className="
                relative
                w-full
                max-w-sm
                overflow-hidden
                rounded-[28px]
                border
                border-neutral-200
                bg-white
                shadow-[0_24px_70px_rgba(0,0,0,0.25)]
                animate-in
                zoom-in-95
                slide-in-from-bottom-3
                duration-300
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-16
                  -top-16
                  h-40
                  w-40
                  rounded-full
                  bg-red-500/[0.06]
                  blur-3xl
                "
              />

              <div className="relative p-5 sm:p-6">

                <button
                  type="button"
                  onClick={handleKeepCartItems}
                  disabled={clearingCart}
                  className="
                    absolute
                    right-3
                    top-3
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    text-neutral-400
                    transition
                    hover:bg-neutral-100
                    hover:text-neutral-700
                    active:scale-90
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                  aria-label="Keep items in cart"
                >
                  <X size={18} />
                </button>

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-red-50
                    text-red-500
                    ring-1
                    ring-red-100
                  "
                >
                  <Trash2 size={23} strokeWidth={1.9} />
                </div>

                <p
                  className="
                    mt-5
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-neutral-400
                  "
                >
                  Clear your cart
                </p>

                <h3
                  id="clear-cart-confirm-title"
                  className="
                    mt-1.5
                    text-[22px]
                    font-semibold
                    tracking-tight
                    text-neutral-900
                  "
                >
                  Clear all items?
                </h3>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-5
                    text-neutral-500
                  "
                >
                  You have{" "}
                  <span className="font-semibold text-neutral-800">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>{" "}
                  in your cart. Removing everything will empty your cart.
                </p>

                <div
                  className="
                    mt-4
                    rounded-2xl
                    border
                    border-[#D4AF37]/25
                    bg-[#FBF7EA]
                    px-4
                    py-3.5
                  "
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className="
                        mt-0.5
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[#D4AF37]/15
                        text-sm
                      "
                    >
                      ✨
                    </span>

                    <p
                      className="
                        text-xs
                        leading-4
                        text-neutral-600
                      "
                    >
                      Some of these pieces may have limited stock and
                      may not be available later.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2">

                  <button
                    type="button"
                    onClick={() => {
                      void handleConfirmedClearCart();
                    }}
                    disabled={clearingCart}
                    className="
                      flex
                      min-h-11
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      bg-black
                      px-4
                      py-3
                      text-xs
                      font-semibold
                      text-white
                      shadow-sm
                      transition
                      hover:bg-neutral-800
                      active:scale-[0.98]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {clearingCart ? (
                      <>
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                        Clearing Cart...
                      </>
                    ) : (
                      "Yes, Clear My Cart"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleKeepCartItems}
                    disabled={clearingCart}
                    className="
                      flex
                      min-h-11
                      w-full
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-neutral-200
                      bg-white
                      px-4
                      py-3
                      text-xs
                      font-semibold
                      text-neutral-700
                      transition
                      hover:bg-neutral-50
                      active:scale-[0.98]
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    Keep My Items
                  </button>

                </div>

                {clearCartError && (
                  <p
                    className="
                      mt-3
                      text-center
                      text-[11px]
                      leading-4
                      text-red-500
                    "
                  >
                    {clearCartError}
                  </p>
                )}

              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            REMOVE ITEM CONFIRMATION
        ==================================================== */}

        {removeConfirmItem && (
          <div
            className="
              absolute
              inset-0
              z-[110]
              flex
              items-center
              justify-center
              bg-black/35
              px-4
              backdrop-blur-[3px]
              animate-in
              fade-in
              duration-200
            "
          >
            <div
              className="
                relative
                w-full
                max-w-sm
                overflow-hidden
                rounded-[26px]
                border
                border-[#C8A44D]/25
                bg-white
                shadow-[0_24px_70px_rgba(0,0,0,0.24)]
                animate-in
                zoom-in-95
                slide-in-from-bottom-3
                duration-300
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-16
                  -top-16
                  h-40
                  w-40
                  rounded-full
                  bg-[#D4AF37]/12
                  blur-3xl
                "
              />

              <div className="relative p-5">
                <div className="flex items-start gap-3.5">
                  <div
                    className="
                      h-16
                      w-16
                      shrink-0
                      overflow-hidden
                      rounded-2xl
                      bg-[#FBF7EA]
                      ring-1
                      ring-[#C8A44D]/20
                    "
                  >
                    <img
                      src={removeConfirmItem.image}
                      alt={removeConfirmItem.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.16em]
                        text-[#A27D18]
                      "
                    >
                      Before you remove it
                    </p>

                    <h3
                      className="
                        mt-1
                        line-clamp-2
                        text-base
                        font-semibold
                        leading-5
                        text-neutral-900
                      "
                    >
                      {removeConfirmItem.name}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setRemoveConfirmItem(null);
                      setWishlistSaveError("");
                    }}
                    className="
                      flex
                      h-8
                      w-8
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
                    aria-label="Keep item in cart"
                  >
                    <X size={17} />
                  </button>
                </div>

                <div
                  className="
                    mt-4
                    rounded-2xl
                    border
                    border-[#D4AF37]/25
                    bg-[#FBF7EA]
                    px-4
                    py-3.5
                  "
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className="
                        mt-0.5
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[#D4AF37]/15
                        text-sm
                      "
                    >
                      ✨
                    </span>

                    <div>
                      <p
                        className="
                          text-sm
                          font-semibold
                          text-neutral-900
                        "
                      >
                        Limited stock available
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          leading-4
                          text-neutral-600
                        "
                      >
                        This piece may not stay available for long.
                        Would you really like to remove it from your cart?
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void handleRemoveAndWishlistItem(
                        removeConfirmItem
                      );
                    }}
                    disabled={isAddingToWishlist}
                    className="
                      flex
                      min-h-11
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      bg-black
                      px-4
                      py-3
                      text-xs
                      font-semibold
                      text-white
                      shadow-sm
                      transition
                      hover:bg-neutral-800
                      active:scale-[0.98]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {isAddingToWishlist ? (
                      <>
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                        Saving to Wishlist...
                      </>
                    ) : (
                      <>
                        <span className="text-sm">♡</span>
                        Add to Wishlist
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      void handleConfirmedRemoveItem(
                        removeConfirmItem
                      );
                    }}
                    disabled={isAddingToWishlist}
                    className="
                      flex
                      min-h-11
                      w-full
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-neutral-200
                      bg-white
                      px-4
                      py-3
                      text-xs
                      font-semibold
                      text-neutral-700
                      transition
                      hover:bg-neutral-50
                      active:scale-[0.98]
                      disabled:opacity-50
                    "
                  >
                    Remove from Cart
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent("tnm:open-help")
                      );
                    }}
                    className="
                      flex
                      min-h-10
                      w-full
                      items-center
                      justify-center
                      gap-1.5
                      rounded-2xl
                      px-4
                      py-2.5
                      text-xs
                      font-medium
                      text-[#8A6D25]
                      transition
                      hover:bg-[#FBF7EA]
                      active:scale-[0.98]
                    "
                  >
                    <HelpCircle size={14} />
                    Need Help?
                  </button>
                </div>

                {wishlistSaveError && (
                  <p
                    className="
                      mt-3
                      px-1
                      text-center
                      text-[11px]
                      leading-4
                      text-red-500
                    "
                  >
                    {wishlistSaveError}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

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
            OUT-OF-STOCK POPUP
        ==================================================== */}

        {outOfStockItem && (
          <div
            className="
              absolute
              inset-0
              z-[120]
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
                overflow-hidden
                rounded-3xl
                border
                border-neutral-200
                bg-white
                p-5
                text-center
                shadow-[0_20px_60px_rgba(0,0,0,0.22)]
                animate-in
                zoom-in-95
                slide-in-from-bottom-2
                duration-300
              "
            >
              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-red-50
                  text-red-500
                  text-2xl
                "
              >
                !
              </div>

              <p
                className="
                  mt-4
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-neutral-400
                "
              >
                Just sold out
              </p>

              <h3
                className="
                  mt-1.5
                  text-lg
                  font-semibold
                  text-neutral-900
                "
              >
                This piece is no longer available
              </h3>

              <div
                className="
                  mt-4
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  bg-neutral-50
                  p-3
                  text-left
                "
              >
                <img
                  src={outOfStockItem.image}
                  alt={outOfStockItem.name}
                  className="
                    h-16
                    w-16
                    shrink-0
                    rounded-xl
                    object-cover
                  "
                />

                <div className="min-w-0">
                  <p
                    className="
                      line-clamp-2
                      text-sm
                      font-semibold
                      text-neutral-900
                    "
                  >
                    {outOfStockItem.name}
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-4
                      text-neutral-500
                    "
                  >
                    Another customer purchased the last available piece.
                    We’ll remove it from your cart now.
                  </p>
                </div>
              </div>

              <p
                className="
                  mt-4
                  text-[11px]
                  leading-4
                  text-neutral-400
                "
              >
                Please remove this item to continue with the
                latest available stock.
              </p>

              <div
                className="
                  mt-5
                  flex
                  gap-2.5
                "
              >

                <button
                  type="button"
                  onClick={handleOutOfStockNotify}
                  className="
                    flex
                    min-h-11
                    flex-1
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-[#D4AF37]/45
                    bg-[#FBF7EA]
                    px-3
                    py-3
                    text-xs
                    font-semibold
                    text-[#8A6D25]
                    transition
                    hover:bg-[#F7F0D9]
                    active:scale-[0.98]
                  "
                >
                  Notify Me
                </button>

                <button
                  type="button"
                  onClick={() => {
                    void handleConfirmOutOfStockRemoval();
                  }}
                  className="
                    flex
                    min-h-11
                    flex-1
                    items-center
                    justify-center
                    rounded-2xl
                    bg-black
                    px-3
                    py-3
                    text-xs
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-neutral-800
                    active:scale-[0.98]
                  "
                >
                  Remove Item
                </button>

              </div>
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

                    {showPriceBreakdown && (

                      <div
                        className="
                          space-y-2
                          text-sm
                          animate-in
                          fade-in
                          slide-in-from-top-1
                          duration-200
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


                        {/* COUPON */}

                        {appliedCoupon && (
                          <div
                            className="
                              flex
                              justify-between
                              text-green-600
                            "
                          >
                            <span>
                              Coupon (
                              {appliedCoupon.code}
                              )
                            </span>

                            <span>
                              -₹
                              {discount.toFixed(2)}
                            </span>
                          </div>
                        )}


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

                      </div>

                    )}


                    {/* ESTIMATED TOTAL + EXPAND/COLLAPSE */}

                    <button
                      type="button"
                      onClick={() =>
                        setShowPriceBreakdown(
                          current => !current
                        )
                      }
                      aria-expanded={showPriceBreakdown}
                      aria-label={
                        showPriceBreakdown
                          ? "Hide price breakdown"
                          : "Show price breakdown"
                      }
                      className="
                        flex
                        w-full
                        items-center
                        justify-between
                        border-t
                        border-neutral-200
                        pt-3
                        text-left
                        text-lg
                        font-bold
                        transition
                      "
                    >

                      <span>
                        Estimated Total
                      </span>

                      <span className="flex items-center gap-2">
                        ₹
                        {estimatedTotal.toFixed(2)}

                        <ChevronDown
                          size={18}
                          strokeWidth={2.2}
                          className={`
                            shrink-0
                            text-neutral-500
                            transition-transform
                            duration-200
                            ${
                              showPriceBreakdown
                                ? "rotate-180"
                                : ""
                            }
                          `}
                        />

                      </span>

                    </button>

                  </div>

                  {/* CHECKOUT */}

                  <button

                    onClick={
                      handleProceedToCheckout
                    }

                    className={`

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

                      transition-all
                      duration-200

                      active:scale-[0.98]

                      hover:bg-neutral-800

                      ${
                        loginOfferHighlight
                          ? "ring-4 ring-[#C8A44D]/25 shadow-[0_0_0_2px_rgba(200,164,77,0.35),0_10px_28px_rgba(200,164,77,0.22)] motion-safe:animate-pulse"
                          : ""
                      }

                    `}

                  >

                    {loginOfferHighlight ? (
                      <span className="flex items-center gap-2">
                        ↓ Continue To Checkout to Sign In
                      </span>
                    ) : (
                      "Continue To Checkout"
                    )}

                  </button>


                  <p

                    className="

                      mt-2

                      text-center

                      text-xs
                      text-neutral-500

                    "

                  >

                    {formattedEstimatedDispatchDate
                      ? `⚡ Estimated dispatch by ${formattedEstimatedDispatchDate}`
                      : "⚡ Estimated dispatch date unavailable"}

                  </p>


                  <button
                    type="button"
                    onClick={handleClearCart}
                    disabled={clearingCart}
                    className="
                      mx-auto
                      mt-2
                      flex
                      items-center
                      justify-center
                      gap-1.5
                      rounded-lg
                      px-3
                      py-1.5
                      text-[11px]
                      font-medium
                      text-neutral-400
                      transition
                      hover:bg-neutral-50
                      hover:text-red-500
                      active:scale-[0.98]
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    <Trash2 size={13} strokeWidth={1.8} />
                    Clear Cart
                  </button>

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

                    onClick={() => {
                      closeCart();
                      navigate("/shop");
                    }}

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
          CHECKOUT OFFER CHOICE
      ====================================================== */}

      {showCheckoutOfferChoice &&
        unlockCoupon && (
        <div
          className="
            fixed inset-0 z-[1450]
            flex items-center justify-center
            bg-black/45 px-4
            backdrop-blur-[4px]
            animate-in fade-in duration-200
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-offer-choice-title"
        >
          <div
            className="
              relative w-full max-w-[390px]
              overflow-hidden rounded-[30px]
              border border-[#D4AF37]/25
              bg-white
              shadow-[0_28px_90px_rgba(0,0,0,0.28)]
              animate-in zoom-in-95 slide-in-from-bottom-4
              duration-300
            "
          >
            <div
              className="
                pointer-events-none absolute -right-20 -top-20
                h-48 w-48 rounded-full
                bg-[#D4AF37]/15 blur-3xl
              "
            />

            <div
              className="
                pointer-events-none absolute -bottom-24 -left-20
                h-48 w-48 rounded-full
                bg-[#D4AF37]/10 blur-3xl
              "
            />

            <button
              type="button"
              onClick={() =>
                setShowCheckoutOfferChoice(false)
              }
              className="
                absolute right-3 top-3 z-20
                flex h-9 w-9 items-center justify-center
                rounded-full text-neutral-400
                transition hover:bg-neutral-100
                hover:text-neutral-800 active:scale-90
              "
              aria-label="Close offer choices"
            >
              <X size={18} />
            </button>

            <div className="relative px-6 pb-6 pt-7 text-center">

              <div
                className="
                  mx-auto flex h-14 w-14
                  items-center justify-center
                  rounded-full
                  bg-[#FBF5DF]
                  text-[#A27B16]
                  ring-1 ring-[#D4AF37]/25
                  shadow-[0_8px_25px_rgba(200,164,77,0.16)]
                "
              >
                <Sparkles size={27} strokeWidth={1.8} />
              </div>

              <p
                className="
                  mt-4 text-[10px] font-semibold uppercase
                  tracking-[0.2em] text-[#A27B16]
                "
              >
                Before you checkout
              </p>

              <h3
                id="checkout-offer-choice-title"
                className="
                  mt-1.5 text-[25px] font-semibold
                  tracking-tight text-neutral-900
                "
              >
                You have offers waiting ✨
              </h3>

              <p
                className="
                  mx-auto mt-2 max-w-[315px]
                  text-sm leading-5 text-neutral-500
                "
              >
                Save on your current cart, or add a little more
                to unlock another offer.
              </p>

              {bestCouponAvailable && bestCoupon ? (
                <>
                  {/* AVAILABLE NOW */}
                  <div
                    className="
                      mt-5 rounded-[22px]
                      border border-green-200
                      bg-green-50 p-4 text-left
                    "
                  >
                    <div className="flex items-start gap-3">

                      <div
                        className="
                          flex h-11 w-11 shrink-0
                          items-center justify-center
                          rounded-xl bg-white
                          text-green-600 shadow-sm
                        "
                      >
                        <Check size={20} strokeWidth={2.4} />
                      </div>

                      <div className="min-w-0 flex-1">

                        <div
                          className="
                            flex items-start
                            justify-between gap-2
                          "
                        >
                          <div className="min-w-0">
                            <p
                              className="
                                text-[10px] font-semibold uppercase
                                tracking-[0.14em] text-green-700
                              "
                            >
                              Available now
                            </p>

                            <p
                              className="
                                mt-1 text-sm font-semibold
                                text-neutral-900
                              "
                            >
                              Save ₹{Number(
                                bestCoupon.estimatedSaving ?? 0
                              ).toLocaleString("en-IN")}
                            </p>
                          </div>

                          <span
                            className="
                              shrink-0 rounded-full
                              bg-black px-2.5 py-1
                              text-[10px] font-semibold
                              tracking-wide text-white
                            "
                          >
                            {bestCoupon.code}
                          </span>
                        </div>

                        <p
                          className="
                            mt-1.5 text-xs leading-4
                            text-neutral-600
                          "
                        >
                          {bestCoupon.title ||
                            "This offer is available for your current cart."}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyAvailableCheckoutOffer}
                      disabled={applyingCheckoutCoupon}
                      className="
                        mt-3 flex min-h-10 w-full
                        items-center justify-center gap-2
                        rounded-xl bg-black px-4 py-2.5
                        text-xs font-semibold text-white
                        transition hover:bg-neutral-800
                        active:scale-[0.98]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      {applyingCheckoutCoupon ? (
                        <>
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />
                          Applying...
                        </>
                      ) : (
                        <>
                          Apply {bestCoupon.code} & Continue
                        </>
                      )}
                    </button>
                  </div>

                  {/* UNLOCKABLE OFFER */}
                  <div
                    className="
                      mt-3 rounded-[22px]
                      border border-[#D4AF37]/30
                      bg-[#FBF7EA] p-4 text-left
                    "
                  >
                    <div className="flex items-start gap-3">

                      <div
                        className="
                          flex h-11 w-11 shrink-0
                          items-center justify-center
                          rounded-xl bg-white
                          text-[#A27B16] shadow-sm
                        "
                      >
                        <Gift size={20} strokeWidth={1.8} />
                      </div>

                      <div className="min-w-0 flex-1">

                        <div
                          className="
                            flex items-start
                            justify-between gap-2
                          "
                        >
                          <div className="min-w-0">
                            <p
                              className="
                                text-[10px] font-semibold uppercase
                                tracking-[0.14em] text-[#A27B16]
                              "
                            >
                              Unlock with more shopping
                            </p>

                            <p
                              className="
                                mt-1 text-sm font-semibold
                                text-neutral-900
                              "
                            >
                              Add ₹{Number(
                                remainingAmount
                              ).toLocaleString("en-IN")} more
                            </p>
                          </div>

                          <span
                            className="
                              shrink-0 rounded-full
                              bg-white px-2.5 py-1
                              text-[10px] font-semibold
                              tracking-wide text-[#8A6D25]
                              ring-1 ring-[#D4AF37]/25
                            "
                          >
                            {unlockCoupon.code}
                          </span>
                        </div>

                        <p
                          className="
                            mt-1.5 text-xs leading-4
                            text-neutral-600
                          "
                        >
                          {unlockCoupon.title ||
                            "Add a little more to unlock this offer."}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleShopToUnlockCheckoutOffer}
                      className="
                        mt-3 flex min-h-10 w-full
                        items-center justify-center
                        rounded-xl
                        border border-[#D4AF37]/35
                        bg-white px-4 py-2.5
                        text-xs font-semibold text-[#8A6D25]
                        transition hover:bg-[#FFFDF7]
                        active:scale-[0.98]
                      "
                    >
                      Add ₹{Number(
                        remainingAmount
                      ).toLocaleString("en-IN")} More & Unlock
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleContinueToCheckoutOfferChoice
                    }
                    disabled={applyingCheckoutCoupon}
                    className="
                      mt-3 flex min-h-10 w-full
                      items-center justify-center
                      rounded-2xl px-4 py-2.5
                      text-xs font-medium text-neutral-500
                      transition hover:bg-neutral-50
                      hover:text-neutral-900
                      active:scale-[0.98]
                      disabled:opacity-50
                    "
                  >
                    Continue without using an offer
                  </button>
                </>
              ) : (
                <>
                  {/* UNLOCK-ONLY */}
                  <div
                    className="
                      mt-5 rounded-[22px]
                      border border-[#D4AF37]/30
                      bg-[#FBF7EA] p-4 text-left
                    "
                  >
                    <div className="flex items-start gap-3">

                      <div
                        className="
                          flex h-11 w-11 shrink-0
                          items-center justify-center
                          rounded-xl bg-white
                          text-[#A27B16] shadow-sm
                        "
                      >
                        <Gift size={20} strokeWidth={1.8} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className="
                            text-[10px] font-semibold uppercase
                            tracking-[0.14em] text-[#A27B16]
                          "
                        >
                          You're almost there
                        </p>

                        <p
                          className="
                            mt-1 text-sm font-semibold
                            text-neutral-900
                          "
                        >
                          Add ₹{Number(
                            remainingAmount
                          ).toLocaleString("en-IN")} more to unlock{" "}
                          {unlockCoupon.code}
                        </p>

                        <p
                          className="
                            mt-1.5 text-xs leading-4
                            text-neutral-600
                          "
                        >
                          {unlockCoupon.title ||
                            "A special offer is waiting for you."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleShopToUnlockCheckoutOffer}
                    className="
                      mt-4 flex min-h-12 w-full
                      items-center justify-center
                      rounded-2xl bg-black px-5 py-3.5
                      text-sm font-semibold text-white
                      shadow-[0_10px_25px_rgba(0,0,0,0.16)]
                      transition hover:bg-neutral-800
                      active:scale-[0.98]
                    "
                  >
                    Add ₹{Number(
                      remainingAmount
                    ).toLocaleString("en-IN")} More & Unlock
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleContinueToCheckoutOfferChoice
                    }
                    className="
                      mt-2.5 flex min-h-10 w-full
                      items-center justify-center
                      rounded-2xl px-4 py-2.5
                      text-xs font-medium text-neutral-500
                      transition hover:bg-neutral-50
                      hover:text-neutral-900
                      active:scale-[0.98]
                    "
                  >
                    Continue to checkout anyway
                  </button>
                </>
              )}

              <p
                className="
                  mt-2 text-[10px] leading-4
                  text-neutral-400
                "
              >
                Your current cart is safe — these offers are optional.
              </p>

            </div>
          </div>
        </div>
      )}

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
          NOTIFY ME — OUT-OF-STOCK CART ITEM
      ====================================================== */}

      {outOfStockItem && (
        <NotifyDialog
          open={showOutOfStockNotify}
          onClose={() =>
            setShowOutOfStockNotify(false)
          }
          product={{
            id:
              outOfStockItem.productId,
            name:
              outOfStockItem.name,
            image:
              outOfStockItem.image ?? null,
          }}
        />
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