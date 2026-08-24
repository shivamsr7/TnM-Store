import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";

export function useWhatsAppNumber() {
  return useQuery({
    queryKey: ["store-settings", "whatsapp"],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("whatsapp")
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data?.whatsapp ?? "";
    },

    staleTime: 5 * 60 * 1000,
  });
}