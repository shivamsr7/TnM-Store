import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const IMAGEKIT_PRIVATE_KEY =
  Deno.env.get("IMAGEKIT_PRIVATE_KEY")!;

const IMAGEKIT_PUBLIC_KEY =
  Deno.env.get("IMAGEKIT_PUBLIC_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

async function generateSignature(
  token: string,
  expire: number,
  privateKey: string
) {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(privateKey),
    {
      name: "HMAC",
      hash: "SHA-1",
    },
    false,
    ["sign"]
  );

  const signatureBuffer =
    await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(`${token}${expire}`)
    );

  return Array.from(
    new Uint8Array(signatureBuffer)
  )
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

Deno.serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  // Only allow GET/POST
  if (
    req.method !== "GET" &&
    req.method !== "POST"
  ) {
    return new Response(
      JSON.stringify({
        error: "Method not allowed",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    if (
      !SUPABASE_URL ||
      !SUPABASE_ANON_KEY ||
      !IMAGEKIT_PRIVATE_KEY ||
      !IMAGEKIT_PUBLIC_KEY
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Required environment variables are missing",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    // Get the Supabase access token from the request.
    const authHeader =
      req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          error: "Authentication required",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    // Create a Supabase client using the user's
    // access token.
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the logged-in Supabase user.
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: "Invalid or expired session",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    /*
     * TnM Jewels admin architecture:
     *
     * Every authenticated Supabase Auth user is
     * currently an admin user.
     *
     * Therefore a valid authenticated session is
     * sufficient authorization for this endpoint.
     */

    // Generate a fresh one-time token.
    const token = crypto.randomUUID();

    // ImageKit requires expire to be less than
    // one hour in the future.
    //
    // 40 minutes gives us enough time for a normal
    // upload while remaining safely within the limit.
    const expire =
      Math.floor(Date.now() / 1000) + 2400;

    // ImageKit requires:
    // HMAC-SHA1(token + expire, privateKey)
    const signature =
      await generateSignature(
        token,
        expire,
        IMAGEKIT_PRIVATE_KEY
      );

    return new Response(
      JSON.stringify({
        token,
        expire,
        signature,
        publicKey: IMAGEKIT_PUBLIC_KEY,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "ImageKit authentication error:",
      error
    );

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : String(error),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }
});