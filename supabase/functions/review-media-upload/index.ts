import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const IMAGEKIT_PRIVATE_KEY =
  Deno.env.get("IMAGEKIT_PRIVATE_KEY")!;
const IMAGEKIT_PUBLIC_KEY =
  Deno.env.get("IMAGEKIT_PUBLIC_KEY")!;

const IMAGEKIT_UPLOAD_URL =
  "https://upload.imagekit.io/api/v1/files/upload";

const REVIEW_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const REVIEW_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const MAX_IMAGES = 5;
const MAX_VIDEOS = 1;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

function json(
  body: unknown,
  status = 200
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    }
  );
}

function cleanToken(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function cleanSlug(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function cleanUuid(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function cleanMediaType(value: unknown) {
  return value === "image" || value === "video"
    ? value
    : null;
}

async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  return Array.from(new Uint8Array(hash))
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

async function generateSignature(
  token: string,
  expire: number,
  privateKey: string
) {
  const encoder = new TextEncoder();

  const key =
    await crypto.subtle.importKey(
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

async function getTokenContext(
  supabase: ReturnType<typeof createClient>,
  token: string,
  productSlug: string
) {
  if (!token || !productSlug) {
    throw new Error(
      "Invalid review authorization."
    );
  }

  const tokenHash =
    await sha256Hex(token);

  const {
    data: tokenRow,
    error: tokenError,
  } = await supabase
    .from("review_request_tokens")
    .select(`
      id,
      order_id,
      customer_id,
      product_id,
      expires_at,
      used_at
    `)
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (tokenError) {
    console.error(
      "Review token lookup error:",
      tokenError
    );
    throw new Error(
      "Unable to verify review authorization."
    );
  }

  if (!tokenRow) {
    throw new Error(
      "Invalid review token."
    );
  }

  if (
    !tokenRow.expires_at ||
    new Date(tokenRow.expires_at).getTime() <=
      Date.now()
  ) {
    throw new Error(
      "Review token has expired."
    );
  }

  const {
    data: product,
    error: productError,
  } = await supabase
    .from("products")
    .select("id, slug")
    .eq("id", tokenRow.product_id)
    .eq("slug", productSlug)
    .maybeSingle();

  if (
    productError ||
    !product
  ) {
    throw new Error(
      "Review product does not match this token."
    );
  }

  return tokenRow;
}

function validateAuthorizeInput(
  mediaType: "image" | "video",
  contentType: string
) {
  if (mediaType === "image") {
    if (
      !REVIEW_IMAGE_TYPES.has(
        contentType
      )
    ) {
      throw new Error(
        "Unsupported image type."
      );
    }
  }

  if (mediaType === "video") {
    if (
      !REVIEW_VIDEO_TYPES.has(
        contentType
      )
    ) {
      throw new Error(
        "Unsupported video type."
      );
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return json(
      { error: "Method not allowed" },
      405
    );
  }

  try {
    if (
      !SUPABASE_URL ||
      !SUPABASE_SERVICE_ROLE_KEY ||
      !IMAGEKIT_PRIVATE_KEY ||
      !IMAGEKIT_PUBLIC_KEY
    ) {
      return json(
        {
          error:
            "Required environment variables are missing.",
        },
        500
      );
    }

    const body =
      await req.json();

    const mode =
      typeof body?.mode === "string"
        ? body.mode
        : "authorize";

    const token =
      cleanToken(body?.token);

    const productSlug =
      cleanSlug(
        body?.productSlug
      );

    const reviewId =
      cleanUuid(
        body?.reviewId
      );

    const supabase =
      createClient(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

    const tokenRow =
      await getTokenContext(
        supabase,
        token,
        productSlug
      );

    /*
     * =======================================================
     * AUTHORIZE IMAGEKIT UPLOAD
     * =======================================================
     *
     * This endpoint is intentionally separate from the normal
     * authenticated imagekit-auth function. The email-review
     * flow is token-authorized rather than session-authorized.
     */
    if (mode === "authorize") {
      const mediaType =
        cleanMediaType(
          body?.mediaType
        );

      const contentType =
        typeof body?.contentType ===
        "string"
          ? body.contentType
          : "";

      if (!mediaType) {
        throw new Error(
          "Invalid media type."
        );
      }

      validateAuthorizeInput(
        mediaType,
        contentType
      );

      if (!reviewId) {
        throw new Error(
          "Review ID is required."
        );
      }

      /*
       * After submit_review_from_token(), the token is marked
       * used. We therefore verify the newly-created review
       * belongs to the same customer/product/order represented
       * by the token.
       */
      const {
        data: review,
        error: reviewError,
      } = await supabase
        .from("reviews")
        .select(
          "id, customer_id, product_id, order_id"
        )
        .eq("id", reviewId)
        .eq(
          "customer_id",
          tokenRow.customer_id
        )
        .eq(
          "product_id",
          tokenRow.product_id
        )
        .eq(
          "order_id",
          tokenRow.order_id
        )
        .maybeSingle();

      if (
        reviewError ||
        !review
      ) {
        throw new Error(
          "Review is not authorized for this media upload."
        );
      }

      /*
       * Prevent more than 5 images / 1 video on the review.
       */
      const {
        data: existingMedia,
        error: mediaError,
      } = await supabase
        .from("review_media")
        .select(
          "media_type"
        )
        .eq(
          "review_id",
          reviewId
        );

      if (mediaError) {
        throw new Error(
          "Unable to check review media."
        );
      }

      const imageCount =
        (existingMedia || []).filter(
          (item) =>
            item.media_type ===
            "image"
        ).length;

      const videoCount =
        (existingMedia || []).filter(
          (item) =>
            item.media_type ===
            "video"
        ).length;

      if (
        mediaType === "image" &&
        imageCount >= MAX_IMAGES
      ) {
        throw new Error(
          `A review can have up to ${MAX_IMAGES} photos.`
        );
      }

      if (
        mediaType === "video" &&
        videoCount >= MAX_VIDEOS
      ) {
        throw new Error(
          "A review can have only 1 video."
        );
      }

      /*
       * ImageKit upload credentials expire in 40 minutes.
       */
      const imagekitToken =
        crypto.randomUUID();

      const expire =
        Math.floor(
          Date.now() / 1000
        ) + 2400;

      const signature =
        await generateSignature(
          imagekitToken,
          expire,
          IMAGEKIT_PRIVATE_KEY
        );

      return json({
        token: imagekitToken,
        expire,
        signature,
        publicKey:
          IMAGEKIT_PUBLIC_KEY,
        folder:
          `reviews/${reviewId}`,
      });
    }

    /*
     * =======================================================
     * ATTACH UPLOADED MEDIA
     * =======================================================
     */
    if (mode === "attach") {
      if (!reviewId) {
        throw new Error(
          "Review ID is required."
        );
      }

      if (
        !Array.isArray(
          body?.media
        ) ||
        body.media.length === 0
      ) {
        return json({
          success: true,
          media: [],
        });
      }

      if (
        body.media.length >
        MAX_IMAGES + MAX_VIDEOS
      ) {
        throw new Error(
          "Too many review media items."
        );
      }

      const {
        data: review,
        error: reviewError,
      } = await supabase
        .from("reviews")
        .select(
          "id, customer_id, product_id, order_id"
        )
        .eq("id", reviewId)
        .eq(
          "customer_id",
          tokenRow.customer_id
        )
        .eq(
          "product_id",
          tokenRow.product_id
        )
        .eq(
          "order_id",
          tokenRow.order_id
        )
        .maybeSingle();

      if (
        reviewError ||
        !review
      ) {
        throw new Error(
          "Review is not authorized for this media."
        );
      }

      const {
        data: existingMedia,
        error: existingMediaError,
      } = await supabase
        .from("review_media")
        .select(
          "media_type"
        )
        .eq(
          "review_id",
          reviewId
        );

      if (existingMediaError) {
        throw new Error(
          "Unable to check existing review media."
        );
      }

      let imageCount =
        (existingMedia || []).filter(
          (item) =>
            item.media_type ===
            "image"
        ).length;

      let videoCount =
        (existingMedia || []).filter(
          (item) =>
            item.media_type ===
            "video"
        ).length;

      const rows = [];

      for (
        let index = 0;
        index < body.media.length;
        index += 1
      ) {
        const item =
          body.media[index];

        const mediaType =
          cleanMediaType(
            item?.media_type
          );

        const mediaUrl =
          typeof item?.media_url ===
          "string"
            ? item.media_url.trim()
            : "";

        const storagePath =
          typeof item?.storage_path ===
          "string"
            ? item.storage_path.trim()
            : "";

        const thumbnailUrl =
          typeof item?.thumbnail_url ===
          "string"
            ? item.thumbnail_url.trim()
            : null;

        if (!mediaType) {
          throw new Error(
            "Invalid review media type."
          );
        }

        if (
          !mediaUrl ||
          !mediaUrl.startsWith(
            "https://ik.imagekit.io/"
          )
        ) {
          throw new Error(
            "Invalid review media URL."
          );
        }

        if (
          !storagePath.startsWith(
            "imagekit:"
          )
        ) {
          throw new Error(
            "Invalid review media storage path."
          );
        }

        if (
          mediaType === "image"
        ) {
          imageCount += 1;

          if (
            imageCount >
            MAX_IMAGES
          ) {
            throw new Error(
              `A review can have up to ${MAX_IMAGES} photos.`
            );
          }
        } else {
          videoCount += 1;

          if (
            videoCount >
            MAX_VIDEOS
          ) {
            throw new Error(
              "A review can have only 1 video."
            );
          }
        }

        rows.push({
          review_id: reviewId,
          media_type: mediaType,
          media_url: mediaUrl,
          storage_path: storagePath,
          thumbnail_url:
            thumbnailUrl || null,
          sort_order: index,
        });
      }

      const {
        data: inserted,
        error: insertError,
      } = await supabase
        .from("review_media")
        .insert(rows)
        .select(`
          id,
          review_id,
          media_type,
          media_url,
          storage_path,
          thumbnail_url,
          sort_order,
          created_at
        `);

      if (insertError) {
        console.error(
          "Review media insert error:",
          insertError
        );

        throw new Error(
          "Review media could not be attached."
        );
      }

      return json({
        success: true,
        media: inserted || [],
      });
    }

    return json(
      {
        error:
          "Unsupported mode.",
      },
      400
    );
  } catch (error) {
    console.error(
      "Review media upload error:",
      error
    );

    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      400
    );
  }
});
