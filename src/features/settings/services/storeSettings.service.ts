import { supabase } from "@/shared/lib/supabase";

export interface StoreSettings {

  // Spin
  spinEnabled: boolean;
  showSpinCard: boolean;
  spinCooldownHours: number;
  spinMaintenanceMessage: string | null;


  // Payment
  razorpayEnabled: boolean;
  razorpayKeyId: string | null;

  codEnabled: boolean;
  codAvailable: boolean;

  partialCodEnabled: boolean;
  partialCodAmount: number | null;
  partialCodMinOrder: number | null;
}



export async function getStoreSettings(): Promise<StoreSettings> {

  const { data, error } = await supabase
    .from("store_settings")
    .select(
      `
      spin_enabled,
      show_spin_card,
      spin_cooldown_hours,
      spin_maintenance_message,

      razorpay_enabled,
      razorpay_key_id,

      cod_enabled,
      cod_available,

      partial_cod_enabled,
      partial_cod_amount,
      partial_cod_min_order
      `
    )
    .single();


  if (error) {
    throw error;
  }



  return {

    // Spin

    spinEnabled:
      data.spin_enabled ?? true,

    showSpinCard:
      data.show_spin_card ?? true,

    spinCooldownHours:
      data.spin_cooldown_hours ?? 24,

    spinMaintenanceMessage:
      data.spin_maintenance_message ??
      "The Spin Wheel is temporarily unavailable.",



    // Payment

    razorpayEnabled:
      data.razorpay_enabled ?? true,


    razorpayKeyId:
      data.razorpay_key_id ?? null,


    codEnabled:
      data.cod_enabled ?? false,


    codAvailable:
      data.cod_available ?? false,


    partialCodEnabled:
      data.partial_cod_enabled ?? false,


    partialCodAmount:
      data.partial_cod_amount ?? null,


    partialCodMinOrder:
      data.partial_cod_min_order ?? null,

  };

}