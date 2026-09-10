import { supabase } from "@/shared/lib/supabase";

export interface GeneratedBirthdayCoupon {
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
  stacking_mode: "exclusive" | "stackable";
  auto_apply: boolean;
  coupon_type: "birthday";
  birthday_year: number | null;
}

export const birthdayCouponGeneratorService = {
  async generate(
    customerId: string
  ): Promise<GeneratedBirthdayCoupon | null> {
    const { data, error } = await supabase.rpc(
      "generate_birthday_coupon",
      {
        p_customer_id: customerId,
      }
    );

    if (error) {
      console.error(
        "Failed to generate birthday coupon:",
        error
      );

      throw error;
    }

    return data as GeneratedBirthdayCoupon | null;
  },
};