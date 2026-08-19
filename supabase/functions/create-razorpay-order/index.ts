import {
  serve,
} from "https://deno.land/std/http/server.ts";

import {
  createClient,
} from "https://esm.sh/@supabase/supabase-js@2";


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


    const checkoutQuoteId =
      String(
        body?.checkoutQuoteId ??
        ""
      ).trim();


    if (!checkoutQuoteId) {

      return jsonResponse(

        {
          error:
            "Secure checkout quote is required.",
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
     * 1. READ THE AUTHORITATIVE CHECKOUT QUOTE
     * =========================================================
     *
     * Never accept the payment amount from the browser.
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
          error:
            "Checkout quote not found.",
        },

        404

      );

    }


    if (quote.used_at) {

      return jsonResponse(

        {
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
          error:
            "Checkout quote has expired. Please return to the address step.",
        },

        410

      );

    }


    const amount =
      Number(
        quote.total_amount
      );


    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      return jsonResponse(

        {
          error:
            "Invalid checkout amount.",
        },

        400

      );

    }


    const razorpayAmount =
      Math.round(
        amount * 100
      );


    /*
     * =========================================================
     * 2. CREATE RAZORPAY ORDER
     * =========================================================
     *
     * IMPORTANT:
     * We intentionally do NOT send "capture" here.
     *
     * Your Razorpay API currently rejects the capture field with:
     * "capture is/are not required and should not be sent".
     *
     * Capture should therefore be controlled through the
     * Razorpay Dashboard's Payment Capture setting.
     */

    const razorpayResponse =
      await fetch(

        "https://api.razorpay.com/v1/orders",

        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json",

            "Authorization":
              "Basic " +
              btoa(
                `${keyId}:${keySecret}`
              ),

          },

          body:
            JSON.stringify({

              amount:
                razorpayAmount,

              currency:
                "INR",

              receipt:
                `tnm_${quote.id}`,

            }),

        }

      );


    const razorpayData =
      await razorpayResponse.json();


    if (
      !razorpayResponse.ok
    ) {

      console.error(
        "Razorpay order creation failed:",
        razorpayData
      );


      return jsonResponse(

        {
          error:
            razorpayData?.error?.description ||
            "Unable to create Razorpay order.",

          razorpay:
            razorpayData?.error ||
            null,

        },

        razorpayResponse.status

      );

    }


    /*
     * Extra server-side sanity check.
     */

    if (
      Number(
        razorpayData.amount
      ) !==
      razorpayAmount
    ) {

      console.error(

        "Razorpay created an unexpected amount:",

        {

          expected:
            razorpayAmount,

          received:
            razorpayData.amount,

          checkoutQuoteId,

        }

      );


      return jsonResponse(

        {
          error:
            "Razorpay order amount does not match the secure checkout total.",
        },

        502

      );

    }


    return jsonResponse(

      {

        ...razorpayData,

        secure_quote_id:
          quote.id,

        verified_amount:
          amount,

      },

      200

    );


  }

  catch (error) {

    console.error(
      "create-razorpay-order error:",
      error
    );


    return jsonResponse(

      {

        error:

          error instanceof Error
            ? error.message
            : "Unable to create Razorpay order.",

      },

      500

    );

  }

});
