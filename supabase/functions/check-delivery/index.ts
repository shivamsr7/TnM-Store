import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

const DEFAULT_PRODUCT_WEIGHT_KG = 0.5;
const QUOTE_VALIDITY_MINUTES = 10;

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
        "Content-Type": "application/json",
      },
    }
  );
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

  try {
    const body = await req.json();

    const customer_pincode =
      String(
        body?.customer_pincode ?? ""
      ).trim();

    /*
     * For the secure checkout flow the browser sends:
     *
     * items: [
     *   {
     *     product_id: string,
     *     quantity: number
     *   }
     * ]
     *
     * The server fetches the real product weights.
     *
     * weight is intentionally NOT trusted when items are supplied.
     */
    const items = Array.isArray(body?.items)
      ? body.items
      : [];

    const payment_method =
      String(
        body?.payment_method ?? "prepaid"
      ).toLowerCase();

    const customer_id =
      body?.customer_id
        ? String(body.customer_id)
        : null;

    /*
     * This keeps the existing DeliveryChecker compatible.
     * Once CheckoutDialog is updated, items will always be
     * supplied for checkout quotes.
     */
    const legacyWeight =
      Number(body?.weight ?? 0.25);

    if (!customer_pincode) {
      return jsonResponse(
        {
          error: "Pincode is required",
        },
        400
      );
    }

    if (
      !/^\d{6}$/.test(
        customer_pincode
      )
    ) {
      return jsonResponse(
        {
          error: "Invalid delivery pincode",
        },
        400
      );
    }

    if (
      ![
        "prepaid",
        "razorpay",
        "cod",
        "partial_cod",
      ].includes(payment_method)
    ) {
      return jsonResponse(
        {
          error: "Invalid payment method",
        },
        400
      );
    }

    /*
     * =========================================================
     * SUPABASE SERVER CLIENT
     * =========================================================
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
        "Supabase server credentials are missing"
      );
    }

    const supabaseAdmin =
      createClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );

    /*
     * =========================================================
     * SERVER-SIDE WEIGHT
     * =========================================================
     *
     * When items are supplied, NEVER trust the frontend weight.
     *
     * Every product weight is fetched from products.
     *
     * NULL / 0 weight → 0.500 kg fallback.
     */

    let shipmentWeight =
      DEFAULT_PRODUCT_WEIGHT_KG;

    const verifiedItems: Array<{
      product_id: string;
      quantity: number;
      price: number;
      weight: number;
    }> = [];

    if (items.length > 0) {
      shipmentWeight = 0;

      for (const item of items) {
        const productId =
          String(
            item?.product_id ??
            item?.productId ??
            ""
          ).trim();

        const quantity =
          Number(
            item?.quantity ?? 0
          );

        if (!productId) {
          throw new Error(
            "Invalid product in cart"
          );
        }

        if (
          !Number.isInteger(quantity) ||
          quantity <= 0
        ) {
          throw new Error(
            "Invalid product quantity"
          );
        }

        const {
          data: product,
          error: productError,
        } = await supabaseAdmin
          .from("products")
          .select(
            "id, price, weight, status, track_inventory, stock, allow_backorders"
          )
          .eq("id", productId)
          .maybeSingle();

        if (productError) {
          throw new Error(
            `Unable to verify product: ${productError.message}`
          );
        }

        if (!product) {
          throw new Error(
            "One or more products are no longer available"
          );
        }

        if (
          product.status !== "active"
        ) {
          throw new Error(
            "One or more products are no longer available"
          );
        }

        if (
          product.track_inventory !== false &&
          Number(product.stock ?? 0) <
            quantity &&
          product.allow_backorders !== true
        ) {
          throw new Error(
            `Insufficient stock for product ${product.id}`
          );
        }

        const productWeight =
          Number(product.weight ?? 0);

        const verifiedWeight =
          productWeight > 0
            ? productWeight
            : DEFAULT_PRODUCT_WEIGHT_KG;

        shipmentWeight +=
          verifiedWeight *
          quantity;

        verifiedItems.push({
          product_id:
            product.id,
          quantity,
          price:
            Number(product.price ?? 0),
          weight:
            verifiedWeight,
        });
      }

      shipmentWeight =
        Math.max(
          shipmentWeight,
          DEFAULT_PRODUCT_WEIGHT_KG
        );
    } else {
      /*
       * Legacy DeliveryChecker requests still work.
       * This value is NOT used by the secure checkout quote
       * once CheckoutDialog starts sending product IDs.
       */
      shipmentWeight =
        Number.isFinite(legacyWeight) &&
        legacyWeight > 0
          ? legacyWeight
          : DEFAULT_PRODUCT_WEIGHT_KG;
    }

    /*
     * =========================================================
     * SHIPROCKET LOGIN
     * =========================================================
     */

    const shiprocketEmail =
      Deno.env.get(
        "SHIPROCKET_EMAIL"
      );

    const shiprocketPassword =
      Deno.env.get(
        "SHIPROCKET_PASSWORD"
      );

    const pickupPincode =
      Deno.env.get(
        "SHIPROCKET_PICKUP_PINCODE"
      );

    if (
      !shiprocketEmail ||
      !shiprocketPassword ||
      !pickupPincode
    ) {
      throw new Error(
        "Shiprocket configuration is missing"
      );
    }

    const loginResponse =
      await fetch(
        "https://apiv2.shiprocket.in/v1/external/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email:
              shiprocketEmail,
            password:
              shiprocketPassword,
          }),
        }
      );

    const loginData =
      await loginResponse.json();

    if (
      !loginResponse.ok ||
      !loginData?.token
    ) {
      return jsonResponse(
        {
          error:
            "Shiprocket authentication failed",
        },
        401
      );
    }

    const token =
      loginData.token;

    /*
     * =========================================================
     * SHIPROCKET SERVICEABILITY
     * =========================================================
     *
     * The full Shiprocket rate is returned.
     *
     * We preserve your existing behavior of using the first
     * available courier returned by Shiprocket.
     */

    const serviceabilityUrl =
      new URL(
        "https://apiv2.shiprocket.in/v1/external/courier/serviceability/"
      );

    serviceabilityUrl.searchParams.set(
      "pickup_postcode",
      pickupPincode
    );

    serviceabilityUrl.searchParams.set(
      "delivery_postcode",
      customer_pincode
    );

    serviceabilityUrl.searchParams.set(
      "weight",
      shipmentWeight.toString()
    );

    serviceabilityUrl.searchParams.set(
      "cod",
      payment_method === "cod" ||
      payment_method === "partial_cod"
        ? "1"
        : "0"
    );

    const serviceabilityResponse =
      await fetch(
        serviceabilityUrl.toString(),
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    const serviceabilityData =
      await serviceabilityResponse.json();

    if (
      !serviceabilityResponse.ok
    ) {
      return jsonResponse(
        {
          error:
            "Shiprocket delivery check failed",
          details:
            serviceabilityData,
        },
        serviceabilityResponse.status
      );
    }

    const couriers =
      serviceabilityData
        ?.data
        ?.available_courier_companies;

    if (
      !Array.isArray(couriers) ||
      couriers.length === 0
    ) {
      return jsonResponse(
        {
          error:
            "Sorry, delivery is not available for this pincode.",
          data:
            serviceabilityData,
        },
        422
      );
    }

    /*
     * Preserve the existing checkout behavior:
     * use the first courier returned by Shiprocket.
     */
    const courier =
      couriers[0];

    const shiprocketRate =
      Number(
        courier?.rate ?? 0
      );

    if (
      !Number.isFinite(
        shiprocketRate
      ) ||
      shiprocketRate < 0
    ) {
      throw new Error(
        "Invalid shipping rate returned by Shiprocket"
      );
    }

    /*
     * =========================================================
     * SECURE CHECKOUT QUOTE
     * =========================================================
     *
     * Only create a quote when actual cart items are supplied.
     *
     * The quote stores the server-verified product snapshot
     * and the Shiprocket rate.
     *
     * Coupon/discount and free-shipping logic will be applied
     * by the secure checkout/order calculation layer in the
     * next step.
     */

    let quoteId: string | null =
      null;

    let quoteExpiresAt:
      string | null = null;

    if (verifiedItems.length > 0) {
      const expiresAt =
        new Date(
          Date.now() +
            QUOTE_VALIDITY_MINUTES *
              60 *
              1000
        ).toISOString();

      const {
        data: quote,
        error: quoteError,
      } = await supabaseAdmin
        .from(
          "checkout_quotes"
        )
        .insert({
          customer_id:
            customer_id,
          shipping_pincode:
            customer_pincode,
          payment_method:
            payment_method,
          items:
            verifiedItems,
          subtotal: 0,
          discount: 0,
          shipping_charge:
            shiprocketRate,
          tax: 0,
          total_amount: 0,
          coupon_id: null,
          coupon_code: null,
          shipment_weight:
            shipmentWeight,
          shiprocket_rate:
            shiprocketRate,
          expires_at:
            expiresAt,
        })
        .select("id, expires_at")
        .single();

      if (quoteError) {
        throw new Error(
          `Unable to create checkout quote: ${quoteError.message}`
        );
      }

      quoteId =
        quote.id;

      quoteExpiresAt =
        quote.expires_at;
    }

    /*
     * =========================================================
     * RESPONSE
     * =========================================================
     *
     * We return the original Shiprocket response so existing
     * delivery-check UI remains compatible, plus the secure
     * quote information for CheckoutDialog.
     */

    return jsonResponse({
      ...serviceabilityData,

      quote: quoteId
        ? {
            id:
              quoteId,
            expires_at:
              quoteExpiresAt,
            shipment_weight:
              shipmentWeight,
            shiprocket_rate:
              shiprocketRate,
          }
        : null,

      verified_shipping: {
        shiprocket_rate:
          shiprocketRate,
        shipment_weight:
          shipmentWeight,
        courier:
          courier?.courier_name ??
          "",
      },
    });
  } catch (error) {
    console.error(
      "check-delivery error:",
      error
    );

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to calculate delivery",
      },
      500
    );
  }
});
