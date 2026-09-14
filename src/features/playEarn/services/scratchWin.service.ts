import { supabase } from "@/shared/lib/supabase";


/* ============================================================
   TYPES
============================================================ */

export interface ScratchWinResult {
  success: boolean;

  play_id: string;

  play_number: number;

  reward_paise: number;

  reward_inr: number;

  reward_label: string;

  is_win: boolean;

  expires_at: string | null;

  remaining_plays: number;

  already_played?: boolean;
}


/* ============================================================
   PLAY SCRATCH & WIN
============================================================ */

export async function playScratchWin(): Promise<ScratchWinResult> {

  const {
    data,
    error,
  } = await supabase.rpc(
    "play_scratch_win"
  );


  if (error) {
    throw new Error(
      error.message ||
        "Unable to play Scratch & Win"
    );
  }


  if (!data) {
    throw new Error(
      "No Scratch & Win result received"
    );
  }


  return data as ScratchWinResult;
}


/* ============================================================
   GET TODAY'S RESULT
============================================================ */

export async function getMyScratchWinToday(): Promise<
  ScratchWinResult | null
> {

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_my_scratch_win_today"
  );


  if (error) {
    throw new Error(
      error.message ||
        "Unable to load today's Scratch & Win result"
    );
  }


  if (!data) {
    return null;
  }


  return data as ScratchWinResult;
}