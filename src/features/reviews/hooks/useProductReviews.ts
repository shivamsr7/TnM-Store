import { useQuery } from "@tanstack/react-query";

import { reviewService } from "../services/review.service";

export function useProductReviews(
  productId: string
) {
  return useQuery({
    queryKey: [
      "product-reviews",
      productId,
    ],

    queryFn: () =>
      reviewService.getProductReviews(
        productId
      ),

    enabled: Boolean(productId),

    staleTime: 5 * 60 * 1000,
  });
}