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


function toBase64(
  bytes: Uint8Array
) {

  let binary = "";

  const chunkSize = 0x8000;

  for (
    let i = 0;
    i < bytes.length;
    i += chunkSize
  ) {

    binary += String.fromCharCode(
      ...bytes.subarray(
        i,
        Math.min(
          i + chunkSize,
          bytes.length
        )
      )
    );

  }

  return btoa(
    binary
  );

}


async function generateHmac(

  body: string,

  secret: string

) {

  const encoder =
    new TextEncoder();


  const key =
    await crypto.subtle.importKey(

      "raw",

      encoder.encode(
        secret
      ),

      {
        name:
          "HMAC",

        hash:
          "SHA-256",
      },

      false,

      [
        "sign",
      ]

    );


  const signature =
    await crypto.subtle.sign(

      "HMAC",

      key,

      encoder.encode(
        body
      )

    );


  return toBase64(
    new Uint8Array(
      signature
    )
  );

}


serve(
  async (
    req
  ) => {

    /*
     * =======================================================
     * CORS
     * =======================================================
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


    /*
     * =======================================================
     * METHOD
     * =======================================================
     */

    if (
      req.method !==
      "POST"
    ) {

      return new Response(

        JSON.stringify({
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


    try {

      /*
       * =====================================================
       * SHIPROCKET CREDENTIALS
       * =====================================================
       *
       * Store these as Supabase Edge Function secrets.
       *
       * SHIPROCKET_API_KEY
       * SHIPROCKET_API_SECRET
       *
       * Never expose the secret in React/frontend code.
       * =====================================================
       */

      const apiKey =
        Deno.env.get(
          "SHIPROCKET_API_KEY"
        );

      const apiSecret =
        Deno.env.get(
          "SHIPROCKET_API_SECRET"
        );


      if (
        !apiKey ||
        !apiSecret
      ) {

        throw new Error(
          "Shiprocket API credentials are missing."
        );

      }


      /*
       * =====================================================
       * REQUEST BODY
       * =====================================================
       */

      const body =
        await req.json();


      const items =
        Array.isArray(
          body.items
        )
          ? body.items
          : [];


      if (
        items.length === 0
      ) {

        throw new Error(
          "At least one checkout item is required."
        );

      }


      /*
       * =====================================================
       * VALIDATE ITEMS
       * =====================================================
       */

      const checkoutItems =
        items.map(
          (
            item: any
          ) => {

            const variantId =
              String(
                item.variant_id ??
                ""
              ).trim();


            const quantity =
              Number(
                item.quantity
              );


            if (
              !variantId
            ) {

              throw new Error(
                "Each checkout item requires a variant_id."
              );

            }


            if (
              !Number.isInteger(
                quantity
              ) ||
              quantity <= 0
            ) {

              throw new Error(
                "Each checkout item requires a valid quantity."
              );

            }


            return {

              variant_id:
                variantId,

              quantity,

            };

          }
        );


      /*
       * =====================================================
       * REDIRECT URL
       * =====================================================
       */

      const redirectUrl =
        String(
          body.redirect_url ??
          ""
        ).trim();


      if (
        !redirectUrl
      ) {

        throw new Error(
          "redirect_url is required."
        );

      }


      /*
       * =====================================================
       * TIMESTAMP
       * =====================================================
       */

      const timestamp =
        new Date().toISOString();


      /*
       * =====================================================
       * EXACT SHIPROCKET REQUEST BODY
       * =====================================================
       *
       * The HMAC must be calculated from this exact JSON
       * string.
       * =====================================================
       */

      const requestBody = {

        cart_data: {

          items:
            checkoutItems,

        },

        redirect_url:
          redirectUrl,

        timestamp,

      };


      const requestBodyString =
        JSON.stringify(
          requestBody
        );


      /*
       * =====================================================
       * HMAC
       * =====================================================
       */

      const hmac =
        await generateHmac(

          requestBodyString,

          apiSecret

        );


      /*
       * =====================================================
       * SHIPROCKET CHECKOUT
       * =====================================================
       */

      const response =
        await fetch(

          "https://checkout-api.shiprocket.com/api/v1/access-token/checkout",

          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json",

              "X-Api-Key":
                apiKey,

              "X-Api-HMAC-SHA256":
                hmac,

            },

            body:
              requestBodyString,

          }

        );


      const responseText =
        await response.text();


      let responseData:
        any = null;


      try {

        responseData =
          JSON.parse(
            responseText
          );

      }

      catch {

        responseData = {
          raw:
            responseText,
        };

      }


      /*
       * =====================================================
       * ERROR
       * =====================================================
       */

      if (
        !response.ok
      ) {

        console.error(
          "Shiprocket Checkout token request failed:",
          {
            status:
              response.status,

            response:
              responseData,
          }
        );


        return new Response(

          JSON.stringify({

            error:
              "Shiprocket Checkout token request failed.",

            details:
              responseData,

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
       * =====================================================
       * SUCCESS
       * =====================================================
       *
       * The Shiprocket guide specifies that result.token
       * is used to initialize checkout.
       * =====================================================
       */

      return new Response(

        JSON.stringify(
          responseData
        ),

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

    catch (
      error
    ) {

      console.error(
        "Shiprocket Checkout error:",
        error
      );


      return new Response(

        JSON.stringify({

          error:
            error instanceof Error
              ? error.message
              : "Unable to initiate Shiprocket Checkout.",

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

  }
);
