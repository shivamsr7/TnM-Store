import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

function normalizePhone(phone?: string | null) {
  if (!phone) return "";
  return phone.replace(/\D/g, "").slice(-10);
}

const safeOrderFields = `
  id,
  order_number,
  customer_id,
  customer_name,
  customer_email,
  subtotal,
  discount,
  gift_wrap,
  gift_wrap_amount,
  shipping_charge,
  tax,
  total_amount,
  advance_amount,
  remaining_amount,
  payment_method,
  advance_payment_status,
  cod_payment_status,
  refund_status,
  refund_amount,
  refund_processed_at,
  order_status,
  shipping_full_name,
  shipping_city,
  shipping_state,
  shipping_pincode,
  courier_name,
  tracking_number,
  created_at,
  updated_at
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.method !== "POST") {
    return json({ success: false, error: "Method not allowed." }, 405);
  }

  try {
    const body = await req.json();

    const orderNumber = String(body?.orderNumber ?? "").trim();
    const phone = normalizePhone(body?.phone);

    if (!orderNumber) {
      return json({ success: false, error: "Order number is required." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase server credentials are missing.");
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    /*
     * If a valid authenticated session is supplied, use the customer's
     * authenticated relationship as the verification mechanism.
     */
    let authenticatedCustomerId: string | null = null;

    const authHeader = req.headers.get("Authorization");

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);

      const {
        data: { user },
      } = await admin.auth.getUser(token);

      if (user) {
        const { data: customer, error: customerError } = await admin
          .from("customers")
          .select("id")
          .eq("auth_user_id", user.id)
          .is("deleted_at", null)
          .maybeSingle();

        if (customerError) throw customerError;

        authenticatedCustomerId = customer?.id ?? null;
      }
    }

    /*
     * customer_phone is intentionally fetched here only for verification.
     * It is NOT included in the safe response returned to the browser.
     */
    const { data: orderRecord, error: orderError } = await admin
      .from("orders")
      .select(`${safeOrderFields}, customer_phone`)
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (orderError) throw orderError;

    /*
     * Deliberately return the same generic failure for all verification
     * failures so a guessed order number cannot reveal whether an order exists.
     */
    if (!orderRecord) {
      return json({
        success: false,
        error: "We couldn't verify those order details.",
      }, 404);
    }

    const authenticatedMatch =
      !!authenticatedCustomerId &&
      orderRecord.customer_id === authenticatedCustomerId;

    const guestMatch =
      phone.length === 10 &&
      normalizePhone(orderRecord.customer_phone) === phone;

    if (!authenticatedMatch && !guestMatch) {
      return json({
        success: false,
        error: "We couldn't verify those order details.",
      }, 403);
    }

    /*
     * Remove the phone number before sending the order object to the client.
     */
    const { customer_phone: _customerPhone, ...order } = orderRecord;

    const [{ data: items, error: itemsError }, { data: activities, error: activityError }] =
      await Promise.all([
        admin
          .from("order_items")
          .select(`
            id,
            order_id,
            product_id,
            product_name,
            product_image,
            price,
            quantity,
            ring_size,
            total
          `)
          .eq("order_id", order.id)
          .order("id", { ascending: true }),

        admin
          .from("order_activity")
          .select(`
            id,
            event_type,
            title,
            description,
            metadata,
            created_at
          `)
          .eq("order_id", order.id)
          .order("created_at", { ascending: true }),
      ]);

    if (itemsError) throw itemsError;
    if (activityError) throw activityError;

    return json({
      success: true,
      order,
      items: items ?? [],
      activities: activities ?? [],
    });
  } catch (error) {
    console.error("track-order error:", error);

    return json({
      success: false,
      error: "Unable to retrieve the order right now. Please try again.",
    }, 500);
  }
});
