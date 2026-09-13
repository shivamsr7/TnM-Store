import { supabase } from "@/shared/lib/supabase";

export interface ThreeNumbersPlayResult {
  play_id: string;
  number_1: number;
  number_2: number;
  number_3: number;
  is_win: boolean;
  reward_paise: number;
  already_played: boolean;
  remaining_chances: number;
}

export interface ThreeNumbersTodayStats {
  total_plays: number;
  remaining_chances: number;
  last_play_id: string | null;
  last_number_1: number | null;
  last_number_2: number | null;
  last_number_3: number | null;
  last_is_win: boolean | null;
  last_reward_paise: number;
}

export const threeNumbersService = {
  async play(): Promise<ThreeNumbersPlayResult> {
    const { data, error } = await supabase.rpc("play_three_numbers");

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("No result returned from 3 Numbers game.");
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (!result) {
      throw new Error("Invalid result returned from 3 Numbers game.");
    }

    return {
      play_id: result.play_id,
      number_1: Number(result.number_1),
      number_2: Number(result.number_2),
      number_3: Number(result.number_3),
      is_win: Boolean(result.is_win),
      reward_paise: Number(result.reward_paise ?? 0),
      already_played: Boolean(result.already_played),
      remaining_chances: Number(result.remaining_chances ?? 0),
    };
  },

  async getTodayStats(): Promise<ThreeNumbersTodayStats> {
    const { data, error } = await supabase.rpc(
      "get_my_three_numbers_today_stats"
    );

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Unable to load today's game status.");
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (!result) {
      return {
        total_plays: 0,
        remaining_chances: 5,
        last_play_id: null,
        last_number_1: null,
        last_number_2: null,
        last_number_3: null,
        last_is_win: null,
        last_reward_paise: 0,
      };
    }

    return {
      total_plays: Number(result.total_plays ?? 0),
      remaining_chances: Number(result.remaining_chances ?? 0),
      last_play_id: result.last_play_id ?? null,
      last_number_1:
        result.last_number_1 !== null && result.last_number_1 !== undefined
          ? Number(result.last_number_1)
          : null,
      last_number_2:
        result.last_number_2 !== null && result.last_number_2 !== undefined
          ? Number(result.last_number_2)
          : null,
      last_number_3:
        result.last_number_3 !== null && result.last_number_3 !== undefined
          ? Number(result.last_number_3)
          : null,
      last_is_win:
        result.last_is_win !== null && result.last_is_win !== undefined
          ? Boolean(result.last_is_win)
          : null,
      last_reward_paise: Number(result.last_reward_paise ?? 0),
    };
  },
};