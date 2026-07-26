import { useQuery } from "@tanstack/react-query";
import { getHeroSettings } from "../api/heroSettings.api";

export function useHeroSettings() {
  return useQuery({
    queryKey: ["hero-settings"],
    queryFn: getHeroSettings,
    staleTime: 1000 * 60 * 10,
  });
}