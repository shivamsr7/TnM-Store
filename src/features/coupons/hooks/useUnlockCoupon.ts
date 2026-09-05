import {
  useQuery,
} from "@tanstack/react-query";

import {
  useCoupons,
} from "./useCoupons";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import {
  supabase,
} from "@/shared/lib/supabase";


export function useUnlockCoupon(
  cartTotal: number,
  cartItems: any[] = []
) {

  const {
    customer,
  } = useAuth();


  const {
    data: coupons = [],
    isLoading: couponsLoading,
  } = useCoupons();


  /*
   * =========================================================
   * SPECIAL PRICE CART CHECK
   * =========================================================
   *
   * A Special Price product must never unlock/show a coupon
   * offer. We compare the cart's snapped unit price with the
   * current regular product price.
   * =========================================================
   */

  const {
    data: specialPriceOnly = false,
    isLoading: specialPriceLoading,
  } = useQuery({

    queryKey: [
      "unlock-coupon-special-price-check",
      cartItems
        .map(
          (item: any) =>
            `${item.productId ?? item.product_id ?? item.id ?? ""}:${item.quantity}:${item.price ?? item.unit_price ?? 0}`
        )
        .sort()
        .join("|"),
    ],

    queryFn: async () => {

      if (cartItems.length === 0) {
        return false;
      }

      const productIds = [
        ...new Set(
          cartItems
            .map(
              (item: any) =>
                item.productId ??
                item.product_id ??
                item.id ??
                ""
            )
            .filter(Boolean)
        ),
      ];

      if (productIds.length === 0) {
        return false;
      }

      const {
        data: products,
        error,
      } = await supabase
        .from("products")
        .select("id, price")
        .in("id", productIds);

      if (error) {
        throw error;
      }

      const regularPriceById =
        new Map(
          (products ?? []).map(
            (product: any) => [
              product.id,
              Number(product.price ?? 0),
            ]
          )
        );

      return cartItems.every(
        (item: any) => {

          const productId =
            item.productId ??
            item.product_id ??
            item.id ??
            "";

          const snappedPrice =
            Number(
              item.price ??
              item.unit_price ??
              0
            );

          const regularPrice =
            regularPriceById.get(
              productId
            ) ?? 0;

          return (
            regularPrice > 0 &&
            snappedPrice < regularPrice
          );

        }
      );

    },

    enabled:
      cartItems.length > 0,

    staleTime: 0,

  });


  /*
   * =========================================================
   * CUSTOMER ELIGIBILITY CONTEXT
   * =========================================================
   *
   * Used for:
   *
   * - New customer
   * - Existing customer
   * - First order
   * - Previous order limits
   * - Lifetime spend limits
   * - Membership tier
   * =========================================================
   */

  const {
    data: customerContext,
    isLoading: customerLoading,
  } = useQuery({

    queryKey: [
      "unlock-coupon-customer-context",
      customer?.id,
    ],

    queryFn: async () => {

      if (!customer?.id) {
        return null;
      }


      const [
        rewardResult,
        ordersResult,
      ] = await Promise.all([

        supabase
          .from("customer_rewards")
          .select(
            "lifetime_spend, tier_id"
          )
          .eq(
            "customer_id",
            customer.id
          )
          .maybeSingle(),

        supabase
          .from("orders")
          .select(
            "id",
            {
              count: "exact",
              head: true,
            }
          )
          .eq(
            "customer_id",
            customer.id
          )
          .not(
            "order_status",
            "in",
            "(cancelled,refunded)"
          ),

      ]);


      if (rewardResult.error) {
        throw rewardResult.error;
      }


      if (ordersResult.error) {
        throw ordersResult.error;
      }


      const previousOrders =
        ordersResult.count ?? 0;


      return {

        lifetimeSpend:
          Number(
            rewardResult.data?.lifetime_spend ?? 0
          ),

        membershipTierId:
          rewardResult.data?.tier_id ?? null,

        previousOrders,

        isNewCustomer:
          previousOrders === 0,

        isFirstOrder:
          previousOrders === 0,

      };

    },

    enabled:
      !!customer?.id,

    staleTime:
      30 * 1000,

  });


  /*
   * =========================================================
   * SELECTED CUSTOMER RULES
   * =========================================================
   */

  const {
    data: customerRuleRows = [],
    isLoading: customerRulesLoading,
  } = useQuery({

    queryKey: [
      "unlock-coupon-customer-rules",
      customer?.id,
      coupons
        .filter(
          (coupon: any) =>
            coupon.customer_scope ===
            "selected"
        )
        .map(
          (coupon: any) =>
            coupon.id
        )
        .sort()
        .join(","),
    ],

    queryFn: async () => {

      if (
        !customer?.id ||
        coupons.length === 0
      ) {
        return [];
      }


      const selectedCouponIds =
        coupons
          .filter(
            (coupon: any) =>
              coupon.customer_scope ===
              "selected"
          )
          .map(
            (coupon: any) =>
              coupon.id
          );


      if (
        selectedCouponIds.length === 0
      ) {
        return [];
      }


      const {
        data,
        error,
      } = await supabase

        .from(
          "coupon_customers"
        )

        .select(
          "coupon_id, customer_id"
        )

        .eq(
          "customer_id",
          customer.id
        )

        .in(
          "coupon_id",
          selectedCouponIds
        );


      if (error) {
        throw error;
      }


      return data ?? [];

    },

    enabled:
      !!customer?.id &&
      coupons.length > 0,

    staleTime:
      30 * 1000,

  });


  /*
   * =========================================================
   * MEMBERSHIP RULES
   * =========================================================
   */

  const {
    data: membershipRuleRows = [],
    isLoading: membershipRulesLoading,
  } = useQuery({

    queryKey: [
      "unlock-coupon-membership-rules",
      customer?.id,
      customerContext?.membershipTierId,
      coupons
        .map(
          (coupon: any) =>
            coupon.id
        )
        .sort()
        .join(","),
    ],

    queryFn: async () => {

      if (
        !customer?.id ||
        coupons.length === 0
      ) {
        return [];
      }


      const couponIds =
        coupons.map(
          (coupon: any) =>
            coupon.id
        );


      const {
        data,
        error,
      } = await supabase

        .from(
          "coupon_membership_tiers"
        )

        .select(
          "coupon_id, tier_id"
        )

        .in(
          "coupon_id",
          couponIds
        );


      if (error) {
        throw error;
      }


      return data ?? [];

    },

    enabled:
      !!customer?.id &&
      !!customerContext &&
      coupons.length > 0,

    staleTime:
      30 * 1000,

  });


  /*
   * =========================================================
   * ONE-USE COUPON USAGE
   * =========================================================
   *
   * IMPORTANT:
   *
   * A coupon with one_use_per_customer = true must NOT be
   * shown as an unlock offer after the customer has already
   * used it.
   *
   * validateCoupon() already enforces this rule when the
   * customer actually applies the coupon.
   *
   * This query makes the unlock banner follow the same rule.
   * =========================================================
   */

  const oneUseCouponIds =
    coupons
      .filter(
        (coupon: any) =>
          coupon.one_use_per_customer ===
          true
      )
      .map(
        (coupon: any) =>
          coupon.id
      );


  const {
    data: usedCouponRows = [],
    isLoading: usageLoading,
  } = useQuery({

    queryKey: [
      "unlock-coupon-usage",
      customer?.id,
      oneUseCouponIds
        .sort()
        .join(","),
    ],

    queryFn: async () => {

      if (
        !customer?.id ||
        oneUseCouponIds.length === 0
      ) {
        return [];
      }


      /*
       * First get every usage row for this customer.
       *
       * We intentionally fetch order_id as well because a
       * coupon must be reusable only when its previous order
       * was cancelled/refunded.
       */

      const {
        data: usageRows,
        error: usageError,
      } = await supabase

        .from(
          "coupon_usage"
        )

        .select(
          "coupon_id, order_id"
        )

        .eq(
          "customer_id",
          customer.id
        )

        .in(
          "coupon_id",
          oneUseCouponIds
        );


      if (usageError) {
        throw usageError;
      }


      const rows =
        usageRows ?? [];


      if (rows.length === 0) {
        return [];
      }


      /*
       * Legacy usage rows without an order_id cannot be
       * safely connected to a cancelled/refunded order.
       * Therefore they remain treated as used.
       */

      const rowsWithoutOrder =
        rows.filter(
          (row: any) =>
            !row.order_id
        );


      const orderIds = Array.from(
        new Set(
          rows
            .filter(
              (row: any) =>
                !!row.order_id
            )
            .map(
              (row: any) =>
                row.order_id
            )
        )
      );


      if (orderIds.length === 0) {
        return rowsWithoutOrder;
      }


      /*
       * Check the actual order status.
       *
       * cancelled/refunded orders do NOT count as coupon
       * usage. Any other order status keeps the coupon
       * blocked for one-use-per-customer coupons.
       */

      const {
        data: orderRows,
        error: orderError,
      } = await supabase

        .from(
          "orders"
        )

        .select(
          "id, order_status"
        )

        .in(
          "id",
          orderIds
        );


      if (orderError) {
        throw orderError;
      }


      const orderStatusById =
        new Map(
          (orderRows ?? []).map(
            (order: any) => [
              order.id,
              order.order_status,
            ]
          )
        );


      return rows.filter(
        (row: any) => {

          /*
           * No order_id = keep blocked.
           */

          if (!row.order_id) {
            return true;
          }


          const status =
            orderStatusById.get(
              row.order_id
            );


          /*
           * Only cancelled/refunded usage is released.
           */

          return (
            status !== "cancelled" &&
            status !== "refunded"
          );

        }
      );

    },

    enabled:
      !!customer?.id &&
      oneUseCouponIds.length > 0,

    /*
     * Coupon usage can change immediately after checkout.
     * Do not keep the previous result cached.
     */

    staleTime:
      0,

    refetchOnMount:
      "always",

    refetchOnWindowFocus:
      true,

    /*
     * This handles the case where the cart drawer remains
     * mounted after checkout. The previous version could keep
     * showing the old unlock offer because React Query had
     * already cached the usage query.
     */

    refetchInterval:
      2000,

    refetchIntervalInBackground:
      false,

  });


  /*
   * =========================================================
   * USED COUPON SET
   * =========================================================
   */

  const usedCouponIds =
    new Set(
      usedCouponRows.map(
        (row: any) =>
          row.coupon_id
      )
    );


  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  const isLoading =
    couponsLoading ||
    customerLoading ||
    customerRulesLoading ||
    membershipRulesLoading ||
    usageLoading ||
    specialPriceLoading;


  /*
   * =========================================================
   * CUSTOMER ELIGIBILITY
   * =========================================================
   */

  const isCustomerEligible = (
    coupon: any
  ) => {

    /*
     * -------------------------------------------------------
     * GUEST CUSTOMER
     * -------------------------------------------------------
     *
     * Customer-specific coupons cannot be safely shown to a
     * guest.
     *
     * Also, one-use-per-customer coupons require login in
     * validateCoupon(), so do not show those to guests.
     * -------------------------------------------------------
     */

    if (!customer?.id) {

      return (
        coupon.customer_scope ===
          "all" &&

        !coupon.first_order_only &&

        !coupon.new_customer_only &&

        !coupon.existing_customer_only &&

        Number(coupon.min_previous_orders ?? 0) <= 0 &&

        Number(coupon.max_previous_orders ?? 0) <= 0 &&

        Number(coupon.min_lifetime_spend ?? 0) <= 0 &&

        Number(coupon.max_lifetime_spend ?? 0) <= 0 &&

        !coupon.one_use_per_customer
      );

    }


    /*
     * Customer context is required for logged-in customer
     * restrictions.
     */

    if (!customerContext) {
      return false;
    }


    /*
     * -------------------------------------------------------
     * ONE USE PER CUSTOMER
     * -------------------------------------------------------
     *
     * This is the main fix.
     *
     * If the customer has already redeemed this coupon,
     * it must never appear as an unlock offer again.
     * -------------------------------------------------------
     */

    if (
      coupon.one_use_per_customer ===
      true
    ) {

      if (
        usedCouponIds.has(
          coupon.id
        )
      ) {
        return false;
      }

    }


    /*
     * -------------------------------------------------------
     * CUSTOMER SCOPE
     * -------------------------------------------------------
     */

    if (
      coupon.customer_scope ===
      "selected"
    ) {

      const selected =
        customerRuleRows.some(
          (row: any) =>
            row.coupon_id ===
              coupon.id &&
            row.customer_id ===
              customer.id
        );


      if (!selected) {
        return false;
      }

    }


    /*
     * New customer scope
     */

    if (
      coupon.customer_scope ===
        "new" &&
      !customerContext.isNewCustomer
    ) {
      return false;
    }


    /*
     * Existing customer scope
     */

    if (
      coupon.customer_scope ===
        "existing" &&
      customerContext.isNewCustomer
    ) {
      return false;
    }


    /*
     * -------------------------------------------------------
     * EXPLICIT CUSTOMER FLAGS
     * -------------------------------------------------------
     */

    if (
      coupon.first_order_only &&
      !customerContext.isFirstOrder
    ) {
      return false;
    }


    if (
      coupon.new_customer_only &&
      !customerContext.isNewCustomer
    ) {
      return false;
    }


    if (
      coupon.existing_customer_only &&
      customerContext.isNewCustomer
    ) {
      return false;
    }


    /*
     * -------------------------------------------------------
     * PREVIOUS ORDER LIMITS
     * -------------------------------------------------------
     */

    if (
      Number(coupon.min_previous_orders ?? 0) > 0 &&
      customerContext.previousOrders <
        Number(
          coupon.min_previous_orders
        )
    ) {
      return false;
    }


    if (
      Number(coupon.max_previous_orders ?? 0) > 0 &&
      customerContext.previousOrders >
        Number(
          coupon.max_previous_orders
        )
    ) {
      return false;
    }


    /*
     * -------------------------------------------------------
     * LIFETIME SPEND LIMITS
     * -------------------------------------------------------
     */

    if (
      Number(coupon.min_lifetime_spend ?? 0) > 0 &&
      customerContext.lifetimeSpend <
        Number(
          coupon.min_lifetime_spend
        )
    ) {
      return false;
    }


    if (
      Number(coupon.max_lifetime_spend ?? 0) > 0 &&
      customerContext.lifetimeSpend >
        Number(
          coupon.max_lifetime_spend
        )
    ) {
      return false;
    }


    /*
     * -------------------------------------------------------
     * MEMBERSHIP RESTRICTIONS
     * -------------------------------------------------------
     */

    const membershipRows =
      membershipRuleRows.filter(
        (row: any) =>
          row.coupon_id ===
          coupon.id
      );


    if (
      membershipRows.length > 0 &&
      !membershipRows.some(
        (row: any) =>
          row.tier_id ===
          customerContext.membershipTierId
      )
    ) {
      return false;
    }


    return true;

  };


  /*
   * =========================================================
   * FIND NEAREST ELIGIBLE LOCKED COUPON
   * =========================================================
   */

  const now =
    new Date();


  /*
   * Special Price-only carts should not surface an unlock
   * coupon offer.
   */
  if (
    specialPriceOnly
  ) {
    return {
      unlockCoupon: null,
      remainingAmount: 0,
      isLoading,
    };
  }


  const lockedCoupons =
    coupons
      .filter(
        (coupon: any) => {

          /*
           * -------------------------------------------------
           * ACTIVE
           * -------------------------------------------------
           */

          if (
            !coupon.is_active
          ) {
            return false;
          }


          /*
           * -------------------------------------------------
           * START DATE
           * -------------------------------------------------
           */

          if (
            coupon.starts_at &&
            now <
              new Date(
                coupon.starts_at
              )
          ) {
            return false;
          }


          /*
           * -------------------------------------------------
           * EXPIRY DATE
           * -------------------------------------------------
           */

          if (
            coupon.expires_at &&
            now >
              new Date(
                coupon.expires_at
              )
          ) {
            return false;
          }


          /*
           * -------------------------------------------------
           * GLOBAL USAGE LIMIT
           * -------------------------------------------------
           */

          if (
            coupon.usage_limit &&
            coupon.used_count >=
              coupon.usage_limit
          ) {
            return false;
          }


          /*
           * -------------------------------------------------
           * CUSTOMER ELIGIBILITY
           * -------------------------------------------------
           *
           * Includes the one-use-per-customer check above.
           * -------------------------------------------------
           */

          if (
            !isCustomerEligible(
              coupon
            )
          ) {
            return false;
          }


          /*
           * -------------------------------------------------
           * MINIMUM ORDER
           * -------------------------------------------------
           *
           * Only show the offer when the customer's current
           * cart is below the required amount.
           * -------------------------------------------------
           */

          return (
            Number(
              coupon.minimum_order_amount
            ) >
            cartTotal
          );

        }
      )
      .sort(
        (
          a: any,
          b: any
        ) =>
          Number(
            a.minimum_order_amount
          ) -
          Number(
            b.minimum_order_amount
          )
      );


  /*
   * =========================================================
   * NEAREST COUPON
   * =========================================================
   */

  const nearestCoupon =
    lockedCoupons[0];


  /*
   * =========================================================
   * NO ELIGIBLE UNLOCK OFFER
   * =========================================================
   */

  if (
    !nearestCoupon
  ) {

    return {

      unlockCoupon:
        null,

      remainingAmount:
        0,

      isLoading,

    };

  }


  /*
   * =========================================================
   * RETURN
   * =========================================================
   */

  return {

    unlockCoupon:
      nearestCoupon,

    remainingAmount:
      Math.max(
        Number(
          nearestCoupon.minimum_order_amount
        ) -
        cartTotal,
        0
      ),

    isLoading,

  };

}