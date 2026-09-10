import { supabase } from "@/shared/lib/supabase";

import type {
  BirthdayCouponSettings,
} from "../types/birthdayCoupon.types";


export interface BirthdayCoupon {
  id: string;
  code: string;
  title: string;
  description: string | null;

  discount_type: "fixed" | "percentage";
  discount_value: number;

  minimum_order_amount: number;
  maximum_discount: number | null;

  usage_limit: number | null;
  used_count: number;

  one_use_per_customer: boolean;

  starts_at: string | null;
  expires_at: string | null;

  is_active: boolean;

  coupon_type: "standard" | "birthday";
  birthday_year: number | null;

  stacking_mode: "exclusive" | "stackable";
  auto_apply: boolean;

  created_at: string;
  updated_at: string;
}


/**
 * Get or create the currently eligible birthday coupon
 * for the authenticated customer.
 *
 * The actual eligibility and creation logic lives inside
 * the SECURITY DEFINER Supabase RPC.
 */
export async function getOrCreateBirthdayCoupon(
  customerId: string
): Promise<BirthdayCoupon | null> {

  if (!customerId) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_or_create_birthday_coupon",
    {
      p_customer_id: customerId,
    }
  );

  if (error) {
    throw error;
  }

  return data as BirthdayCoupon | null;
}


/**
 * Read birthday settings.
 *
 * This is mainly useful for customer-facing UI when we
 * need to display the configured birthday offer.
 */
export async function getBirthdayCouponSettings(): Promise<
  BirthdayCouponSettings | null
> {

  const {
    data,
    error,
  } = await supabase
    .from("birthday_coupon_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}