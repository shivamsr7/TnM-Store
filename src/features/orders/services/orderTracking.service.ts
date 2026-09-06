import { supabase } from "@/shared/lib/supabase";

export interface TrackingActivity {
  id: string;
  event_type: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface TrackingOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  ring_size?: string | null;
  total: number;
}

export interface TrackingOrder {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  subtotal: number;
  discount: number;
  gift_wrap: boolean;
  gift_wrap_amount: number;
  shipping_charge: number;
  tax: number;
  total_amount: number;
  advance_amount: number;
  remaining_amount: number;
  payment_method: "partial_cod" | "prepaid";
  advance_payment_status: string;
  cod_payment_status: string;
  refund_status: string;
  refund_amount: number;
  refund_processed_at: string | null;
  order_status:
    | "pending"
    | "confirmed"
    | "packed"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned"
    | "refunded";
  shipping_full_name: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_pincode: string | null;
  courier_name: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderTrackingResult {
  order: TrackingOrder;
  items: TrackingOrderItem[];
  activities: TrackingActivity[];
}

export function normalizeTrackingPhone(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

export async function trackOrder(
  orderNumber: string,
  phone?: string
): Promise<OrderTrackingResult> {
  const normalizedPhone = phone
    ? normalizeTrackingPhone(phone)
    : "";

  const { data, error } = await supabase.functions.invoke(
    "track-order",
    {
      body: {
        orderNumber: orderNumber.trim(),
        phone: normalizedPhone || undefined,
      },
    }
  );

  if (error) {
    try {
      const response = error.context;
      if (response && typeof response.json === "function") {
        const body = await response.json();
        if (typeof body?.error === "string") {
          throw new Error(body.error);
        }
      }
    } catch (parseError) {
      if (parseError instanceof Error && parseError.message) {
        throw parseError;
      }
    }

    throw new Error("Unable to verify the order details.");
  }

  if (!data?.success || !data?.order) {
    throw new Error(
      data?.error || "We couldn't verify those order details."
    );
  }

  return {
    order: data.order,
    items: data.items ?? [],
    activities: data.activities ?? [],
  };
}
