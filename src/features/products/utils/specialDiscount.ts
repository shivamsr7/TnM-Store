/**
 * Calculate the price a customer should pay after a product-level
 * special discount.
 *
 * The base product price is never modified.
 */
export type SpecialDiscountProduct = {
  price: number;
  special_discount_enabled?: boolean | null;
  special_discount_type?: "percentage" | "fixed" | null;
  special_discount_value?: number | null;
  special_discount_ends_at?: string | null;
};

export function getSpecialDiscountAmount(
  product: SpecialDiscountProduct
): number {
  const price = Math.max(Number(product.price) || 0, 0);

  if (!product.special_discount_enabled) {
    return 0;
  }

  if (
    product.special_discount_ends_at &&
    new Date(product.special_discount_ends_at).getTime() <= Date.now()
  ) {
    return 0;
  }

  const value = Math.max(
    Number(product.special_discount_value) || 0,
    0
  );

  if (value <= 0 || price <= 0) {
    return 0;
  }

  if (product.special_discount_type === "fixed") {
    return Math.min(value, price);
  }

  // Percentage discounts are capped at 100%.
  const percentage = Math.min(value, 100);

  return Math.min(
    (price * percentage) / 100,
    price
  );
}

export function getEffectiveProductPrice(
  product: SpecialDiscountProduct
): number {
  const price = Math.max(Number(product.price) || 0, 0);

  return Math.max(
    price - getSpecialDiscountAmount(product),
    0
  );
}

export function hasSpecialProductDiscount(
  product: SpecialDiscountProduct
): boolean {
  return (
    Boolean(product.special_discount_enabled) &&
    getSpecialDiscountAmount(product) > 0
  );
}
