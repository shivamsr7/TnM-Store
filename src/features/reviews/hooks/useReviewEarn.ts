import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import {
  reviewEarnService,
} from "../services/reviewEarn.service";


export function useReviewEarnItems() {
  return useQuery({
    queryKey: [
      "customer",
      "review-earn",
    ],
    queryFn:
      reviewEarnService.getPendingReviews,
    staleTime: 60_000,
  });
}


export function useCreateReviewEarnToken() {
  return useMutation({
    mutationFn:
      reviewEarnService.createReviewToken,
  });
}
