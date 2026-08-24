import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/shared/lib/supabase";


export interface ContactSettings {
  supportEmail: string;
  businessEmail: string;
  phone: string;
  whatsapp: string;
  address: string;

  instagram: string;
}


export function useContactSettings() {

  return useQuery<ContactSettings>({
    queryKey: [
      "contact-settings",
    ],

    queryFn: async () => {

      const {
        data,
        error,
      } = await supabase

        .from("store_settings")

        .select(`
          support_email,
          business_email,
          phone,
          whatsapp,
          address,
          instagram
        `)

        .single();


      if (error) {
        throw error;
      }


      return {
        supportEmail:
          data?.support_email ??
          "",

        businessEmail:
          data?.business_email ??
          "",

        phone:
          data?.phone ??
          "",

        whatsapp:
          data?.whatsapp ??
          "",

        address:
          data?.address ??
          "",

        instagram:
          data?.instagram ??
          "",
      };

    },

    staleTime:
      5 * 60 * 1000,

  });

}