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

      return new Response(

        JSON.stringify({

          success:
            false,

          error:
            "Method not allowed",

        }),

        {

          status:
            405,

          headers: {

            ...corsHeaders,

            "Content-Type":
              "application/json",

          },

        }

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


    const amount =
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
     * VALIDATION
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
        amount
      ) ||
      amount <= 0
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
     * RUPEES → PAISE
     * ===================================================
     */

    const amountInPaise =
      Math.round(
        amount * 100
      );


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

      "💳 Starting Razorpay refund",

      {

        paymentId,

        amount,

        amountInPaise,

        idempotencyKey,

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

          data,

        }

      );


      const message =

        data?.error?.description ||

        data?.error?.reason ||

        data?.error?.code ||

        "Razorpay refund request failed.";


      return new Response(

        JSON.stringify({

          success:
            false,

          error:
            message,

          razorpayError:
            data?.error ??
            null,

        }),

        {

          status:
            response.status,

          headers: {

            ...corsHeaders,

            "Content-Type":
              "application/json",

          },

        }

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


    return new Response(

      JSON.stringify({

        success:
          true,

        refund:
          data,

      }),

      {

        status:
          200,

        headers: {

          ...corsHeaders,

          "Content-Type":
            "application/json",

        },

      }

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


    return new Response(

      JSON.stringify({

        success:
          false,

        error:

          error instanceof Error

            ? error.message

            : "Unexpected refund error.",

      }),

      {

        status:
          500,

        headers: {

          ...corsHeaders,

          "Content-Type":
            "application/json",

        },

      }

    );

  }

});