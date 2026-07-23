import { supabase } from "@/shared/lib/supabase";
import type { HeroBanner } from "../types/hero.types";

export async function getHeroBanners(): Promise<HeroBanner[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("position", "Homepage Hero")
    .eq("is_active", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("display_order", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}