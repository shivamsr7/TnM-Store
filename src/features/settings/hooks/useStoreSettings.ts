import { useQuery } from "@tanstack/react-query";
import { getStoreSettings } from "../services/storeSettings.service";

export function useStoreSettings() {
  return useQuery({
    queryKey: ["store-settings"],
    queryFn: getStoreSettings,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}