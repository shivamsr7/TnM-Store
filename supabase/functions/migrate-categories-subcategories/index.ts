import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const IMAGEKIT_PRIVATE_KEY = Deno.env.get("IMAGEKIT_PRIVATE_KEY")!;
const IMAGEKIT_PUBLIC_KEY = Deno.env.get("IMAGEKIT_PUBLIC_KEY")!;

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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function isSupabaseStorageUrl(url: string | null) {
  if (!url) return false;

  return (
    url.startsWith(SUPABASE_STORAGE_PREFIX) ||
    url.includes(".supabase.co/storage/v1/object/")
  );
}

function isImageKitUrl(url: string | null) {
  if (!url) return false;
  return url.startsWith(IMAGEKIT_URL_PREFIX);
}

function getOriginalFileName(
  url: string | null,
  fallback: string
) {
  if (!url) return fallback;

  try {
    const cleanUrl = url.split("?")[0];
    const parts = cleanUrl.split("/");
    const lastPart = parts[parts.length - 1];

    if (lastPart) {
      return decodeURIComponent(lastPart);
    }
  } catch {
    // Ignore filename parsing errors.
  }

  return fallback;
}

function getExtension(fileName: string) {
  const match = fileName.match(
    /\.([a-zA-Z0-9]+)$/
  );

  return match
    ? match[1].toLowerCase()
    : "jpg";
}

function createImageKitFileName(
  originalFileName: string,
  prefix: string
) {
  const extension =
    getExtension(originalFileName);

  const baseName =
    originalFileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") ||
    prefix;

  return `${baseName}-${crypto.randomUUID()}.${extension}`;
}

async function downloadImage(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Unable to download image. HTTP ${response.status}`
    );
  }

  const blob = await response.blob();

  if (blob.size === 0) {
    throw new Error(
      "Downloaded image is empty."
    );
  }

  return blob;
}

async function uploadToImageKit(
  blob: Blob,
  fileName: string,
  folder: string
) {
  const formData = new FormData();

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

  const basicAuth = btoa(
    `${IMAGEKIT_PRIVATE_KEY}:`
  );

  const response = await fetch(
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
    result = await response.json();
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
    throw new Error(
      "ImageKit returned an invalid upload response."
    );
  }

  return {
    fileId: result.fileId,
    url: result.url,
    filePath: result.filePath,
  };
}

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
      skipped: true,
      reason: "NO_IMAGE",
    };
  }

  if (isImageKitUrl(url)) {
    return {
      attempted: false,
      migrated: false,
      alreadyMigrated: true,
      newUrl: url,
      newPath: currentPath,
    };
  }

  if (!isSupabaseStorageUrl(url)) {
    return {
      attempted: false,
      migrated: false,
      skipped: true,
      reason: "NOT_SUPABASE_URL",
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
    `[migration] Downloading ${url}`
  );

  const blob =
    await downloadImage(url);

  console.log(
    `[migration] Uploading ${fileName} → ${folder}`
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
    newUrl: uploadResult.url,
    newPath:
      `imagekit:${uploadResult.fileId}`,
    fileId: uploadResult.fileId,
    filePath:
      uploadResult.filePath,
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
     * --------------------------------------------------
     * AUTH
     * --------------------------------------------------
     */

    const authHeader =
      req.headers.get(
        "Authorization"
      );

    if (!authHeader) {
      return jsonResponse(
        {
          success: false,
          reason: "AUTH_REQUIRED",
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
      data: { user },
      error: userError,
    } =
      await supabase.auth.getUser();

    if (
      userError ||
      !user
    ) {
      return jsonResponse(
        {
          success: false,
          reason: "INVALID_SESSION",
          message:
            "Your session is invalid or expired.",
        },
        401
      );
    }

    /*
     * --------------------------------------------------
     * REQUEST
     * --------------------------------------------------
     */

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
        requestBody.limit ?? 10
      );

    const limit = Math.min(
      Math.max(
        Number.isFinite(
          requestedLimit
        )
          ? Math.floor(
              requestedLimit
            )
          : 10,
        1
      ),
      100
    );

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

    /*
     * --------------------------------------------------
     * LOAD CATEGORIES
     * --------------------------------------------------
     */

    const {
      data: categories,
      error: categoryError,
    } =
      await supabase
        .from("categories")
        .select(
          "id,name,image_url,image_path"
        )
        .order(
          "created_at",
          {
            ascending: true,
          }
        )
        .limit(limit);

    if (categoryError) {
      return jsonResponse(
        {
          success: false,
          reason:
            "CATEGORY_QUERY_FAILED",
          message:
            "Could not read categories.",
          error:
            categoryError.message,
        },
        500
      );
    }

    /*
     * --------------------------------------------------
     * LOAD SUBCATEGORIES
     * --------------------------------------------------
     */

    const {
      data: subcategories,
      error: subcategoryError,
    } =
      await supabase
        .from("subcategories")
        .select(
          "id,name,image_url,image_path"
        )
        .order(
          "created_at",
          {
            ascending: true,
          }
        )
        .limit(limit);

    if (subcategoryError) {
      return jsonResponse(
        {
          success: false,
          reason:
            "SUBCATEGORY_QUERY_FAILED",
          message:
            "Could not read subcategories.",
          error:
            subcategoryError.message,
        },
        500
      );
    }

    let processedCategories = 0;
    let processedSubcategories = 0;

    let migrated = 0;
    let failed = 0;
    let skipped = 0;
    let alreadyMigrated = 0;

    const results: any[] = [];

    /*
     * --------------------------------------------------
     * CATEGORIES
     * --------------------------------------------------
     */

    for (
      const category of
        categories ?? []
    ) {
      processedCategories++;

      const result: any = {
        type: "category",
        id: category.id,
        name: category.name,
        migrated: false,
        alreadyMigrated: false,
        skipped: false,
      };

      if (!category.image_url) {
        result.skipped = true;
        result.reason =
          "NO_IMAGE";

        skipped++;
        results.push(result);
        continue;
      }

      try {
        const migration =
          await migrateImage({
            url:
              category.image_url,
            currentPath:
              category.image_path,
            folder:
              "categories",
            prefix:
              "category",
          });

        if (
          migration.alreadyMigrated
        ) {
          alreadyMigrated++;

          result.alreadyMigrated =
            true;
          result.url =
            migration.newUrl;
          result.path =
            migration.newPath;
        } else if (
          migration.skipped
        ) {
          skipped++;

          result.skipped =
            true;
          result.reason =
            migration.reason;
        } else if (
          migration.migrated
        ) {
          const {
            error: updateError,
          } =
            await supabase
              .from("categories")
              .update({
                image_url:
                  migration.newUrl,
                image_path:
                  migration.newPath,
              })
              .eq(
                "id",
                category.id
              );

          if (updateError) {
            failed++;

            result.error =
              `Image uploaded but database update failed: ${updateError.message}`;
          } else {
            migrated++;

            result.migrated =
              true;
            result.oldUrl =
              migration.oldUrl;
            result.newUrl =
              migration.newUrl;
            result.newPath =
              migration.newPath;
          }
        }
      } catch (error) {
        failed++;

        result.error =
          error instanceof Error
            ? error.message
            : "Category migration failed.";
      }

      results.push(result);
    }

    /*
     * --------------------------------------------------
     * SUBCATEGORIES
     * --------------------------------------------------
     */

    for (
      const subcategory of
        subcategories ?? []
    ) {
      processedSubcategories++;

      const result: any = {
        type:
          "subcategory",
        id:
          subcategory.id,
        name:
          subcategory.name,
        migrated: false,
        alreadyMigrated: false,
        skipped: false,
      };

      if (
        !subcategory.image_url
      ) {
        result.skipped = true;
        result.reason =
          "NO_IMAGE";

        skipped++;
        results.push(result);
        continue;
      }

      try {
        const migration =
          await migrateImage({
            url:
              subcategory.image_url,
            currentPath:
              subcategory.image_path,
            folder:
              "subcategories",
            prefix:
              "subcategory",
          });

        if (
          migration.alreadyMigrated
        ) {
          alreadyMigrated++;

          result.alreadyMigrated =
            true;
          result.url =
            migration.newUrl;
          result.path =
            migration.newPath;
        } else if (
          migration.skipped
        ) {
          skipped++;

          result.skipped =
            true;
          result.reason =
            migration.reason;
        } else if (
          migration.migrated
        ) {
          const {
            error: updateError,
          } =
            await supabase
              .from(
                "subcategories"
              )
              .update({
                image_url:
                  migration.newUrl,
                image_path:
                  migration.newPath,
              })
              .eq(
                "id",
                subcategory.id
              );

          if (updateError) {
            failed++;

            result.error =
              `Image uploaded but database update failed: ${updateError.message}`;
          } else {
            migrated++;

            result.migrated =
              true;
            result.oldUrl =
              migration.oldUrl;
            result.newUrl =
              migration.newUrl;
            result.newPath =
              migration.newPath;
          }
        }
      } catch (error) {
        failed++;

        result.error =
          error instanceof Error
            ? error.message
            : "Subcategory migration failed.";
      }

      results.push(result);
    }

    /*
     * --------------------------------------------------
     * RESPONSE
     * --------------------------------------------------
     */

    return jsonResponse({
      success:
        failed === 0,

      message:
        failed === 0
          ? "Category and subcategory migration completed."
          : "Migration completed with some failures.",

      processed: {
        categories:
          processedCategories,
        subcategories:
          processedSubcategories,
        total:
          processedCategories +
          processedSubcategories,
      },

      migrated,
      failed,
      skipped,
      alreadyMigrated,

      limit,

      results,
    });
  } catch (error) {
    console.error(
      "[migration] Unexpected error:",
      error
    );

    return jsonResponse(
      {
        success: false,
        reason:
          "UNEXPECTED_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Unexpected migration error.",
      },
      500
    );
  }
});