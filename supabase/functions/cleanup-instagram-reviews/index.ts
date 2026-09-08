import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

const batch = <T>(items: T[], size: number) => {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
};

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
    const confirmDelete = body?.confirmDelete === true;

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: reviews, error: reviewsError } = await admin
      .from("instagram_customer_reviews")
      .select("id, customer_name, screenshot_url, screenshot_path");

    if (reviewsError) throw reviewsError;

    const supabaseReferences = (reviews ?? [])
      .filter((r) => isSupabaseUrl(r.screenshot_url))
      .map((r) => ({
        id: r.id,
        customerName: r.customer_name,
        screenshotUrl: r.screenshot_url,
      }));

    const nonImageKitImages = (reviews ?? [])
      .filter((r) => r.screenshot_url && !isImageKitUrl(r.screenshot_url))
      .map((r) => ({
        id: r.id,
        customerName: r.customer_name,
        screenshotUrl: r.screenshot_url,
      }));

    const legacyStoragePaths = (reviews ?? [])
      .filter((r) => !r.screenshot_path || !r.screenshot_path.startsWith("imagekit:"))
      .map((r) => ({
        id: r.id,
        customerName: r.customer_name,
        screenshotPath: r.screenshot_path,
      }));

    const imageKitPaths = (reviews ?? [])
      .map((r) => r.screenshot_path)
      .filter((path): path is string => Boolean(path?.startsWith("imagekit:")));

    const duplicateMap = new Map<string, number>();
    for (const path of imageKitPaths) {
      duplicateMap.set(path, (duplicateMap.get(path) ?? 0) + 1);
    }

    const duplicateImageKitPaths = [...duplicateMap.entries()]
      .filter(([, count]) => count > 1)
      .map(([path]) => path);

    const { data: files, error: listError } = await admin.storage
      .from("media")
      .list("instagram-reviews", {
        limit: 1000,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    if (listError) throw listError;

    const supabaseFiles = (files ?? [])
      .filter((file) => file.name !== ".emptyFolderPlaceholder")
      .map((file) => ({
        folder: "instagram-reviews",
        name: file.name,
        path: `instagram-reviews/${file.name}`,
      }));

    const safetyCheckPassed =
      supabaseReferences.length === 0 &&
      nonImageKitImages.length === 0 &&
      legacyStoragePaths.length === 0 &&
      duplicateImageKitPaths.length === 0;

    const filesReadyForDeletion = safetyCheckPassed
      ? supabaseFiles.length
      : 0;

    const base = {
      success: true,
      dryRun: !confirmDelete,
      safetyCheckPassed,
      reviews: reviews?.length ?? 0,
      databaseReviewImages: reviews?.length ?? 0,
      supabaseReferencedImages: supabaseReferences.length,
      nonImageKitImages: nonImageKitImages.length,
      legacyStoragePaths: legacyStoragePaths.length,
      uniqueImageKitPaths: new Set(imageKitPaths).size,
      duplicateImageKitPaths,
      supabaseFiles: supabaseFiles.length,
      reviewSupabaseFiles: supabaseFiles.length,
      filesReadyForDeletion,
      affectedImages: 0,
      files: supabaseFiles,
      supabaseReferences,
      nonImageKitImageDetails: nonImageKitImages,
      legacyStoragePathDetails: legacyStoragePaths,
      attempted: 0,
      deleted: 0,
      failed: 0,
      failedFiles: [] as unknown[],
    };

    if (!safetyCheckPassed) {
      return new Response(
        JSON.stringify({
          ...base,
          message: "Safety check failed. No Supabase files were deleted.",
          reason: "One or more Instagram review screenshots are not fully migrated to ImageKit.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!confirmDelete || supabaseFiles.length === 0) {
      return new Response(
        JSON.stringify({
          ...base,
          message: supabaseFiles.length
            ? `Safety check passed. ${supabaseFiles.length} old Supabase file(s) are ready for deletion.`
            : "Safety check passed. No old Supabase Instagram review files remain.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let deleted = 0;
    let failed = 0;
    const failedFiles: unknown[] = [];

    for (const filesBatch of batch(
      supabaseFiles.map((file) => file.path),
      100,
    )) {
      const { data, error } = await admin.storage
        .from("media")
        .remove(filesBatch);

      if (error) {
        failed += filesBatch.length;
        failedFiles.push({
          files: filesBatch,
          error: error.message,
        });
        continue;
      }

      deleted += data?.length ?? filesBatch.length;
    }

    return new Response(
      JSON.stringify({
        ...base,
        dryRun: false,
        attempted: supabaseFiles.length,
        deleted,
        failed,
        failedFiles,
        filesReadyForDeletion: 0,
        message:
          failed === 0
            ? `Instagram review storage cleanup completed. Deleted ${deleted} old Supabase file(s).`
            : `Instagram review storage cleanup completed with ${failed} failed file(s).`,
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
