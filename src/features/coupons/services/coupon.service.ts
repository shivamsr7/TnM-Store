import {
  supabase,
} from "@/shared/lib/supabase";


/*
 * =========================================================
 * ADVANCED COUPON VALIDATION
 * =========================================================
 *
 * The public API intentionally remains compatible with the
 * existing CartDrawer:
 *
 * validateCoupon(
 *   code,
 *   cartTotal,
 *   customerId,
 *   cartItems
 * )
 *
 * The fourth argument is optional so existing callers do not
 * break while the storefront is migrated.
 * =========================================================
 */

type CartInputItem = {
  productId?: string;
  product_id?: string;
  quantity: number;
  price?: number;
  unit_price?: number;
};

type TargetRow = {
  target_type: string;
  target_id: string;
  target_mode: "include" | "exclude";
};

type CustomerContext = {
  id: string;
  email?: string | null;
  phone?: string | null;
  previous_orders: number;
  lifetime_spend: number;
  is_new_customer: boolean;
  is_first_order: boolean;
  membership_tier_id: string | null;
};


const roundMoney = (
  value: number
) =>
  Math.max(
    0,
    Math.round(
      (value + Number.EPSILON) * 100
    ) / 100
  );


const getProductId = (
  item: CartInputItem
) =>
  item.productId ??
  item.product_id ??
  "";


const getUnitPrice = (
  item: CartInputItem
) =>
  Number(
    item.unit_price ??
    item.price ??
    0
  );


const getQuantity = (
  items: Array<{
    quantity: number;
  }>
) =>
  items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );


/*
 * =========================================================
 * PRODUCT TARGET MATCHING
 * =========================================================
 */

const itemMatchesTarget = (
  item: any,
  target: TargetRow
) => {

  switch (
    target.target_type
  ) {

    case "product":
      return (
        item.product_id ===
        target.target_id
      );

    case "category":
      return (
        item.category_ids ?? []
      ).includes(
        target.target_id
      );

    case "collection":
      return (
        item.collection_ids ?? []
      ).includes(
        target.target_id
      );

    case "brand":
      return (
        item.brand_id ===
        target.target_id
      );

    case "tag":
      return (
        item.tag_ids ?? []
      ).includes(
        target.target_id
      );

    default:
      return false;

  }

};


/*
 * =========================================================
 * ELIGIBLE CART ITEMS
 * =========================================================
 */

const calculateEligibleItems = (
  coupon: any,
  items: any[],
  targets: TargetRow[]
) => {

  if (
    coupon.apply_scope ===
      "all"
  ) {
    return items.filter(
      item => !item.is_special_price
    );
  }


  const targetType =
    coupon.apply_scope ===
      "products"
      ? "product"
      : coupon.apply_scope ===
        "categories"
      ? "category"
      : coupon.apply_scope ===
        "collections"
      ? "collection"
      : coupon.apply_scope ===
        "brands"
      ? "brand"
      : "tag";


  const relevantTargets =
    targets.filter(
      target =>
        target.target_type ===
        targetType
    );


  /*
   * A targeted coupon with no target rows is invalid.
   * This protects against an accidentally incomplete coupon.
   */

  if (
    relevantTargets.length ===
    0
  ) {
    return [];
  }


  const includes =
    relevantTargets.filter(
      target =>
        target.target_mode ===
        "include"
    );


  const excludes =
    relevantTargets.filter(
      target =>
        target.target_mode ===
        "exclude"
    );


  return items.filter(
    item => {

      if (item.is_special_price) {
        return false;
      }

      const excluded =
        excludes.some(
          target =>
            itemMatchesTarget(
              item,
              target
            )
        );


      if (excluded) {
        return false;
      }


      /*
       * If only exclusions exist, every non-excluded
       * item is eligible.
       */

      if (
        includes.length ===
        0
      ) {
        return true;
      }


      return includes.some(
        target =>
          itemMatchesTarget(
            item,
            target
          )
      );

    }
  );

};


/*
 * =========================================================
 * STANDARD DISCOUNT
 * =========================================================
 */

const calculateStandardDiscount = (
  coupon: any,
  eligibleSubtotal: number
) => {

  switch (
    coupon.discount_type
  ) {

    case "percentage":

      return roundMoney(
        Math.min(
          eligibleSubtotal *
            (
              Number(
                coupon.discount_value
              ) / 100
            ),
          coupon.maximum_discount ??
            Number.POSITIVE_INFINITY
        )
      );


    case "fixed":

      return roundMoney(
        Math.min(
          Number(
            coupon.discount_value
          ),
          eligibleSubtotal
        )
      );


    case "free_shipping":
    case "free_gift":

      return 0;


    default:

      throw new Error(
        "Invalid coupon type"
      );

  }

};


/*
 * =========================================================
 * BUY X GET Y
 * =========================================================
 *
 * Discount is applied to the cheapest eligible "get"
 * quantity. This prevents a customer from choosing the
 * expensive item as the free/discounted item.
 * =========================================================
 */

const calculateBuyXGetYDiscount = (
  coupon: any,
  eligibleItems: any[]
) => {

  const buyQuantity =
    Number(
      coupon.buy_quantity
    );

  const getQuantity =
    Number(
      coupon.get_quantity
    );


  if (
    !buyQuantity ||
    buyQuantity < 1 ||
    !getQuantity ||
    getQuantity < 1
  ) {

    throw new Error(
      "This Buy X Get Y coupon is not configured correctly."
    );

  }


  const totalEligibleQuantity =
    getQuantityValue(
      eligibleItems
    );


  const offerBlock =
    buyQuantity +
    getQuantity;


  const completedBlocks =
    Math.floor(
      totalEligibleQuantity /
      offerBlock
    );


  if (
    completedBlocks <= 0
  ) {
    return 0;
  }


  const discountedUnits =
    Math.min(
      completedBlocks *
        getQuantity,
      totalEligibleQuantity
    );


  /*
   * Expand quantities into individual unit prices.
   * Jewellery cart quantities are normally small and this
   * gives us the correct "cheapest get items" behavior.
   */

  const unitPrices: number[] = [];


  for (
    const item of eligibleItems
  ) {

    for (
      let i = 0;
      i < Number(item.quantity);
      i++
    ) {

      unitPrices.push(
        Number(
          item.unit_price
        )
      );

    }

  }


  unitPrices.sort(
    (a, b) =>
      a - b
  );


  const getPrices =
    unitPrices.slice(
      0,
      discountedUnits
    );


  switch (
    coupon.get_discount_type
  ) {

    case "free":

      return roundMoney(
        getPrices.reduce(
          (sum, price) =>
            sum + price,
          0
        )
      );


    case "percentage": {

      const percentage =
        Number(
          coupon.get_discount_value ??
          0
        );

      return roundMoney(
        getPrices.reduce(
          (sum, price) =>
            sum +
            price *
              (
                percentage / 100
              ),
          0
        )
      );

    }


    case "fixed": {

      const fixed =
        Number(
          coupon.get_discount_value ??
          0
        );

      return roundMoney(
        getPrices.reduce(
          (sum, price) =>
            sum +
            Math.min(
              fixed,
              price
            ),
          0
        )
      );

    }


    default:

      throw new Error(
        "Select a valid Get discount type for this Buy X Get Y coupon."
      );

  }

};


const getQuantityValue = (
  items: any[]
) =>
  items.reduce(
    (
      sum,
      item
    ) =>
      sum +
      Number(
        item.quantity || 0
      ),
    0
  );


/*
 * =========================================================
 * CUSTOMER ELIGIBILITY
 * =========================================================
 */

const isCustomerEligible = (
  coupon: any,
  customer: CustomerContext | null,
  selectedCustomerIds: string[],
  membershipTierIds: string[]
) => {

  if (
    !customer
  ) {
    return false;
  }


  if (
    coupon.customer_scope ===
    "selected"
  ) {

    if (
      !selectedCustomerIds.includes(
        customer.id
      )
    ) {
      return false;
    }

  }


  if (
    coupon.customer_scope ===
      "new" &&
    !customer.is_new_customer
  ) {
    return false;
  }


  if (
    coupon.customer_scope ===
      "existing" &&
    customer.is_new_customer
  ) {
    return false;
  }


  if (
    coupon.first_order_only &&
    !customer.is_first_order
  ) {
    return false;
  }


  if (
    coupon.new_customer_only &&
    !customer.is_new_customer
  ) {
    return false;
  }


  if (
    coupon.existing_customer_only &&
    customer.is_new_customer
  ) {
    return false;
  }


  /*
   * 0 means "no restriction".
   *
   * Only positive values are treated as configured
   * minimum/maximum limits.
   */

  if (
    Number(
      coupon.min_previous_orders ??
      0
    ) > 0 &&
    customer.previous_orders <
      Number(
        coupon.min_previous_orders
      )
  ) {
    return false;
  }


  if (
    Number(
      coupon.max_previous_orders ??
      0
    ) > 0 &&
    customer.previous_orders >
      Number(
        coupon.max_previous_orders
      )
  ) {
    return false;
  }


  if (
    Number(
      coupon.min_lifetime_spend ??
      0
    ) > 0 &&
    customer.lifetime_spend <
      Number(
        coupon.min_lifetime_spend
      )
  ) {
    return false;
  }


  if (
    Number(
      coupon.max_lifetime_spend ??
      0
    ) > 0 &&
    customer.lifetime_spend >
      Number(
        coupon.max_lifetime_spend
      )
  ) {
    return false;
  }


  /*
   * Membership restrictions are additive.
   *
   * If Admin selected Gold + Platinum, a customer in
   * either tier is eligible.
   */

  if (
    membershipTierIds.length >
    0
  ) {

    if (
      !customer.membership_tier_id ||
      !membershipTierIds.includes(
        customer.membership_tier_id
      )
    ) {
      return false;
    }

  }


  return true;

};


/*
 * =========================================================
 * MAIN VALIDATION
 * =========================================================
 */

export async function validateCoupon(
  code: string,
  cartTotal: number,
  customerId: string,
  cartItems: CartInputItem[] = []
) {

  /*
   * -------------------------------------------------------
   * GET COUPON
   * -------------------------------------------------------
   */

  const {
    data: coupon,
    error: couponError,
  } =
    await supabase
      .from("coupons")
      .select("*")
      .eq(
        "code",
        code.trim().toUpperCase()
      )
      .eq(
        "is_active",
        true
      )
      .single();


  if (
    couponError ||
    !coupon
  ) {

    throw new Error(
      "This coupon code is invalid. Please check the code and try again."
    );

  }


  const now =
    new Date();


  /*
   * -------------------------------------------------------
   * DATE VALIDATION
   * -------------------------------------------------------
   */

  if (
    coupon.starts_at &&
    now <
      new Date(
        coupon.starts_at
      )
  ) {

    throw new Error(
      "This coupon is not active yet. Please try again later."
    );

  }


  if (
    coupon.expires_at &&
    now >
      new Date(
        coupon.expires_at
      )
  ) {

    throw new Error(
      "This coupon has expired and can no longer be used."
    );

  }


  /*
   * -------------------------------------------------------
   * GLOBAL USAGE LIMIT
   * -------------------------------------------------------
   */

  if (
    coupon.usage_limit !==
      null &&
    Number(
      coupon.usage_limit
    ) > 0 &&
    Number(
      coupon.used_count ?? 0
    ) >=
      Number(
        coupon.usage_limit
      )
  ) {

    throw new Error(
      "This coupon has reached its usage limit and can no longer be used."
    );

  }


  /*
   * -------------------------------------------------------
   * ONE USE PER CUSTOMER
   * -------------------------------------------------------
   */

  if (
    coupon.one_use_per_customer
  ) {

    if (
      !customerId
    ) {

      throw new Error(
        "Please log in to use this coupon."
      );

    }


    const {
      data: previousUsage,
      error: usageError,
    } =
      await supabase
        .from(
          "coupon_usage"
        )
        .select("id")
        .eq(
          "coupon_id",
          coupon.id
        )
        .eq(
          "customer_id",
          customerId
        )
        .limit(1)
        .maybeSingle();


    if (
      usageError
    ) {
      throw usageError;
    }


    if (
      previousUsage
    ) {

      throw new Error(
        "You have already used this coupon."
      );

    }

  }


  /*
   * -------------------------------------------------------
   * LOAD TARGETS / CUSTOMER / MEMBERSHIP
   * -------------------------------------------------------
   */

  const [
    targetResult,
    selectedCustomerResult,
    membershipResult,
  ] =
    await Promise.all([

      supabase
        .from(
          "coupon_targets"
        )
        .select("*")
        .eq(
          "coupon_id",
          coupon.id
        ),

      supabase
        .from(
          "coupon_customers"
        )
        .select(
          "customer_id"
        )
        .eq(
          "coupon_id",
          coupon.id
        ),

      supabase
        .from(
          "coupon_membership_tiers"
        )
        .select(
          "tier_id"
        )
        .eq(
          "coupon_id",
          coupon.id
        ),

    ]);


  if (
    targetResult.error
  ) {
    throw targetResult.error;
  }


  if (
    selectedCustomerResult.error
  ) {
    throw selectedCustomerResult.error;
  }


  if (
    membershipResult.error
  ) {
    throw membershipResult.error;
  }


  /*
   * -------------------------------------------------------
   * CUSTOMER CONTEXT
   * -------------------------------------------------------
   *
   * lifetime_spend + tier come from customer_rewards,
   * which is already the source used by the membership UI.
   *
   * Previous orders are calculated from orders and cancelled
   * orders are not counted.
   * -------------------------------------------------------
   */

  let customerContext:
    CustomerContext | null =
    null;


  if (
    customerId
  ) {

    const [
      customerResult,
      rewardResult,
      orderResult,
    ] =
      await Promise.all([

        supabase
          .from(
            "customers"
          )
          .select(
            "id, email, phone"
          )
          .eq(
            "id",
            customerId
          )
          .single(),

        supabase
          .from(
            "customer_rewards"
          )
          .select(
            "lifetime_spend, tier_id"
          )
          .eq(
            "customer_id",
            customerId
          )
          .maybeSingle(),

        supabase
          .from(
            "orders"
          )
          .select(
            "id, order_status"
          )
          .eq(
            "customer_id",
            customerId
          ),

      ]);


    if (
      customerResult.error &&
      customerResult.error.code !==
        "PGRST116"
    ) {
      throw customerResult.error;
    }


    if (
      rewardResult.error
    ) {
      throw rewardResult.error;
    }


    if (
      orderResult.error
    ) {
      throw orderResult.error;
    }


    const validOrders =
      (
        orderResult.data ??
        []
      ).filter(
        (
          order: any
        ) =>
          order.order_status !==
          "cancelled"
      );


    const previousOrders =
      validOrders.length;


    customerContext = {

      id:
        customerId,

      email:
        customerResult.data
          ?.email ??
        null,

      phone:
        customerResult.data
          ?.phone ??
        null,

      previous_orders:
        previousOrders,

      lifetime_spend:
        Number(
          rewardResult.data
            ?.lifetime_spend ??
          0
        ),

      is_new_customer:
        previousOrders ===
        0,

      is_first_order:
        previousOrders ===
        0,

      membership_tier_id:
        rewardResult.data
          ?.tier_id ??
        null,

    };

  }


  /*
   * Customer targeting.
   */

  const selectedCustomerIds =
    (
      selectedCustomerResult.data ??
      []
    ).map(
      (
        row: any
      ) =>
        row.customer_id
    );


  const membershipTierIds =
    (
      membershipResult.data ??
      []
    ).map(
      (
        row: any
      ) =>
        row.tier_id
    );


  if (
    !isCustomerEligible(
      coupon,
      customerContext,
      selectedCustomerIds,
      membershipTierIds
    )
  ) {

    throw new Error(
      "This coupon is not available for your account."
    );

  }


  /*
   * -------------------------------------------------------
   * CART PRODUCT DATA
   * -------------------------------------------------------
   */

  const productIds =
    cartItems
      .map(
        getProductId
      )
      .filter(Boolean);


  let productMetadata:
    Record<
      string,
      any
    > = {};


  if (
    productIds.length >
    0
  ) {

    const {
      data: products,
      error:
        productError,
    } =
      await supabase
        .from(
          "products"
        )
        .select(`
          id,
          price,
          category_id,
          brand_id,
          product_collections(
            collection_id
          ),
          product_tags(
            tag_id
          )
        `)
        .in(
          "id",
          [
            ...new Set(
              productIds
            ),
          ]
        );


    if (
      productError
    ) {
      throw productError;
    }


    for (
      const product of
        products ??
        []
    ) {

      productMetadata[
        product.id
      ] = {

        regular_price: Number(product.price ?? 0),

        category_ids:
          product.category_id
            ? [
                product.category_id,
              ]
            : [],

        collection_ids:
          (
            product.product_collections ??
            []
          ).map(
            (
              row: any
            ) =>
              row.collection_id
          ),

        brand_id:
          product.brand_id ??
          null,

        tag_ids:
          (
            product.product_tags ??
            []
          ).map(
            (
              row: any
            ) =>
              row.tag_id
          ),

      };

    }

  }


  /*
   * Convert CartDrawer's lightweight CartItem into the
   * advanced coupon engine format.
   */

  const validationItems =
    cartItems.map(
      item => {

        const productId =
          getProductId(
            item
          );

        const metadata =
          productMetadata[
            productId
          ] ?? {

            category_ids:
              [],

            collection_ids:
              [],

            brand_id:
              null,

            tag_ids:
              [],

          };


        const unitPrice =
          getUnitPrice(item);

        const regularPrice =
          Number(metadata.regular_price ?? 0);

        return {

          product_id:
            productId,

          quantity:
            Number(
              item.quantity
            ),

          unit_price:
            unitPrice,

          is_special_price:
            regularPrice > 0 &&
            unitPrice < regularPrice,

          ...metadata,

        };

      }
    );


  /*
   * -------------------------------------------------------
   * FULL CART VALIDATION
   * -------------------------------------------------------
   */

  const actualCartTotal =
    roundMoney(
      validationItems.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.unit_price *
            item.quantity,
        0
      )
    );


  /*
   * Never trust the amount supplied by the UI.
   * We use the database/product-derived cart amount.
   *
   * If cartItems were not supplied by an older caller,
   * retain the old cartTotal behavior for compatibility.
   */

  const orderSubtotal =
    validationItems.length >
    0
      ? actualCartTotal
      : Number(
          cartTotal
        );


  if (
    orderSubtotal <
      Number(
        coupon.minimum_order_amount ??
        0
      )
  ) {

    throw new Error(
      `Add ₹${Math.max(0, Number(coupon.minimum_order_amount) - orderSubtotal).toLocaleString("en-IN")} more to meet the minimum order value for this coupon.`
    );

  }


  /*
   * -------------------------------------------------------
   * CART QUANTITY
   * -------------------------------------------------------
   */

  const cartQuantity =
    getQuantity(
      validationItems
    );


  if (
    coupon.min_cart_quantity !==
      null &&
    cartQuantity <
      Number(
        coupon.min_cart_quantity
      )
  ) {

    throw new Error(
      `Add at least ${coupon.min_cart_quantity} items to use this coupon.`
    );

  }


  if (
    coupon.max_cart_quantity !==
      null &&
    Number(
      coupon.max_cart_quantity
    ) > 0 &&
    cartQuantity >
      Number(
        coupon.max_cart_quantity
      )
  ) {

    throw new Error(
      `This coupon is only valid for up to ${coupon.max_cart_quantity} items.`
    );

  }


  /*
   * -------------------------------------------------------
   * TARGETING
   * -------------------------------------------------------
   */

  const eligibleItems =
    calculateEligibleItems(
      coupon,
      validationItems,
      (
        targetResult.data ??
        []
      ) as TargetRow[]
    );


  if (
    coupon.apply_scope !==
      "all" &&
    eligibleItems.length ===
      0
  ) {

    throw new Error(
      "This coupon does not apply to the products in your cart."
    );

  }


  if (
    validationItems.length > 0 &&
    eligibleItems.length === 0
  ) {
    throw new Error(
      "This coupon does not apply to the products in your cart."
    );
  }


  const eligibleQuantity =
    getQuantity(
      eligibleItems
    );


  const eligibleSubtotal =
    roundMoney(
      eligibleItems.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.unit_price *
            item.quantity,
        0
      )
    );


  /*
   * -------------------------------------------------------
   * ELIGIBLE ITEM CONDITIONS
   * -------------------------------------------------------
   */

  if (
    coupon.min_eligible_quantity !==
      null &&
    eligibleQuantity <
      Number(
        coupon.min_eligible_quantity
      )
  ) {

    throw new Error(
      `You need at least ${coupon.min_eligible_quantity} eligible items to use this coupon.`
    );

  }


  if (
    coupon.max_eligible_quantity !==
      null &&
    Number(
      coupon.max_eligible_quantity
    ) > 0 &&
    eligibleQuantity >
      Number(
        coupon.max_eligible_quantity
      )
  ) {

    throw new Error(
      `This coupon is only valid for up to ${coupon.max_eligible_quantity} eligible items.`
    );

  }


  if (
    coupon.min_eligible_subtotal !==
      null &&
    eligibleSubtotal <
      Number(
        coupon.min_eligible_subtotal
      )
  ) {

    throw new Error(
      `Eligible products must total at least ₹${coupon.min_eligible_subtotal}.`
    );

  }


  if (
    coupon.max_eligible_subtotal !==
      null &&
    Number(
      coupon.max_eligible_subtotal
    ) > 0 &&
    eligibleSubtotal >
      Number(
        coupon.max_eligible_subtotal
      )
  ) {

    throw new Error(
      `Eligible products can total at most ₹${coupon.max_eligible_subtotal}.`
    );

  }


  /*
   * -------------------------------------------------------
   * DISCOUNT
   * -------------------------------------------------------
   */

  let discount =
    0;


  let freeShipping =
    false;


  let freeGift =
    false;


  if (
    coupon.offer_type ===
    "buy_x_get_y"
  ) {

    discount =
      calculateBuyXGetYDiscount(
        coupon,
        eligibleItems
      );

  } else {

    discount =
      calculateStandardDiscount(
        coupon,
        eligibleSubtotal
      );

  }


  if (
    coupon.discount_type ===
    "free_shipping"
  ) {
    freeShipping = true;
  }


  if (
    coupon.discount_type ===
    "free_gift"
  ) {
    freeGift = true;
  }


  return {

    coupon,

    discount:
      roundMoney(
        discount
      ),

    freeShipping,

    freeGift,

    eligibleSubtotal,

    eligibleQuantity,

    valid:
      true,

  };

}