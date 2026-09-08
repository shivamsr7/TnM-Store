import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BUCKET = "media";
const IMAGEKIT_UPLOAD_URL =
  "https://upload.imagekit.io/api/v1/files/upload";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    // --------------------------------------------------
    // 1. Authentication
    // --------------------------------------------------

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return json(
        {
          error: "Authentication required",
        },
        401
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const privateKey = Deno.env.get("IMAGEKIT_PRIVATE_KEY");
    const publicKey = Deno.env.get("IMAGEKIT_PUBLIC_KEY");

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !privateKey ||
      !publicKey
    ) {
      throw new Error(
        "Required environment variables are missing"
      );
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
      return json(
        {
          error: "Invalid or expired authentication",
        },
        401
      );
    }

    // --------------------------------------------------
    // 2. Read request
    // --------------------------------------------------

    const body = await req.json().catch(() => ({}));

    const limit =
      typeof body.limit === "number" &&
      body.limit > 0 &&
      body.limit <= 50
        ? Math.floor(body.limit)
        : 10;

    // --------------------------------------------------
    // 3. Find old Supabase product images
    // --------------------------------------------------

    const { data: images, error: imagesError } =
      await supabase
        .from("product_images")
        .select(
          "id, product_id, image_url, storage_path, sort_order, is_primary"
        )
        .not("image_url", "is", null)
        .not(
          "image_url",
          "like",
          "https://ik.imagekit.io/%"
        )
        .limit(limit);

    if (imagesError) {
      throw imagesError;
    }

    if (!images || images.length === 0) {
      return json({
        success: true,
        message: "No product images need migration",
        processed: 0,
        migrated: 0,
        failed: 0,
      });
    }

    const results = [];

    // --------------------------------------------------
    // 4. Process images one by one
    // --------------------------------------------------

    for (const image of images) {
      try {
        if (!image.image_url) {
          throw new Error("Missing image URL");
        }

        // ----------------------------------------------
        // Download existing Supabase image
        // ----------------------------------------------

        const sourceResponse = await fetch(
          image.image_url
        );

        if (!sourceResponse.ok) {
          throw new Error(
            `Failed to download source image: ${sourceResponse.status}`
          );
        }

        const contentType =
          sourceResponse.headers.get("content-type") ||
          "image/jpeg";

        const arrayBuffer =
          await sourceResponse.arrayBuffer();

        const extension =
          getExtension(contentType);

        const fileName =
          `product-${image.product_id}-${image.id}-${crypto.randomUUID()}.${extension}`;

        // ----------------------------------------------
        // ImageKit authentication
        // ----------------------------------------------

        const token = crypto.randomUUID();

        const expire =
          Math.floor(Date.now() / 1000) + 2400;

        const signature = await createSignature(
          token,
          expire.toString(),
          privateKey
        );

        // ----------------------------------------------
        // Upload to ImageKit
        // ----------------------------------------------

        const formData = new FormData();

        const blob = new Blob(
          [arrayBuffer],
          {
            type: contentType,
          }
        );

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
          "publicKey",
          publicKey
        );

        formData.append(
          "signature",
          signature
        );

        formData.append(
          "expire",
          expire.toString()
        );

        formData.append(
          "token",
          token
        );

        formData.append(
          "useUniqueFileName",
          "true"
        );

        formData.append(
          "folder",
          "/products"
        );

        const uploadResponse = await fetch(
          IMAGEKIT_UPLOAD_URL,
          {
            method: "POST",
            body: formData,
          }
        );

        const uploadText =
          await uploadResponse.text();

        let uploadResult: any;

        try {
          uploadResult =
            JSON.parse(uploadText);
        } catch {
          uploadResult = {
            raw: uploadText,
          };
        }

        if (!uploadResponse.ok) {
          throw new Error(
            `ImageKit upload failed: ${JSON.stringify(
              uploadResult
            )}`
          );
        }

        if (
          !uploadResult.fileId ||
          !uploadResult.url
        ) {
          throw new Error(
            "ImageKit returned an invalid upload response"
          );
        }

        // ----------------------------------------------
        // Update database
        // ----------------------------------------------

        const newImageUrl =
          uploadResult.url;

        const newStoragePath =
          `imagekit:${uploadResult.fileId}`;

        const { error: updateError } =
          await supabase
            .from("product_images")
            .update({
              image_url: newImageUrl,
              storage_path: newStoragePath,
            })
            .eq("id", image.id);

        if (updateError) {
          throw updateError;
        }

        results.push({
          id: image.id,
          status: "migrated",
          oldUrl: image.image_url,
          newUrl: newImageUrl,
          fileId: uploadResult.fileId,
        });
      } catch (error) {
        console.error(
          `Migration failed for image ${image.id}:`,
          error
        );

        results.push({
          id: image.id,
          status: "failed",
          error:
            error instanceof Error
              ? error.message
              : String(error),
        });
      }
    }

    const migrated =
      results.filter(
        (r) => r.status === "migrated"
      ).length;

    const failed =
      results.filter(
        (r) => r.status === "failed"
      ).length;

    return json({
      success: true,
      processed: results.length,
      migrated,
      failed,
      results,
      migratedBy: user.email ?? user.id,
    });
  } catch (error) {
    console.error(
      "migrate-product-images error:",
      error
    );

    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error",
      },
      500
    );
  }
});

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------

function json(
  data: unknown,
  status = 200
) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type":
          "application/json",
        "Cache-Control":
          "no-store",
      },
    }
  );
}

async function createSignature(
  token: string,
  expire: string,
  privateKey: string
) {
  const encoder =
    new TextEncoder();

  const keyData =
    encoder.encode(privateKey);

  const message =
    encoder.encode(
      token + expire
    );

  const cryptoKey =
    await crypto.subtle.importKey(
      "raw",
      keyData,
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
      cryptoKey,
      message
    );

  return Array.from(
    new Uint8Array(signatureBuffer)
  )
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, "0")
    )
    .join("");
}

function getExtension(
  contentType: string
) {
  switch (contentType) {
    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    case "image/gif":
      return "gif";

    case "image/avif":
      return "avif";

    case "image/svg+xml":
      return "svg";

    default:
      return "jpg";
  }
}