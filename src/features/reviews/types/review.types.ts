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