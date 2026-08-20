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
  cartTotal: number
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
   * CUSTOMER ELIGIBILITY CONTEXT
   * =========================================================
   *
   * Unlock offers must respect the same customer restrictions
   * used by the coupon system.
   *
   * This prevents customer-only coupons such as SPECIAL20
   * from appearing to new customers.
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
          .neq(
            "order_status",
            "cancelled"
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


  const isLoading =
    couponsLoading ||
    customerLoading ||
    customerRulesLoading ||
    membershipRulesLoading;


  /*
   * =========================================================
   * CUSTOMER ELIGIBILITY
   * =========================================================
   */

  const isCustomerEligible = (
    coupon: any
  ) => {

    /*
     * No customer:
     *
     * Do not show customer-restricted unlock offers.
     */

    if (!customer?.id) {

      return (
        coupon.customer_scope === "all" &&
        !coupon.first_order_only &&
        !coupon.new_customer_only &&
        !coupon.existing_customer_only &&
        coupon.min_previous_orders == null &&
        coupon.max_previous_orders == null &&
        coupon.min_lifetime_spend == null &&
        coupon.max_lifetime_spend == null
      );

    }


    if (!customerContext) {
      return false;
    }


    /*
     * Customer scope
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


    if (
      coupon.customer_scope ===
      "new" &&
      !customerContext.isNewCustomer
    ) {
      return false;
    }


    if (
      coupon.customer_scope ===
      "existing" &&
      customerContext.isNewCustomer
    ) {
      return false;
    }


    /*
     * Explicit customer flags
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
     * Previous order limits
     */

    if (
      coupon.min_previous_orders != null &&
      customerContext.previousOrders <
        Number(
          coupon.min_previous_orders
        )
    ) {
      return false;
    }


    if (
      coupon.max_previous_orders != null &&
      customerContext.previousOrders >
        Number(
          coupon.max_previous_orders
        )
    ) {
      return false;
    }


    /*
     * Lifetime spend limits
     */

    if (
      coupon.min_lifetime_spend != null &&
      customerContext.lifetimeSpend <
        Number(
          coupon.min_lifetime_spend
        )
    ) {
      return false;
    }


    if (
      coupon.max_lifetime_spend != null &&
      customerContext.lifetimeSpend >
        Number(
          coupon.max_lifetime_spend
        )
    ) {
      return false;
    }


    /*
     * Membership restrictions
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


  const lockedCoupons =
    coupons
      .filter(
        (coupon: any) => {

          if (
            !coupon.is_active
          ) {
            return false;
          }


          if (
            coupon.starts_at &&
            now <
              new Date(
                coupon.starts_at
              )
          ) {
            return false;
          }


          if (
            coupon.expires_at &&
            now >
              new Date(
                coupon.expires_at
              )
          ) {
            return false;
          }


          if (
            coupon.usage_limit &&
            coupon.used_count >=
              coupon.usage_limit
          ) {
            return false;
          }


          if (
            !isCustomerEligible(
              coupon
            )
          ) {
            return false;
          }


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


  const nearestCoupon =
    lockedCoupons[0];


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
