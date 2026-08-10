import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import {
  notifyService,
} from "../services/notify.service";


/*
 * =========================================================
 * QUERY KEYS
 * =========================================================
 */

export const notifyKeys = {

  all: [
    "notify",
  ] as const,


  pending: (
    productId: string,
    customerId: string
  ) => [
    "notify",
    "pending",
    productId,
    customerId,
  ] as const,


  guestPending: (
    productId: string,
    phone: string
  ) => [
    "notify",
    "guest-pending",
    productId,
    phone,
  ] as const,

};


/*
 * =========================================================
 * CREATE NOTIFY REQUEST
 * =========================================================
 */

export function useCreateNotify() {

  return useMutation({

    mutationFn: async (
      values: {
        product_id: string;

        customer_id: string | null;

        name: string;

        email: string | null;

        phone: string;
      }
    ) => {

      try {

        return await notifyService.create(
          values
        );

      } catch (error) {

        /*
         * PostgreSQL duplicate-key error.
         *
         * This happens when the customer already has
         * a pending request for this product.
         */

        const code =
          (
            error as {
              code?: string;
            }
          )?.code;


        if (
          code === "23505"
        ) {

          const duplicateError =
            new Error(
              "NOTIFY_ALREADY_EXISTS"
            );


          (
            duplicateError as Error & {
              code?: string;
            }
          ).code =
            "23505";


          throw duplicateError;

        }


        throw error;

      }

    },

  });

}


/*
 * =========================================================
 * LOGGED-IN CUSTOMER CHECK
 * =========================================================
 */

export function useHasPendingNotify(

  productId: string,

  customerId:
    string | null

) {

  return useQuery({

    queryKey:
      notifyKeys.pending(

        productId,

        customerId ?? ""

      ),

    queryFn: () =>
      notifyService.hasPendingNotify(

        productId,

        customerId!

      ),

    enabled:
      Boolean(

        productId &&

        customerId

      ),

    staleTime:
      30_000,

  });

}


/*
 * =========================================================
 * GUEST CHECK
 * =========================================================
 */

export function useHasPendingGuestNotify(

  productId: string,

  phone: string

) {

  const normalizedPhone =
    phone.trim();


  return useQuery({

    queryKey:
      notifyKeys.guestPending(

        productId,

        normalizedPhone

      ),

    queryFn: () =>
      notifyService.hasPendingGuestRequest(

        productId,

        normalizedPhone

      ),

    enabled:
      Boolean(

        productId &&

        normalizedPhone

      ),

    staleTime:
      30_000,

  });

}