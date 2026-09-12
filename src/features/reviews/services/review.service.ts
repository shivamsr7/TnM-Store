import {
  supabase,
} from "@/shared/lib/supabase";

import type {
  ProductReview,
  ReviewRequestResponse,
  SubmitTokenReviewInput,
  SubmitTokenReviewResponse,
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
   *
   * Returns only approved reviews for the public
   * product page.
   *
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
   * CHECK WHETHER CURRENT CUSTOMER HAS REVIEWED PRODUCT
   * =======================================================
   *
   * This is used by the product page to decide whether
   * to show:
   *
   *   "Write a Review"
   *
   * or:
   *
   *   "Already Reviewed"
   *
   * IMPORTANT:
   *
   * This checks for ANY existing review belonging to the
   * current authenticated customer.
   *
   * Therefore:
   *
   * - pending  -> already reviewed
   * - approved -> already reviewed
   * - rejected -> already reviewed
   *
   * The database remains the final authority for preventing
   * duplicate reviews.
   *
   * =======================================================
   */

  async hasCustomerReviewedProduct(
    productId: string
  ): Promise<boolean> {

    if (
      !productId ||
      !productId.trim()
    ) {

      return false;

    }


    const {
      data,
      error,
    } = await supabase.rpc(
      "has_customer_reviewed_product",
      {
        p_product_id:
          productId,
      }
    );


    if (error) {

      console.error(
        "Check customer review status failed:",
        error
      );

      throw error;

    }


    return Boolean(
      data
    );

  }


  /*
   * =======================================================
   * CREATE NORMAL PRODUCT REVIEW
   * =======================================================
   *
   * Existing logged-in review flow.
   *
   * DO NOT CHANGE.
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


  /*
   * =======================================================
   * GET REVIEW REQUEST
   * =======================================================
   *
   * Secure email-review flow.
   *
   * The customer does NOT need to be logged in.
   *
   * The database validates:
   *
   * - token
   * - token expiry
   * - order
   * - delivery status
   * - 24 hour wait
   * - product slug
   * - previous review
   *
   * =======================================================
   */

  async getReviewRequest(
    token: string,
    productSlug: string
  ): Promise<ReviewRequestResponse> {

    const {
      data,
      error,
    } = await supabase.rpc(
      "get_review_request_by_token",
      {
        p_token:
          token,

        p_product_slug:
          productSlug,
      }
    );


    if (error) {

      console.error(
        "Get review request failed:",
        error
      );

      throw error;

    }


    return data as ReviewRequestResponse;

  }


  /*
   * =======================================================
   * SUBMIT REVIEW FROM EMAIL TOKEN
   * =======================================================
   */

  async submitReviewFromToken(
    input: SubmitTokenReviewInput
  ): Promise<SubmitTokenReviewResponse> {

    const {
      data,
      error,
    } = await supabase.rpc(
      "submit_review_from_token",
      {
        p_token:
          input.token,

        p_product_slug:
          input.productSlug,

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
        "Submit token review failed:",
        error
      );

      throw error;

    }


    return data as SubmitTokenReviewResponse;

  }

}


/*
 * =========================================================
 * EXPORT
 * =========================================================
 */

export const reviewService =
  new ReviewService();