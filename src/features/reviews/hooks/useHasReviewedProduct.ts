import {
  useQuery,
} from "@tanstack/react-query";

import {
  reviewService,
} from "../services/review.service";


export function useHasReviewedProduct(
  productId: string,
  customerId?: string
) {

  return useQuery({

    queryKey: [
      "customer-product-review",
      customerId,
      productId,
    ],

    queryFn: () =>
      reviewService.hasCustomerReviewedProduct(
        productId
      ),

    enabled:
      Boolean(
        productId &&
        customerId
      ),

    staleTime:
      5 * 60 * 1000,

  });

}