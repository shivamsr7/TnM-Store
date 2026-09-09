import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import {
  reviewService,
} from "../services/review.service";

import type {
  SubmitTokenReviewInput,
} from "../types/review.types";


/*
 * =========================================================
 * GET REVIEW REQUEST
 * =========================================================
 */

export function useReviewRequest(
  token: string,
  productSlug: string
) {

  return useQuery({

    queryKey: [
      "review-request",
      token,
      productSlug,
    ],

    queryFn: () =>
      reviewService.getReviewRequest(
        token,
        productSlug
      ),

    enabled:
      Boolean(token) &&
      Boolean(productSlug),

    retry: false,

    staleTime: 0,

  });

}


/*
 * =========================================================
 * SUBMIT REVIEW
 * =========================================================
 */

export function useSubmitReviewFromToken() {

  return useMutation({

    mutationFn: (
      input: SubmitTokenReviewInput
    ) =>
      reviewService.submitReviewFromToken(
        input
      ),

  });

}