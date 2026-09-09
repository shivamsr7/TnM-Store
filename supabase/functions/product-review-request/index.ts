import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
  "SUPABASE_SERVICE_ROLE_KEY"
);

const SITE_URL = "https://tnmonline.in";
const SEND_EMAIL_FUNCTION = "send-email";

const TOKEN_VALIDITY_DAYS = 30;
const ORDER_BATCH_SIZE = 100;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase environment variables are not configured");
}

const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (error && typeof error === "object") {
    try {
      return JSON.parse(JSON.stringify(error));
    } catch {
      return {
        message: String(error),
      };
    }
  }

  return {
    message: String(error),
  };
}

function generateSecureToken(): string {
  const bytes = new Uint8Array(32);

  crypto.getRandomValues(bytes);

  return Array.from(bytes)
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

async function hashToken(
  token: string
): Promise<string> {
  const data =
    new TextEncoder().encode(token);

  const hashBuffer =
    await crypto.subtle.digest(
      "SHA-256",
      data
    );

  return Array.from(
    new Uint8Array(hashBuffer)
  )
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

function escapeHtml(
  value: unknown
): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildReviewUrl(
  productSlug: string,
  token: string
): string {
  return `${SITE_URL}/review/${encodeURIComponent(
    productSlug
  )}?token=${encodeURIComponent(token)}`;
}

function buildReviewEmailHtml({
  customerName,
  orderNumber,
  products,
}: {
  customerName: string;
  orderNumber: string;
  products: Array<{
    name: string;
    imageUrl: string | null;
    reviewUrl: string;
  }>;
}): string {
  const firstName =
    customerName?.trim()?.split(/\s+/)[0] ||
    "there";

  const productCards =
    products
      .map((product) => {
        const image =
          product.imageUrl
            ? `
          <img
            src="${escapeHtml(
              product.imageUrl
            )}"
            alt="${escapeHtml(
              product.name
            )}"
            width="180"
            style="
              display:block;
              width:180px;
              max-width:100%;
              height:auto;
              margin:0 auto 18px;
              border-radius:12px;
            "
          />
        `
            : "";

        return `
        <div
          style="
            background:#ffffff;
            border:1px solid #e8e4de;
            border-radius:14px;
            padding:22px;
            margin:0 0 16px;
            text-align:center;
          "
        >
          ${image}

          <div
            style="
              font-family:Arial,Helvetica,sans-serif;
              font-size:17px;
              line-height:25px;
              font-weight:600;
              color:#17130f;
              margin-bottom:16px;
            "
          >
            ${escapeHtml(
              product.name
            )}
          </div>

          <a
            href="${escapeHtml(
              product.reviewUrl
            )}"
            style="
              display:inline-block;
              background:#17130f;
              color:#ffffff;
              text-decoration:none;
              font-family:Arial,Helvetica,sans-serif;
              font-size:14px;
              font-weight:600;
              padding:12px 24px;
              border-radius:8px;
            "
          >
            Share Your Review
          </a>
        </div>
      `;
      })
      .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width,initial-scale=1.0"
  />
  <title>
    How was your T&amp;M Jewels order?
  </title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f6f6f4;
  "
>
  <div
    style="
      width:100%;
      background:#f6f6f4;
      padding:28px 12px;
      box-sizing:border-box;
    "
  >
    <div
      style="
        max-width:600px;
        margin:0 auto;
        background:#ffffff;
        border:1px solid #e8e4de;
        border-radius:16px;
        overflow:hidden;
      "
    >

      <div
        style="
          padding:24px;
          border-bottom:1px solid #eeeae4;
          text-align:center;
        "
      >
        <div
          style="
            font-family:Georgia,'Times New Roman',serif;
            color:#17130f;
            font-size:22px;
            letter-spacing:1.2px;
            font-weight:600;
          "
        >
          T&amp;M JEWELS
        </div>
      </div>

      <div
        style="
          padding:32px 24px 24px;
        "
      >

        <div
          style="
            font-family:Arial,Helvetica,sans-serif;
            color:#17130f;
            font-size:24px;
            line-height:32px;
            font-weight:600;
            text-align:center;
          "
        >
          How was your order?
        </div>

        <div
          style="
            font-family:Arial,Helvetica,sans-serif;
            color:#5f5a55;
            font-size:15px;
            line-height:24px;
            text-align:center;
            margin:14px auto 24px;
            max-width:470px;
          "
        >
          Hi ${escapeHtml(
            firstName
          )}, your T&amp;M Jewels order has been
          delivered. We'd appreciate it if you could
          share your experience with your purchase.
        </div>

        <div
          style="
            font-family:Arial,Helvetica,sans-serif;
            color:#77716b;
            font-size:12px;
            line-height:18px;
            text-align:center;
            margin-bottom:20px;
          "
        >
          Order ${escapeHtml(
            orderNumber
          )}
        </div>

        ${productCards}

        <div
          style="
            font-family:Arial,Helvetica,sans-serif;
            color:#77716b;
            font-size:13px;
            line-height:21px;
            text-align:center;
            padding:4px 8px 8px;
          "
        >
          Your feedback helps us improve our
          products and service.
        </div>

      </div>

      <div
        style="
          border-top:1px solid #eeeae4;
          padding:20px 24px 24px;
          text-align:center;
        "
      >
        <div
          style="
            font-family:Arial,Helvetica,sans-serif;
            color:#8a837c;
            font-size:11px;
            line-height:18px;
          "
        >
          Thank you for shopping with
          T&amp;M Jewels.
        </div>

        <div
          style="
            font-family:Arial,Helvetica,sans-serif;
            color:#aaa39c;
            font-size:10px;
            margin-top:6px;
          "
        >
          T&amp;M Jewels
        </div>
      </div>

    </div>
  </div>
</body>
</html>
`;
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/${SEND_EMAIL_FUNCTION}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey:
          SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        to,
        subject,
        html,
      }),
    }
  );

  const data =
    await response.json().catch(
      () => null
    );

  if (!response.ok) {
    throw new Error(
      `send-email failed (${response.status}): ${JSON.stringify(
        data
      )}`
    );
  }

  return data;
}

/*
 * =========================================================
 * CREATE / REUSE REVIEW REQUEST + TOKEN
 *
 * This is used immediately when an order becomes Delivered.
 *
 * IMPORTANT:
 * - No email is sent here.
 * - The raw token is returned only so the existing
 *   Delivered Order email can contain the secure link.
 * - The token hash is what is stored in the database.
 * =========================================================
 */
async function prepareReviewLinks(
  orderId: string
) {
  const {
    data: order,
    error: orderError,
  } = await supabaseAdmin
    .from("orders")
    .select(
      `
        id,
        order_number,
        customer_id,
        customer_name,
        customer_email,
        order_status,
        delivered_at
      `
    )
    .eq("id", orderId)
    .single();

  if (orderError) {
    throw orderError;
  }

  if (!order) {
    throw new Error(
      "Order not found"
    );
  }

  if (
    order.order_status !==
    "delivered"
  ) {
    throw new Error(
      "Review links can only be prepared for delivered orders"
    );
  }

  if (!order.delivered_at) {
    throw new Error(
      "Delivered timestamp is missing"
    );
  }

  if (!order.customer_id) {
    return {
      orderId: order.id,
      orderNumber:
        order.order_number,
      products: [],
    };
  }

  const customerEmail =
    order.customer_email?.trim();

  if (!customerEmail) {
    return {
      orderId: order.id,
      orderNumber:
        order.order_number,
      products: [],
    };
  }

  /*
   * =======================================================
   * Get products from this order
   * =======================================================
   */

  const {
    data: orderItems,
    error: itemsError,
  } = await supabaseAdmin
    .from("order_items")
    .select(
      `
        id,
        product_id,
        product_name,
        product_image
      `
    )
    .eq(
      "order_id",
      order.id
    )
    .not(
      "product_id",
      "is",
      null
    );

  if (itemsError) {
    throw itemsError;
  }

  if (!orderItems?.length) {
    return {
      orderId: order.id,
      orderNumber:
        order.order_number,
      products: [],
    };
  }

  const uniqueProductIds = [
    ...new Set(
      orderItems
        .map(
          (item) =>
            item.product_id
        )
        .filter(Boolean)
    ),
  ];

  if (!uniqueProductIds.length) {
    return {
      orderId: order.id,
      orderNumber:
        order.order_number,
      products: [],
    };
  }

  /*
   * =======================================================
   * Product details
   * =======================================================
   */

  const {
    data: products,
    error: productsError,
  } = await supabaseAdmin
    .from("products")
    .select(
      `
        id,
        name,
        slug
      `
    )
    .in(
      "id",
      uniqueProductIds
    );

  if (productsError) {
    throw productsError;
  }

  const productMap =
    new Map(
      (products ?? []).map(
        (product) => [
          product.id,
          product,
        ]
      )
    );

  /*
   * =======================================================
   * Product images
   * =======================================================
   */

  const {
    data: productImages,
    error: imagesError,
  } = await supabaseAdmin
    .from("product_images")
    .select(
      `
        id,
        product_id,
        image_url,
        sort_order,
        is_primary
      `
    )
    .in(
      "product_id",
      uniqueProductIds
    )
    .order(
      "sort_order",
      {
        ascending: true,
      }
    );

  if (imagesError) {
    throw imagesError;
  }

  const imageMap =
    new Map<string, string>();

  for (
    const image of
      productImages ?? []
  ) {
    if (
      !imageMap.has(
        image.product_id
      )
    ) {
      imageMap.set(
        image.product_id,
        image.image_url
      );
    }

    if (
      image.is_primary
    ) {
      imageMap.set(
        image.product_id,
        image.image_url
      );
    }
  }

  /*
   * =======================================================
   * Existing reviews
   * =======================================================
   */

  const {
    data: existingReviews,
    error: reviewsError,
  } = await supabaseAdmin
    .from("reviews")
    .select(
      "product_id"
    )
    .eq(
      "customer_id",
      order.customer_id
    )
    .in(
      "product_id",
      uniqueProductIds
    );

  if (reviewsError) {
    throw reviewsError;
  }

  const reviewedProductIds =
    new Set(
      (
        existingReviews ??
        []
      ).map(
        (review) =>
          review.product_id
      )
    );

  /*
   * =======================================================
   * Existing review requests
   * =======================================================
   */

  const {
    data: existingRequests,
    error: requestsError,
  } = await supabaseAdmin
    .from(
      "product_review_requests"
    )
    .select(
      `
        id,
        order_id,
        product_id,
        status,
        initial_sent_at,
        reminder_sent_at
      `
    )
    .eq(
      "customer_id",
      order.customer_id
    )
    .in(
      "product_id",
      uniqueProductIds
    );

  if (requestsError) {
    throw requestsError;
  }

  const requestMap =
    new Map<
      string,
      {
        id: string;
        order_id: string;
        product_id: string;
        status: string;
        initial_sent_at:
          string | null;
        reminder_sent_at:
          string | null;
      }
    >();

  for (
    const request of
      existingRequests ?? []
  ) {
    requestMap.set(
      request.product_id,
      request
    );
  }

  /*
   * =======================================================
   * Prepare links
   * =======================================================
   */

  const preparedProducts:
    Array<{
      productId: string;
      productName: string;
      productSlug: string;
      imageUrl: string | null;
      reviewUrl: string;
      requestId: string;
    }> = [];

  for (
    const productId of
      uniqueProductIds
  ) {
    const product =
      productMap.get(
        productId
      );

    if (!product) {
      continue;
    }

    if (!product.slug) {
      continue;
    }

    /*
     * Customer has already reviewed this product.
     * No review CTA.
     */
    if (
      reviewedProductIds.has(
        productId
      )
    ) {
      continue;
    }

    const existingRequest =
      requestMap.get(
        productId
      );

    /*
     * =====================================================
     * Existing request
     * =====================================================
     */

    if (existingRequest) {
      /*
       * A successfully sent request already exists.
       *
       * We do not create another request/token.
       */
      if (
        existingRequest.status ===
        "sent"
      ) {
        /*
         * If initial_sent_at exists, this is a request
         * created by the new system.
         *
         * We still need a usable token for the Delivered
         * email. Look for an existing unused token.
         */
        const {
          data: existingToken,
          error:
            existingTokenError,
        } = await supabaseAdmin
          .from(
            "review_request_tokens"
          )
          .select(
            `
              token_hash,
              expires_at,
              used_at
            `
          )
          .eq(
            "review_request_id",
            existingRequest.id
          )
          .is(
            "used_at",
            null
          )
          .gt(
            "expires_at",
            new Date().toISOString()
          )
          .maybeSingle();

        if (
          existingTokenError
        ) {
          throw existingTokenError;
        }

        /*
         * We cannot reconstruct the raw token from its hash.
         *
         * Therefore an old sent request cannot be used to
         * generate a new raw URL.
         *
         * Since this means the review request already exists,
         * do not create a duplicate request.
         */
        if (
          !existingToken
        ) {
          continue;
        }

        /*
         * IMPORTANT:
         * We intentionally cannot expose an old raw token.
         *
         * The new delivery flow will normally create the
         * request before the first Delivered email.
         */
        continue;
      }
    }

    /*
     * =====================================================
     * Existing failed request
     * =====================================================
     *
     * Reuse it.
     */

    let requestId =
      existingRequest?.id ??
      null;

    if (!requestId) {
      const {
        data: newRequest,
        error:
          insertRequestError,
      } = await supabaseAdmin
        .from(
          "product_review_requests"
        )
        .insert({
          customer_id:
            order.customer_id,
          order_id:
            order.id,
          product_id:
            productId,
          status:
            "failed",
        })
        .select(
          `
            id,
            order_id,
            product_id,
            status,
            initial_sent_at,
            reminder_sent_at
          `
        )
        .single();

      if (
        insertRequestError
      ) {
        /*
         * Another invocation may have created
         * the request concurrently.
         */
        if (
          insertRequestError.code ===
          "23505"
        ) {
          const {
            data:
              concurrentRequest,
            error:
              concurrentRequestError,
          } = await supabaseAdmin
            .from(
              "product_review_requests"
            )
            .select(
              `
                id,
                order_id,
                product_id,
                status,
                initial_sent_at,
                reminder_sent_at
              `
            )
            .eq(
              "customer_id",
              order.customer_id
            )
            .eq(
              "product_id",
              productId
            )
            .maybeSingle();

          if (
            concurrentRequestError
          ) {
            throw concurrentRequestError;
          }

          if (
            !concurrentRequest
          ) {
            throw insertRequestError;
          }

          /*
           * If concurrent invocation already successfully
           * sent the request, do not create another one.
           */
          if (
            concurrentRequest.status ===
            "sent"
          ) {
            continue;
          }

          requestId =
            concurrentRequest.id;
        } else {
          throw insertRequestError;
        }
      } else {
        requestId =
          newRequest.id;
      }
    } else {
      /*
       * Reuse failed request.
       *
       * Make sure it points to this delivered order.
       */
      if (
        existingRequest &&
        existingRequest.order_id !==
          order.id
      ) {
        const {
          error:
            requestOrderUpdateError,
        } = await supabaseAdmin
          .from(
            "product_review_requests"
          )
          .update({
            order_id:
              order.id,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            requestId
          );

        if (
          requestOrderUpdateError
        ) {
          throw requestOrderUpdateError;
        }
      }
    }

    if (!requestId) {
      continue;
    }

    /*
     * =====================================================
     * Delete previous unused token
     * =====================================================
     */

    const {
      error:
        deleteTokenError,
    } = await supabaseAdmin
      .from(
        "review_request_tokens"
      )
      .delete()
      .eq(
        "review_request_id",
        requestId
      )
      .is(
        "used_at",
        null
      );

    if (
      deleteTokenError
    ) {
      throw deleteTokenError;
    }

    /*
     * =====================================================
     * Generate secure token
     * =====================================================
     */

    const rawToken =
      generateSecureToken();

    const tokenHash =
      await hashToken(
        rawToken
      );

    const expiresAt =
      new Date(
        Date.now() +
          TOKEN_VALIDITY_DAYS *
            24 *
            60 *
            60 *
            1000
      ).toISOString();

    /*
     * =====================================================
     * Store token hash
     * =====================================================
     */

    const {
      data: insertedToken,
      error: tokenError,
    } = await supabaseAdmin
      .from(
        "review_request_tokens"
      )
      .insert({
        review_request_id:
          requestId,
        order_id:
          order.id,
        customer_id:
          order.customer_id,
        product_id:
          productId,
        token_hash:
          tokenHash,
        expires_at:
          expiresAt,
      })
      .select("id")
      .single();

    if (
      tokenError
    ) {
      throw tokenError;
    }

    if (
      !insertedToken?.id
    ) {
      throw new Error(
        "Review token was not created"
      );
    }

    /*
     * =====================================================
     * Build secure review URL
     * =====================================================
     */

    const reviewUrl =
      buildReviewUrl(
        product.slug,
        rawToken
      );

    const orderItem =
      orderItems.find(
        (item) =>
          item.product_id ===
          productId
      );

    preparedProducts.push({
      productId,
      productName:
        product.name ||
        orderItem?.product_name ||
        "Your T&M Jewels Product",
      productSlug:
        product.slug,
      imageUrl:
        imageMap.get(
          productId
        ) ??
        orderItem?.product_image ??
        null,
      reviewUrl,
      requestId,
    });
  }

  /*
   * =======================================================
   * Mark requests as prepared.
   *
   * IMPORTANT:
   * We do NOT mark initial_sent_at here.
   *
   * order.service.ts will do that only after the existing
   * Delivered email succeeds.
   * =======================================================
   */

  return {
    orderId: order.id,
    orderNumber:
      order.order_number,
    customerEmail,
    products:
      preparedProducts,
    requestIds:
      preparedProducts.map(
        (product) => product.requestId
      ),
  };
}

/*
 * =========================================================
 * MARK INITIAL REVIEW CTA AS SENT
 *
 * Called by order.service.ts after the Delivered email
 * succeeds.
 * =========================================================
 */
async function markInitialSent({
  orderId,
  customerEmail,
  requestIds,
}: {
  orderId: string;
  customerEmail: string;
  requestIds: string[];
}) {
  if (!requestIds.length) {
    return {
      updated: 0,
    };
  }

  if (!orderId) {
    throw new Error(
      "orderId is required"
    );
  }

  if (!customerEmail?.trim()) {
    throw new Error(
      "customerEmail is required"
    );
  }

  /*
   * Only allow requests belonging to this exact order/customer.
   * This prevents an arbitrary request ID from being marked as sent.
   */
  const {
    data: requests,
    error: requestsError,
  } = await supabaseAdmin
    .from("product_review_requests")
    .select(
      `
        id,
        order_id,
        customer_id,
        status
      `
    )
    .in("id", requestIds)
    .eq("order_id", orderId);

  if (requestsError) {
    throw requestsError;
  }

  if (!requests?.length) {
    return {
      updated: 0,
    };
  }

  const {
    data: order,
    error: orderError,
  } = await supabaseAdmin
    .from("orders")
    .select(
      `
        id,
        customer_id,
        customer_email,
        order_status,
        delivered_at
      `
    )
    .eq("id", orderId)
    .single();

  if (orderError) {
    throw orderError;
  }

  if (
    order.order_status !== "delivered" ||
    !order.delivered_at ||
    order.customer_email?.trim() !==
      customerEmail.trim()
  ) {
    throw new Error(
      "Order is not eligible for initial review CTA confirmation"
    );
  }

  const validRequestIds = requests
    .filter(
      (request) =>
        request.customer_id ===
        order.customer_id
    )
    .map(
      (request) => request.id
    );

  if (!validRequestIds.length) {
    return {
      updated: 0,
    };
  }

  const now =
    new Date().toISOString();

  const {
    data,
    error,
  } = await supabaseAdmin
    .from("product_review_requests")
    .update({
      status: "sent",
      sent_at: now,
      initial_sent_at: now,
      updated_at: now,
    })
    .in(
      "id",
      validRequestIds
    )
    .select("id");

  if (error) {
    throw error;
  }

  return {
    updated:
      data?.length ?? 0,
  };
}

/*
 * =========================================================
 * REMINDER MODE
 *
 * Runs after delivered_at is at least 24 hours old.
 * =========================================================
 */
async function processReminderMode({
  dryRun,
}: {
  dryRun: boolean;
}) {
  const cutoff =
    new Date(
      Date.now() -
        24 *
          60 *
          60 *
          1000
    ).toISOString();

  const result = {
    success: true,
    dryRun,
    mode: "reminder",
    cutoff,
    processedOrders: 0,
    eligibleOrders: 0,
    sentEmails: 0,
    skippedOrders: 0,
    failedOrders: 0,
    sentTo:
      [] as Array<
        Record<string, unknown>
      >,
    eligible:
      [] as Array<
        Record<string, unknown>
      >,
    skipped:
      [] as Array<
        Record<string, unknown>
      >,
    failed:
      [] as Array<
        Record<string, unknown>
      >,
  };

  /*
   * =======================================================
   * Find delivered orders older than 24 hours
   * =======================================================
   */

  const {
    data: orders,
    error: ordersError,
  } = await supabaseAdmin
    .from("orders")
    .select(
      `
        id,
        order_number,
        customer_id,
        customer_name,
        customer_email,
        order_status,
        delivered_at
      `
    )
    .eq(
      "order_status",
      "delivered"
    )
    .not(
      "delivered_at",
      "is",
      null
    )
    .lte(
      "delivered_at",
      cutoff
    )
    .order(
      "delivered_at",
      {
        ascending: true,
      }
    )
    .limit(
      ORDER_BATCH_SIZE
    );

  if (ordersError) {
    throw ordersError;
  }

  for (
    const order of
      orders ?? []
  ) {
    result.processedOrders++;

    try {
      const customerEmail =
        order.customer_email?.trim();

      if (!customerEmail) {
        result.skippedOrders++;

        result.skipped.push({
          orderId:
            order.id,
          orderNumber:
            order.order_number,
          reason:
            "missing_customer_email",
        });

        continue;
      }

      if (
        !order.customer_id
      ) {
        result.skippedOrders++;

        result.skipped.push({
          orderId:
            order.id,
          orderNumber:
            order.order_number,
          reason:
            "missing_customer_id",
        });

        continue;
      }

      /*
       * =====================================================
       * Get order products
       * =====================================================
       */

      const {
        data: orderItems,
        error: itemsError,
      } = await supabaseAdmin
        .from(
          "order_items"
        )
        .select(
          `
            id,
            product_id,
            product_name,
            product_image
          `
        )
        .eq(
          "order_id",
          order.id
        )
        .not(
          "product_id",
          "is",
          null
        );

      if (itemsError) {
        throw itemsError;
      }

      if (!orderItems?.length) {
        result.skippedOrders++;

        result.skipped.push({
          orderId:
            order.id,
          orderNumber:
            order.order_number,
          reason:
            "no_products",
        });

        continue;
      }

      const uniqueProductIds =
        [
          ...new Set(
            orderItems
              .map(
                (item) =>
                  item.product_id
              )
              .filter(Boolean)
          ),
        ];

      if (
        !uniqueProductIds.length
      ) {
        result.skippedOrders++;

        result.skipped.push({
          orderId:
            order.id,
          orderNumber:
            order.order_number,
          reason:
            "no_valid_product_ids",
        });

        continue;
      }

      /*
       * =====================================================
       * Existing requests
       *
       * IMPORTANT:
       *
       * We only send the 24-hour reminder for requests
       * that were created/sent by the new delivery flow.
       *
       * Old requests from the previous system have:
       *   initial_sent_at = NULL
       *
       * Those are skipped to avoid duplicate emails.
       * =====================================================
       */

      const {
        data: existingRequests,
        error:
          requestsError,
      } = await supabaseAdmin
        .from(
          "product_review_requests"
        )
        .select(
          `
            id,
            order_id,
            product_id,
            status,
            initial_sent_at,
            reminder_sent_at
          `
        )
        .eq(
          "customer_id",
          order.customer_id
        )
        .in(
          "product_id",
          uniqueProductIds
        );

      if (requestsError) {
        throw requestsError;
      }

      const requestMap =
        new Map<
          string,
          {
            id: string;
            order_id: string;
            product_id: string;
            status: string;
            initial_sent_at:
              string | null;
            reminder_sent_at:
              string | null;
          }
        >();

      for (
        const request of
          existingRequests ?? []
      ) {
        requestMap.set(
          request.product_id,
          request
        );
      }

      /*
       * =====================================================
       * Existing reviews
       * =====================================================
       */

      const {
        data: existingReviews,
        error:
          reviewsError,
      } = await supabaseAdmin
        .from("reviews")
        .select(
          "product_id"
        )
        .eq(
          "customer_id",
          order.customer_id
        )
        .in(
          "product_id",
          uniqueProductIds
        );

      if (reviewsError) {
        throw reviewsError;
      }

      const reviewedProductIds =
        new Set(
          (
            existingReviews ??
            []
          ).map(
            (review) =>
              review.product_id
          )
        );

      /*
       * =====================================================
       * Product details
       * =====================================================
       */

      const {
        data: products,
        error:
          productsError,
      } = await supabaseAdmin
        .from("products")
        .select(
          `
            id,
            name,
            slug
          `
        )
        .in(
          "id",
          uniqueProductIds
        );

      if (productsError) {
        throw productsError;
      }

      const productMap =
        new Map(
          (
            products ?? []
          ).map(
            (product) => [
              product.id,
              product,
            ]
          )
        );

      /*
       * =====================================================
       * Product images
       * =====================================================
       */

      const {
        data: productImages,
        error:
          imagesError,
      } = await supabaseAdmin
        .from(
          "product_images"
        )
        .select(
          `
            id,
            product_id,
            image_url,
            sort_order,
            is_primary
          `
        )
        .in(
          "product_id",
          uniqueProductIds
        )
        .order(
          "sort_order",
          {
            ascending: true,
          }
        );

      if (imagesError) {
        throw imagesError;
      }

      const imageMap =
        new Map<
          string,
          string
        >();

      for (
        const image of
          productImages ?? []
      ) {
        if (
          !imageMap.has(
            image.product_id
          )
        ) {
          imageMap.set(
            image.product_id,
            image.image_url
          );
        }

        if (
          image.is_primary
        ) {
          imageMap.set(
            image.product_id,
            image.image_url
          );
        }
      }

      /*
       * =====================================================
       * Determine products requiring reminder
       * =====================================================
       */

      const eligibleProducts =
        uniqueProductIds
          .map(
            (productId) => {
              const product =
                productMap.get(
                  productId
                );

              if (!product) {
                return null;
              }

              if (
                !product.slug
              ) {
                return null;
              }

              /*
               * Already reviewed.
               */
              if (
                reviewedProductIds.has(
                  productId
                )
              ) {
                return null;
              }

              const request =
                requestMap.get(
                  productId
                );

              /*
               * No request means the Delivered email was
               * never prepared/sent by the new system.
               *
               * Do not create a new reminder here because
               * old behaviour could cause duplicate emails.
               */
              if (!request) {
                return null;
              }

              /*
               * Old request from the previous system.
               *
               * No initial_sent_at means we don't know that
               * a Delivered email with the new CTA was sent.
               *
               * Skip it for safety.
               */
              if (
                !request.initial_sent_at
              ) {
                return null;
              }

              /*
               * Reminder already sent.
               */
              if (
                request.reminder_sent_at
              ) {
                return null;
              }

              /*
               * Request itself must have been successfully
               * marked sent.
               */
              if (
                request.status !==
                "sent"
              ) {
                return null;
              }

              return {
                productId,
                product,
                request,
                imageUrl:
                  imageMap.get(
                    productId
                  ) ??
                  orderItems.find(
                    (item) =>
                      item.product_id ===
                      productId
                  )?.product_image ??
                  null,
              };
            }
          )
          .filter(Boolean) as Array<{
          productId: string;
          product: {
            id: string;
            name: string;
            slug: string;
          };
          request: {
            id: string;
            order_id: string;
            product_id: string;
            status: string;
            initial_sent_at:
              string | null;
            reminder_sent_at:
              string | null;
          };
          imageUrl: string | null;
        }>;

      if (
        !eligibleProducts.length
      ) {
        result.skippedOrders++;

        result.skipped.push({
          orderId:
            order.id,
          orderNumber:
            order.order_number,
          reason:
            "no_reminder_eligible_products",
        });

        continue;
      }

      result.eligibleOrders++;

      /*
       * =====================================================
       * DRY RUN
       * =====================================================
       */

      if (dryRun) {
        result.eligible.push({
          orderId:
            order.id,
          orderNumber:
            order.order_number,
          customerEmail,
          products:
            eligibleProducts.map(
              ({
                productId,
                product,
                request,
              }) => ({
                productId,
                name:
                  product.name,
                slug:
                  product.slug,
                requestId:
                  request.id,
                initialSentAt:
                  request.initial_sent_at,
                reminderSentAt:
                  request.reminder_sent_at,
              })
            ),
        });

        continue;
      }

      /*
       * =====================================================
       * Generate a NEW usable token for the reminder
       * only when needed.
       *
       * IMPORTANT:
       * The Delivered email already contained the original
       * raw token, but raw tokens cannot be reconstructed.
       *
       * Therefore, for the reminder we rotate the unused
       * token and create a new secure link for the same
       * review request.
       *
       * This is still the SAME review request and the same
       * customer/product relationship.
       * =====================================================
       */

      const emailProducts:
        Array<{
          name: string;
          imageUrl:
            string | null;
          reviewUrl: string;
          requestId:
            string;
        }> = [];

      const requestIds:
        string[] = [];

      for (
        const eligible of
          eligibleProducts
      ) {
        const {
          productId,
          product,
          request,
          imageUrl,
        } = eligible;

        /*
         * Remove previous unused token.
         *
         * The old token remains invalid once rotated.
         */
        const {
          error:
            deleteTokenError,
        } = await supabaseAdmin
          .from(
            "review_request_tokens"
          )
          .delete()
          .eq(
            "review_request_id",
            request.id
          )
          .is(
            "used_at",
            null
          );

        if (
          deleteTokenError
        ) {
          throw deleteTokenError;
        }

        /*
         * Generate secure reminder token.
         */
        const rawToken =
          generateSecureToken();

        const tokenHash =
          await hashToken(
            rawToken
          );

        const expiresAt =
          new Date(
            Date.now() +
              TOKEN_VALIDITY_DAYS *
                24 *
                60 *
                60 *
                1000
          ).toISOString();

        const {
          data: insertedToken,
          error: tokenError,
        } = await supabaseAdmin
          .from(
            "review_request_tokens"
          )
          .insert({
            review_request_id:
              request.id,
            order_id:
              request.order_id,
            customer_id:
              order.customer_id,
            product_id:
              productId,
            token_hash:
              tokenHash,
            expires_at:
              expiresAt,
          })
          .select("id")
          .single();

        if (
          tokenError
        ) {
          throw tokenError;
        }

        if (
          !insertedToken?.id
        ) {
          throw new Error(
            "Reminder review token was not created"
          );
        }

        const reviewUrl =
          buildReviewUrl(
            product.slug,
            rawToken
          );

        emailProducts.push({
          name:
            product.name ||
            "Your T&M Jewels Product",
          imageUrl,
          reviewUrl,
          requestId:
            request.id,
        });

        requestIds.push(
          request.id
        );
      }

      if (
        !emailProducts.length
      ) {
        result.skippedOrders++;

        result.skipped.push({
          orderId:
            order.id,
          orderNumber:
            order.order_number,
          reason:
            "no_products_remaining_for_reminder",
        });

        continue;
      }

      /*
       * =====================================================
       * Send ONE reminder email per order
       * =====================================================
       */

      const html =
        buildReviewEmailHtml({
          customerName:
            order.customer_name ||
            "there",

          orderNumber:
            order.order_number ||
            order.id,

          products:
            emailProducts,
        });

      try {
        await sendEmail({
          to: customerEmail,
          subject:
            "How was your T&M Jewels order?",
          html,
        });

        const sentAt =
          new Date().toISOString();

        /*
         * Mark ONLY the reminder timestamp.
         *
         * initial_sent_at remains the time the Delivered
         * email was sent.
         */
        const {
          error:
            markReminderError,
        } = await supabaseAdmin
          .from(
            "product_review_requests"
          )
          .update({
            status:
              "sent",
            reminder_sent_at:
              sentAt,
            updated_at:
              sentAt,
          })
          .in(
            "id",
            requestIds
          );

        if (
          markReminderError
        ) {
          throw markReminderError;
        }

        result.sentEmails++;

        result.sentTo.push({
          email:
            customerEmail,
          orderId:
            order.id,
          orderNumber:
            order.order_number,
          products:
            emailProducts.map(
              (product) => ({
                name:
                  product.name,
                requestId:
                  product.requestId,
              })
            ),
        });
      } catch (
        emailError
      ) {
        /*
         * Do not set reminder_sent_at.
         *
         * The next cron execution can retry.
         */
        console.error(
          `Reminder email failed for order ${order.order_number}:`,
          serializeError(
            emailError
          )
        );

        throw emailError;
      }
    } catch (
      orderError
    ) {
      result.failedOrders++;

      result.failed.push({
        orderId:
          order.id,
        orderNumber:
          order.order_number,
        error:
          serializeError(
            orderError
          ),
      });

      console.error(
        `Failed processing reminder for order ${order.order_number}:`,
        serializeError(
          orderError
        )
      );
    }
  }

  return result;
}

/*
 * =========================================================
 * MAIN HANDLER
 * =========================================================
 */
Deno.serve(
  async (req) => {
    if (
      req.method ===
      "OPTIONS"
    ) {
      return new Response(
        "ok",
        {
          headers:
            corsHeaders,
        }
      );
    }

    if (
      req.method !==
      "POST"
    ) {
      return jsonResponse(
        {
          success:
            false,
          error:
            "Method not allowed",
        },
        405
      );
    }

    try {
      let body:
        Record<
          string,
          unknown
        > = {};

      try {
        body =
          await req.json();
      } catch {
        body = {};
      }

      const mode =
        typeof body.mode ===
        "string"
          ? body.mode
          : "reminder";

      const dryRun =
        body.dryRun ===
        true;

      /*
       * =====================================================
       * MODE: PREPARE
       *
       * Called immediately after order becomes Delivered.
       * =====================================================
       */

      if (
        mode ===
        "prepare"
      ) {
        const orderId =
          typeof body.orderId ===
          "string"
            ? body.orderId.trim()
            : "";

        if (!orderId) {
          return jsonResponse(
            {
              success:
                false,
              error:
                "orderId is required for prepare mode",
            },
            400
          );
        }

        if (dryRun) {
          return jsonResponse({
            success:
              true,
            dryRun:
              true,
            mode:
              "prepare",
            message:
              "Prepare mode dry-run does not create tokens or database records.",
            orderId,
          });
        }

        const prepared =
          await prepareReviewLinks(
            orderId
          );

        return jsonResponse({
          success:
            true,
          dryRun:
            false,
          mode:
            "prepare",
          ...prepared,
        });
      }

      /*
       * =====================================================
       * MODE: MARK INITIAL SENT
       *
       * Called after Delivered email succeeds.
       * =====================================================
       */

      if (
        mode ===
        "mark_initial_sent"
      ) {
        const orderId =
          typeof body.orderId ===
          "string"
            ? body.orderId.trim()
            : "";

        const customerEmail =
          typeof body.customerEmail ===
          "string"
            ? body.customerEmail.trim()
            : "";

        const requestIds =
          Array.isArray(
            body.requestIds
          )
            ? body.requestIds.filter(
                (
                  value
                ): value is string =>
                  typeof value ===
                    "string" &&
                  value.trim()
                    .length > 0
              )
            : [];

        if (!orderId) {
          return jsonResponse(
            {
              success:
                false,
              error:
                "orderId is required for mark_initial_sent mode",
            },
            400
          );
        }

        if (!customerEmail) {
          return jsonResponse(
            {
              success:
                false,
              error:
                "customerEmail is required for mark_initial_sent mode",
            },
            400
          );
        }

        if (
          !requestIds.length
        ) {
          return jsonResponse(
            {
              success:
                false,
              error:
                "requestIds are required for mark_initial_sent mode",
            },
            400
          );
        }

        if (dryRun) {
          return jsonResponse({
            success:
              true,
            dryRun:
              true,
            mode:
              "mark_initial_sent",
            orderId,
            customerEmail,
            requestIds,
          });
        }

        const result =
          await markInitialSent({
            orderId,
            customerEmail,
            requestIds,
          });

        return jsonResponse({
          success:
            true,
          dryRun:
            false,
          mode:
            "mark_initial_sent",
          orderId,
          ...result,
        });
      }

      /*
       * =====================================================
       * MODE: REMINDER
       *
       * Existing cron calls {} and reaches this mode.
       * =====================================================
       */

      if (
        mode ===
          "reminder" ||
        mode ===
          ""
      ) {
        const result =
          await processReminderMode({
            dryRun,
          });

        return jsonResponse(
          result
        );
      }

      return jsonResponse(
        {
          success:
            false,
          error:
            `Unknown mode: ${mode}`,
          supportedModes: [
            "prepare",
            "mark_initial_sent",
            "reminder",
          ],
        },
        400
      );
    } catch (
      error
    ) {
      console.error(
        "product-review-request fatal error:",
        serializeError(
          error
        )
      );

      return jsonResponse(
        {
          success:
            false,
          error:
            serializeError(
              error
            ),
        },
        500
      );
    }
  }
);