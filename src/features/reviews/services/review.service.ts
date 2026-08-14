import {
  supabase,
} from "@/shared/lib/supabase";

import type {
  ProductReview,
} from "../types/review.types";


/*
 * =========================================================
 * CREATE REVIEW INPUT
 * =========================================================
 */

interface CreateReviewInput {

  product_id: string;

  customer_id: string;

  rating: number;

  title: string | null;

  review: string;

}


/*
 * =========================================================
 * REVIEW SERVICE
 * =========================================================
 */

class ReviewService {


  /*
   * =======================================================
   * GET PRODUCT REVIEWS
   * =======================================================
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


    if (error) {

      throw error;

    }


    return (
      data ?? []
    ) as ProductReview[];

  }


  /*
   * =======================================================
   * CREATE REVIEW
   * =======================================================
   *
   * IMPORTANT:
   *
   * customer_id is supplied from the current development
   * AuthContext.
   *
   * order_id and is_verified are NEVER supplied here.
   *
   * The database RPC determines them.
   *
   * =======================================================
   */

  async createReview(
    input: CreateReviewInput
  ): Promise<ProductReview> {

    const {
      data,
      error,
    } = await supabase.rpc(
      "create_product_review",
      {
        p_product_id:
          input.product_id,

        p_customer_id:
          input.customer_id,

        p_rating:
          input.rating,

        p_title:
          input.title,

        p_review:
          input.review,
      }
    );


    if (error) {

      console.error(
        "Create product review failed:",
        error
      );

      throw error;

    }


    return data as ProductReview;

  }

}


/*
 * =========================================================
 * EXPORT
 * =========================================================
 */

export const reviewService =
  new ReviewService();