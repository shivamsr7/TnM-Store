import { supabase } from "@/shared/lib/supabase";
import type { Category } from "../types/category.types";

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .is("parent_id", null)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}