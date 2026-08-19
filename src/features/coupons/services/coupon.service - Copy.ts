import {
  supabase
} from "@/shared/lib/supabase";


export async function validateCoupon(

  code: string,

  cartTotal: number,

  customerId: string

) {


  /*
   * =========================================================
   * GET COUPON
   * =========================================================
   */

  const {

    data,

    error

  } = await supabase

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

    error ||

    !data

  ) {

    throw new Error(

      "Invalid coupon code"

    );

  }


  const coupon =
    data;


  /*
   * =========================================================
   * START DATE
   * =========================================================
   */

  const now =
    new Date();


  if (

    coupon.starts_at &&

    now <

      new Date(

        coupon.starts_at

      )

  ) {

    throw new Error(

      "This coupon is not active yet"

    );

  }


  /*
   * =========================================================
   * EXPIRY
   * =========================================================
   */

  if (

    coupon.expires_at &&

    now >

      new Date(

        coupon.expires_at

      )

  ) {

    throw new Error(

      "This coupon has expired"

    );

  }


  /*
   * =========================================================
   * GLOBAL USAGE LIMIT
   * =========================================================
   */

  if (

    coupon.usage_limit &&

    coupon.used_count >=

      coupon.usage_limit

  ) {

    throw new Error(

      "This coupon limit has been reached"

    );

  }


  /*
   * =========================================================
   * ONE USE PER CUSTOMER
   * =========================================================
   */

  if (

    coupon.one_use_per_customer

  ) {


    const {

      data: previousUsage,

      error: usageError

    } = await supabase

      .from(

        "coupon_usage"

      )

      .select(

        "id"

      )

      .eq(

        "coupon_id",

        coupon.id

      )

      .eq(

        "customer_id",

        customerId

      )

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

        "You have already used this coupon"

      );

    }

  }


  /*
   * =========================================================
   * MINIMUM ORDER
   * =========================================================
   */

  if (

    cartTotal <

    coupon.minimum_order_amount

  ) {

    throw new Error(

      `Minimum order value ₹${coupon.minimum_order_amount} required`

    );

  }


  /*
   * =========================================================
   * DISCOUNT
   * =========================================================
   */

  let discount =
    0;


  let freeShipping =
    false;


  let freeGift =
    false;


  switch (

    coupon.discount_type

  ) {


    case "percentage":


      discount =

        (

          cartTotal *

          coupon.discount_value

        ) /

        100;


      if (

        coupon.maximum_discount

      ) {

        discount =

          Math.min(

            discount,

            coupon.maximum_discount

          );

      }


      break;


    case "fixed":


      discount =

        coupon.discount_value;


      break;


    case "free_shipping":


      freeShipping =
        true;


      discount =
        0;


      break;


    case "free_gift":


      freeGift =
        true;


      discount =
        0;


      break;


    default:


      throw new Error(

        "Invalid coupon type"

      );

  }


  return {

    coupon,

    discount,

    freeShipping,

    freeGift,

  };

}