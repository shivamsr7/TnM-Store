import { supabase } from "@/shared/lib/supabase";

export interface StoreSettings {
  spinEnabled: boolean;
  showSpinCard: boolean;
  spinCooldownHours: number;
  spinMaintenanceMessage: string | null;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const { data, error } = await supabase
    .from("store_settings")
    .select(
      `
      spin_enabled,
      show_spin_card,
      spin_cooldown_hours,
      spin_maintenance_message
      `
    )
    .single();

  if (error) {
    throw error;
  }

  return {
    spinEnabled: data.spin_enabled ?? true,
    showSpinCard: data.show_spin_card ?? true,
    spinCooldownHours: data.spin_cooldown_hours ?? 24,
    spinMaintenanceMessage:
      data.spin_maintenance_message ??
      "The Spin Wheel is temporarily unavailable.",
  };
}