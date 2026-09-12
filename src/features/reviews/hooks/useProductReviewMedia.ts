import {
  useQuery,
} from "@tanstack/react-query";

import {
  reviewMediaService,
} from "../services/reviewMedia.service";


export function useProductReviewMedia(
  reviewIds: string[]
) {

  return useQuery({

    queryKey: [
      "product-review-media",
      reviewIds,
    ],

    queryFn: () =>
      reviewMediaService.getByReviewIds(
        reviewIds
      ),

    enabled:
      reviewIds.length > 0,

    staleTime:
      5 * 60 * 1000,

  });

}