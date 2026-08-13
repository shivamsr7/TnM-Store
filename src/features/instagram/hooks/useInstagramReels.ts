import {
  useQuery,
} from "@tanstack/react-query";

import {
  supabase,
} from "@/shared/lib/supabase";

import type {
  InstagramReelsResponse,
} from "../types/instagram.types";


/*
 * =========================================================
 * CONSTANTS
 * =========================================================
 */

const INSTAGRAM_FUNCTION_NAME =
  "instagram-reels";


/*
 * =========================================================
 * FETCH INSTAGRAM REELS
 * =========================================================
 */

async function fetchInstagramReels(): Promise<
  InstagramReelsResponse
> {

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    INSTAGRAM_FUNCTION_NAME
  );


  if (error) {

    console.error(
      "Instagram reels fetch error:",
      error
    );

    throw error;

  }


  if (!data) {

    throw new Error(
      "Instagram reels response is empty."
    );

  }


  if (
    !data.success
  ) {

    throw new Error(
      data.error ??
      "Unable to load Instagram reels."
    );

  }


  return data as InstagramReelsResponse;

}


/*
 * =========================================================
 * HOOK
 * =========================================================
 */

export function useInstagramReels() {

  return useQuery({

    queryKey: [
      "instagram",
      "reels",
    ],

    queryFn:
      fetchInstagramReels,

    /*
     * Instagram doesn't need
     * to be fetched on every render.
     */

    staleTime:
      5 * 60 * 1000,

    gcTime:
      30 * 60 * 1000,

    retry: 1,

    refetchOnWindowFocus:
      false,

  });

}