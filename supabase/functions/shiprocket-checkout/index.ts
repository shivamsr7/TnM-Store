import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const SHIPROCKET_BASE_URL =
  "https://fastrr-api-dev.pickrr.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

function jsonResponse(
  data: unknown,
  status = 200
) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

async function generateHmacBase64(
  message: string,
  secret: string
): Promise<string> {

  const encoder =
    new TextEncoder();

  const keyData =
    encoder.encode(secret);

  const messageData =
    encoder.encode(message);

  const cryptoKey =
    await crypto.subtle.importKey(
      "raw",
      keyData,
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["sign"]
    );

  const signature =
    await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      messageData
    );

  const bytes =
    new Uint8Array(signature);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response(
      "ok",
      {
        headers: corsHeaders,
      }
    );
  }

  if (req.method !== "POST") {
    return jsonResponse(
      {
        ok: false,
        error: "Method not allowed",
      },
      405
    );
  }

  try {

    const apiKey =
      Deno.env.get(
        "SHIPROCKET_CHECKOUT_API_KEY"
      );

    const apiSecret =
      Deno.env.get(
        "SHIPROCKET_CHECKOUT_API_SECRET"
      );

    if (!apiKey || !apiSecret) {
      return jsonResponse(
        {
          ok: false,
          error:
            "Shiprocket credentials are not configured",
        },
        500
      );
    }

    const input =
      await req.json();

    /*
     * -------------------------------------------------------
     * VALIDATION
     * -------------------------------------------------------
     */

    if (
      !input.variant_id ||
      !input.quantity
    ) {
      return jsonResponse(
        {
          ok: false,
          error:
            "variant_id and quantity are required",
        },
        400
      );
    }

    /*
     * -------------------------------------------------------
     * TIMESTAMP
     * -------------------------------------------------------
     */

    const timestamp =
      new Date().toISOString();

    /*
     * -------------------------------------------------------
     * SHIPROCKET REQUEST BODY
     * -------------------------------------------------------
     *
     * IMPORTANT:
     * The exact JSON string generated below is also the
     * exact string used for HMAC generation.
     *
     * Do NOT stringify a different object for the HMAC.
     * -------------------------------------------------------
     */

    const checkoutBody = {
      cart_data: {
        items: [
          {
            variant_id:
              String(input.variant_id),

            quantity:
              Number(input.quantity),

            ...(input.catalog_data
              ? {
                  catalog_data: {
                    price:
                      Number(
                        input.catalog_data.price
                      ),

                    name:
                      String(
                        input.catalog_data.name
                      ),

                    image_url:
                      String(
                        input.catalog_data.image_url
                      ),
                  },
                }
              : {}),
          },
        ],

        ...(input.cart_discount
          ? {
              cart_discount: {
                coupon_code:
                  String(
                    input.cart_discount
                      .coupon_code
                  ),

                amount:
                  Number(
                    input.cart_discount.amount
                  ),
              },
            }
          : {}),

        custom_attributes:
          input.custom_attributes || {},

        mobile_app: false,
      },

      redirect_url:
        String(input.redirect_url),

      timestamp,
    };

    /*
     * -------------------------------------------------------
     * EXACT JSON BODY
     * -------------------------------------------------------
     */

    const requestBody =
      JSON.stringify(
        checkoutBody
      );

    /*
     * -------------------------------------------------------
     * HMAC SHA-256 → BASE64
     * -------------------------------------------------------
     */

    const hmac =
      await generateHmacBase64(
        requestBody,
        apiSecret
      );

    /*
     * -------------------------------------------------------
     * SHIPROCKET API CALL
     * -------------------------------------------------------
     */

    const response =
      await fetch(
        `${SHIPROCKET_BASE_URL}/api/v1/access-token/checkout`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "X-Api-Key":
              apiKey,

            "X-Api-HMAC-SHA256":
              hmac,
          },

          body:
            requestBody,
        }
      );

    const responseText =
      await response.text();

    let responseData: unknown;

    try {
      responseData =
        JSON.parse(responseText);
    } catch {
      responseData =
        {
          raw: responseText,
        };
    }

    if (!response.ok) {

      console.error(
        "Shiprocket error:",
        response.status,
        responseData
      );

      return jsonResponse(
        {
          ok: false,

          shiprocket_status:
            response.status,

          shiprocket_response:
            responseData,
        },
        response.status
      );
    }

    return jsonResponse(
      {
        ok: true,

        shiprocket_response:
          responseData,
      }
    );

  } catch (error) {

    console.error(
      "Shiprocket checkout error:",
      error
    );

    return jsonResponse(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      500
    );
  }
});