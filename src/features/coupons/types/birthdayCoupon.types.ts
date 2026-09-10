export type BirthdayCouponDiscountType =
  | "fixed"
  | "percentage";

export type BirthdayCouponStackingMode =
  | "exclusive"
  | "stackable";

export interface BirthdayCouponSettings {
  id: string;

  is_enabled: boolean;

  coupon_prefix: string;

  title: string;

  description: string | null;

  discount_type: BirthdayCouponDiscountType;

  discount_value: number;

  minimum_order_amount: number;

  maximum_discount: number | null;

  one_use_per_customer: boolean;

  stacking_mode: BirthdayCouponStackingMode;

  auto_apply: boolean;

  created_at: string;

  updated_at: string;
}

export type BirthdayCouponSettingsFormData =
  Omit<
    BirthdayCouponSettings,
    "id" | "created_at" | "updated_at"
  >;