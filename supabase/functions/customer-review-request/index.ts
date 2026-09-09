import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
  "SUPABASE_SERVICE_ROLE_KEY"
)!;

const SITE_URL = (
  Deno.env.get("SITE_URL") || "https://tnmonline.in"
).replace(/\/$/, "");

const SEND_EMAIL_FUNCTION = `${SUPABASE_URL}/functions/v1/send-email`;

const TOKEN_EXPIRY_DAYS = 30;
const DELIVERY_WAIT_HOURS = 24;
const STALE_PROCESSING_MINUTES = 15;

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

interface Order {
  id: string;
  order_number: string | null;
  customer_id: string;
  order_status: string;
  delivered_at: string | null;
}

interface Customer {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  price: number | string | null;
  quantity: number | null;
  total: number | string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  status: string | null;
}

interface ProductImage {
  product_id: string;
  image_url: string;
  is_primary: boolean | null;
  sort_order: number | null;
}

interface Review {
  id: string;
  customer_id: string;
  product_id: string;
}

interface ReviewEmailRequest {
  id: string;
  order_id: string;
  customer_id: string;
  status: "processing" | "sent" | "failed";
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ReviewEmailProduct {
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  token: string;
  reviewUrl: string;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function json(
  body: unknown,
  status = 200
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getCustomerName(customer: Customer): string {
  const name = [
    customer.first_name,
    customer.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "there";
}

function getSafeNumber(
  value: number | string | null | undefined
): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getImageUrl(
  productImage: string | null,
  productId: string,
  productImages: ProductImage[]
): string | null {
  if (productImage) {
    return productImage;
  }

  const primary = productImages.find(
    (image) =>
      image.product_id === productId &&
      image.is_primary === true
  );

  if (primary?.image_url) {
    return primary.image_url;
  }

  const first = productImages
    .filter((image) => image.product_id === productId)
    .sort(
      (a, b) =>
        (a.sort_order ?? 0) -
        (b.sort_order ?? 0)
    )[0];

  return first?.image_url || null;
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  return Array.from(bytes)
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);

  const digest = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

function getExpiryDate(): string {
  const date = new Date();

  date.setDate(
    date.getDate() + TOKEN_EXPIRY_DAYS
  );

  return date.toISOString();
}

function isDeliveryEligible(
  deliveredAt: string | null
): boolean {
  if (!deliveredAt) {
    return false;
  }

  const deliveredTime =
    new Date(deliveredAt).getTime();

  if (!Number.isFinite(deliveredTime)) {
    return false;
  }

  const waitTime =
    DELIVERY_WAIT_HOURS * 60 * 60 * 1000;

  return Date.now() - deliveredTime >= waitTime;
}

function isStaleProcessing(
  request: ReviewEmailRequest
): boolean {
  if (request.status !== "processing") {
    return false;
  }

  const updatedAt = new Date(
    request.updated_at
  ).getTime();

  if (!Number.isFinite(updatedAt)) {
    return true;
  }

  const staleAfter =
    STALE_PROCESSING_MINUTES * 60 * 1000;

  return Date.now() - updatedAt >= staleAfter;
}

function buildReviewUrl(
  productSlug: string,
  token: string
): string {
  return `${SITE_URL}/review/${encodeURIComponent(
    productSlug
  )}?token=${encodeURIComponent(token)}`;
}

/* -------------------------------------------------------------------------- */
/* Request claiming                                                           */
/* -------------------------------------------------------------------------- */

async function claimReviewEmailRequest(
  order: Order
): Promise<{
  claimed: boolean;
  request: ReviewEmailRequest | null;
}> {
  const { data: existing, error: existingError } =
    await supabase
      .from("review_email_requests")
      .select(
        "id, order_id, customer_id, status, sent_at, created_at, updated_at"
      )
      .eq("order_id", order.id)
      .maybeSingle();

  if (existingError) {
    throw new Error(
      `Failed checking review email request: ${existingError.message}`
    );
  }

  if (existing) {
    const request =
      existing as ReviewEmailRequest;

    // Already successfully sent.
    if (request.status === "sent") {
      return {
        claimed: false,
        request,
      };
    }

    // Another worker is currently processing it.
    if (
      request.status === "processing" &&
      !isStaleProcessing(request)
    ) {
      return {
        claimed: false,
        request,
      };
    }

    // Failed or stale processing request.
    // Only this worker that successfully changes the status
    // gets ownership of the retry.
    const { data: claimedRetry, error } =
      await supabase
        .from("review_email_requests")
        .update({
          status: "processing",
          updated_at: new Date().toISOString(),
          sent_at: null,
        })
        .eq("id", request.id)
        .in("status", ["failed", "processing"])
        .select(
          "id, order_id, customer_id, status, sent_at, created_at, updated_at"
        )
        .maybeSingle();

    if (error) {
      throw new Error(
        `Failed claiming retry: ${error.message}`
      );
    }

    if (!claimedRetry) {
      return {
        claimed: false,
        request,
      };
    }

    return {
      claimed: true,
      request:
        claimedRetry as ReviewEmailRequest,
    };
  }

  // First worker creates the request.
  const { data: inserted, error: insertError } =
    await supabase
      .from("review_email_requests")
      .insert({
        order_id: order.id,
        customer_id: order.customer_id,
        status: "processing",
        sent_at: null,
        updated_at: new Date().toISOString(),
      })
      .select(
        "id, order_id, customer_id, status, sent_at, created_at, updated_at"
      )
      .maybeSingle();

  if (!insertError && inserted) {
    return {
      claimed: true,
      request:
        inserted as ReviewEmailRequest,
    };
  }

  // A concurrent worker may have inserted the same order.
  // Because order_id is UNIQUE, recover by reading the existing row.
  const { data: concurrentRequest, error: concurrentError } =
    await supabase
      .from("review_email_requests")
      .select(
        "id, order_id, customer_id, status, sent_at, created_at, updated_at"
      )
      .eq("order_id", order.id)
      .maybeSingle();

  if (concurrentError) {
    throw new Error(
      `Failed recovering concurrent request: ${concurrentError.message}`
    );
  }

  if (!concurrentRequest) {
    throw new Error(
      insertError?.message ||
        "Unable to create review email request"
    );
  }

  return {
    claimed: false,
    request:
      concurrentRequest as ReviewEmailRequest,
  };
}

/* -------------------------------------------------------------------------- */
/* Email HTML                                                                 */
/* -------------------------------------------------------------------------- */

function buildProductCard(
  product: ReviewEmailProduct
): string {
  const image = product.imageUrl
    ? `
      <img
        src="${escapeHtml(product.imageUrl)}"
        alt="${escapeHtml(product.productName)}"
        width="96"
        height="120"
        style="
          display:block;
          width:96px;
          height:120px;
          object-fit:cover;
          border-radius:12px;
          border:1px solid #eadfce;
        "
      />
    `
    : `
      <div
        style="
          width:96px;
          height:120px;
          border-radius:12px;
          background:#f5f1eb;
          border:1px solid #eadfce;
        "
      ></div>
    `;

  return `
    <tr>
      <td style="padding:12px 0;">
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            background:#faf8f5;
            border:1px solid #eee5d9;
            border-radius:16px;
          "
        >
          <tr>
            <td style="padding:14px;">
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>
                  <td
                    width="96"
                    valign="top"
                    style="padding-right:16px;"
                  >
                    ${image}
                  </td>

                  <td
                    valign="middle"
                    style="
                      font-family:Arial,Helvetica,sans-serif;
                    "
                  >
                    <div
                      style="
                        font-size:16px;
                        line-height:22px;
                        font-weight:600;
                        color:#24201c;
                        margin-bottom:12px;
                      "
                    >
                      ${escapeHtml(product.productName)}
                    </div>

                    <a
                      href="${escapeHtml(product.reviewUrl)}"
                      style="
                        display:inline-block;
                        padding:11px 18px;
                        background:#171411;
                        color:#ffffff;
                        text-decoration:none;
                        border-radius:999px;
                        font-size:13px;
                        font-weight:600;
                        letter-spacing:.2px;
                      "
                    >
                      Review Product
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

function buildEmailHtml(
  customer: Customer,
  products: ReviewEmailProduct[],
  order: Order
): string {
  const customerName =
    getCustomerName(customer);

  const productCards = products
    .map(buildProductCard)
    .join("");

  const orderReference =
    order.order_number || order.id;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>How did you like your jewellery?</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f4f1ed;
  "
>
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background:#f4f1ed;"
  >
    <tr>
      <td align="center" style="padding:32px 14px;">

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width:620px;
            background:#ffffff;
            border-radius:24px;
            overflow:hidden;
          "
        >

          <!-- Header -->
          <tr>
            <td
              align="center"
              style="
                padding:30px 24px 24px;
                background:#171411;
              "
            >
              <div
                style="
                  font-family:Georgia,'Times New Roman',serif;
                  color:#d8b978;
                  font-size:25px;
                  font-weight:bold;
                  letter-spacing:1px;
                "
              >
                T&amp;M JEWELS
              </div>

              <div
                style="
                  margin-top:7px;
                  font-family:Arial,Helvetica,sans-serif;
                  color:#d9d1c6;
                  font-size:11px;
                  letter-spacing:2px;
                "
              >
                JEWELLERY MADE TO BE LOVED
              </div>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td
              align="center"
              style="padding:42px 28px 20px;"
            >
              <div
                style="
                  font-family:Arial,Helvetica,sans-serif;
                  color:#b08a48;
                  font-size:12px;
                  font-weight:bold;
                  letter-spacing:2px;
                  text-transform:uppercase;
                "
              >
                A LITTLE FAVOUR
              </div>

              <h1
                style="
                  margin:12px 0 10px;
                  font-family:Georgia,'Times New Roman',serif;
                  color:#211d19;
                  font-size:30px;
                  line-height:38px;
                  font-weight:500;
                "
              >
                How did you like<br />
                your jewellery?
              </h1>

              <p
                style="
                  margin:0 auto;
                  max-width:470px;
                  font-family:Arial,Helvetica,sans-serif;
                  color:#6d665e;
                  font-size:15px;
                  line-height:24px;
                "
              >
                Hi ${escapeHtml(customerName)}, your order
                has been delivered. We'd love to know what
                you think about your pieces.
              </p>
            </td>
          </tr>

          <!-- Decorative stars -->
          <tr>
            <td
              align="center"
              style="padding:4px 24px 18px;"
            >
              <div
                style="
                  color:#c49a55;
                  font-size:22px;
                  letter-spacing:5px;
                "
              >
                ★ ★ ★ ★ ★
              </div>
            </td>
          </tr>

          <!-- Products -->
          <tr>
            <td style="padding:8px 24px 12px;">
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                ${productCards}
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td
              align="center"
              style="padding:20px 30px 36px;"
            >
              <p
                style="
                  margin:0;
                  font-family:Arial,Helvetica,sans-serif;
                  color:#746c63;
                  font-size:13px;
                  line-height:21px;
                "
              >
                Your honest review helps us create better
                pieces and helps other jewellery lovers
                shop with confidence.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              style="
                padding:24px;
                background:#faf8f5;
                border-top:1px solid #eee7dd;
              "
            >
              <p
                style="
                  margin:0 0 6px;
                  text-align:center;
                  font-family:Arial,Helvetica,sans-serif;
                  color:#7b746c;
                  font-size:11px;
                  line-height:18px;
                "
              >
                Order ${escapeHtml(orderReference)}
              </p>

              <p
                style="
                  margin:0;
                  text-align:center;
                  font-family:Arial,Helvetica,sans-serif;
                  color:#9a9288;
                  font-size:11px;
                  line-height:18px;
                "
              >
                With love, T&amp;M Jewels ♡
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/* -------------------------------------------------------------------------- */
/* Send email                                                                 */
/* -------------------------------------------------------------------------- */

async function sendReviewEmail(
  customer: Customer,
  order: Order,
  products: ReviewEmailProduct[]
): Promise<void> {
  if (!customer.email) {
    throw new Error(
      "Customer does not have an email address"
    );
  }

  const html = buildEmailHtml(
    customer,
    products,
    order
  );

  const response = await fetch(
    SEND_EMAIL_FUNCTION,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        to: customer.email,
        subject:
          "How did you like your T&M Jewels?",
        html,
      }),
    }
  );

  const responseText = await response.text();

  let responseData: unknown = null;

  try {
    responseData = JSON.parse(responseText);
  } catch {
    responseData = responseText;
  }

  if (!response.ok) {
    throw new Error(
      `send-email failed (${response.status}): ${JSON.stringify(
        responseData
      )}`
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return json(
      {
        error: "Method not allowed",
      },
      405
    );
  }

  try {
    /* ---------------------------------------------------------------------- */
    /* 1. Find delivered orders that are at least 24 hours old               */
    /* ---------------------------------------------------------------------- */

    const cutoff = new Date(
      Date.now() -
        DELIVERY_WAIT_HOURS *
          60 *
          60 *
          1000
    ).toISOString();

    const { data: orders, error: ordersError } =
      await supabase
        .from("orders")
        .select(
          "id, order_number, customer_id, order_status, delivered_at"
        )
        .eq("order_status", "delivered")
        .not("delivered_at", "is", null)
        .lte("delivered_at", cutoff)
        .order("delivered_at", {
          ascending: true,
        })
        .limit(100);

    if (ordersError) {
      throw new Error(
        `Failed loading delivered orders: ${ordersError.message}`
      );
    }

    if (!orders || orders.length === 0) {
      return json({
        success: true,
        message:
          "No eligible delivered orders found.",
        processed: 0,
        sent: 0,
        skipped: 0,
        failed: 0,
      });
    }

    let processed = 0;
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    /* ---------------------------------------------------------------------- */
    /* 2. Process each order                                                  */
    /* ---------------------------------------------------------------------- */

    for (const rawOrder of orders) {
      const order = rawOrder as Order;

      processed++;

      try {
        /* ------------------------------------------------------------------ */
        /* Re-check delivery eligibility                                      */
        /* ------------------------------------------------------------------ */

        if (
          order.order_status !== "delivered" ||
          !isDeliveryEligible(order.delivered_at)
        ) {
          skipped++;
          continue;
        }

        /* ------------------------------------------------------------------ */
        /* Claim request                                                       */
        /* ------------------------------------------------------------------ */

        const {
          claimed,
          request,
        } = await claimReviewEmailRequest(order);

        if (!claimed || !request) {
          skipped++;
          continue;
        }

        /* ------------------------------------------------------------------ */
        /* Customer                                                            */
        /* ------------------------------------------------------------------ */

        const {
          data: customer,
          error: customerError,
        } = await supabase
          .from("customers")
          .select(
            "id, first_name, last_name, email"
          )
          .eq("id", order.customer_id)
          .maybeSingle();

        if (customerError) {
          throw new Error(
            `Failed loading customer: ${customerError.message}`
          );
        }

        if (!customer) {
          throw new Error(
            "Customer not found"
          );
        }

        const typedCustomer =
          customer as Customer;

        if (!typedCustomer.email) {
          throw new Error(
            "Customer email is missing"
          );
        }

        /* ------------------------------------------------------------------ */
        /* Order items                                                         */
        /* ------------------------------------------------------------------ */

        const {
          data: orderItems,
          error: orderItemsError,
        } = await supabase
          .from("order_items")
          .select(
            "id, order_id, product_id, product_name, product_image, price, quantity, total"
          )
          .eq("order_id", order.id);

        if (orderItemsError) {
          throw new Error(
            `Failed loading order items: ${orderItemsError.message}`
          );
        }

        if (
          !orderItems ||
          orderItems.length === 0
        ) {
          throw new Error(
            "Order has no order items"
          );
        }

        const typedItems =
          orderItems as OrderItem[];

        const productIds = Array.from(
          new Set(
            typedItems
              .map((item) => item.product_id)
              .filter(
                (id): id is string =>
                  Boolean(id)
              )
          )
        );

        if (productIds.length === 0) {
          throw new Error(
            "No product IDs found in order"
          );
        }

        /* ------------------------------------------------------------------ */
        /* Products                                                            */
        /* ------------------------------------------------------------------ */

        const {
          data: products,
          error: productsError,
        } = await supabase
          .from("products")
          .select(
            "id, name, slug, status"
          )
          .in("id", productIds);

        if (productsError) {
          throw new Error(
            `Failed loading products: ${productsError.message}`
          );
        }

        const typedProducts =
          (products || []) as Product[];

        const productMap =
          new Map<string, Product>();

        for (const product of typedProducts) {
          productMap.set(
            product.id,
            product
          );
        }

        /* ------------------------------------------------------------------ */
        /* Product images                                                      */
        /* ------------------------------------------------------------------ */

        const {
          data: productImages,
          error: imagesError,
        } = await supabase
          .from("product_images")
          .select(
            "product_id, image_url, is_primary, sort_order"
          )
          .in("product_id", productIds)
          .order("sort_order", {
            ascending: true,
          });

        if (imagesError) {
          throw new Error(
            `Failed loading product images: ${imagesError.message}`
          );
        }

        const typedImages =
          (productImages || []) as ProductImage[];

        /* ------------------------------------------------------------------ */
        /* Existing reviews                                                    */
        /* ------------------------------------------------------------------ */

        const {
          data: existingReviews,
          error: reviewsError,
        } = await supabase
          .from("reviews")
          .select(
            "id, customer_id, product_id"
          )
          .eq(
            "customer_id",
            order.customer_id
          )
          .in(
            "product_id",
            productIds
          );

        if (reviewsError) {
          throw new Error(
            `Failed loading existing reviews: ${reviewsError.message}`
          );
        }

        const reviewedProductIds =
          new Set(
            ((existingReviews ||
              []) as Review[]).map(
              (review) =>
                review.product_id
            )
          );

        /* ------------------------------------------------------------------ */
        /* Determine products that still need a review                        */
        /* ------------------------------------------------------------------ */

        const reviewProducts: ReviewEmailProduct[] =
          [];

        for (const item of typedItems) {
          if (!item.product_id) {
            continue;
          }

          const product =
            productMap.get(
              item.product_id
            );

          if (!product) {
            continue;
          }

          // One customer can review a product only once.
          if (
            reviewedProductIds.has(
              product.id
            )
          ) {
            continue;
          }

          /*
           * We intentionally do not require product.status === "active".
           * A customer should still be able to review a product they
           * purchased even if that product has subsequently been hidden.
           */

          const token =
            generateToken();

          const tokenHash =
            await hashToken(token);

          const expiresAt =
            getExpiryDate();

          const { error: tokenError } =
            await supabase
              .from(
                "review_request_tokens"
              )
              .insert({
                review_request_id:
                  request.id,
                order_id: order.id,
                customer_id:
                  order.customer_id,
                product_id:
                  product.id,
                token_hash:
                  tokenHash,
                expires_at:
                  expiresAt,
              });

          if (tokenError) {
            throw new Error(
              `Failed creating review token for ${product.id}: ${tokenError.message}`
            );
          }

          reviewProducts.push({
            productId: product.id,
            productName:
              product.name ||
              item.product_name,
            productSlug:
              product.slug,
            imageUrl:
              getImageUrl(
                item.product_image,
                product.id,
                typedImages
              ),
            token,
            reviewUrl:
              buildReviewUrl(
                product.slug,
                token
              ),
          });
        }

        /* ------------------------------------------------------------------ */
        /* Everything already reviewed                                        */
        /* ------------------------------------------------------------------ */

        if (
          reviewProducts.length === 0
        ) {
          await supabase
            .from(
              "review_email_requests"
            )
            .update({
              status: "sent",
              sent_at:
                new Date().toISOString(),
              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              request.id
            )
            .eq(
              "status",
              "processing"
            );

          skipped++;
          continue;
        }

        /* ------------------------------------------------------------------ */
        /* Send email                                                          */
        /* ------------------------------------------------------------------ */

        await sendReviewEmail(
          typedCustomer,
          order,
          reviewProducts
        );

        /* ------------------------------------------------------------------ */
        /* Mark successfully sent                                              */
        /* ------------------------------------------------------------------ */

        const {
          data: updatedRequest,
          error: updateError,
        } = await supabase
          .from(
            "review_email_requests"
          )
          .update({
            status: "sent",
            sent_at:
              new Date().toISOString(),
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            request.id
          )
          .eq(
            "status",
            "processing"
          )
          .select("id")
          .maybeSingle();

        if (updateError) {
          /*
           * The email has already been sent.
           *
           * We deliberately do NOT send it again here.
           * The request remains processing and can be reconciled
           * manually / by a future idempotency layer.
           */
          console.error(
            "Email sent but request status update failed:",
            updateError
          );

          throw new Error(
            `Email sent but failed marking request as sent: ${updateError.message}`
          );
        }

        if (!updatedRequest) {
          /*
           * Another worker changed the request after our send.
           * Again, DO NOT send another email.
           */
          console.warn(
            `Review email request ${request.id} was changed before final status update. Email was already sent.`
          );
        }

        sent++;
      } catch (error) {
        failed++;

        const message =
          error instanceof Error
            ? error.message
            : String(error);

        console.error(
          `Review request failed for order ${order.id}:`,
          message
        );

        /*
         * Do not overwrite a successful "sent" state.
         *
         * This protects us if some later error happens after
         * the email was successfully sent and another process
         * has already marked it sent.
         */
        await supabase
          .from(
            "review_email_requests"
          )
          .update({
            status: "failed",
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "order_id",
            order.id
          )
          .eq(
            "status",
            "processing"
          );
      }
    }

    return json({
      success: true,
      processed,
      sent,
      skipped,
      failed,
      cutoff,
    });
  } catch (error) {
    console.error(
      "customer-review-request failed:",
      error
    );

    return json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      500
    );
  }
});