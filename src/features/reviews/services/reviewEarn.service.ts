import { supabase } from "@/shared/lib/supabase";

export type ReviewEarnItem = {
  orderId: string;
  orderNumber: string | null;
  deliveredAt: string;
  productId: string;
  productName: string;
  productImage: string | null;
  productSlug: string;
};

export const reviewEarnService = {

  async getPendingReviews(): Promise<ReviewEarnItem[]> {

    const {
      data,
      error,
    } = await supabase.rpc(
      "customer_get_review_earn_items"
    );

    if (error) {
      throw error;
    }

    return Array.isArray(data)
      ? (data as ReviewEarnItem[])
      : [];
  },

  async createReviewToken(
    productId: string
  ) {

    const {
      data,
      error,
    } = await supabase.rpc(
      "customer_create_review_earn_token",
      {
        p_product_id: productId,
      }
    );

    if (error) {
      throw error;
    }

    if (
      !data?.token ||
      !data?.productSlug
    ) {
      throw new Error(
        "Review token was not created."
      );
    }

    return {
      token: String(data.token),
      productSlug: String(
        data.productSlug
      ),
      expiresAt:
        data.expiresAt
          ? String(data.expiresAt)
          : null,
    };
  },
};
