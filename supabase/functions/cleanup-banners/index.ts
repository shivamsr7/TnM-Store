// supabase/functions/cleanup-banners/index.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const IMAGEKIT_URL_PREFIX =
  "https://ik.imagekit.io/khag8cpng/";

const PRODUCT_BUCKET = "media";
const BANNER_DESKTOP_FOLDER = "banners/desktop";
const BANNER_MOBILE_FOLDER = "banners/mobile";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function isImageKitUrl(url: string | null) {
  if (!url) return false;
  return url.startsWith(IMAGEKIT_URL_PREFIX);
}

function isSupabaseStorageUrl(url: string | null) {
  if (!url) return false;

  return (
    url.startsWith(
      `${SUPABASE_URL}/storage/v1/object/public/media/`
    ) ||
    url.includes(".supabase.co/storage/v1/object/")
  );
}

function isImageKitPath(path: string | null) {
  if (!path) return false;
  return path.startsWith("imagekit:");
}

function cleanPath(path: string) {
  return path.replace(/^\/+/, "");
}

async function listAllFiles(
  supabase: ReturnType<typeof createClient>,
  folder: string
) {
  const files: Array<{
    name: string;
    id?: string | null;
    metadata?: Record<string, unknown> | null;
  }> = [];

  let offset = 0;
  const pageSize = 100;

  while (true) {
    const { data, error } = await supabase.storage
      .from(PRODUCT_BUCKET)
      .list(folder, {
        limit: pageSize,
        offset,
        sortBy: {
          column: "name",
          order: "asc",
        },
      });

    if (error) {
      throw new Error(
        `Unable to list ${folder}: ${error.message}`
      );
    }

    if (!data || data.length === 0) {
      break;
    }

    for (const item of data) {
      // Ignore Supabase's folder placeholder.
      if (item.name === ".emptyFolderPlaceholder") {
        continue;
      }

      files.push({
        name: item.name,
        id: item.id,
        metadata: item.metadata as Record<string, unknown> | null,
      });
    }

    if (data.length < pageSize) {
      break;
    }

    offset += pageSize;
  }

  return files;
}

async function deleteFiles(
  supabase: ReturnType<typeof createClient>,
  paths: string[]
) {
  const batchSize = 100;

  let deleted = 0;
  const failures: Array<{
    batch: string[];
    error: string;
  }> = [];

  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize);

    const { error } = await supabase.storage
      .from(PRODUCT_BUCKET)
      .remove(batch);

    if (error) {
      failures.push({
        batch,
        error: error.message,
      });
      continue;
    }

    deleted += batch.length;
  }

  return {
    deleted,
    failures,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    /*
     * ---------------------------------------------------------
     * 1. AUTHENTICATION
     * ---------------------------------------------------------
     */

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return jsonResponse(
        {
          success: false,
          reason: "AUTH_REQUIRED",
          message: "Authentication is required.",
        },
        401
      );
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
      return jsonResponse(
        {
          success: false,
          reason: "INVALID_SESSION",
          message: "Your session is invalid or expired.",
        },
        401
      );
    }

    /*
     * ---------------------------------------------------------
     * 2. REQUEST BODY
     * ---------------------------------------------------------
     */

    let requestBody: {
      confirm?: boolean;
    } = {};

    try {
      requestBody = await req.json();
    } catch {
      requestBody = {};
    }

    const confirmDelete = requestBody.confirm === true;

    /*
     * ---------------------------------------------------------
     * 3. READ ALL BANNER DATABASE RECORDS
     * ---------------------------------------------------------
     */

    const { data: banners, error: bannersError } =
      await supabase
        .from("banners")
        .select(
          "id,image_url,image_path,mobile_image_url,mobile_image_path"
        );

    if (bannersError) {
      return jsonResponse(
        {
          success: false,
          reason: "DATABASE_QUERY_FAILED",
          message: "Could not read banner records.",
          error: bannersError.message,
        },
        500
      );
    }

    const bannerRows = banners ?? [];

    /*
     * ---------------------------------------------------------
     * 4. SAFETY AUDIT
     * ---------------------------------------------------------
     */

    const nonImageKitUrls: Array<{
      bannerId: string;
      type: "desktop" | "mobile";
      url: string;
    }> = [];

    const supabaseReferences: Array<{
      bannerId: string;
      type: "desktop" | "mobile";
      url: string;
    }> = [];

    const legacyStoragePaths: Array<{
      bannerId: string;
      type: "desktop" | "mobile";
      path: string;
    }> = [];

    const duplicateImageKitPaths: string[] = [];

    const imageKitPathMap = new Map<string, string[]>();

    for (const banner of bannerRows) {
      /*
       * Desktop URL
       */

      if (banner.image_url) {
        if (isSupabaseStorageUrl(banner.image_url)) {
          supabaseReferences.push({
            bannerId: banner.id,
            type: "desktop",
            url: banner.image_url,
          });
        } else if (!isImageKitUrl(banner.image_url)) {
          nonImageKitUrls.push({
            bannerId: banner.id,
            type: "desktop",
            url: banner.image_url,
          });
        }
      }

      /*
       * Mobile URL
       */

      if (banner.mobile_image_url) {
        if (isSupabaseStorageUrl(banner.mobile_image_url)) {
          supabaseReferences.push({
            bannerId: banner.id,
            type: "mobile",
            url: banner.mobile_image_url,
          });
        } else if (!isImageKitUrl(banner.mobile_image_url)) {
          nonImageKitUrls.push({
            bannerId: banner.id,
            type: "mobile",
            url: banner.mobile_image_url,
          });
        }
      }

      /*
       * Desktop storage path
       */

      if (banner.image_path) {
        if (!isImageKitPath(banner.image_path)) {
          legacyStoragePaths.push({
            bannerId: banner.id,
            type: "desktop",
            path: banner.image_path,
          });
        } else {
          const existing =
            imageKitPathMap.get(banner.image_path) ?? [];

          existing.push(`${banner.id}:desktop`);

          imageKitPathMap.set(
            banner.image_path,
            existing
          );
        }
      }

      /*
       * Mobile storage path
       */

      if (banner.mobile_image_path) {
        if (!isImageKitPath(banner.mobile_image_path)) {
          legacyStoragePaths.push({
            bannerId: banner.id,
            type: "mobile",
            path: banner.mobile_image_path,
          });
        } else {
          const existing =
            imageKitPathMap.get(
              banner.mobile_image_path
            ) ?? [];

          existing.push(`${banner.id}:mobile`);

          imageKitPathMap.set(
            banner.mobile_image_path,
            existing
          );
        }
      }
    }

    for (const [path, references] of imageKitPathMap) {
      if (references.length > 1) {
        duplicateImageKitPaths.push(
          `${path} -> ${references.join(", ")}`
        );
      }
    }

    /*
     * ---------------------------------------------------------
     * 5. LIST OLD SUPABASE BANNER FILES
     * ---------------------------------------------------------
     */

    const desktopFiles = await listAllFiles(
      supabase,
      BANNER_DESKTOP_FOLDER
    );

    const mobileFiles = await listAllFiles(
      supabase,
      BANNER_MOBILE_FOLDER
    );

    const desktopPaths = desktopFiles.map(
      (file) =>
        `${BANNER_DESKTOP_FOLDER}/${cleanPath(file.name)}`
    );

    const mobilePaths = mobileFiles.map(
      (file) =>
        `${BANNER_MOBILE_FOLDER}/${cleanPath(file.name)}`
    );

    const filesReadyForDeletion = [
      ...desktopPaths,
      ...mobilePaths,
    ];

    /*
     * ---------------------------------------------------------
     * 6. GLOBAL SAFETY CHECK
     * ---------------------------------------------------------
     */

    const safetyChecks = {
      allDesktopUrlsImageKit:
        !nonImageKitUrls.some(
          (item) => item.type === "desktop"
        ) &&
        !supabaseReferences.some(
          (item) => item.type === "desktop"
        ),

      allMobileUrlsImageKit:
        !nonImageKitUrls.some(
          (item) => item.type === "mobile"
        ) &&
        !supabaseReferences.some(
          (item) => item.type === "mobile"
        ),

      noSupabaseReferences:
        supabaseReferences.length === 0,

      noNonImageKitUrls:
        nonImageKitUrls.length === 0,

      noLegacyStoragePaths:
        legacyStoragePaths.length === 0,

      noDuplicateImageKitPaths:
        duplicateImageKitPaths.length === 0,
    };

    const safeToDelete =
      safetyChecks.allDesktopUrlsImageKit &&
      safetyChecks.allMobileUrlsImageKit &&
      safetyChecks.noSupabaseReferences &&
      safetyChecks.noNonImageKitUrls &&
      safetyChecks.noLegacyStoragePaths &&
      safetyChecks.noDuplicateImageKitPaths;

    /*
     * ---------------------------------------------------------
     * 7. NEVER DELETE IF SAFETY CHECK FAILS
     * ---------------------------------------------------------
     */

    if (!safeToDelete) {
      return jsonResponse(
        {
          success: false,
          deleted: false,
          reason: "SAFETY_CHECK_FAILED",
          message:
            "Old banner files were NOT deleted because one or more safety checks failed.",

          bannerCount: bannerRows.length,

          supabaseFiles: {
            desktop: desktopFiles.length,
            mobile: mobileFiles.length,
            total: filesReadyForDeletion.length,
          },

          safetyChecks,

          diagnostics: {
            supabaseReferences,
            nonImageKitUrls,
            legacyStoragePaths,
            duplicateImageKitPaths,
          },

          readyForDeletion: 0,
        },
        409
      );
    }

    /*
     * ---------------------------------------------------------
     * 8. DRY RUN
     * ---------------------------------------------------------
     */

    if (!confirmDelete) {
      return jsonResponse({
        success: true,
        deleted: false,
        dryRun: true,

        message:
          "Safety checks passed. No files were deleted. Send confirm:true to delete the old Supabase banner files.",

        bannerCount: bannerRows.length,

        supabaseFiles: {
          desktop: desktopFiles.length,
          mobile: mobileFiles.length,
          total: filesReadyForDeletion.length,
        },

        safetyChecks,

        diagnostics: {
          supabaseReferences,
          nonImageKitUrls,
          legacyStoragePaths,
          duplicateImageKitPaths,
        },

        readyForDeletion: filesReadyForDeletion.length,

        files: {
          desktop: desktopPaths,
          mobile: mobilePaths,
        },
      });
    }

    /*
     * ---------------------------------------------------------
     * 9. CONFIRMED DELETE
     * ---------------------------------------------------------
     */

    if (filesReadyForDeletion.length === 0) {
      return jsonResponse({
        success: true,
        deleted: false,
        dryRun: false,
        message:
          "No old Supabase banner files were found. Nothing to delete.",

        bannerCount: bannerRows.length,

        supabaseFiles: {
          desktop: 0,
          mobile: 0,
          total: 0,
        },

        readyForDeletion: 0,
      });
    }

    const deletionResult = await deleteFiles(
      supabase,
      filesReadyForDeletion
    );

    /*
     * ---------------------------------------------------------
     * 10. FINAL RESPONSE
     * ---------------------------------------------------------
     */

    const deleteSuccess =
      deletionResult.failures.length === 0;

    return jsonResponse(
      {
        success: deleteSuccess,
        deleted: deletionResult.deleted > 0,
        dryRun: false,

        message: deleteSuccess
          ? "Old Supabase banner files deleted successfully."
          : "Banner cleanup completed with some deletion failures.",

        bannerCount: bannerRows.length,

        attemptedDeletion:
          filesReadyForDeletion.length,

        deleted:
          deletionResult.deleted,

        failedBatches:
          deletionResult.failures.length,

        failures:
          deletionResult.failures,

        safetyChecks,

        remainingExpected:
          filesReadyForDeletion.length -
          deletionResult.deleted,
      },
      deleteSuccess ? 200 : 500
    );
  } catch (error) {
    console.error(
      "[cleanup-banners] Unexpected error:",
      error
    );

    return jsonResponse(
      {
        success: false,
        reason: "UNEXPECTED_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Unexpected banner cleanup error.",
      },
      500
    );
  }
});