import { supabase } from "@/shared/lib/supabase";

/**
 * ============================================================
 * T&M JEWELS — MOMENTS SERVICE
 * ============================================================
 *
 * Handles creation and retrieval of secure personalized
 * Moments.
 *
 * IMPORTANT:
 * - Raw tokens are generated client-side using Web Crypto.
 * - Only the SHA-256 hash is stored in Supabase.
 * - The raw token becomes the private URL.
 * - Moment creation happens through the protected RPC.
 */


/* ============================================================
   TYPES
============================================================ */

export type MomentOccasion =
  | "anniversary"
  | "birthday"
  | "valentines"
  | "mothers_day"
  | "raksha_bandhan"
  | "engagement"
  | "congratulations"
  | "just_because";


export interface CreateMomentInput {
  orderId?: string | null;

  productId?: string | null;

  occasion?: MomentOccasion;

  templateKey?: string;

  recipientName?: string | null;

  senderName?: string | null;

  personalMessage?: string | null;

  expiresAt?: string | null;

  metadata?: Record<string, unknown>;
}


export interface CreatedMoment {
  id: string;

  token: string;

  url: string;

  occasion: MomentOccasion;

  templateKey: string;
}


export interface MomentData {
  id: string;

  occasion: MomentOccasion;

  template_key: string;

  recipient_name: string | null;

  sender_name: string | null;

  personal_message: string | null;

  product_id: string | null;

  metadata: Record<string, unknown>;
}


/* ============================================================
   CONSTANTS
============================================================ */

const MOMENT_BASE_PATH = "/moments";


/* ============================================================
   TOKEN GENERATION
============================================================ */

/**
 * Generates a cryptographically secure random token.
 *
 * 32 random bytes = 256 bits of entropy.
 *
 * The token is encoded as URL-safe hexadecimal.
 */
function generateSecureToken(): string {
  if (
    typeof crypto === "undefined" ||
    !crypto.getRandomValues
  ) {
    throw new Error(
      "Secure random number generation is not available."
    );
  }


  const bytes =
    new Uint8Array(32);


  crypto.getRandomValues(
    bytes
  );


  return Array.from(bytes)
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, "0")
    )
    .join("");
}


/* ============================================================
   TOKEN HASHING
============================================================ */

/**
 * Hashes the raw token using SHA-256.
 *
 * Supabase stores this hash, never the raw token.
 */
async function hashToken(
  token: string
): Promise<string> {

  if (
    typeof crypto === "undefined" ||
    !crypto.subtle
  ) {
    throw new Error(
      "Web Crypto API is not available."
    );
  }


  const data =
    new TextEncoder().encode(
      token
    );


  const digest =
    await crypto.subtle.digest(
      "SHA-256",
      data
    );


  return Array.from(
    new Uint8Array(digest)
  )
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, "0")
    )
    .join("");
}


/* ============================================================
   URL BUILDER
============================================================ */

function buildMomentUrl(
  token: string
): string {

  if (
    typeof window === "undefined"
  ) {
    return `${MOMENT_BASE_PATH}/${token}`;
  }


  return new URL(
    `${MOMENT_BASE_PATH}/${token}`,
    window.location.origin
  ).toString();
}


/* ============================================================
   CREATE MOMENT
============================================================ */

async function createMoment(
  input: CreateMomentInput
): Promise<CreatedMoment> {

  /*
   * Generate the raw token locally.
   *
   * This token is NEVER stored in Supabase.
   */
  const rawToken =
    generateSecureToken();


  /*
   * Only the SHA-256 hash is sent to Supabase.
   */
  const tokenHash =
    await hashToken(
      rawToken
    );


  const occasion =
    input.occasion ??
    "anniversary";


  const templateKey =
    input.templateKey ??
    "anniversary_love_letter";


  /*
   * IMPORTANT:
   *
   * Do NOT insert directly into public.moments.
   *
   * Direct INSERT is intentionally blocked by RLS/privileges.
   *
   * Creation goes through the protected SECURITY DEFINER RPC.
   */
  const {
    data,
    error,
  } = await supabase.rpc(
    "create_moment",
    {
      p_order_id:
        input.orderId ?? null,

      p_product_id:
        input.productId ?? null,

      p_occasion:
        occasion,

      p_template_key:
        templateKey,

      p_recipient_name:
        input.recipientName?.trim() ||
        null,

      p_sender_name:
        input.senderName?.trim() ||
        null,

      p_personal_message:
        input.personalMessage?.trim() ||
        null,

      p_token_hash:
        tokenHash,

      p_expires_at:
        input.expiresAt ?? null,

      p_metadata:
        input.metadata ?? {},
    }
  );


  if (error) {

    console.error(
      "Moment creation failed:",
      error
    );

    throw new Error(
      error.message ||
      "Unable to create Moment."
    );
  }


  /*
   * create_moment() returns only the new UUID.
   */
  if (!data) {

    throw new Error(
      "Moment was created but no ID was returned."
    );
  }


  return {
    id:
      data as string,

    token:
      rawToken,

    url:
      buildMomentUrl(
        rawToken
      ),

    occasion,

    templateKey,
  };
}


/* ============================================================
   GET MOMENT
============================================================ */

async function getMomentByToken(
  token: string
): Promise<MomentData | null> {

  const cleanToken =
    token?.trim();


  if (
    !cleanToken ||
    cleanToken.length < 32
  ) {
    return null;
  }


  const {
    data,
    error,
  } = await supabase.rpc(
    "get_moment_by_token",
    {
      p_token:
        cleanToken,
    }
  );


  if (error) {

    console.error(
      "Moment lookup failed:",
      error
    );

    return null;
  }


  if (!data) {
    return null;
  }


  return data as MomentData;
}


/* ============================================================
   TRACK MOMENT EVENT
============================================================ */

async function trackMomentEvent(
  token: string,
  eventType: string,
  eventData: Record<string, unknown> = {}
): Promise<boolean> {

  const cleanToken =
    token?.trim();


  if (
    !cleanToken ||
    cleanToken.length < 32
  ) {
    return false;
  }


  const {
    data,
    error,
  } = await supabase.rpc(
    "track_moment_event",
    {
      p_token:
        cleanToken,

      p_event_type:
        eventType,

      p_event_data:
        eventData,
    }
  );


  if (error) {

    console.error(
      "Moment event tracking failed:",
      error
    );

    return false;
  }


  return data === true;
}


/* ============================================================
   PUBLIC SERVICE
============================================================ */

export const momentsService = {
  createMoment,

  getMomentByToken,

  trackMomentEvent,
};