import {
  useQuery,
} from "@tanstack/react-query";

import {
  shopService,
  type ShopCategory,
} from "../services/shop.service";


export function useShopCategories() {

  return useQuery<
    ShopCategory[],
    Error
  >({

    queryKey: [
      "shop",
      "categories",
    ],

    queryFn:
      shopService.getCategories,

    staleTime:
      5 * 60 * 1000,

  });

}