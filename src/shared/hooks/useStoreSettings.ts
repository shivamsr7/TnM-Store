import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/shared/lib/supabase";


export interface StoreSocialSettings {
  instagram: string;
  facebook: string;
  whatsapp: string;
}


export function useStoreSettings() {

  return useQuery<StoreSocialSettings>({

    /*
     * IMPORTANT:
     * Do NOT use ["store-settings"] here.
     *
     * Other components use that key for different
     * store_settings queries.
     *
     * This dedicated key prevents React Query
     * from returning the wrong cached data.
     */

    queryKey: [
      "store-settings",
      "social",
    ],


    queryFn: async () => {

      const {
        data,
        error,
      } = await supabase

        .from(
          "store_settings"
        )

        .select(
          "instagram, facebook, whatsapp"
        )

        .single();


      if (error) {

        throw error;

      }


      return {

        instagram:
          data?.instagram ?? "",

        facebook:
          data?.facebook ?? "",

        whatsapp:
          data?.whatsapp ?? "",

      };

    },


    staleTime:
      5 * 60 * 1000,

  });

}