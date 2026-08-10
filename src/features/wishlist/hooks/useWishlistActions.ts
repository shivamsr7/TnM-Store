import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import {
  wishlistService,
} from "../services/wishlist.service";


export function useWishlistActions() {

  const {
    customer,
  } = useAuth();


  const queryClient =
    useQueryClient();


  const addMutation =
    useMutation({

      mutationFn: (
        productId: string
      ) => {

        if (!customer?.id) {
          throw new Error(
            "Customer must be logged in"
          );
        }


        return wishlistService.add(
          customer.id,
          productId
        );

      },


      onSuccess: () => {

        queryClient.invalidateQueries({
          queryKey: [
            "wishlist",
            customer?.id,
          ],
        });

      },

    });


  const removeMutation =
    useMutation({

      mutationFn: (
        productId: string
      ) => {

        if (!customer?.id) {
          throw new Error(
            "Customer must be logged in"
          );
        }


        return wishlistService.remove(
          customer.id,
          productId
        );

      },


      onSuccess: () => {

        queryClient.invalidateQueries({
          queryKey: [
            "wishlist",
            customer?.id,
          ],
        });

      },

    });


  return {

    addToWishlist:
      addMutation.mutateAsync,

    removeFromWishlist:
      removeMutation.mutateAsync,

    isAdding:
      addMutation.isPending,

    isRemoving:
      removeMutation.isPending,

  };

}