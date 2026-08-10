import {
  useQuery,
} from "@tanstack/react-query";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import {
  wishlistService,
} from "../services/wishlist.service";


export function useWishlist() {

  const {
    customer,
  } = useAuth();


  return useQuery({

    queryKey: [
      "wishlist",
      customer?.id,
    ],

    queryFn: () =>
      wishlistService.getWishlist(
        customer!.id
      ),

    enabled:
      Boolean(
        customer?.id
      ),

  });

}