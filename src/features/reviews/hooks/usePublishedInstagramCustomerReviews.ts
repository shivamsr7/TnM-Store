import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";

export interface InstagramCustomerReview {
  id: string;
  customer_name: string;
  instagram_username: string | null;
  review_text: string | null;
  rating: number;
  screenshot_url: string;
  screenshot_path: string;
  product_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function usePublishedInstagramCustomerReviews() {
  return useQuery({
    queryKey: ["instagram-customer-reviews", "published"],
    queryFn: async (): Promise<InstagramCustomerReview[]> => {
      const { data, error } = await supabase
        .from("instagram_customer_reviews")
        .select("*")
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });
}