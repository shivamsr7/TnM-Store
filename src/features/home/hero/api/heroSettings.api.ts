import { supabase } from "@/shared/lib/supabase";
import type { HeroSettings } from "../types/heroSettings.types";

export async function getHeroSettings(): Promise<HeroSettings | null> {
  const { data, error } = await supabase
    .from("hero_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data;
}