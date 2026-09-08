import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const IMAGEKIT_PRIVATE_KEY = Deno.env.get("IMAGEKIT_PRIVATE_KEY")!;
const IMAGEKIT_PUBLIC_KEY = Deno.env.get("IMAGEKIT_PUBLIC_KEY")!;
const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const isSupabaseUrl = (url: string | null | undefined) =>
  Boolean(url && url.includes(".supabase.co/storage/v1/object/"));

const isImageKitUrl = (url: string | null | undefined) =>
  Boolean(url && url.includes("ik.imagekit.io/"));

async function getImageKitAuth() {
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 2400;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(IMAGEKIT_PRIVATE_KEY),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(token + expire),
  );
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return { token, expire, signature };
}

async function uploadToImageKit(blob: Blob, fileName: string) {
  const auth = await getImageKitAuth();
  const form = new FormData();
  form.append("file", blob, fileName);
  form.append("fileName", fileName);
  form.append("publicKey", IMAGEKIT_PUBLIC_KEY);
  form.append("signature", auth.signature);
  form.append("expire", String(auth.expire));
  form.append("token", auth.token);
  form.append("useUniqueFileName", "true");
  form.append("folder", "instagram-reviews");

  const response = await fetch(IMAGEKIT_UPLOAD_URL, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    throw new Error(`ImageKit upload failed (${response.status}): ${await response.text()}`);
  }

  return await response.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "AUTH_REQUIRED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "UNAUTHORIZED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body?.limit ?? 10), 1), 100);

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: reviews, error: reviewsError } = await admin
      .from("instagram_customer_reviews")
      .select("id, customer_name, screenshot_url, screenshot_path")
      .order("created_at", { ascending: true })
      .limit(limit);

    if (reviewsError) throw reviewsError;

    let migrated = 0;
    let failed = 0;
    let alreadyMigrated = 0;
    let skipped = 0;
    const details: unknown[] = [];

    for (const review of reviews ?? []) {
      try {
        if (isImageKitUrl(review.screenshot_url) &&
            review.screenshot_path?.startsWith("imagekit:")) {
          alreadyMigrated++;
          details.push({ id: review.id, status: "already_imagekit" });
          continue;
        }

        if (!isSupabaseUrl(review.screenshot_url)) {
          skipped++;
          details.push({ id: review.id, status: "skipped", reason: "not_supabase_url" });
          continue;
        }

        const imageResponse = await fetch(review.screenshot_url);
        if (!imageResponse.ok) {
          throw new Error(`Could not download Supabase image (${imageResponse.status})`);
        }

        const fileName =
          review.screenshot_path?.split("/").pop() ||
          `instagram-review-${review.id}.jpg`;

        const uploadResult = await uploadToImageKit(
          await imageResponse.blob(),
          fileName,
        );

        if (!uploadResult?.url || !uploadResult?.fileId) {
          throw new Error("ImageKit returned an invalid upload response.");
        }

        const imagekitPath = `imagekit:${uploadResult.fileId}`;

        const { error: updateError } = await admin
          .from("instagram_customer_reviews")
          .update({
            screenshot_url: uploadResult.url,
            screenshot_path: imagekitPath,
          })
          .eq("id", review.id);

        if (updateError) throw updateError;

        migrated++;
        details.push({
          id: review.id,
          customerName: review.customer_name,
          status: "migrated",
          imagekitUrl: uploadResult.url,
          imagekitPath,
        });
      } catch (error) {
        failed++;
        details.push({
          id: review.id,
          customerName: review.customer_name,
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: reviews?.length ?? 0,
        migrated,
        failed,
        alreadyMigrated,
        skipped,
        details,
        message: `Processed ${reviews?.length ?? 0} Instagram review(s).`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
