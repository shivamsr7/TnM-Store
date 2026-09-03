import {
  createClient,
} from "https://esm.sh/@supabase/supabase-js@2";

import {
  serve,
} from "https://deno.land/std/http/server.ts";


const corsHeaders = {

  "Access-Control-Allow-Origin":
    "*",

  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",

  "Access-Control-Allow-Methods":
    "POST, OPTIONS",

};


function jsonResponse(
  body: unknown,
  status = 200
) {

  return new Response(

    JSON.stringify(body),

    {

      status,

      headers: {

        ...corsHeaders,

        "Content-Type":
          "application/json",

      },

    }

  );

}


serve(async (req) => {

  /*
   * =====================================================
   * CORS
   * =====================================================
   */

  if (
    req.method ===
    "OPTIONS"
  ) {

    return new Response(

      "ok",

      {

        headers:
          corsHeaders,

      }

    );

  }


  try {

    /*
     * ===================================================
     * METHOD
     * ===================================================
     */

    if (
      req.method !==
      "POST"
    ) {

      return jsonResponse(

        {

          success:
            false,

          error:
            "Method not allowed",

        },

        405

      );

    }


    /*
     * ===================================================
     * SUPABASE SERVER CLIENT
     * ===================================================
     */

    const supabaseUrl =
      Deno.env.get(
        "SUPABASE_URL"
      );

    const serviceRoleKey =
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY"
      );


    if (
      !supabaseUrl ||
      !serviceRoleKey
    ) {

      throw new Error(

        "Supabase server credentials are missing."

      );

    }


    const supabase =
      createClient(

        supabaseUrl,

        serviceRoleKey,

        {

          auth: {

            persistSession:
              false,

            autoRefreshToken:
              false,

            detectSessionInUrl:
              false,

          },

        }

      );


    /*
     * ===================================================
     * AUTHENTICATION
     * ===================================================
     */

    const authorizationHeader =
      req.headers.get(
        "Authorization"
      );


    if (
      !authorizationHeader ||
      !authorizationHeader.startsWith(
        "Bearer "
      )
    ) {

      return jsonResponse(

        {

          success:
            false,

          error:
            "Authentication required.",

        },

        401

      );

    }


    const accessToken =
      authorizationHeader
        .replace(
          /^Bearer\s+/i,
          ""
        )
        .trim();


    if (
      !accessToken
    ) {

      return jsonResponse(

        {

          success:
            false,

          error:
            "Authentication required.",

        },

        401

      );

    }


    const {
      data: userData,
      error: userError,
    } =
      await supabase.auth.getUser(
        accessToken
      );


    if (
      userError ||
      !userData?.user
    ) {

      console.error(

        "❌ Refund authentication failed:",

        userError

      );


      return jsonResponse(

        {

          success:
            false,

          error:
            "Invalid or expired authentication token.",

        },

        401

      );

    }


    const userId =
      userData.user.id;


    /*
     * ===================================================
     * ADMIN AUTHORIZATION
     * ===================================================
     *
     * Only active users in public.admin_users can
     * process refunds.
     */

    const {
      data: adminUser,
      error: adminError,
    } =
      await supabase

        .from("admin_users")

        .select(
          "user_id, role, is_active"
        )

        .eq(
          "user_id",
          userId
        )

        .eq(
          "is_active",
          true
        )

        .maybeSingle();


    if (
      adminError
    ) {

      console.error(

        "❌ Admin authorization lookup failed:",

        adminError

      );


      throw new Error(

        "Unable to verify administrator authorization."

      );

    }


    if (
      !adminUser
    ) {

      console.warn(

        "⚠️ Unauthorized refund attempt:",

        {

          userId,

        }

      );


      return jsonResponse(

        {

          success:
            false,

          error:
            "Administrator access required.",

        },

        403

      );

    }


    /*
     * ===================================================
     * REQUEST BODY
     * ===================================================
     */

    const body =
      await req.json();


    const paymentId =
      String(

        body.paymentId ??
        ""

      ).trim();


    const requestedAmount =
      Number(
        body.amount
      );


    const idempotencyKey =
      String(

        body.idempotencyKey ??
        ""

      ).trim();


    /*
     * ===================================================
     * BASIC VALIDATION
     * ===================================================
     */

    if (
      !paymentId
    ) {

      throw new Error(

        "Razorpay payment ID is required."

      );

    }


    if (
      !paymentId.startsWith(
        "pay_"
      )
    ) {

      throw new Error(

        "Invalid Razorpay payment ID."

      );

    }


    if (
      !Number.isFinite(
        requestedAmount
      ) ||
      requestedAmount <= 0
    ) {

      throw new Error(

        "Refund amount must be greater than zero."

      );

    }


    if (
      !idempotencyKey
    ) {

      throw new Error(

        "Refund idempotency key is required."

      );

    }


    /*
     * ===================================================
     * FIND AUTHORITATIVE ORDER
     * ===================================================
     *
     * Never trust the client to tell us which order
     * or refund amount should be processed.
     *
     * payment_transaction_id is the Razorpay payment ID
     * stored against the order.
     */

    const {
      data: order,
      error: orderError,
    } =
      await supabase

        .from("orders")

        .select(
          [
            "id",
            "order_number",
            "payment_method",
            "payment_transaction_id",
            "order_status",
            "refund_status",
            "refund_amount",
            "advance_amount",
            "advance_payment_status",
          ].join(", ")
        )

        .eq(
          "payment_transaction_id",
          paymentId
        )

        .maybeSingle();


    if (
      orderError
    ) {

      console.error(

        "❌ Failed to load refund order:",

        orderError

      );


      throw new Error(

        "Unable to verify the order for this refund."

      );

    }


    if (
      !order
    ) {

      return jsonResponse(

        {

          success:
            false,

          error:
            "No order was found for this Razorpay payment.",

        },

        404

      );

    }


    /*
     * ===================================================
     * ORDER VALIDATION
     * ===================================================
     */

    if (
      order.payment_method !==
      "prepaid"
    ) {

      return jsonResponse(

        {

          success:
            false,

          error:
            "Refunds are available only for prepaid orders.",

        },

        400

      );

    }


    if (
      order.order_status !==
      "cancelled"
    ) {

      return jsonResponse(

        {

          success:
            false,

          error:
            "Only cancelled orders can be refunded.",

        },

        400

      );

    }


    if (
      order.refund_status ===
      "processed"
    ) {

      return jsonResponse(

        {

          success:
            false,

          error:
            "This refund has already been processed.",

        },

        409

      );

    }


    if (
      order.refund_status !==
      "pending"
    ) {

      return jsonResponse(

        {

          success:
            false,

          error:
            "This order does not have a pending refund.",

        },

        400

      );

    }


    if (
      order.payment_transaction_id !==
      paymentId
    ) {

      return jsonResponse(

        {

          success:
            false,

          error:
            "Payment verification failed.",

        },

        400

      );

    }


    /*
     * ===================================================
     * SERVER-SIDE REFUND AMOUNT
     * ===================================================
     */

    const serverRefundAmount =
      Number(
        order.refund_amount ?? 0
      );


    if (
      !Number.isFinite(
        serverRefundAmount
      ) ||
      serverRefundAmount <= 0
    ) {

      return jsonResponse(

        {

          success:
            false,

          error:
            "The order does not contain a valid refundable amount.",

        },

        400

      );

    }


    /*
     * The amount supplied by the client must match
     * the authoritative amount stored on the order.
     */

    const requestedAmountPaise =
      Math.round(
        requestedAmount * 100
      );


    const serverRefundAmountPaise =
      Math.round(
        serverRefundAmount * 100
      );


    if (
      requestedAmountPaise !==
      serverRefundAmountPaise
    ) {

      console.warn(

        "⚠️ Refund amount mismatch:",

        {

          orderId:
            order.id,

          orderNumber:
            order.order_number,

          requestedAmount,

          serverRefundAmount,

          userId,

        }

      );


      return jsonResponse(

        {

          success:
            false,

          error:
            "Refund amount does not match the authorized order refund amount.",

        },

        400

      );

    }


    /*
     * ===================================================
     * RAZORPAY SECRETS
     * ===================================================
     */

    const keyId =
      Deno.env.get(
        "RAZORPAY_KEY_ID"
      );


    const keySecret =
      Deno.env.get(
        "RAZORPAY_KEY_SECRET"
      );


    if (
      !keyId ||
      !keySecret
    ) {

      throw new Error(

        "Razorpay credentials are missing."

      );

    }


    /*
     * ===================================================
     * RAZORPAY AMOUNT
     * ===================================================
     */

    const amountInPaise =
      serverRefundAmountPaise;


    /*
     * ===================================================
     * BASIC AUTH
     * ===================================================
     */

    const authorization =
      "Basic " +

      btoa(

        `${keyId}:${keySecret}`

      );


    console.log(

      "💳 Starting authorized Razorpay refund",

      {

        orderId:
          order.id,

        orderNumber:
          order.order_number,

        paymentId,

        amount:
          serverRefundAmount,

        amountInPaise,

        idempotencyKey,

        adminUserId:
          userId,

        adminRole:
          adminUser.role,

      }

    );


    /*
     * ===================================================
     * RAZORPAY REFUND API
     * ===================================================
     */

    const response =
      await fetch(

        `https://api.razorpay.com/v1/payments/${encodeURIComponent(
          paymentId
        )}/refund`,

        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json",

            "Authorization":
              authorization,

            "X-Refund-Idempotency":
              idempotencyKey,

          },

          body:

            JSON.stringify({

              amount:
                amountInPaise,

              speed:
                "normal",

            }),

        }

      );


    /*
     * ===================================================
     * RAZORPAY RESPONSE
     * ===================================================
     */

    const data =
      await response.json();


    /*
     * ===================================================
     * RAZORPAY ERROR
     * ===================================================
 */

    if (
      !response.ok
    ) {

      console.error(

        "❌ Razorpay refund failed",

        {

          status:
            response.status,

          orderId:
            order.id,

          paymentId,

          data,

        }

      );


      const message =

        data?.error?.description ||

        data?.error?.reason ||

        data?.error?.code ||

        "Razorpay refund request failed.";


      return jsonResponse(

        {

          success:
            false,

          error:
            message,

          razorpayError:
            data?.error ??
            null,

        },

        response.status

      );

    }


    /*
     * ===================================================
     * REFUND ID VALIDATION
     * ===================================================
 */

    if (
      !data?.id
    ) {

      throw new Error(

        "Razorpay returned a successful response without a refund ID."

      );

    }


    /*
     * ===================================================
     * SUCCESS
     * ===================================================
 */

    console.log(

      "✅ Razorpay refund created",

      {

        orderId:
          order.id,

        orderNumber:
          order.order_number,

        refundId:
          data.id,

        paymentId:
          data.payment_id,

        amount:
          data.amount,

        status:
          data.status,

      }

    );


    return jsonResponse(

      {

        success:
          true,

        refund:
          data,

      },

      200

    );


  } catch (
    error
  ) {

    /*
     * ===================================================
     * UNEXPECTED ERROR
     * ===================================================
 */

    console.error(

      "❌ Refund Edge Function error",

      error

    );


    return jsonResponse(

      {

        success:
          false,

        error:

          error instanceof Error

            ? error.message

            : "Unexpected refund error.",

      },

      500

    );

  }

});