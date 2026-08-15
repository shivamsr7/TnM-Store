import {
  serve
} from "https://deno.land/std/http/server.ts";

import {
  createHmac
} from "node:crypto";


const corsHeaders = {

  "Access-Control-Allow-Origin": "*",

  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",

  "Access-Control-Allow-Methods":
    "POST, OPTIONS",

};


serve(async (req) => {


  // Handle browser preflight

  if (
    req.method === "OPTIONS"
  ) {

    return new Response(

      "ok",

      {
        headers:
          corsHeaders
      }

    );

  }


  try {


    const body =
      await req.json();


    const {

      razorpay_order_id,

      razorpay_payment_id,

      razorpay_signature,

    } = body;


    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {

      throw new Error(
        "Missing Razorpay payment verification fields."
      );

    }


    const secret =
      Deno.env.get(
        "RAZORPAY_KEY_SECRET"
      );


    if (!secret) {

      throw new Error(
        "Razorpay secret missing"
      );

    }


    const generatedSignature =

      createHmac(
        "sha256",
        secret
      )

        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )

        .digest(
          "hex"
        );


    const verified =

      generatedSignature ===
      razorpay_signature;


    console.log(
      "🔐 Razorpay payment verification:",
      {
        razorpayOrderId:
          razorpay_order_id,

        razorpayPaymentId:
          razorpay_payment_id,

        verified,
      }
    );


    return new Response(

      JSON.stringify({

        success:
          verified,

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


  }

  catch (error) {


    console.error(
      "❌ Razorpay verification error:",
      error
    );


    return new Response(

      JSON.stringify({

        success:
          false,

        error:

          error instanceof Error

            ? error.message

            : "Payment verification failed.",

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