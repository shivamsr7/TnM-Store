import {
  serve,
} from "https://deno.land/std/http/server.ts";

import {
  createClient,
} from "https://esm.sh/@supabase/supabase-js@2";

import {
  createHmac,
} from "node:crypto";


const corsHeaders = {

  "Access-Control-Allow-Origin": "*",

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


async function razorpayRequest(
  url: string,
  keyId: string,
  keySecret: string,
  options: RequestInit = {}
) {

  const response =
    await fetch(

      url,

      {

        ...options,

        headers: {

          ...(options.headers || {}),

          "Authorization":
            "Basic " +
            btoa(
              `${keyId}:${keySecret}`
            ),

          "Content-Type":
            "application/json",

        },

      }

    );


  const data =
    await response.json();


  return {
    response,
    data,
  };

}


serve(async (req) => {

  if (
    req.method === "OPTIONS"
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

    const body =
      await req.json();


    const razorpayOrderId =
      String(
        body?.razorpay_order_id ??
        ""
      ).trim();


    const razorpayPaymentId =
      String(
        body?.razorpay_payment_id ??
        ""
      ).trim();


    const razorpaySignature =
      String(
        body?.razorpay_signature ??
        ""
      ).trim();


    const checkoutQuoteId =
      String(
        body?.checkoutQuoteId ??
        ""
      ).trim();


    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature ||
      !checkoutQuoteId
    ) {

      return jsonResponse(

        {
          success: false,

          error:
            "Missing secure payment verification fields.",

        },

        400

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


    /*
     * =========================================================
     * 1. LOAD THE SERVER-SIDE CHECKOUT QUOTE
     * =========================================================
     */

    const {
      data: quote,
      error: quoteError,
    } = await supabaseAdmin

      .from(
        "checkout_quotes"
      )

      .select(
        "id, total_amount, expires_at, used_at"
      )

      .eq(
        "id",
        checkoutQuoteId
      )

      .maybeSingle();


    if (quoteError) {

      throw quoteError;

    }


    if (!quote) {

      return jsonResponse(

        {
          success: false,

          error:
            "Checkout quote not found.",

        },

        404

      );

    }


    if (quote.used_at) {

      return jsonResponse(

        {
          success: false,

          error:
            "This checkout quote has already been used.",

        },

        409

      );

    }


    if (
      new Date(
        quote.expires_at
      ).getTime() <= Date.now()
    ) {

      return jsonResponse(

        {
          success: false,

          error:
            "Checkout quote has expired. Please return to the address step.",

        },

        410

      );

    }


    const expectedAmount =
      Number(
        quote.total_amount
      );


    if (
      !Number.isFinite(
        expectedAmount
      ) ||
      expectedAmount <= 0
    ) {

      return jsonResponse(

        {
          success: false,

          error:
            "Invalid checkout quote amount.",

        },

        400

      );

    }


    const expectedAmountPaise =
      Math.round(
        expectedAmount * 100
      );


    /*
     * =========================================================
     * 2. VERIFY RAZORPAY SIGNATURE
     * =========================================================
     */

    const generatedSignature =
      createHmac(
        "sha256",
        keySecret
      )

        .update(
          `${razorpayOrderId}|${razorpayPaymentId}`
        )

        .digest(
          "hex"
        );


    if (
      generatedSignature !==
      razorpaySignature
    ) {

      return jsonResponse(

        {
          success: false,

          error:
            "Invalid Razorpay payment signature.",

        },

        400

      );

    }


    /*
     * =========================================================
     * 3. VERIFY RAZORPAY ORDER
     * =========================================================
     */

    const {
      response:
        orderResponse,
      data:
        razorpayOrder,
    } = await razorpayRequest(

      `https://api.razorpay.com/v1/orders/${encodeURIComponent(
        razorpayOrderId
      )}`,

      keyId,

      keySecret,

      {
        method:
          "GET",
      }

    );


    if (
      !orderResponse.ok
    ) {

      console.error(
        "Razorpay order lookup failed:",
        razorpayOrder
      );

      return jsonResponse(

        {
          success: false,

          error:
            "Unable to verify the Razorpay order.",

        },

        502

      );

    }


    if (
      razorpayOrder.currency !==
      "INR"
    ) {

      return jsonResponse(

        {
          success: false,

          error:
            "Razorpay order currency mismatch.",

        },

        400

      );

    }


    if (
      Number(
        razorpayOrder.amount
      ) !==
      expectedAmountPaise
    ) {

      return jsonResponse(

        {
          success: false,

          error:
            "Payment amount does not match the secure checkout total.",

        },

        400

      );

    }


    if (
      razorpayOrder.receipt !==
      `tnm_${checkoutQuoteId}`
    ) {

      return jsonResponse(

        {
          success: false,

          error:
            "Razorpay order does not belong to this checkout.",

        },

        400

      );

    }


    /*
     * =========================================================
     * 4. FETCH PAYMENT
     * =========================================================
     */

    const {
      response:
        paymentResponse,
      data:
        razorpayPayment,
    } = await razorpayRequest(

      `https://api.razorpay.com/v1/payments/${encodeURIComponent(
        razorpayPaymentId
      )}`,

      keyId,

      keySecret,

      {
        method:
          "GET",
      }

    );


    if (
      !paymentResponse.ok
    ) {

      console.error(
        "Razorpay payment lookup failed:",
        razorpayPayment
      );

      return jsonResponse(

        {
          success: false,

          error:
            "Unable to verify the Razorpay payment.",

        },

        502

      );

    }


    if (
      razorpayPayment.order_id !==
      razorpayOrderId
    ) {

      return jsonResponse(

        {
          success: false,

          error:
            "Razorpay payment does not belong to this order.",

        },

        400

      );

    }


    if (
      Number(
        razorpayPayment.amount
      ) !==
      expectedAmountPaise
    ) {

      return jsonResponse(

        {
          success: false,

          error:
            "Paid amount does not match the secure checkout total.",

        },

        400

      );

    }


    /*
     * =========================================================
     * 5. CAPTURE IF STILL AUTHORIZED
     * =========================================================
     *
     * Razorpay Automatic Capture may be asynchronous. If the
     * browser callback reaches us while the payment is still
     * authorized, capture it server-side instead of treating an
     * authorized payment as successful.
     *
     * If it is already captured, do nothing.
     */

    let finalPayment =
      razorpayPayment;


    if (
      finalPayment.status ===
      "authorized"
    ) {

      const {
        response:
          captureResponse,
        data:
          captureData,
      } = await razorpayRequest(

        `https://api.razorpay.com/v1/payments/${encodeURIComponent(
          razorpayPaymentId
        )}/capture`,

        keyId,

        keySecret,

        {

          method:
            "POST",

          body:
            JSON.stringify({

              amount:
                expectedAmountPaise,

              currency:
                "INR",

            }),

        }

      );


      if (
        !captureResponse.ok
      ) {

        /*
         * A concurrent automatic capture can race with this
         * request. In that case Razorpay may report that the
         * payment is already captured. Re-fetch the payment
         * before deciding that verification failed.
         */

        const {
          response:
            refreshedPaymentResponse,
          data:
            refreshedPayment,
        } = await razorpayRequest(

          `https://api.razorpay.com/v1/payments/${encodeURIComponent(
            razorpayPaymentId
          )}`,

          keyId,

          keySecret,

          {
            method:
              "GET",
          }

        );


        if (
          refreshedPaymentResponse.ok
        ) {

          finalPayment =
            refreshedPayment;

        }

        else {

          console.error(
            "Razorpay capture failed:",
            captureData
          );

          return jsonResponse(

            {
              success: false,

              error:
                captureData?.error?.description ||
                "Payment could not be captured.",

            },

            502

          );

        }

      }

      else {

        finalPayment =
          captureData;

      }

    }


    /*
     * =========================================================
     * 6. ONLY CAPTURED PAYMENTS ARE SUCCESSFUL
     * =========================================================
     */

    if (
      finalPayment.status !==
      "captured"
    ) {

      return jsonResponse(

        {
          success: false,

          error:
            "Payment has not been captured yet.",

          payment_status:
            finalPayment.status,

        },

        409

      );

    }


    if (
      Number(
        finalPayment.amount
      ) !==
      expectedAmountPaise
    ) {

      return jsonResponse(

        {
          success: false,

          error:
            "Captured payment amount does not match the secure checkout total.",

        },

        400

      );

    }


    console.log(

      "Razorpay payment securely verified and captured:",

      {

        checkoutQuoteId,

        razorpayOrderId,

        razorpayPaymentId,

        amount:
          expectedAmount,

      }

    );


    /*
     * =========================================================
     * 7. RETURN VERIFIED PAYMENT
     * =========================================================
     *
     * Existing CheckoutDialog/create_order_transaction flow
     * remains responsible for creating the application order.
     */

    return jsonResponse(

      {

        success: true,

        verified: true,

        checkoutQuoteId,

        razorpayOrderId,

        razorpayPaymentId,

        amount:
          expectedAmount,

        amountPaise:
          expectedAmountPaise,

        paymentStatus:
          finalPayment.status,

      },

      200

    );


  }

  catch (error) {

    console.error(
      "Razorpay verification error:",
      error
    );


    return jsonResponse(

      {

        success: false,

        error:

          error instanceof Error
            ? error.message
            : "Payment verification failed.",

      },

      500

    );

  }

});
