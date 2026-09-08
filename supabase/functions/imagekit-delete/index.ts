import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    // --------------------------------------------------
    // 1. Require authentication
    // --------------------------------------------------

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: "Authentication required",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // --------------------------------------------------
    // 2. Verify Supabase user
    // --------------------------------------------------

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase environment variables are missing");
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: "Invalid or expired authentication",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // --------------------------------------------------
    // 3. Get ImageKit private key
    // --------------------------------------------------

    const privateKey = Deno.env.get("IMAGEKIT_PRIVATE_KEY");

    if (!privateKey) {
      throw new Error("IMAGEKIT_PRIVATE_KEY is not configured");
    }

    // --------------------------------------------------
    // 4. Read fileId
    // --------------------------------------------------

    const body = await req.json();

    const fileId = body?.fileId;

    if (!fileId || typeof fileId !== "string") {
      return new Response(
        JSON.stringify({
          error: "fileId is required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // --------------------------------------------------
    // 5. Delete from ImageKit
    // --------------------------------------------------

    const imageKitResponse = await fetch(
      "https://api.imagekit.io/v1/files/batch/deleteByFileIds",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            btoa(`${privateKey}:`),
        },
        body: JSON.stringify({
          fileIds: [fileId],
        }),
      }
    );

    const responseText = await imageKitResponse.text();

    let responseData: unknown;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = {
        raw: responseText,
      };
    }

    if (!imageKitResponse.ok) {
      console.error(
        "ImageKit delete failed:",
        imageKitResponse.status,
        responseData
      );

      return new Response(
        JSON.stringify({
          error: "Failed to delete file from ImageKit",
          details: responseData,
        }),
        {
          status: imageKitResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // --------------------------------------------------
    // 6. Success
    // --------------------------------------------------

    return new Response(
      JSON.stringify({
        success: true,
        fileId,
        result: responseData,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("imagekit-delete error:", error);

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});