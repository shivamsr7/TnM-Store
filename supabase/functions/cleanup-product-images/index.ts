// supabase/functions/cleanup-product-images/index.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const IMAGEKIT_PREFIX =
  "https://ik.imagekit.io/khag8cpng/";

const SUPABASE_STORAGE_PREFIX =
  `${SUPABASE_URL}/storage/v1/object/public/media/`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

interface ProductImageRow {
  id: string;
  image_url: string | null;
  storage_path: string | null;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  // --------------------------------------------------
  // 1. CORS
  // --------------------------------------------------

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // --------------------------------------------------
    // 2. AUTHENTICATION
    // --------------------------------------------------

    const authHeader =
      req.headers.get("Authorization");

    if (!authHeader) {
      return jsonResponse({
        success: false,
        deleted: false,
        safetyCheckPassed: false,
        reason: "AUTH_REQUIRED",
        message:
          "Authentication is required.",
      });
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
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
      return jsonResponse({
        success: false,
        deleted: false,
        safetyCheckPassed: false,
        reason: "INVALID_SESSION",
        message:
          "Your session is invalid or expired.",
      });
    }

    // --------------------------------------------------
    // 3. READ REQUEST BODY
    // --------------------------------------------------

    let requestBody: {
      confirmDelete?: boolean;
    } = {};

    try {
      requestBody = await req.json();
    } catch {
      requestBody = {};
    }

    const confirmDelete =
      requestBody.confirmDelete === true;

    // --------------------------------------------------
    // 4. GET CURRENT PRODUCT IMAGE RECORDS
    // --------------------------------------------------

    const {
      data: productImages,
      error: productImagesError,
    } = await supabase
      .from("product_images")
      .select(
        "id,image_url,storage_path"
      );

    if (productImagesError) {
      return jsonResponse({
        success: false,
        deleted: false,
        safetyCheckPassed: false,
        reason:
          "DATABASE_QUERY_FAILED",
        message:
          "Could not read product image records.",
        error:
          productImagesError.message,
      });
    }

    const dbImages =
      (productImages ??
        []) as ProductImageRow[];

    // --------------------------------------------------
    // 5. SAFETY CHECK:
    //    NO CURRENT IMAGE MAY POINT TO SUPABASE
    // --------------------------------------------------

    const supabaseReferencedImages =
      dbImages.filter((image) => {
        const url =
          image.image_url ?? "";

        return (
          url.startsWith(
            SUPABASE_STORAGE_PREFIX
          ) ||
          url.includes(
            ".supabase.co/storage/v1/object/"
          )
        );
      });

    if (
      supabaseReferencedImages.length > 0
    ) {
      return jsonResponse({
        success: false,
        deleted: false,
        safetyCheckPassed: false,
        reason:
          "SUPABASE_REFERENCES_REMAIN",
        message:
          "Deletion blocked because some current product images still point to Supabase Storage.",
        databaseProductImages:
          dbImages.length,
        supabaseReferencedImages:
          supabaseReferencedImages.length,
        affectedImages:
          supabaseReferencedImages
            .slice(0, 50)
            .map((image) => ({
              id: image.id,
              imageUrl:
                image.image_url,
              storagePath:
                image.storage_path,
            })),
      });
    }

    // --------------------------------------------------
    // 6. SAFETY CHECK:
    //    ALL CURRENT IMAGES MUST USE IMAGEKIT
    // --------------------------------------------------

    const nonImageKitImages =
      dbImages.filter((image) => {
        const url =
          image.image_url ?? "";

        return !url.startsWith(
          IMAGEKIT_PREFIX
        );
      });

    if (
      nonImageKitImages.length > 0
    ) {
      return jsonResponse({
        success: false,
        deleted: false,
        safetyCheckPassed: false,
        reason:
          "NON_IMAGEKIT_IMAGES_REMAIN",
        message:
          "Deletion blocked because some product images are not using ImageKit.",
        databaseProductImages:
          dbImages.length,
        nonImageKitImages:
          nonImageKitImages.length,
        affectedImages:
          nonImageKitImages
            .slice(0, 50)
            .map((image) => ({
              id: image.id,
              imageUrl:
                image.image_url,
              storagePath:
                image.storage_path,
            })),
      });
    }

    // --------------------------------------------------
    // 7. SAFETY CHECK:
    //    ALL STORAGE PATHS MUST BE IMAGEKIT PATHS
    // --------------------------------------------------

    const legacyStoragePaths =
      dbImages.filter((image) => {
        const path =
          image.storage_path ?? "";

        return !path.startsWith(
          "imagekit:"
        );
      });

    if (
      legacyStoragePaths.length > 0
    ) {
      return jsonResponse({
        success: false,
        deleted: false,
        safetyCheckPassed: false,
        reason:
          "LEGACY_STORAGE_PATHS_REMAIN",
        message:
          "Deletion blocked because some product image records still contain legacy Supabase storage paths.",
        databaseProductImages:
          dbImages.length,
        legacyStoragePaths:
          legacyStoragePaths.length,
        affectedImages:
          legacyStoragePaths
            .slice(0, 50)
            .map((image) => ({
              id: image.id,
              imageUrl:
                image.image_url,
              storagePath:
                image.storage_path,
            })),
      });
    }

    // --------------------------------------------------
    // 8. SAFETY CHECK:
    //    NO DUPLICATE IMAGEKIT PATHS
    // --------------------------------------------------

    const imageKitPaths =
      dbImages
        .map(
          (image) =>
            image.storage_path
        )
        .filter(Boolean) as string[];

    const uniqueImageKitPaths =
      new Set(imageKitPaths);

    const duplicateCount =
      imageKitPaths.length -
      uniqueImageKitPaths.size;

    if (duplicateCount > 0) {
      return jsonResponse({
        success: false,
        deleted: false,
        safetyCheckPassed: false,
        reason:
          "DUPLICATE_IMAGEKIT_PATHS",
        message:
          "Deletion blocked because duplicate ImageKit storage paths were detected.",
        databaseProductImages:
          dbImages.length,
        uniqueImageKitPaths:
          uniqueImageKitPaths.size,
        duplicateImageKitPaths:
          duplicateCount,
      });
    }

    // --------------------------------------------------
    // 9. LIST SUPABASE PRODUCTS FOLDER
    // --------------------------------------------------

    const {
      data: storageFiles,
      error: storageError,
    } = await supabase.storage
      .from("media")
      .list("products", {
        limit: 1000,
        offset: 0,
        sortBy: {
          column: "name",
          order: "asc",
        },
      });

    if (storageError) {
      return jsonResponse({
        success: false,
        deleted: false,
        safetyCheckPassed: false,
        reason:
          "STORAGE_LIST_FAILED",
        message:
          "Could not inspect the Supabase products folder.",
        error:
          storageError.message,
      });
    }

    // --------------------------------------------------
    // 10. FILTER ACTUAL FILES
    //     EXCLUDE FOLDER PLACEHOLDER
    // --------------------------------------------------

    const files =
      (storageFiles ?? []).filter(
        (file) =>
          file.name &&
          !file.name.endsWith("/") &&
          file.name !==
            ".emptyFolderPlaceholder"
      );

    const filePaths =
      files.map(
        (file) =>
          `products/${file.name}`
      );

    // --------------------------------------------------
    // 11. FINAL SAFETY CHECK
    // --------------------------------------------------

    const safetyCheckPassed =
      supabaseReferencedImages.length ===
        0 &&
      nonImageKitImages.length === 0 &&
      legacyStoragePaths.length === 0 &&
      duplicateCount === 0;

    if (!safetyCheckPassed) {
      return jsonResponse({
        success: false,
        deleted: false,
        safetyCheckPassed: false,
        reason:
          "SAFETY_CHECK_FAILED",
        message:
          "Deletion was blocked because the ImageKit migration safety checks did not pass.",
        supabaseFiles:
          files.length,
        databaseProductImages:
          dbImages.length,
        supabaseReferencedImages:
          supabaseReferencedImages.length,
        nonImageKitImages:
          nonImageKitImages.length,
        legacyStoragePaths:
          legacyStoragePaths.length,
        duplicateImageKitPaths:
          duplicateCount,
      });
    }

    // --------------------------------------------------
    // 12. DRY RUN
    // --------------------------------------------------

    if (!confirmDelete) {
      return jsonResponse({
        success: true,
        deleted: false,
        safetyCheckPassed: true,
        dryRun: true,

        message:
          "Safety checks passed. All current product images are using ImageKit. Old Supabase product files can be deleted.",

        supabaseFiles:
          files.length,

        databaseProductImages:
          dbImages.length,

        supabaseReferencedImages:
          0,

        nonImageKitImages:
          0,

        legacyStoragePaths:
          0,

        uniqueImageKitPaths:
          uniqueImageKitPaths.size,

        filesReadyForDeletion:
          files.length,

        files: filePaths,
      });
    }

    // --------------------------------------------------
    // 13. DELETE OLD SUPABASE FILES
    // --------------------------------------------------

    let deleted = 0;
    let failed = 0;

    const failures: unknown[] = [];

    // Supabase Storage remove supports batches.
    // Keep batches at 100 for safety.
    for (
      let i = 0;
      i < filePaths.length;
      i += 100
    ) {
      const batch =
        filePaths.slice(
          i,
          i + 100
        );

      const {
        data,
        error,
      } = await supabase.storage
        .from("media")
        .remove(batch);

      if (error) {
        failed += batch.length;

        failures.push({
          batchStart: i,
          batchSize:
            batch.length,
          error:
            error.message,
        });

        continue;
      }

      const deletedCount =
        data?.length ?? 0;

      deleted +=
        deletedCount;

      if (
        deletedCount <
        batch.length
      ) {
        failed +=
          batch.length -
          deletedCount;
      }
    }

    // --------------------------------------------------
    // 14. FINAL RESULT
    // --------------------------------------------------

    const success =
      failed === 0;

    return jsonResponse({
      success,

      deleted:
        deleted > 0,

      safetyCheckPassed:
        true,

      attempted:
        filePaths.length,

      deletedCount:
        deleted,

      failedCount:
        failed,

      message: success
        ? `Successfully deleted ${deleted} old Supabase product images.`
        : `Deletion completed with ${failed} failed files.`,

      failures,
    });
  } catch (error) {
    // --------------------------------------------------
    // 15. UNEXPECTED ERROR
    // --------------------------------------------------

    return jsonResponse({
      success: false,
      deleted: false,
      safetyCheckPassed: false,
      reason:
        "UNEXPECTED_ERROR",

      message:
        error instanceof Error
          ? error.message
          : "Unexpected cleanup error.",
    });
  }
});