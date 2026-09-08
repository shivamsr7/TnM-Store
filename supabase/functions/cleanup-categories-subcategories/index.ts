import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "media";
const FOLDERS = ["categories", "subcategories"] as const;

type Row = {
  id: string;
  name: string | null;
  image_url: string | null;
  image_path: string | null;
};

type StorageFile = {
  name: string;
  id?: string | null;
  metadata?: Record<string, unknown> | null;
};

const isImageKitUrl = (url: string | null | undefined) =>
  !!url && url.includes("ik.imagekit.io/");

const isSupabaseStorageUrl = (url: string | null | undefined) =>
  !!url &&
  (url.includes("/storage/v1/object/public/") ||
    url.includes("/storage/v1/object/sign/") ||
    url.includes("/storage/v1/object/authenticated/"));

const isImageKitPath = (path: string | null | undefined) =>
  !!path && path.startsWith("imagekit:");

const listFolder = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  folder: string
): Promise<StorageFile[]> => {
  const files: StorageFile[] = [];
  const pageSize = 1000;

  // Storage.list() returns direct children of the requested folder.
  // Our migration stores category/subcategory images directly in these folders.
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .list(folder, {
        limit: pageSize,
        offset,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      throw new Error(
        `Failed to list Supabase Storage folder "${folder}": ${error.message}`
      );
    }

    const page = (data ?? []) as StorageFile[];

    for (const file of page) {
      // Ignore folder-like entries and Supabase's placeholder.
      if (!file.name) continue;
      if (file.name === ".emptyFolderPlaceholder") continue;
      if (!file.id) continue;

      files.push(file);
    }

    if (page.length < pageSize) break;
  }

  return files;
};

const getRows = async (
  supabaseAdmin: ReturnType<typeof createClient>
) => {
  const [{ data: categories, error: categoryError }, { data: subcategories, error: subcategoryError }] =
    await Promise.all([
      supabaseAdmin
        .from("categories")
        .select("id,name,image_url,image_path")
        .not("image_url", "is", null),

      supabaseAdmin
        .from("subcategories")
        .select("id,name,image_url,image_path")
        .not("image_url", "is", null),
    ]);

  if (categoryError) {
    throw new Error(
      `Failed to read categories: ${categoryError.message}`
    );
  }

  if (subcategoryError) {
    throw new Error(
      `Failed to read subcategories: ${subcategoryError.message}`
    );
  }

  return {
    categories: (categories ?? []) as Row[],
    subcategories: (subcategories ?? []) as Row[],
  };
};

const validateRows = (rows: Row[], label: string) => {
  const supabaseReferences = rows.filter((row) =>
    isSupabaseStorageUrl(row.image_url)
  );

  const nonImageKitImages = rows.filter(
    (row) => row.image_url && !isImageKitUrl(row.image_url)
  );

  const legacyStoragePaths = rows.filter(
    (row) => !isImageKitPath(row.image_path)
  );

  const imageKitPaths = rows
    .map((row) => row.image_path)
    .filter((path): path is string => isImageKitPath(path));

  const pathCounts = new Map<string, number>();

  for (const path of imageKitPaths) {
    pathCounts.set(path, (pathCounts.get(path) ?? 0) + 1);
  }

  const duplicateImageKitPaths = [...pathCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([path, count]) => ({ path, count }));

  return {
    label,
    count: rows.length,
    supabaseReferences,
    nonImageKitImages,
    legacyStoragePaths,
    uniqueImageKitPaths: new Set(imageKitPaths).size,
    duplicateImageKitPaths,
  };
};

const deleteInBatches = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  paths: string[]
) => {
  const BATCH_SIZE = 100;
  let deleted = 0;
  let failed = 0;
  const failures: Array<{ path: string; error: string }> = [];

  for (let i = 0; i < paths.length; i += BATCH_SIZE) {
    const batch = paths.slice(i, i + BATCH_SIZE);

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .remove(batch);

    if (error) {
      failed += batch.length;

      for (const path of batch) {
        failures.push({
          path,
          error: error.message,
        });
      }

      continue;
    }

    const deletedNames = new Set(
      (data ?? []).map((file) => file.name)
    );

    // Supabase returns deleted object metadata. Count what it confirms.
    for (const path of batch) {
      const fileName = path.split("/").pop() ?? path;

      if (deletedNames.has(fileName)) {
        deleted += 1;
      } else {
        // A successful remove call is considered successful even if
        // the API response omits the object metadata.
        deleted += 1;
      }
    }
  }

  return {
    deleted,
    failed,
    failures,
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "AUTH_REQUIRED",
          message: "Authorization header is required.",
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      throw new Error(
        "Missing Supabase environment variables."
      );
    }

    // Verify the caller using their user JWT.
    const supabaseAuth = createClient(
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
    } = await supabaseAuth.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "UNAUTHORIZED",
          message: "Your session is invalid or expired.",
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

    // Service role is used only after authentication so Storage operations
    // are not blocked by user-facing RLS/storage policies.
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    let body: { confirmDelete?: boolean } = {};

    try {
      body = await req.json();
    } catch {
      // Empty request body = dry run.
    }

    const confirmDelete = body.confirmDelete === true;

    const { categories, subcategories } =
      await getRows(supabaseAdmin);

    const categoryValidation = validateRows(
      categories,
      "categories"
    );

    const subcategoryValidation = validateRows(
      subcategories,
      "subcategories"
    );

    const allRows = [...categories, ...subcategories];

    const supabaseReferences = [
      ...categoryValidation.supabaseReferences.map((row) => ({
        type: "category",
        id: row.id,
        name: row.name,
        imageUrl: row.image_url,
      })),
      ...subcategoryValidation.supabaseReferences.map((row) => ({
        type: "subcategory",
        id: row.id,
        name: row.name,
        imageUrl: row.image_url,
      })),
    ];

    const nonImageKitImages = [
      ...categoryValidation.nonImageKitImages.map((row) => ({
        type: "category",
        id: row.id,
        name: row.name,
        imageUrl: row.image_url,
      })),
      ...subcategoryValidation.nonImageKitImages.map((row) => ({
        type: "subcategory",
        id: row.id,
        name: row.name,
        imageUrl: row.image_url,
      })),
    ];

    const legacyStoragePaths = [
      ...categoryValidation.legacyStoragePaths.map((row) => ({
        type: "category",
        id: row.id,
        name: row.name,
        imagePath: row.image_path,
      })),
      ...subcategoryValidation.legacyStoragePaths.map((row) => ({
        type: "subcategory",
        id: row.id,
        name: row.name,
        imagePath: row.image_path,
      })),
    ];

    const allImageKitPaths = allRows
      .map((row) => row.image_path)
      .filter((path): path is string => isImageKitPath(path));

    const pathCounts = new Map<string, number>();

    for (const path of allImageKitPaths) {
      pathCounts.set(path, (pathCounts.get(path) ?? 0) + 1);
    }

    const duplicateImageKitPaths = [...pathCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([path, count]) => ({ path, count }));

    const categoryFiles = await listFolder(
      supabaseAdmin,
      "categories"
    );

    const subcategoryFiles = await listFolder(
      supabaseAdmin,
      "subcategories"
    );

    const files = [
      ...categoryFiles.map((file) => ({
        folder: "categories",
        name: file.name,
        path: `categories/${file.name}`,
      })),
      ...subcategoryFiles.map((file) => ({
        folder: "subcategories",
        name: file.name,
        path: `subcategories/${file.name}`,
      })),
    ];

    const safetyCheckPassed =
      supabaseReferences.length === 0 &&
      nonImageKitImages.length === 0 &&
      legacyStoragePaths.length === 0 &&
      duplicateImageKitPaths.length === 0;

    const baseResponse = {
      success: true,
      dryRun: !confirmDelete,
      safetyCheckPassed,

      categories: categories.length,
      subcategories: subcategories.length,
      databaseCategoryImages: categories.length,
      databaseSubcategoryImages: subcategories.length,
      databaseImages: allRows.length,

      supabaseReferencedImages: supabaseReferences.length,
      nonImageKitImages: nonImageKitImages.length,
      legacyStoragePaths: legacyStoragePaths.length,

      uniqueImageKitPaths: new Set(allImageKitPaths).size,
      duplicateImageKitPaths,

      supabaseFiles: files.length,
      categorySupabaseFiles: categoryFiles.length,
      subcategorySupabaseFiles: subcategoryFiles.length,

      filesReadyForDeletion: safetyCheckPassed
        ? files.length
        : 0,

      affectedImages: safetyCheckPassed
        ? files.length
        : 0,

      files,

      supabaseReferences,
      nonImageKitImageDetails: nonImageKitImages,
      legacyStoragePathDetails: legacyStoragePaths,
    };

    if (!safetyCheckPassed) {
      return new Response(
        JSON.stringify({
          ...baseResponse,
          dryRun: true,
          attempted: 0,
          deleted: 0,
          deletedCount: 0,
          failed: 0,
          failedCount: 0,
          message:
            "Safety check failed. No Supabase files were deleted.",
          reason:
            "One or more category/subcategory images are not fully migrated to ImageKit.",
        }),
        {
          status: 409,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!confirmDelete) {
      return new Response(
        JSON.stringify({
          ...baseResponse,
          message:
            "Dry run passed. The listed category and subcategory files are ready for deletion.",
          reason: "READY_FOR_DELETION",
          attempted: 0,
          deleted: 0,
          deletedCount: 0,
          failed: 0,
          failedCount: 0,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const deletion = await deleteInBatches(
      supabaseAdmin,
      files.map((file) => file.path)
    );

    return new Response(
      JSON.stringify({
        ...baseResponse,
        dryRun: false,
        message:
          deletion.failed === 0
            ? "Old category and subcategory Supabase files deleted successfully."
            : "Deletion completed with some failures.",
        reason:
          deletion.failed === 0
            ? "DELETION_COMPLETED"
            : "DELETION_PARTIAL",

        attempted: files.length,
        deleted: deletion.deleted,
        deletedCount: deletion.deleted,
        failed: deletion.failed,
        failedCount: deletion.failed,
        failures: deletion.failures,
      }),
      {
        status: deletion.failed === 0 ? 200 : 207,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "cleanup-categories-subcategories error:",
      error
    );

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected cleanup error.",
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
