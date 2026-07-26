import { supabase } from "@/shared/lib/supabase";

import type {
  Subcategory,
} from "../types/subcategory.types";


export async function getSubcategories(): Promise<Subcategory[]> {

  const {
    data,
    error,
  } = await supabase

    .from("subcategories")

    .select("*")

    .eq(
      "is_active",
      true
    )

    .order(
      "sort_order",
      {
        ascending: true,
      }
    );


  if (error) {

    throw error;

  }


  return data ?? [];

}