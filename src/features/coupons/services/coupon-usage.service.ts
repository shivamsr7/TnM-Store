import {
  supabase
} from "@/shared/lib/supabase";


/*
 * =========================================================
 * RECORD COUPON USAGE
 * =========================================================
 *
 * Call this ONLY after the order has been successfully
 * created/paid.
 *
 * =========================================================
 */

export async function recordCouponUsage(

  couponId: string,

  customerId: string,

  orderId?: string

) {


  /*
   * Prevent duplicate usage records.
   */

  const {

    data: existingUsage,

    error: existingError

  } = await supabase

    .from(

      "coupon_usage"

    )

    .select(

      "id"

    )

    .eq(

      "coupon_id",

      couponId

    )

    .eq(

      "customer_id",

      customerId

    )

    .maybeSingle();


  if (

    existingError

  ) {

    throw existingError;

  }


  /*
   * Already recorded.
   */

  if (

    existingUsage

  ) {

    return true;

  }


  /*
   * Create usage record.
   */

  const {

    error: usageError

  } = await supabase

    .from(

      "coupon_usage"

    )

    .insert({

      coupon_id:
        couponId,

      customer_id:
        customerId,

      order_id:
        orderId ?? null,

    });


  if (

    usageError

  ) {

    throw usageError;

  }


  /*
   * =========================================================
   * INCREMENT GLOBAL USAGE
   * =========================================================
   */

  const {

    data: coupon,

    error: couponError

  } = await supabase

    .from(

      "coupons"

    )

    .select(

      "used_count"

    )

    .eq(

      "id",

      couponId

    )

    .single();


  if (

    couponError

  ) {

    throw couponError;

  }


  const updatedCount =

    (

      coupon.used_count ??

      0

    ) +

    1;


  const {

    error: updateError

  } = await supabase

    .from(

      "coupons"

    )

    .update({

      used_count:
        updatedCount,

    })

    .eq(

      "id",

      couponId

    );


  if (

    updateError

  ) {

    throw updateError;

  }


  return true;

}