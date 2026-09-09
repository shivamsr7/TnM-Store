export interface ProductReview {
  id: string;
  product_id: string;
  customer_id: string | null;
  order_id: string | null;
  rating: number;
  title: string | null;
  review: string;
  status: "pending" | "approved" | "rejected";
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}


/*
 * =========================================================
 * REVIEW REQUEST PRODUCT
 * =========================================================
 */

export interface ReviewRequestProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: number | null;
}


/*
 * =========================================================
 * REVIEW REQUEST RESPONSE
 * =========================================================
 */

export interface ReviewRequestResponse {
  valid: boolean;
  alreadyReviewed?: boolean;
  reason?: string;
  availableAt?: string;
  product?: ReviewRequestProduct;
}


/*
 * =========================================================
 * TOKEN REVIEW SUBMISSION
 * =========================================================
 */

export interface SubmitTokenReviewInput {
  token: string;
  productSlug: string;
  rating: number;
  title: string | null;
  review: string;
}


export interface SubmitTokenReviewResponse {
  success: boolean;
  reviewId: string;
  productId: string;
  orderId: string;
}