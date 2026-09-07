import {
  serve,
} from "https://deno.land/std/http/server.ts";

import {
  createClient,
} from "https://esm.sh/@supabase/supabase-js@2";


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
     * =====================================================
     * 1. AUTHENTICATE ADMIN
     * =====================================================
     */

    const authorization =
      req.headers.get(
        "Authorization"
      );


    if (
      !authorization?.startsWith(
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


    const supabaseUrl =
      Deno.env.get(
        "SUPABASE_URL"
      );


    const serviceRoleKey =
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY"
      );


    const keyId =
      Deno.env.get(
        "RAZORPAY_KEY_ID"
      );


    const keySecret =
      Deno.env.get(
        "RAZORPAY_KEY_SECRET"
      );


    if (
      !supabaseUrl ||
      !serviceRoleKey
    ) {

      throw new Error(
        "Supabase server credentials missing."
      );

    }


    if (
      !keyId ||
      !keySecret
    ) {

      throw new Error(
        "Razorpay credentials missing."
      );

    }


    const supabaseAdmin =
      createClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            persistSession:
              false,

            autoRefreshToken:
              false,
          },
        }
      );


    const accessToken =
      authorization.replace(
        "Bearer ",
        ""
      ).trim();


    const {
      data: {
        user
      },
      error: userError,
    } =
      await supabaseAdmin.auth.getUser(
        accessToken
      );


    if (
      userError ||
      !user
    ) {

      return jsonResponse(
        {
          success:
            false,

          error:
            "Invalid authentication token.",
        },
        401
      );

    }


    /*
     * =====================================================
     * 2. VERIFY ADMIN
     * =====================================================
     */

    const {
      data: adminUser,
      error: adminError,
    } =
      await supabaseAdmin

        .from(
          "admin_users"
        )

        .select(
          "user_id, role, is_active"
        )

        .eq(
          "user_id",
          user.id
        )

        .eq(
          "is_active",
          true
        )

        .maybeSingle();


    if (adminError) {

      console.error(
        "❌ Admin authorization lookup failed:",
        adminError
      );

      throw new Error(
        "Unable to verify administrator authorization."
      );

    }


    if (!adminUser) {

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
     * =====================================================
     * 3. REQUEST BODY
     * =====================================================
     */

    const body =
      await req.json();


    const paymentId =
      String(
        body?.paymentId ??
        ""
      ).trim();


    const requestedAmount =
      Number(
        body?.amount
      );


    const idempotencyKey =
      String(
        body?.idempotencyKey ??
        ""
      ).trim();


    if (!paymentId) {

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


    if (!idempotencyKey) {

      throw new Error(
        "Refund idempotency key is required."
      );

    }


    /*
     * =====================================================
     * 4. FIND ORDER
     * =====================================================
     */

    const {
      data: order,
      error: orderError,
    } =
      await supabaseAdmin

        .from(
          "orders"
        )

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
            "wallet_refund_amount",
            "razorpay_refund_amount",
            "razorpay_refund_transaction_id",
          ].join(", ")
        )

        .eq(
          "payment_transaction_id",
          paymentId
        )

        .maybeSingle();


    if (orderError) {

      throw orderError;

    }


    if (!order) {

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
     * =====================================================
     * 5. ORDER VALIDATION
     * =====================================================
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
     * =====================================================
     * 6. DETERMINE AUTHORITATIVE RAZORPAY REFUND AMOUNT
     * =====================================================
     *
     * refund_amount = combined refund
     * wallet_refund_amount = wallet portion
     *
     * Razorpay receives only the remainder.
     *
     * For an existing processed Razorpay refund, return the
     * existing ID instead of issuing another refund.
     * =====================================================
     */

    if (
      order.razorpay_refund_transaction_id
    ) {

      return jsonResponse(
        {
          success:
            true,

          refund:
            {
              id:
                order.razorpay_refund_transaction_id,

              amount:
                Math.round(
                  Number(
                    order.razorpay_refund_amount ??
                    0
                  ) * 100
                ),

              payment_id:
                paymentId,

              status:
                "processed",
            },

          alreadyProcessed:
            true,
        },
        200
      );

    }


    const totalRefundAmount =
      Number(
        order.refund_amount ??
        0
      );


    const walletRefundAmount =
      Number(
        order.wallet_refund_amount ??
        0
      );


    if (
      !Number.isFinite(
        totalRefundAmount
      ) ||
      totalRefundAmount <= 0
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


    if (
      !Number.isFinite(
        walletRefundAmount
      ) ||
      walletRefundAmount < 0
    ) {

      return jsonResponse(
        {
          success:
            false,

          error:
            "Invalid wallet refund amount.",
        },
        400
      );

    }


    const serverRazorpayRefundAmount =
      Math.max(
        0,
        totalRefundAmount -
        walletRefundAmount
      );


    if (
      serverRazorpayRefundAmount <= 0
    ) {

      return jsonResponse(
        {
          success:
            false,

          error:
            "No Razorpay refund is required for this order.",
        },
        400
      );

    }


    /*
     * Client amount must exactly match the server calculation.
     */

    const requestedAmountPaise =
      Math.round(
        requestedAmount *
        100
      );


    const serverAmountPaise =
      Math.round(
        serverRazorpayRefundAmount *
        100
      );


    if (
      requestedAmountPaise !==
      serverAmountPaise
    ) {

      console.warn(
        "⚠️ Razorpay refund amount mismatch:",
        {
          orderId:
            order.id,

          requestedAmount,

          serverRazorpayRefundAmount,

          userId:
            user.id,
        }
      );


      return jsonResponse(
        {
          success:
            false,

          error:
            "Refund amount does not match the authorized Razorpay refund amount.",
        },
        400
      );

    }


    /*
     * =====================================================
     * 7. RAZORPAY REFUND
     * =====================================================
     */

    const authorizationHeader =
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
          serverRazorpayRefundAmount,

        amountInPaise:
          serverAmountPaise,

        idempotencyKey,

        adminUserId:
          user.id,

        adminRole:
          adminUser.role,
      }
    );


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
              authorizationHeader,

            "X-Refund-Idempotency":
              idempotencyKey,

          },

          body:
            JSON.stringify({
              amount:
                serverAmountPaise,

              speed:
                "normal",
            }),

        }

      );


    const data =
      await response.json();


    /*
     * =====================================================
     * 8. RAZORPAY ERROR
     * =====================================================
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
     * =====================================================
     * 9. VALIDATE RESPONSE
     * =====================================================
     */

    if (
      !data?.id
    ) {

      throw new Error(
        "Razorpay returned a successful response without a refund ID."
      );

    }


    /*
     * =====================================================
     * 10. STORE RAZORPAY RESULT
     * =====================================================
     *
     * We store this immediately so a retry can never issue
     * another refund.
     * =====================================================
     */

    const {
      error: updateError
    } =
      await supabaseAdmin

        .from(
          "orders"
        )

        .update({

          razorpay_refund_amount:
            serverRazorpayRefundAmount,

          razorpay_refund_transaction_id:
            data.id,

          updated_at:
            new Date().toISOString(),

        })

        .eq(
          "id",
          order.id
        );


    if (updateError) {

      console.error(
        "❌ Razorpay refund succeeded but database update failed:",
        {
          orderId:
            order.id,

          refundId:
            data.id,

          updateError,
        }
      );


      /*
       * Do NOT call Razorpay again.
       *
       * The Razorpay idempotency key protects the external
       * operation, and the refund ID is in the error log for
       * reconciliation.
       */

      return jsonResponse(
        {
          success:
            true,

          refund:
            data,

          warning:
            "Razorpay refund succeeded but the order record could not be updated. Do not issue another manual refund.",
        },
        200
      );

    }


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

        alreadyProcessed:
          false,
      },
      200
    );


  } catch (error) {

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