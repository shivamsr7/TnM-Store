// supabase/functions/migrate-banners/index.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL =
  Deno.env.get("SUPABASE_URL")!;

const SUPABASE_ANON_KEY =
  Deno.env.get("SUPABASE_ANON_KEY")!;

const IMAGEKIT_PRIVATE_KEY =
  Deno.env.get("IMAGEKIT_PRIVATE_KEY")!;

const IMAGEKIT_PUBLIC_KEY =
  Deno.env.get("IMAGEKIT_PUBLIC_KEY")!;

const IMAGEKIT_UPLOAD_URL =
  "https://upload.imagekit.io/api/v1/files/upload";

const IMAGEKIT_URL_PREFIX =
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

interface BannerRow {
  id: string;

  image_url: string | null;
  image_path: string | null;

  mobile_image_url: string | null;
  mobile_image_path: string | null;
}

interface MigrationResult {
  bannerId: string;

  desktop: {
    attempted: boolean;
    migrated: boolean;
    oldUrl?: string | null;
    newUrl?: string;
    newPath?: string;
    error?: string;
  };

  mobile: {
    attempted: boolean;
    migrated: boolean;
    oldUrl?: string | null;
    newUrl?: string;
    newPath?: string;
    error?: string;
  };
}

function jsonResponse(
  body: unknown,
  status = 200
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type":
          "application/json",
      },
    }
  );
}

/**
 * Determine whether a URL is still hosted
 * in our Supabase Storage bucket.
 */
function isSupabaseStorageUrl(
  url: string | null
) {
  if (!url) return false;

  return (
    url.startsWith(
      SUPABASE_STORAGE_PREFIX
    ) ||
    url.includes(
      ".supabase.co/storage/v1/object/"
    )
  );
}

/**
 * Determine whether a URL is already
 * hosted by ImageKit.
 */
function isImageKitUrl(
  url: string | null
) {
  if (!url) return false;

  return url.startsWith(
    IMAGEKIT_URL_PREFIX
  );
}

/**
 * Extract a useful filename from an existing
 * URL/path.
 */
function getOriginalFileName(
  url: string | null,
  fallback = "banner"
) {
  if (!url) {
    return fallback;
  }

  try {
    const cleanUrl =
      url.split("?")[0];

    const parts =
      cleanUrl.split("/");

    const lastPart =
      parts[parts.length - 1];

    if (
      lastPart &&
      lastPart.includes(".")
    ) {
      return decodeURIComponent(
        lastPart
      );
    }
  } catch {
    // Ignore filename parsing errors.
  }

  return fallback;
}

/**
 * Keep a valid file extension.
 */
function getExtension(
  fileName: string
) {
  const match =
    fileName.match(
      /\.([a-zA-Z0-9]+)$/
    );

  return match
    ? match[1].toLowerCase()
    : "jpg";
}

/**
 * Create a clean ImageKit filename.
 */
function createImageKitFileName(
  originalFileName: string,
  prefix: string
) {
  const extension =
    getExtension(
      originalFileName
    );

  const baseName =
    originalFileName
      .replace(
        /\.[^/.]+$/,
        ""
      )
      .replace(
        /[^a-zA-Z0-9-_]/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      ) ||
    prefix;

  return `${baseName}-${crypto.randomUUID()}.${extension}`;
}

/**
 * Download a Supabase Storage image.
 */
async function downloadImage(
  url: string
) {
  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Unable to download image. HTTP ${response.status}`
    );
  }

  const blob =
    await response.blob();

  if (blob.size === 0) {
    throw new Error(
      "Downloaded image is empty."
    );
  }

  return blob;
}

/**
 * Upload an image to ImageKit using the
 * server-side private key.
 *
 * The private key never reaches the browser.
 */
async function uploadToImageKit(
  blob: Blob,
  fileName: string,
  folder: string
) {
  const formData =
    new FormData();

  formData.append(
    "file",
    blob,
    fileName
  );

  formData.append(
    "fileName",
    fileName
  );

  formData.append(
    "folder",
    folder
  );

  formData.append(
    "useUniqueFileName",
    "false"
  );

  formData.append(
    "publicKey",
    IMAGEKIT_PUBLIC_KEY
  );

  const basicAuth =
    btoa(
      `${IMAGEKIT_PRIVATE_KEY}:`
    );

  const response =
    await fetch(
      IMAGEKIT_UPLOAD_URL,
      {
        method: "POST",
        headers: {
          Authorization:
            `Basic ${basicAuth}`,
        },
        body: formData,
      }
    );

  let result: any = null;

  try {
    result =
      await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    console.error(
      "ImageKit upload failed:",
      result
    );

    throw new Error(
      result?.message ||
        `ImageKit upload failed. HTTP ${response.status}`
    );
  }

  if (
    !result?.fileId ||
    !result?.url
  ) {
    console.error(
      "Invalid ImageKit response:",
      result
    );

    throw new Error(
      "ImageKit returned an invalid upload response."
    );
  }

  return {
    fileId:
      result.fileId,

    url:
      result.url,

    filePath:
      result.filePath,
  };
}

/**
 * Migrate one banner image.
 */
async function migrateImage({
  url,
  currentPath,
  folder,
  prefix,
}: {
  url: string | null;
  currentPath: string | null;
  folder: string;
  prefix: string;
}) {
  if (!url) {
    return {
      attempted: false,
      migrated: false,
    };
  }

  // Already migrated.
  if (
    isImageKitUrl(url)
  ) {
    return {
      attempted: false,
      migrated: false,
      alreadyMigrated: true,
      newUrl: url,
      newPath:
        currentPath ??
        null,
    };
  }

  // Do not migrate unknown external URLs.
  if (
    !isSupabaseStorageUrl(url)
  ) {
    return {
      attempted: false,
      migrated: false,
      skipped: true,
      reason:
        "NOT_SUPABASE_URL",
      oldUrl: url,
    };
  }

  const originalFileName =
    getOriginalFileName(
      url,
      prefix
    );

  const fileName =
    createImageKitFileName(
      originalFileName,
      prefix
    );

  console.log(
    `[migrate-banners] Downloading ${url}`
  );

  const blob =
    await downloadImage(url);

  console.log(
    `[migrate-banners] Uploading ${fileName} to ${folder}`
  );

  const uploadResult =
    await uploadToImageKit(
      blob,
      fileName,
      folder
    );

  return {
    attempted: true,
    migrated: true,

    oldUrl: url,

    newUrl:
      uploadResult.url,

    newPath:
      `imagekit:${uploadResult.fileId}`,

    fileId:
      uploadResult.fileId,

    filePath:
      uploadResult.filePath,
  };
}

Deno.serve(async (req) => {
  // --------------------------------------------------
  // 1. CORS
  // --------------------------------------------------

  if (
    req.method ===
    "OPTIONS"
  ) {
    return new Response(
      "ok",
      {
        status: 200,
        headers:
          corsHeaders,
      }
    );
  }

  try {
    // --------------------------------------------------
    // 2. AUTHENTICATION
    // --------------------------------------------------

    const authHeader =
      req.headers.get(
        "Authorization"
      );

    if (!authHeader) {
      return jsonResponse(
        {
          success: false,
          reason:
            "AUTH_REQUIRED",
          message:
            "Authentication is required.",
        },
        401
      );
    }

    const supabase =
      createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        {
          global: {
            headers: {
              Authorization:
                authHeader,
            },
          },
        }
      );

    const {
      data: {
        user,
      },
      error:
        userError,
    } =
      await supabase.auth.getUser();

    if (
      userError ||
      !user
    ) {
      return jsonResponse(
        {
          success: false,
          reason:
            "INVALID_SESSION",
          message:
            "Your session is invalid or expired.",
        },
        401
      );
    }

    // --------------------------------------------------
    // 3. READ REQUEST
    // --------------------------------------------------

    let requestBody: {
      limit?: number;
    } = {};

    try {
      requestBody =
        await req.json();
    } catch {
      requestBody = {};
    }

    const requestedLimit =
      Number(
        requestBody.limit ??
          50
      );

    const limit =
      Math.min(
        Math.max(
          Number.isFinite(
            requestedLimit
          )
            ? Math.floor(
                requestedLimit
              )
            : 50,
          1
        ),
        100
      );

    // --------------------------------------------------
    // 4. VERIFY IMAGEKIT CONFIGURATION
    // --------------------------------------------------

    if (
      !IMAGEKIT_PRIVATE_KEY ||
      !IMAGEKIT_PUBLIC_KEY
    ) {
      return jsonResponse(
        {
          success: false,
          reason:
            "IMAGEKIT_CONFIG_MISSING",
          message:
            "ImageKit environment variables are not configured.",
        },
        500
      );
    }

    // --------------------------------------------------
    // 5. GET BANNERS
    // --------------------------------------------------

    const {
      data: banners,
      error:
        bannersError,
    } =
      await supabase
        .from("banners")
        .select(
          "id,image_url,image_path,mobile_image_url,mobile_image_path"
        )
        .order(
          "created_at",
          {
            ascending: true,
          }
        )
        .limit(limit);

    if (
      bannersError
    ) {
      console.error(
        "Banner query failed:",
        bannersError
      );

      return jsonResponse(
        {
          success: false,
          reason:
            "DATABASE_QUERY_FAILED",
          message:
            "Could not read banner records.",
          error:
            bannersError.message,
        },
        500
      );
    }

    const bannerRows =
      (banners ??
        []) as BannerRow[];

    // --------------------------------------------------
    // 6. MIGRATION COUNTERS
    // --------------------------------------------------

    let processed =
      0;

    let migrated =
      0;

    let failed =
      0;

    let skipped =
      0;

    let alreadyMigrated =
      0;

    const results:
      MigrationResult[] = [];

    // --------------------------------------------------
    // 7. PROCESS BANNERS
    // --------------------------------------------------

    for (
      const banner
      of bannerRows
    ) {
      processed++;

      const result: MigrationResult =
        {
          bannerId:
            banner.id,

          desktop: {
            attempted:
              false,
            migrated:
              false,
            oldUrl:
              banner.image_url,
          },

          mobile: {
            attempted:
              false,
            migrated:
              false,
            oldUrl:
              banner.mobile_image_url,
          },
        };

      let desktopChanged =
        false;

      let mobileChanged =
        false;

      let desktopUrl =
        banner.image_url;

      let desktopPath =
        banner.image_path;

      let mobileUrl =
        banner.mobile_image_url;

      let mobilePath =
        banner.mobile_image_path;

      // ----------------------------------------------
      // DESKTOP
      // ----------------------------------------------

      if (
        banner.image_url
      ) {
        try {
          const desktop =
            await migrateImage({
              url:
                banner.image_url,

              currentPath:
                banner.image_path,

              folder:
                "banners/desktop",

              prefix:
                "banner-desktop",
            });

          if (
            desktop.alreadyMigrated
          ) {
            alreadyMigrated++;

            result.desktop = {
              attempted:
                false,

              migrated:
                false,

              oldUrl:
                banner.image_url,

              newUrl:
                desktop.newUrl,

              newPath:
                desktop.newPath,
            };
          } else if (
            desktop.skipped
          ) {
            skipped++;

            result.desktop = {
              attempted:
                false,

              migrated:
                false,

              oldUrl:
                banner.image_url,

              error:
                `Skipped: ${desktop.reason}`,
            };
          } else if (
            desktop.migrated
          ) {
            desktopUrl =
              desktop.newUrl ??
              desktopUrl;

            desktopPath =
              desktop.newPath ??
              desktopPath;

            desktopChanged =
              true;

            migrated++;

            result.desktop = {
              attempted:
                true,

              migrated:
                true,

              oldUrl:
                banner.image_url,

              newUrl:
                desktop.newUrl,

              newPath:
                desktop.newPath,
            };
          }
        } catch (error) {
          failed++;

          result.desktop = {
            attempted:
              true,

            migrated:
              false,

            oldUrl:
              banner.image_url,

            error:
              error instanceof
              Error
                ? error.message
                : "Desktop image migration failed.",
          };
        }
      }

      // ----------------------------------------------
      // MOBILE
      // ----------------------------------------------

      if (
        banner.mobile_image_url
      ) {
        try {
          const mobile =
            await migrateImage({
              url:
                banner.mobile_image_url,

              currentPath:
                banner.mobile_image_path,

              folder:
                "banners/mobile",

              prefix:
                "banner-mobile",
            });

          if (
            mobile.alreadyMigrated
          ) {
            alreadyMigrated++;

            result.mobile = {
              attempted:
                false,

              migrated:
                false,

              oldUrl:
                banner.mobile_image_url,

              newUrl:
                mobile.newUrl,

              newPath:
                mobile.newPath,
            };
          } else if (
            mobile.skipped
          ) {
            skipped++;

            result.mobile = {
              attempted:
                false,

              migrated:
                false,

              oldUrl:
                banner.mobile_image_url,

              error:
                `Skipped: ${mobile.reason}`,
            };
          } else if (
            mobile.migrated
          ) {
            mobileUrl =
              mobile.newUrl ??
              mobileUrl;

            mobilePath =
              mobile.newPath ??
              mobilePath;

            mobileChanged =
              true;

            migrated++;

            result.mobile = {
              attempted:
                true,

              migrated:
                true,

              oldUrl:
                banner.mobile_image_url,

              newUrl:
                mobile.newUrl,

              newPath:
                mobile.newPath,
            };
          }
        } catch (error) {
          failed++;

          result.mobile = {
            attempted:
              true,

            migrated:
              false,

            oldUrl:
              banner.mobile_image_url,

            error:
              error instanceof
              Error
                ? error.message
                : "Mobile image migration failed.",
          };
        }
      }

      // ------------------------------------------------
      // 8. UPDATE DATABASE ONLY IF UPLOAD SUCCEEDED
      // ------------------------------------------------

      if (
        desktopChanged ||
        mobileChanged
      ) {
        const updatePayload: Record<
          string,
          unknown
        > = {};

        if (
          desktopChanged
        ) {
          updatePayload.image_url =
            desktopUrl;

          updatePayload.image_path =
            desktopPath;
        }

        if (
          mobileChanged
        ) {
          updatePayload.mobile_image_url =
            mobileUrl;

          updatePayload.mobile_image_path =
            mobilePath;
        }

        const {
          error:
            updateError,
        } =
          await supabase
            .from("banners")
            .update(
              updatePayload
            )
            .eq(
              "id",
              banner.id
            );

        if (
          updateError
        ) {
          console.error(
            `[migrate-banners] Database update failed for banner ${banner.id}:`,
            updateError
          );

          failed++;

          /*
           * IMPORTANT:
           *
           * ImageKit upload succeeded,
           * but DB update failed.
           *
           * We do NOT delete the ImageKit
           * image here. It is safer to leave
           * it in ImageKit and retry/update
           * the database later.
           */

          result.desktop.error =
            result.desktop
              .migrated
              ? "Image uploaded to ImageKit but database update failed."
              : result.desktop.error;

          result.mobile.error =
            result.mobile
              .migrated
              ? "Image uploaded to ImageKit but database update failed."
              : result.mobile.error;
        }
      }

      results.push(
        result
      );
    }

    // --------------------------------------------------
    // 9. FINAL RESPONSE
    // --------------------------------------------------

    return jsonResponse({
      success:
        failed === 0,

      message:
        failed === 0
          ? "Banner migration completed successfully."
          : "Banner migration completed with some failures.",

      processed,

      migrated,

      failed,

      skipped,

      alreadyMigrated,

      limit,

      results,
    });
  } catch (error) {
    console.error(
      "Unexpected banner migration error:",
      error
    );

    return jsonResponse(
      {
        success: false,

        reason:
          "UNEXPECTED_ERROR",

        message:
          error instanceof
          Error
            ? error.message
            : "Unexpected banner migration error.",
      },
      500
    );
  }
});