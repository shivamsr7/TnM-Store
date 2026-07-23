import { useQuery } from "@tanstack/react-query";
import { getHeroBanners } from "../api/hero.api";

export function useHeroBanners() {
  return useQuery({
    queryKey: ["hero-banners"],
    queryFn: getHeroBanners,
    staleTime: 1000 * 60 * 5,
  });
}