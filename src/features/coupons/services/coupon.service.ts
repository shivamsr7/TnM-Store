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
  customer_type?: "guest" | "member" | null;
  previous_orders: number;
  lifetime_spend: number;
  is_new_customer: boolean;
  is_first_order: boolean;
  membership_tier_id: string | null;
};

type CouponValidationOptions = {
  /*
   * Preview-only mode used by the Guest coupon list.
   *
   * It does not alter normal coupon validation. It temporarily
   * evaluates the Guest as the default (lowest-spend) Member tier
   * so the UI can show only coupons that would actually become
   * usable after the Guest upgrades.
   */
  previewAsMember?: boolean;
};


/**
 * Structured coupon validation error.
 *
 * CheckoutDialog can use the code to distinguish a
 * member-only coupon from a normal invalid/ineligible coupon
 * and offer the guest a secure upgrade to Member.
 */
export class CouponValidationError extends Error {
  code: string;

  constructor(
    message: string,
    code: string
  ) {
    super(message);
    this.name = "CouponValidationError";
    this.code = code;
  }
}


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
 * SPECIAL PRICE STATUS
 * =========================================================
 *
 * A product-level Special Price is considered active only
 * while its configured end time has not passed.
 *
 * This is important for coupon validation because a Buy Now
 * item may still carry the old Special Price snapshot in the
 * browser/cart after the offer has expired.
 */

const isSpecialOfferActive = (
  metadata: any
) => {

  if (
    !Boolean(
      metadata?.special_discount_enabled
    )
  ) {
    return false;
  }


  if (
    Number(
      metadata?.special_discount_value ?? 0
    ) <= 0
  ) {
    return false;
  }


  if (
    Number(
      metadata?.regular_price ?? 0
    ) <= 0
  ) {
    return false;
  }


  /*
   * No end time means the Special Price remains active
   * according to the existing product configuration.
   */
  if (
    !metadata?.special_discount_ends_at
  ) {
    return true;
  }


  return (
    new Date(
      metadata.special_discount_ends_at
    ).getTime() >
    Date.now()
  );

};


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
  cartItems: CartInputItem[] = [],
  options: CouponValidationOptions = {}
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
      data: couponAlreadyUsed,
      error: usageError,
    } =
      await supabase.rpc(
        "check_coupon_customer_usage",
        {
          p_coupon_id:
            coupon.id,

          p_customer_id:
            customerId,
        }
      );


    if (
      usageError
    ) {
      throw usageError;
    }


    if (
      couponAlreadyUsed
    ) {

      throw new Error(
        "You have already used this coupon."
      );

    }

  }


  /*
   * -------------------------------------------------------
   * SECURE COUPON CONTEXT
   * -------------------------------------------------------
   *
   * Guest checkout runs without a persistent Supabase Auth
   * session. Therefore protected coupon/customer tables
   * must not be queried directly from the browser.
   *
   * The SECURITY DEFINER RPC performs the protected reads
   * server-side and returns only the data required by this
   * validation engine.
   */
  const {
    data: couponContext,
    error: couponContextError,
  } = await supabase.rpc(
    "get_coupon_validation_context",
    {
      p_coupon_id: coupon.id,
      p_customer_id: customerId || null,
    }
  );


  if (
    couponContextError
  ) {
    throw couponContextError;
  }


  if (
    !couponContext
  ) {
    throw new Error(
      "Unable to validate this coupon right now. Please try again."
    );
  }


  /*
   * One-use-per-customer is checked inside the same secure
   * RPC. This keeps coupon_usage protected by RLS.
   */
  if (
    coupon.one_use_per_customer &&
    couponContext.already_used
  ) {
    throw new Error(
      "You have already used this coupon."
    );
  }


  /*
   * Customer context is assembled from the server-side RPC.
   */
  let customerContext:
    CustomerContext | null =
    null;


  if (
    couponContext.customer
  ) {

    customerContext = {

      id:
        String(
          couponContext.customer.id ??
          customerId
        ),

      email:
        couponContext.customer.email ??
        null,

      phone:
        couponContext.customer.phone ??
        null,

      customer_type:
        couponContext.customer.customer_type ===
          "member"
          ? "member"
          : "guest",

      previous_orders:
        Number(
          couponContext.customer.previous_orders ??
          0
        ),

      lifetime_spend:
        Number(
          couponContext.customer.lifetime_spend ??
          0
        ),

      is_new_customer:
        Number(
          couponContext.customer.previous_orders ??
          0
        ) === 0,

      is_first_order:
        Number(
          couponContext.customer.previous_orders ??
          0
        ) === 0,

      membership_tier_id:
        couponContext.customer.membership_tier_id ??
        null,

    };

  }


  /*
   * Customer targeting.
   */
  const selectedCustomerIds =
    Array.isArray(
      couponContext.selected_customer_ids
    )
      ? couponContext.selected_customer_ids.map(
          (id: any) =>
            String(id)
        )
      : [];


  const membershipTierIds =
    Array.isArray(
      couponContext.membership_tier_ids
    )
      ? couponContext.membership_tier_ids.map(
          (id: any) =>
            String(id)
        )
      : [];


  const targetRows =
    Array.isArray(
      couponContext.targets
    )
      ? couponContext.targets
      : [];


  /*
   * -------------------------------------------------------
   * GUEST -> MEMBER PREVIEW
   * -------------------------------------------------------
   *
   * This is used only by the available-coupons list.
   *
   * Normal coupon application is completely unchanged.
   * When previewAsMember is true, evaluate the current Guest
   * against the default Member tier (the lowest minimum-spend
   * reward tier). All other customer/cart restrictions remain
   * exactly the same.
   */
  if (
    options.previewAsMember &&
    customerContext?.customer_type === "guest"
  ) {
    /*
     * Guests must not query reward_tiers directly because
     * checkout runs without a persistent Auth session.
     *
     * The secure RPC returns the default Member tier
     * (the active tier with the lowest minimum_spend).
     */
    const {
      data: defaultTierId,
      error: defaultTierError,
    } = await supabase.rpc(
      "get_default_member_tier_id"
    );

    if (defaultTierError) {
      throw defaultTierError;
    }

    if (defaultTierId) {
      customerContext = {
        ...customerContext,
        customer_type: "member",
        membership_tier_id:
          String(defaultTierId),
      };
    }
  }


  /*
   * Membership-tier targeting is the definitive signal that
   * a coupon is Member-only.
   *
   * Guests should get a specific error code so CheckoutDialog
   * can offer the existing secure upgrade_guest_to_member RPC.
   */
  if (
    membershipTierIds.length > 0 &&
    customerContext?.customer_type !== "member"
  ) {
    throw new CouponValidationError(
      "This coupon is available to T&M Members only.",
      "MEMBER_ONLY_COUPON"
    );
  }


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
          special_discount_enabled,
          special_discount_type,
          special_discount_value,
          special_discount_ends_at,
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

        /*
         * These fields identify the actual product-level
         * Special Discount. A lower cart price by itself is
         * NOT considered a Special Price because normal
         * product discounts are coupon-eligible.
         */
        special_discount_enabled:
          Boolean(
            product.special_discount_enabled
          ),

        special_discount_type:
          product.special_discount_type ??
          null,

        special_discount_value:
          Number(
            product.special_discount_value ??
            0
          ),

        special_discount_ends_at:
          product.special_discount_ends_at ??
          null,

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
          Number(
            metadata.regular_price ??
            0
          );

        const specialEnabled =
          Boolean(
            metadata.special_discount_enabled
          );

        const specialValue =
          Math.max(
            Number(
              metadata.special_discount_value ??
              0
            ),
            0
          );

        const specialOfferActive =
          isSpecialOfferActive(
            metadata
          );

        let memberSpecialPrice =
          regularPrice;

        if (
          specialOfferActive
        ) {
          if (
            metadata.special_discount_type ===
            "fixed"
          ) {
            memberSpecialPrice =
              Math.max(
                regularPrice -
                  Math.min(
                    specialValue,
                    regularPrice
                  ),
                0
              );
          } else {
            const percentage =
              Math.min(
                specialValue,
                100
              );

            memberSpecialPrice =
              Math.max(
                regularPrice -
                  (
                    regularPrice *
                    percentage
                  ) /
                    100,
                0
              );
          }
        }

        /*
         * IMPORTANT:
         *
         * A normal product discount such as:
         *
         *   MRP ₹899 -> Regular ₹699
         *
         * is NOT a special price.
         *
         * A product-level Special Discount is identified by
         * special_discount_enabled + a valid discount value
         * AND an active special-price period.
         *
         * For Guest Member-preview, simulate the price that
         * the Guest would receive after becoming a Member.
         * For a normal Member validation, use the actual cart
         * price while the Special Price is active.
         *
         * If the Special Price has expired, use the current
         * regular product price for coupon validation. This
         * prevents a stale Buy Now/cart Special Price snapshot
         * from keeping the item coupon-ineligible.
         */
        const isPreviewingMember =
          Boolean(
            options.previewAsMember &&
            customerContext?.customer_type ===
              "member"
          );

        const isSpecialPrice =
          specialOfferActive &&
          (
            isPreviewingMember
              ? memberSpecialPrice <
                regularPrice
              : unitPrice <
                regularPrice
          );

        const effectiveUnitPrice =
          !specialOfferActive &&
          specialEnabled &&
          specialValue > 0 &&
          regularPrice > 0 &&
          metadata.special_discount_ends_at &&
          new Date(
            metadata.special_discount_ends_at
          ).getTime() <= Date.now()
            ? regularPrice
            : unitPrice;

        return {

          product_id:
            productId,

          quantity:
            Number(
              item.quantity
            ),

          unit_price:
            effectiveUnitPrice,

          is_special_price:
            isSpecialPrice,

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
      targetRows as TargetRow[]
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