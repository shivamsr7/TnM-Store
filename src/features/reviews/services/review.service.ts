import {
  supabase,
} from "@/shared/lib/supabase";

import type {
  ProductReview,
} from "../types/review.types";


interface CreateReviewInput {
  product_id: string;

  customer_id: string | null;

  order_id: string | null;

  rating: number;

  title: string | null;

  review: string;

  status:
    | "pending"
    | "approved"
    | "rejected";

  is_verified: boolean;
}


class ReviewService {


  /*
   * =========================================================
   * GET APPROVED REVIEWS
   * =========================================================
   */

  async getProductReviews(
    productId: string
  ): Promise<ProductReview[]> {

    const {
      data,
      error,
    } = await supabase

      .from("reviews")

      .select(`
        id,
        product_id,
        customer_id,
        order_id,
        rating,
        title,
        review,
        status,
        is_verified,
        created_at,
        updated_at
      `)

      .eq(
        "product_id",
        productId
      )

      .eq(
        "status",
        "approved"
      )

      .order(
        "created_at",
        {
          ascending: false,
        }
      );


    if (
      error
    ) {

      throw error;

    }


    return (
      data ?? []
    ) as ProductReview[];

  }


  /*
   * =========================================================
   * CREATE REVIEW
   * =========================================================
   */

  async createReview(
    input: CreateReviewInput
  ): Promise<ProductReview> {

    const {
      data,
      error,
    } = await supabase

      .from("reviews")

      .insert({

        product_id:
          input.product_id,

        customer_id:
          input.customer_id,

        order_id:
          input.order_id,

        rating:
          input.rating,

        title:
          input.title,

        review:
          input.review,

        /*
         * Always pending when submitted
         * from the storefront.
         */

        status:
          "pending",

        /*
         * Never trust the browser
         * to verify a purchase.
         */

        is_verified:
          false,

      })

      .select(`
        id,
        product_id,
        customer_id,
        order_id,
        rating,
        title,
        review,
        status,
        is_verified,
        created_at,
        updated_at
      `)

      .single();


    if (
      error
    ) {

      throw error;

    }


    return (
      data
    ) as ProductReview;

  }

}


export const reviewService =
  new ReviewService();