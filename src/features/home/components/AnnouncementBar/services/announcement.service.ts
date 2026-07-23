import { supabase } from "@/shared/lib/supabase";

export interface Announcement {
  id: string;
  message: string;
  is_active: boolean;
  display_order: number;
}

export const announcementService = {
  async getAll(): Promise<Announcement[]> {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      throw error;
    }

    return data ?? [];
  },
};