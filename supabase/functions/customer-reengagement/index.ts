import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SITE_URL = "https://tnmonline.in";
const TEST_EMAIL = "shivam25061994@gmail.com";
const COOLDOWN_DAYS = 7;

const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type CampaignType =
  | "wallet_expiry"
  | "wallet_balance"
  | "abandoned_cart"
  | "wishlist_price_drop"
  | "wishlist"
  | "back_in_stock"
  | "recent_purchase"
  | "winback_30d"
  | "winback_60d";

type WalletExpiryStage = 7 | 3 | 2 | 1 | 0;

type CartItem = {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  price: number | string;
  quantity: number;
  updated_at: string;
};

type CartSignal = {
  cartId: string;
  lastActivityAt: string;
  itemCount: number;
  subtotal: number;
  items: CartItem[];
};

type WishlistItem = {
  id: string;
  customer_id: string;
  product_id: string;
  created_at: string;
};

type WishlistProduct = {
  id: string;
  name: string;
  price: number | string;
  stock: number | null;
  track_inventory: boolean;
  allow_backorders: boolean;
  status: string;
  image: string | null;
};

type WishlistSignal = {
  lastAddedAt: string;
  itemCount: number;
  items: Array<{
    wishlistId: string;
    productId: string;
    productName: string;
    productImage: string | null;
    price: number | string;
  }>;
};

type WishlistPriceDropSignal = {
  productId: string;
  productSlug: string | null;
  productName: string;
  productImage: string | null;
  previousPrice: number;
  newPrice: number;
  priceDrop: number;
  changedAt: string;
  referenceId: string;
};

type BackInStockSignal = {
  productId: string;
  productName: string;
  productSlug: string | null;
  productImage: string | null;
  price: number;
  restockedAt: string;
  referenceId: string;
};

type Campaign = {
  customerId: string;
  email: string;
  customerName: string;
  campaignType: CampaignType;
  subject: string;
  title: string;
  message: string;
  ctaText: string;
  ctaUrl: string;
  referenceId: string | null;
  metadata: Record<string, unknown>;
  cart?: CartSignal;
  wishlist?: WishlistSignal;
  wishlistPriceDrop?: WishlistPriceDropSignal;
  backInStock?: BackInStockSignal;
};

function money(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getCustomerName(
  firstName: string | null,
  lastName: string | null
) {
  return [firstName, lastName].filter(Boolean).join(" ") || "there";
}

function daysUntil(date: string) {
  return Math.ceil(
    (new Date(date).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  );
}

function getExpiryStage(days: number): WalletExpiryStage | null {
  if (days < 0 || days > 7) return null;
  if (days === 0) return 0;
  if (days === 1) return 1;
  if (days === 2) return 2;
  if (days === 3) return 3;
  return 7;
}

function expiryStageRank(stage: WalletExpiryStage) {
  switch (stage) {
    case 7:
      return 1;
    case 3:
      return 2;
    case 2:
      return 3;
    case 1:
      return 4;
    case 0:
      return 5;
  }
}

function getExpiryCopy(
  balance: number,
  expiresAt: string,
  stage: WalletExpiryStage
) {
  const expiryDate = new Date(expiresAt).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  switch (stage) {
    case 0:
      return {
        subject: "⏳ Your T&M Wallet credit expires today",
        title: "Your wallet credit expires today",
        message:
          `You have ${money(balance)} waiting in your T&M Wallet. ` +
          "Your expiring wallet credit expires today. Use it now before it expires.",
      };

    case 1:
      return {
        subject: "⏳ Your T&M Wallet credit expires tomorrow",
        title: "Your wallet credit expires tomorrow",
        message:
          `You have ${money(balance)} waiting in your T&M Wallet. ` +
          "Your expiring credit expires tomorrow. Don't leave it unused.",
      };

    case 2:
      return {
        subject: "Only 2 days left to use your T&M Wallet",
        title: "Only 2 days left",
        message:
          `You have ${money(balance)} waiting in your T&M Wallet. ` +
          "Your expiring credit has only 2 days left. This is a good time to pick something you've been eyeing.",
      };

    case 3:
      return {
        subject: "Only 3 days left to use your T&M Wallet",
        title: "Only 3 days left",
        message:
          `You have ${money(balance)} waiting in your T&M Wallet. ` +
          "Your expiring credit has only 3 days left. Don't miss the chance to use it.",
      };

    case 7:
    default:
      return {
        subject: "⏳ Your T&M Wallet credit is expiring soon",
        title: "Your wallet credit is waiting",
        message:
          `You have ${money(balance)} in your T&M Wallet. ` +
          `Part of your wallet credit expires in the next few days, on ${expiryDate}.`,
      };
  }
}

function baseEmailHtml(
  campaign: Campaign,
  bodyContent: string
) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<title>T&amp;M Jewels</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ef;color:#222;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f3ef;">
<tr>
<td align="center" style="padding:28px 12px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#fff;border:1px solid #e9e3d8;">

<tr>
<td align="center" style="padding:30px 20px 24px;border-bottom:1px solid #eeeae2;">
<img src="https://wzphyyoftwxvpqxtfgtb.supabase.co/storage/v1/object/public/Logo/MainLogo.png"
alt="T&amp;M Jewels" width="190"
style="display:block;width:190px;max-width:80%;height:auto;margin:0 auto;">
<div style="margin-top:10px;font-size:11px;line-height:18px;letter-spacing:1.5px;color:#999287;text-transform:uppercase;">
Create your own style. Create your own trend.
</div>
</td>
</tr>

<tr>
<td align="center" style="padding:38px 24px 20px;">
<div style="width:58px;height:58px;line-height:58px;border-radius:50%;background:#f7f1e5;color:#8b6424;font-size:24px;font-weight:bold;">
✦
</div>
<h1 style="margin:18px 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:29px;line-height:37px;font-weight:600;color:#8b6424;">
${esc(campaign.title)}
</h1>
<p style="margin:0;font-size:14px;line-height:23px;color:#6e6a63;">
Dear ${esc(campaign.customerName)},<br>
${esc(campaign.message)}
</p>
</td>
</tr>

${bodyContent}

<tr>
<td align="center" style="padding:32px 24px;border-top:1px solid #eeeae2;">
<div style="height:1px;background:#eeeae2;margin-bottom:22px;"></div>
<img src="https://wzphyyoftwxvpqxtfgtb.supabase.co/storage/v1/object/public/Logo/MainLogo.png"
alt="T&amp;M Jewels" width="125"
style="display:block;width:125px;height:auto;margin:0 auto;">
<div style="margin-top:12px;font-size:12px;line-height:20px;color:#999287;">
Need help? Contact us at <strong>shop.tnm.official@gmail.com</strong>
</div>
<div style="margin-top:14px;font-size:11px;line-height:18px;color:#aaa49a;">
You are receiving this because you are a T&amp;M Jewels customer.
<br>© T&amp;M Jewels. All rights reserved.
</div>
</td>
</tr>

</table>
</td>
</tr>
</table>
</body>
</html>`;
}

function emailHtml(campaign: Campaign) {
  const body = `
<tr>
<td align="center" style="padding:8px 24px 36px;">
<a href="${esc(campaign.ctaUrl)}"
style="display:inline-block;background:#8b6424;color:#fff;text-decoration:none;padding:14px 28px;font-size:12px;font-weight:bold;letter-spacing:1px;border-radius:4px;">
${esc(campaign.ctaText)}
</a>
<div style="margin-top:16px;font-size:11px;line-height:18px;color:#aaa49a;">
Your wallet credit is applied automatically at checkout when available.
</div>
</td>
</tr>`;

  return baseEmailHtml(campaign, body);
}

function cartEmailHtml(
  campaign: Campaign,
  cart: CartSignal
) {
  const itemRows = cart.items
    .slice(0, 6)
    .map((item) => {
      const image = item.product_image
        ? `<img src="${esc(item.product_image)}" alt="${esc(item.product_name)}" width="72" height="90" style="display:block;width:72px;height:90px;object-fit:cover;border-radius:4px;">`
        : `<div style="width:72px;height:90px;background:#f5f3ef;border-radius:4px;"></div>`;

      return `
<tr>
<td style="padding:12px 0;border-bottom:1px solid #eeeae2;vertical-align:middle;">
${image}
</td>
<td style="padding:12px;border-bottom:1px solid #eeeae2;vertical-align:middle;text-align:left;">
<div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:21px;color:#333;">
${esc(item.product_name)}
</div>
<div style="margin-top:4px;font-size:11px;line-height:17px;color:#999287;">
Qty ${Number(item.quantity)}
</div>
</td>
<td style="padding:12px 0;border-bottom:1px solid #eeeae2;vertical-align:middle;text-align:right;font-size:13px;color:#5e5a54;">
${money(Number(item.price) * Number(item.quantity))}
</td>
</tr>`;
    })
    .join("");

  const body = `
<tr>
<td style="padding:8px 30px 20px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
${itemRows}
<tr>
<td colspan="2" style="padding:18px 0 4px;text-align:right;font-size:12px;color:#999287;">
Cart total
</td>
<td style="padding:18px 0 4px;text-align:right;font-size:16px;font-weight:bold;color:#333;">
${money(cart.subtotal)}
</td>
</tr>
</table>
</td>
</tr>

<tr>
<td align="center" style="padding:10px 24px 36px;">
<a href="${esc(campaign.ctaUrl)}"
style="display:inline-block;background:#8b6424;color:#fff;text-decoration:none;padding:14px 28px;font-size:12px;font-weight:bold;letter-spacing:1px;border-radius:4px;">
${esc(campaign.ctaText)}
</a>
<div style="margin-top:16px;font-size:11px;line-height:18px;color:#aaa49a;">
Your cart is saved for you. Availability and pricing are subject to change.
</div>
</td>
</tr>`;

  return baseEmailHtml(campaign, body);
}

function wishlistPriceDropEmailHtml(
  campaign: Campaign,
  signal: WishlistPriceDropSignal
) {
  const image = signal.productImage
    ? `<img src="${esc(signal.productImage)}" alt="${esc(signal.productName)}" width="150" height="188" style="display:block;width:150px;height:188px;object-fit:cover;border-radius:6px;margin:0 auto;">`
    : "";

  const body = `
<tr>
<td align="center" style="padding:8px 30px 26px;">
${image}
<div style="margin-top:18px;font-family:Georgia,'Times New Roman',serif;font-size:19px;line-height:27px;color:#333;">
${esc(signal.productName)}
</div>

<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:14px auto 0;">
<tr>
<td style="padding:0 10px 0 0;font-size:13px;color:#aaa49a;text-decoration:line-through;">
${money(signal.previousPrice)}
</td>
<td style="padding:0 10px;font-size:18px;font-weight:bold;color:#8b6424;">
${money(signal.newPrice)}
</td>
<td style="padding:4px 8px;background:#f7f1e5;border-radius:3px;font-size:11px;font-weight:bold;color:#8b6424;">
SAVE ${money(signal.priceDrop)}
</td>
</tr>
</table>
</td>
</tr>

<tr>
<td align="center" style="padding:10px 24px 36px;">
<a href="${esc(campaign.ctaUrl)}"
style="display:inline-block;background:#8b6424;color:#fff;text-decoration:none;padding:14px 28px;font-size:12px;font-weight:bold;letter-spacing:1px;border-radius:4px;">
${esc(campaign.ctaText)}
</a>
<div style="margin-top:16px;font-size:11px;line-height:18px;color:#aaa49a;">
This price is current when this email is sent and may change later.
</div>
</td>
</tr>`;

  return baseEmailHtml(campaign, body);
}

function wishlistEmailHtml(
  campaign: Campaign,
  wishlist: WishlistSignal
) {
  const itemRows = wishlist.items
    .slice(0, 6)
    .map((item) => {
      const image = item.productImage
        ? `<img src="${esc(item.productImage)}" alt="${esc(item.productName)}" width="72" height="90" style="display:block;width:72px;height:90px;object-fit:cover;border-radius:4px;">`
        : `<div style="width:72px;height:90px;background:#f5f3ef;border-radius:4px;"></div>`;

      return `
<tr>
<td style="padding:12px 0;border-bottom:1px solid #eeeae2;vertical-align:middle;">
${image}
</td>
<td style="padding:12px;border-bottom:1px solid #eeeae2;vertical-align:middle;text-align:left;">
<div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:21px;color:#333;">
${esc(item.productName)}
</div>
<div style="margin-top:4px;font-size:13px;line-height:18px;color:#5e5a54;">
${money(Number(item.price))}
</div>
</td>
</tr>`;
    })
    .join("");

  const body = `
<tr>
<td style="padding:8px 30px 20px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
${itemRows}
</table>
</td>
</tr>

<tr>
<td align="center" style="padding:10px 24px 36px;">
<a href="${esc(campaign.ctaUrl)}"
style="display:inline-block;background:#8b6424;color:#fff;text-decoration:none;padding:14px 28px;font-size:12px;font-weight:bold;letter-spacing:1px;border-radius:4px;">
${esc(campaign.ctaText)}
</a>
<div style="margin-top:16px;font-size:11px;line-height:18px;color:#aaa49a;">
Prices and availability are subject to change.
</div>
</td>
</tr>`;

  return baseEmailHtml(campaign, body);
}

function backInStockEmailHtml(
  campaign: Campaign,
  signal: BackInStockSignal
) {
  const image = signal.productImage
    ? `<img src="${esc(signal.productImage)}" alt="${esc(signal.productName)}" width="180" height="225" style="display:block;width:180px;height:225px;object-fit:cover;border-radius:6px;margin:0 auto;">`
    : `<div style="width:180px;height:225px;background:#f5f3ef;border-radius:6px;margin:0 auto;"></div>`;

  const body = `
<tr>
<td align="center" style="padding:8px 30px 26px;">
${image}
<div style="margin-top:18px;font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:28px;color:#333;">
${esc(signal.productName)}
</div>
<div style="margin-top:8px;font-size:16px;font-weight:bold;color:#8b6424;">
${money(signal.price)}
</div>
</td>
</tr>

<tr>
<td align="center" style="padding:10px 24px 36px;">
<a href="${esc(campaign.ctaUrl)}"
style="display:inline-block;background:#8b6424;color:#fff;text-decoration:none;padding:14px 28px;font-size:12px;font-weight:bold;letter-spacing:1px;border-radius:4px;">
${esc(campaign.ctaText)}
</a>
<div style="margin-top:16px;font-size:11px;line-height:18px;color:#aaa49a;">
It's available again now, but availability can change.
</div>
</td>
</tr>`;

  return baseEmailHtml(campaign, body);
}

async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/send-email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        to,
        subject,
        html,
      }),
    }
  );

  const rawResponse = await response.text();

  let data: unknown = null;

  try {
    data = rawResponse ? JSON.parse(rawResponse) : null;
  } catch {
    data = rawResponse;
  }

  if (!response.ok) {
    let details = "";

    if (typeof data === "string") {
      details = data;
    } else {
      try {
        details = JSON.stringify(data);
      } catch {
        details = String(data);
      }
    }

    throw new Error(
      `send-email failed: ${response.status} ${details}`
    );
  }

  return data;
}

async function recentlyEmailed(customerId: string) {
  const since = new Date(
    Date.now() -
      COOLDOWN_DAYS * 24 * 60 * 60 * 1000
  );

  const { data, error } = await supabaseAdmin
    .from("customer_email_campaigns")
    .select("id")
    .eq("customer_id", customerId)
    .eq("status", "sent")
    .gte("sent_at", since.toISOString())
    .limit(1);

  if (error) throw error;
  return (data ?? []).length > 0;
}

async function getLastWalletExpiryStage(
  customerId: string,
  walletLotId: string
): Promise<WalletExpiryStage | null> {
  const { data, error } = await supabaseAdmin
    .from("customer_email_campaigns")
    .select("metadata")
    .eq("customer_id", customerId)
    .eq("campaign_type", "wallet_expiry")
    .eq("status", "sent")
    .eq("reference_id", walletLotId)
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data?.metadata) return null;

  const stage = Number(
    (data.metadata as Record<string, unknown>)
      .expiryStage
  );

  if (![0, 1, 2, 3, 7].includes(stage)) {
    return null;
  }

  return stage as WalletExpiryStage;
}

async function campaignAlreadySent(
  customerId: string,
  campaignType: CampaignType,
  referenceId: string | null
) {
  let query = supabaseAdmin
    .from("customer_email_campaigns")
    .select("id")
    .eq("customer_id", customerId)
    .eq("campaign_type", campaignType)
    .eq("status", "sent");

  if (referenceId) {
    query = query.eq("reference_id", referenceId);
  } else {
    query = query.is("reference_id", null);
  }

  const { data, error } = await query.limit(1);

  if (error) throw error;
  return (data ?? []).length > 0;
}

async function getWalletSignal(customerId: string) {
  const { data: wallet, error: walletError } =
    await supabaseAdmin
      .from("wallets")
      .select("id,balance_paise")
      .eq("customer_id", customerId)
      .eq("status", "active")
      .maybeSingle();

  if (walletError) throw walletError;

  if (!wallet || Number(wallet.balance_paise) <= 0) {
    return null;
  }

  const { data: lots, error: lotsError } =
    await supabaseAdmin
      .from("wallet_credit_lots")
      .select(
        "id,remaining_amount_paise,expires_at,status,created_at"
      )
      .eq("wallet_id", wallet.id)
      .eq("status", "active")
      .gt("remaining_amount_paise", 0)
      .order("expires_at", {
        ascending: true,
        nullsFirst: false,
      })
      .limit(20);

  if (lotsError) throw lotsError;

  const activeLots = (lots ?? []).filter((lot) => {
    if (!lot.expires_at) return true;
    return (
      new Date(lot.expires_at).getTime() >
      Date.now()
    );
  });

  if (!activeLots.length) return null;

  const balance =
    Number(wallet.balance_paise) / 100;

  const expiringLot = activeLots.find(
    (lot) => lot.expires_at
  );

  if (expiringLot?.expires_at) {
    const days = daysUntil(expiringLot.expires_at);
    const expiryStage = getExpiryStage(days);

    if (expiryStage !== null) {
      const copy = getExpiryCopy(
        balance,
        expiringLot.expires_at,
        expiryStage
      );

      return {
        campaignType:
          "wallet_expiry" as CampaignType,
        title: copy.title,
        message: copy.message,
        subject: copy.subject,
        referenceId: expiringLot.id,
        expiryStage,
        metadata: {
          balance,
          expiresAt: expiringLot.expires_at,
          daysRemaining: days,
          expiryStage,
          walletLotId: expiringLot.id,
        },
      };
    }
  }

  return {
    campaignType:
      "wallet_balance" as CampaignType,
    title:
      `You have ${money(balance)} waiting for you`,
    message:
      `There's ${money(balance)} in your T&M Wallet ready to use on your next T&M Jewels order. Maybe it's time to treat yourself.`,
    subject:
      "💛 You have money waiting in your T&M Wallet",
    referenceId: null,
    expiryStage: null,
    metadata: { balance },
  };
}

async function getCartSignal(
  customerId: string
): Promise<CartSignal | null> {
  const { data: cart, error: cartError } =
    await supabaseAdmin
      .from("carts")
      .select("id,updated_at")
      .eq("customer_id", customerId)
      .maybeSingle();

  if (cartError) throw cartError;
  if (!cart) return null;

  const { data: items, error: itemsError } =
    await supabaseAdmin
      .from("cart_items")
      .select(
        "id,product_id,product_name,product_image,price,quantity,updated_at"
      )
      .eq("cart_id", cart.id)
      .order("updated_at", {
        ascending: false,
      });

  if (itemsError) throw itemsError;
  if (!items?.length) return null;

  const typedItems = items as CartItem[];

  /*
   * IMPORTANT:
   * Cart data can become stale after the customer leaves.
   * Before sending an abandoned-cart email, always check the
   * CURRENT product record.
   *
   * Availability rules:
   * - Product must still exist.
   * - Product status must be "active".
   * - If inventory is tracked, there must be enough stock for
   *   the quantity in the cart, unless backorders are allowed.
   * - If inventory is not tracked, the product is considered
   *   available.
   *
   * We also use the CURRENT product name and price so the email
   * never advertises an outdated price/name.
   */
  const productIds = [
    ...new Set(
      typedItems
        .map((item) => item.product_id)
        .filter(Boolean)
    ),
  ];

  if (!productIds.length) return null;

  const { data: products, error: productsError } =
    await supabaseAdmin
      .from("products")
      .select(
        "id,name,price,stock,track_inventory,allow_backorders,status"
      )
      .in("id", productIds);

  if (productsError) throw productsError;

  const productMap = new Map(
    (products ?? []).map((product) => [
      product.id,
      product,
    ])
  );

  const availableItems: CartItem[] = [];

  for (const item of typedItems) {
    const product = productMap.get(item.product_id);

    // Deleted/missing products cannot be purchased.
    if (!product) continue;

    // Hidden/inactive products cannot be promoted.
    if (product.status !== "active") continue;

    const quantity = Math.max(
      1,
      Number(item.quantity || 0)
    );

    const trackInventory =
      product.track_inventory === true;
    const allowBackorders =
      product.allow_backorders === true;
    const stock = Number(product.stock ?? 0);

    const available =
      !trackInventory ||
      allowBackorders ||
      stock >= quantity;

    if (!available) continue;

    availableItems.push({
      ...item,
      // Use current product data rather than stale cart data.
      product_name:
        product.name || item.product_name,
      price:
        product.price != null
          ? product.price
          : item.price,
    });
  }

  /*
   * If every item became unavailable, do not send a misleading
   * abandoned-cart email. If a product later becomes available
   * again, the same cart state can qualify naturally.
   */
  if (!availableItems.length) return null;

  const latestItemActivity =
    availableItems.reduce(
      (latest, item) =>
        new Date(item.updated_at).getTime() >
        new Date(latest).getTime()
          ? item.updated_at
          : latest,
      availableItems[0].updated_at
    );

  const lastActivityAt =
    new Date(cart.updated_at).getTime() >
    new Date(latestItemActivity).getTime()
      ? cart.updated_at
      : latestItemActivity;

  const ageHours =
    (Date.now() -
      new Date(lastActivityAt).getTime()) /
    (1000 * 60 * 60);

  if (ageHours < 24) return null;

  const itemCount = availableItems.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  const subtotal = availableItems.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  return {
    cartId: cart.id,
    lastActivityAt,
    itemCount,
    subtotal,
    items: availableItems,
  };
}

async function getPrimaryProductImages(
  productIds: string[]
): Promise<Map<string, string>> {
  if (!productIds.length) return new Map();

  const { data, error } = await supabaseAdmin
    .from("product_images")
    .select("product_id,image_url,is_primary,sort_order")
    .in("product_id", productIds)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error) throw error;

  const imageMap = new Map<string, string>();

  for (const row of data ?? []) {
    if (
      row.image_url &&
      !imageMap.has(row.product_id)
    ) {
      imageMap.set(row.product_id, row.image_url);
    }
  }

  return imageMap;
}

async function getWishlistPriceDropSignal(
  customerId: string
): Promise<WishlistPriceDropSignal | null> {
  const lookback = new Date(
    Date.now() - 8 * 24 * 60 * 60 * 1000
  );

  const { data: wishlistRows, error: wishlistError } =
    await supabaseAdmin
      .from("wishlists")
      .select("product_id")
      .eq("customer_id", customerId);

  if (wishlistError) throw wishlistError;
  if (!wishlistRows?.length) return null;

  const wishlistProductIds = [
    ...new Set(
      wishlistRows
        .map((row) => row.product_id)
        .filter(Boolean)
    ),
  ];

  if (!wishlistProductIds.length) return null;

  /*
   * Fetch the latest price-change event for each wishlist product.
   * We intentionally inspect the latest event, not merely the latest
   * historical drop. This prevents a stale "price dropped" email when
   * the product later became more expensive.
   */
  const { data: priceChanges, error: priceError } =
    await supabaseAdmin
      .from("product_price_history")
      .select(
        "id,product_id,previous_price,new_price,changed_at"
      )
      .in("product_id", wishlistProductIds)
      .gte("changed_at", lookback.toISOString())
      .order("changed_at", { ascending: false })
      .limit(100);

  if (priceError) throw priceError;
  if (!priceChanges?.length) return null;

  const latestByProduct = new Map<
    string,
    (typeof priceChanges)[number]
  >();

  for (const change of priceChanges) {
    if (!latestByProduct.has(change.product_id)) {
      latestByProduct.set(change.product_id, change);
    }
  }

  const productIds = [
    ...latestByProduct.keys(),
  ];

  const { data: products, error: productsError } =
    await supabaseAdmin
      .from("products")
      .select(
        "id,name,slug,price,stock,track_inventory,allow_backorders,status"
      )
      .in("id", productIds);

  if (productsError) throw productsError;

  const imageMap =
    await getPrimaryProductImages(productIds);

  for (const product of products ?? []) {
    const change = latestByProduct.get(product.id);
    if (!change) continue;

    // Only a current/latest price change that is actually a drop qualifies.
    if (
      Number(change.new_price) >=
      Number(change.previous_price)
    ) {
      continue;
    }

    if (product.status !== "active") continue;

    const available =
      product.track_inventory !== true ||
      product.allow_backorders === true ||
      Number(product.stock ?? 0) > 0;

    if (!available) continue;

    const currentPrice = Number(product.price);
    const previousPrice =
      Number(change.previous_price);

    // The live price must still reflect the recorded drop.
    if (
      !Number.isFinite(currentPrice) ||
      !Number.isFinite(previousPrice) ||
      currentPrice >= previousPrice
    ) {
      continue;
    }

    const priceDrop =
      previousPrice - currentPrice;

    if (priceDrop <= 0) continue;

    return {
      productId: product.id,
      productSlug: product.slug ?? null,
      productName: product.name,
      productImage:
        imageMap.get(product.id) ?? null,
      previousPrice,
      newPrice: currentPrice,
      priceDrop,
      changedAt: change.changed_at,
      referenceId:
        `${change.id}:${product.id}`,
    };
  }

  return null;
}

async function getBackInStockSignal(
  customerId: string
): Promise<BackInStockSignal | null> {
  const lookback = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  );

  /*
   * Only products currently on this customer's wishlist can trigger
   * the campaign.
   */
  const { data: wishlistRows, error: wishlistError } =
    await supabaseAdmin
      .from("wishlists")
      .select("id,product_id")
      .eq("customer_id", customerId);

  if (wishlistError) throw wishlistError;
  if (!wishlistRows?.length) return null;

  const wishlistProductIds = [
    ...new Set(
      wishlistRows
        .map((row) => row.product_id)
        .filter(Boolean)
    ),
  ];

  if (!wishlistProductIds.length) return null;

  /*
   * The stock trigger records every stock change. We fetch recent
   * events and keep only the latest event per product.
   *
   * This means:
   *   1 -> 0 -> 5  => qualifies
   *   0 -> 5 -> 0  => does NOT qualify anymore
   *
   * We never act on an old restock event after a newer stock change.
   */
  const { data: stockChanges, error: stockError } =
    await supabaseAdmin
      .from("product_stock_history")
      .select(
        "id,product_id,previous_stock,new_stock,changed_at"
      )
      .in("product_id", wishlistProductIds)
      .gte("changed_at", lookback.toISOString())
      .order("changed_at", { ascending: false })
      .limit(500);

  if (stockError) throw stockError;
  if (!stockChanges?.length) return null;

  const latestByProduct = new Map<
    string,
    (typeof stockChanges)[number]
  >();

  for (const change of stockChanges) {
    if (!latestByProduct.has(change.product_id)) {
      latestByProduct.set(change.product_id, change);
    }
  }

  /*
   * Only a genuine transition from zero to available qualifies.
   * For tracked inventory this is 0 -> positive stock.
   */
  const restockedProductIds: string[] = [];

  for (const change of latestByProduct.values()) {
    const previousStock = Number(
      change.previous_stock ?? 0
    );
    const newStock = Number(
      change.new_stock ?? 0
    );

    if (
      previousStock <= 0 &&
      newStock > 0
    ) {
      restockedProductIds.push(
        change.product_id
      );
    }
  }

  if (!restockedProductIds.length) return null;

  const { data: products, error: productsError } =
    await supabaseAdmin
      .from("products")
      .select(
        "id,name,slug,price,stock,track_inventory,allow_backorders,status"
      )
      .in("id", restockedProductIds);

  if (productsError) throw productsError;

  const imageMap =
    await getPrimaryProductImages(
      restockedProductIds
    );

  /*
   * If several wishlist pieces were restocked, pick the newest
   * qualifying restock event so the customer gets one focused email.
   */
  const sortedProducts = [...(products ?? [])].sort(
    (a, b) =>
      new Date(
        latestByProduct.get(b.id)!.changed_at
      ).getTime() -
      new Date(
        latestByProduct.get(a.id)!.changed_at
      ).getTime()
  );

  for (const product of sortedProducts) {
    const change = latestByProduct.get(product.id);
    if (!change) continue;

    if (product.status !== "active") continue;

    const currentStock = Number(
      product.stock ?? 0
    );

    const currentlyAvailable =
      product.track_inventory !== true ||
      product.allow_backorders === true ||
      currentStock > 0;

    if (!currentlyAvailable) continue;

    /*
     * A product with inventory tracking disabled is not meaningful
     * as a stock-restock event, so require it to be tracked here.
     */
    if (product.track_inventory !== true) continue;

    if (
      Number(change.previous_stock ?? 0) > 0 ||
      Number(change.new_stock ?? 0) <= 0
    ) {
      continue;
    }

    return {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug ?? null,
      productImage:
        imageMap.get(product.id) ?? null,
      price: Number(product.price ?? 0),
      restockedAt: change.changed_at,
      referenceId:
        `${change.id}:${product.id}`,
    };
  }

  return null;
}

async function getWishlistSignal(
  customerId: string
): Promise<WishlistSignal | null> {
  const WISHLIST_MIN_AGE_DAYS = 7;

  const { data: wishlistRows, error: wishlistError } =
    await supabaseAdmin
      .from("wishlists")
      .select("id,customer_id,product_id,created_at")
      .eq("customer_id", customerId)
      .order("created_at", {
        ascending: true,
      });

  if (wishlistError) throw wishlistError;
  if (!wishlistRows?.length) return null;

  const typedRows = wishlistRows as WishlistItem[];

  /*
   * A wishlist reminder is based on the actual wishlist state.
   * We only qualify after the oldest wishlist item has been there
   * for at least 7 days.
   */
  const oldestCreatedAt = typedRows[0].created_at;
  const ageDays =
    (Date.now() -
      new Date(oldestCreatedAt).getTime()) /
    (1000 * 60 * 60 * 24);

  if (ageDays < WISHLIST_MIN_AGE_DAYS) return null;

  const productIds = [
    ...new Set(
      typedRows
        .map((item) => item.product_id)
        .filter(Boolean)
    ),
  ];

  if (!productIds.length) return null;

  /*
   * Use live product data. Never promote a hidden, deleted,
   * or unavailable product.
   */
  const { data: products, error: productsError } =
    await supabaseAdmin
      .from("products")
      .select(
        "id,name,price,stock,track_inventory,allow_backorders,status"
      )
      .in("id", productIds);

  if (productsError) throw productsError;

  /*
   * Product images live outside the products table in this project,
   * so we use the image already available from the product/cart data
   * only when the schema exposes it. The wishlist campaign remains
   * fully functional without an image.
   */
  const productMap = new Map(
    (products ?? []).map((product) => [
      product.id,
      product as WishlistProduct,
    ])
  );

  const availableItems: WishlistSignal["items"] = [];

  for (const wishlistItem of typedRows) {
    const product = productMap.get(
      wishlistItem.product_id
    );

    if (!product) continue;
    if (product.status !== "active") continue;

    const available =
      product.track_inventory !== true ||
      product.allow_backorders === true ||
      Number(product.stock ?? 0) > 0;

    if (!available) continue;

    availableItems.push({
      wishlistId: wishlistItem.id,
      productId: product.id,
      productName: product.name,
      productImage: null,
      price: product.price,
    });
  }

  if (!availableItems.length) return null;

  const latestCreatedAt = typedRows.reduce(
    (latest, item) =>
      new Date(item.created_at).getTime() >
      new Date(latest).getTime()
        ? item.created_at
        : latest,
    typedRows[0].created_at
  );

  return {
    lastAddedAt: latestCreatedAt,
    itemCount: availableItems.length,
    items: availableItems,
  };
}

async function getLastPurchase(customerId: string) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(
      "id,order_number,created_at,order_status,total_amount"
    )
    .eq("customer_id", customerId)
    .not(
      "order_status",
      "in",
      '("cancelled","returned")'
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

function buildWinbackCampaign(
  customer: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  },
  lastPurchase: {
    id: string;
    created_at: string;
  } | null
): Campaign | null {
  if (!lastPurchase) return null;

  const daysSince = Math.floor(
    (Date.now() -
      new Date(lastPurchase.created_at).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (daysSince >= 60) {
    return {
      customerId: customer.id,
      email: customer.email,
      customerName: getCustomerName(
        customer.first_name,
        customer.last_name
      ),
      campaignType: "winback_60d",
      subject:
        "We saved a little sparkle for you ✨",
      title: "It's been a while",
      message:
        "It's been a little while since your last T&M Jewels order. Come see what's new — your next favourite piece might be waiting.",
      ctaText: "EXPLORE T&M JEWELS",
      ctaUrl: SITE_URL,
      referenceId: lastPurchase.id,
      metadata: { daysSince },
    };
  }

  if (daysSince >= 30) {
    return {
      customerId: customer.id,
      email: customer.email,
      customerName: getCustomerName(
        customer.first_name,
        customer.last_name
      ),
      campaignType: "winback_30d",
      subject:
        "Ready for your next T&M Jewels piece? ✨",
      title: "Your next look is calling",
      message:
        "It's been a month since your last order. Take a little look around — you may find something that belongs in your jewellery box.",
      ctaText: "SHOP NEW LOOKS",
      ctaUrl: SITE_URL,
      referenceId: lastPurchase.id,
      metadata: { daysSince },
    };
  }

  return null;
}

async function buildCampaign(customer: {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}): Promise<Campaign | null> {
  /*
   * Campaign priority:
   *
   * 1. Back in stock
   * 2. Wishlist price drop
   * 3. Wallet expiry
   * 4. Abandoned cart
   * 5. Wishlist
   * 6. Generic wallet balance
   * 7. Winback
   *
   * Back-in-stock and wishlist price-drop are concrete product
   * events, so they are checked before generic retention reminders.
   */

  // 1. Back-in-stock wishlist event.
  //
  // This is an event-based notification and intentionally bypasses
  // the normal 7-day marketing cooldown. Deduplication is still
  // enforced by the exact stock-history event reference.
  const backInStock =
    await getBackInStockSignal(customer.id);

  if (backInStock) {
    const alreadySent =
      await campaignAlreadySent(
        customer.id,
        "back_in_stock",
        backInStock.referenceId
      );

    if (!alreadySent) {
      return {
        customerId: customer.id,
        email: customer.email,
        customerName: getCustomerName(
          customer.first_name,
          customer.last_name
        ),
        campaignType: "back_in_stock",
        subject:
          "✨ It's back — your wishlist favourite is available",
        title: "It's back",
        message:
          `${backInStock.productName} is available again. You saved it to your wishlist, and now you can finally make it yours.`,
        ctaText: "SHOP THIS PIECE",
        ctaUrl:
          backInStock.productSlug
            ? `${SITE_URL}/product/${backInStock.productSlug}`
            : `${SITE_URL}/product/${backInStock.productId}`,
        referenceId:
          backInStock.referenceId,
        metadata: {
          productId: backInStock.productId,
          productName: backInStock.productName,
          price: backInStock.price,
          restockedAt: backInStock.restockedAt,
        },
        backInStock,
      };
    }
  }

  // 2. Wishlist price drop.
  //
  // This is also a high-intent event. It bypasses the normal
  // 7-day marketing cooldown, while the exact price-history
  // reference still prevents duplicate sends.
  const priceDrop =
    await getWishlistPriceDropSignal(customer.id);

  if (priceDrop) {
    const alreadySent =
      await campaignAlreadySent(
        customer.id,
        "wishlist_price_drop",
        priceDrop.referenceId
      );

    if (!alreadySent) {
      return {
        customerId: customer.id,
        email: customer.email,
        customerName: getCustomerName(
          customer.first_name,
          customer.last_name
        ),
        campaignType:
          "wishlist_price_drop",
        subject:
          "✨ A wishlist favourite just got more tempting",
        title:
          "Your wishlist just got a little sweeter",
        message:
          `The price of ${priceDrop.productName} has dropped from ${money(priceDrop.previousPrice)} to ${money(priceDrop.newPrice)}. You saved it for a reason — now might be the perfect time to make it yours.`,
        ctaText: "SHOP THIS PIECE",
        ctaUrl:
          priceDrop.productSlug
            ? `${SITE_URL}/product/${priceDrop.productSlug}`
            : `${SITE_URL}/product/${priceDrop.productId}`,
        referenceId:
          priceDrop.referenceId,
        metadata: {
          productId: priceDrop.productId,
          productSlug: priceDrop.productSlug,
          productName: priceDrop.productName,
          previousPrice: priceDrop.previousPrice,
          newPrice: priceDrop.newPrice,
          priceDrop: priceDrop.priceDrop,
          changedAt: priceDrop.changedAt,
        },
        wishlistPriceDrop: priceDrop,
      };
    }
  }

  // 3. Wallet expiry.
  const wallet = await getWalletSignal(
    customer.id
  );

  if (wallet?.campaignType === "wallet_expiry") {
    const currentStage =
      wallet.expiryStage as WalletExpiryStage;

    const lastStage =
      await getLastWalletExpiryStage(
        customer.id,
        wallet.referenceId!
      );

    if (
      lastStage === null ||
      expiryStageRank(currentStage) >
        expiryStageRank(lastStage)
    ) {
      return {
        customerId: customer.id,
        email: customer.email,
        customerName: getCustomerName(
          customer.first_name,
          customer.last_name
        ),
        campaignType: wallet.campaignType,
        subject: wallet.subject,
        title: wallet.title,
        message: wallet.message,
        ctaText: "USE MY WALLET",
        ctaUrl: SITE_URL,
        referenceId: wallet.referenceId,
        metadata: wallet.metadata,
      };
    }

    // If the same expiry stage was already sent,
    // continue checking lower-priority campaigns.
  }

  // 4. Abandoned cart.
  const cart = await getCartSignal(
    customer.id
  );

  if (cart) {
    const cartReference =
      `${cart.cartId}:${new Date(
        cart.lastActivityAt
      ).getTime()}`;

    const alreadySent =
      await campaignAlreadySent(
        customer.id,
        "abandoned_cart",
        cartReference
      );

    if (!alreadySent) {
      return {
        customerId: customer.id,
        email: customer.email,
        customerName: getCustomerName(
          customer.first_name,
          customer.last_name
        ),
        campaignType: "abandoned_cart",
        subject:
          "✨ You left something beautiful behind",
        title: "Your cart is waiting",
        message:
          cart.itemCount === 1
            ? "You picked something special. It's still waiting in your cart whenever you're ready."
            : `You picked ${cart.itemCount} beautiful pieces. They're still waiting in your cart whenever you're ready.`,
        ctaText: "VIEW MY CART",
        ctaUrl: `${SITE_URL}/cart`,
        referenceId: cartReference,
        metadata: {
          cartId: cart.cartId,
          lastActivityAt: cart.lastActivityAt,
          itemCount: cart.itemCount,
          subtotal: cart.subtotal,
        },
        cart,
      };
    }
  }

  // 5. Wishlist.
  const wishlist = await getWishlistSignal(
    customer.id
  );

  if (wishlist) {
    const wishlistReference = wishlist.items
      .map(
        (item) =>
          `${item.productId}:${item.wishlistId}`
      )
      .sort()
      .join("|");

    const alreadySent =
      await campaignAlreadySent(
        customer.id,
        "wishlist",
        wishlistReference
      );

    if (!alreadySent) {
      return {
        customerId: customer.id,
        email: customer.email,
        customerName: getCustomerName(
          customer.first_name,
          customer.last_name
        ),
        campaignType: "wishlist",
        subject:
          "✨ Still thinking about it?",
        title:
          wishlist.itemCount === 1
            ? "A piece you loved is waiting"
            : "Your wishlist is waiting",
        message:
          wishlist.itemCount === 1
            ? "That piece you loved is still on your wishlist. Maybe it's time to make it yours."
            : `You have ${wishlist.itemCount} beautiful pieces saved in your wishlist. Maybe it's time to make one of them yours.`,
        ctaText: "VIEW MY WISHLIST",
        ctaUrl: `${SITE_URL}/wishlist`,
        referenceId: wishlistReference,
        metadata: {
          lastAddedAt: wishlist.lastAddedAt,
          itemCount: wishlist.itemCount,
          productIds: wishlist.items.map(
            (item) => item.productId
          ),
        },
        wishlist,
      };
    }
  }

  // 6. Generic wallet balance.
  if (
    wallet &&
    wallet.campaignType === "wallet_balance"
  ) {
    const alreadySent =
      await campaignAlreadySent(
        customer.id,
        wallet.campaignType,
        wallet.referenceId
      );

    if (!alreadySent) {
      return {
        customerId: customer.id,
        email: customer.email,
        customerName: getCustomerName(
          customer.first_name,
          customer.last_name
        ),
        campaignType: wallet.campaignType,
        subject: wallet.subject,
        title: wallet.title,
        message: wallet.message,
        ctaText: "USE MY WALLET",
        ctaUrl: SITE_URL,
        referenceId: wallet.referenceId,
        metadata: wallet.metadata,
      };
    }
  }

  // 7. Winback.
  const lastPurchase =
    await getLastPurchase(customer.id);

  const winback = buildWinbackCampaign(
    customer,
    lastPurchase
  );

  if (winback) {
    const alreadySent =
      await campaignAlreadySent(
        customer.id,
        winback.campaignType,
        winback.referenceId
      );

    if (!alreadySent) return winback;
  }

  return null;
}

async function canSendCampaign(
  campaign: Campaign
) {
  /*
   * Wallet expiry, back-in-stock, and wishlist price-drop are
   * event/urgency based.
   * Back-in-stock and wishlist price-drop intentionally bypass
   * the normal 7-day marketing cooldown.
   *
   * Both are still deduplicated:
   * - wallet expiry: expiry stage + wallet lot
   * - back in stock: specific stock-history event
   */
  if (
    campaign.campaignType ===
      "back_in_stock" ||
    campaign.campaignType ===
      "wishlist_price_drop"
  ) {
    return true;
  }

  if (campaign.campaignType !== "wallet_expiry") {
    return !(await recentlyEmailed(
      campaign.customerId
    ));
  }

  const currentStage = Number(
    campaign.metadata.expiryStage
  ) as WalletExpiryStage;

  const since = new Date(
    Date.now() -
      COOLDOWN_DAYS * 24 * 60 * 60 * 1000
  );

  const { data, error } = await supabaseAdmin
    .from("customer_email_campaigns")
    .select(
      "campaign_type,reference_id,metadata,sent_at"
    )
    .eq("customer_id", campaign.customerId)
    .eq("status", "sent")
    .gte("sent_at", since.toISOString())
    .order("sent_at", {
      ascending: false,
    })
    .limit(20);

  if (error) throw error;

  if (!data?.length) return true;

  const latestWalletExpiry = data.find(
    (row) =>
      row.campaign_type === "wallet_expiry" &&
      row.reference_id === campaign.referenceId
  );

  if (latestWalletExpiry) {
    const previousStage = Number(
      (
        latestWalletExpiry.metadata as
          | Record<string, unknown>
          | null
      )?.expiryStage
    );

    if (
      [0, 1, 2, 3, 7].includes(previousStage) &&
      expiryStageRank(currentStage) >
        expiryStageRank(
          previousStage as WalletExpiryStage
        )
    ) {
      return true;
    }
  }

  return false;
}

async function processCustomers(
  dryRun = false
) {
  let processed = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  const sentTo: Array<{
    email: string;
    campaign: CampaignType;
    subject: string;
    expiryStage?: WalletExpiryStage;
    cartId?: string;
    cartItems?: number;
    cartTotal?: number;
  }> = [];

  const dryRunTo: Array<{
    email: string;
    campaign: CampaignType;
    subject: string;
    reason: string;
    cartId?: string;
    cartItems?: number;
    cartTotal?: number;
  }> = [];

  const failedTo: Array<{
    email: string;
    campaign: CampaignType;
    subject: string;
    error: string;
  }> = [];

  const { data: customers, error } =
    await supabaseAdmin
      .from("customers")
      .select(
        "id,email,first_name,last_name"
      )
      .eq("status", "active")
      .eq("marketing_email_enabled", true)
      .not("email", "is", null)
      .is("deleted_at", null)
      .limit(5000);

  if (error) throw error;

  for (const customer of customers ?? []) {
    processed++;

    if (!customer.email) {
      skipped++;
      continue;
    }

    let campaign: Campaign | null = null;

    try {
      campaign =
        await buildCampaign(customer);

      if (!campaign) {
        skipped++;
        continue;
      }

      if (!(await canSendCampaign(campaign))) {
        skipped++;
        continue;
      }

      if (dryRun) {
        dryRunTo.push({
          email: campaign.email,
          campaign: campaign.campaignType,
          subject: campaign.subject,
          reason:
            campaign.campaignType ===
            "abandoned_cart"
              ? "Cart has been inactive for at least 24 hours and this cart state has not been emailed before."
              : campaign.campaignType ===
                "wallet_expiry"
              ? `Wallet expiry stage ${campaign.metadata.expiryStage} qualifies.`
              : campaign.campaignType ===
                "back_in_stock"
              ? "A wishlist product has a latest stock transition from 0 to available and is currently purchasable."
              : "Campaign conditions qualify and cooldown/deduplication checks passed.",
          ...(campaign.campaignType ===
          "abandoned_cart"
            ? {
                cartId:
                  campaign.cart?.cartId,
                cartItems:
                  campaign.cart?.itemCount,
                cartTotal:
                  campaign.cart?.subtotal,
              }
            : {}),
        });

        skipped++;
        continue;
      }

      const html =
        campaign.campaignType ===
          "abandoned_cart" &&
        campaign.cart
          ? cartEmailHtml(
              campaign,
              campaign.cart
            )
          : campaign.campaignType ===
              "wishlist_price_drop" &&
            campaign.wishlistPriceDrop
          ? wishlistPriceDropEmailHtml(
              campaign,
              campaign.wishlistPriceDrop
            )
          : campaign.campaignType ===
              "wishlist" &&
            campaign.wishlist
          ? wishlistEmailHtml(
              campaign,
              campaign.wishlist
            )
          : campaign.campaignType ===
              "back_in_stock" &&
            campaign.backInStock
          ? backInStockEmailHtml(
              campaign,
              campaign.backInStock
            )
          : emailHtml(campaign);

      await sendEmail(
        campaign.email,
        campaign.subject,
        html
      );

      const { error: logError } =
        await supabaseAdmin
          .from("customer_email_campaigns")
          .insert({
            customer_id:
              campaign.customerId,
            campaign_type:
              campaign.campaignType,
            status: "sent",
            subject: campaign.subject,
            reference_id:
              campaign.referenceId,
            metadata: campaign.metadata,
          });

      if (logError) throw logError;

      sent++;

      sentTo.push({
        email: campaign.email,
        campaign:
          campaign.campaignType,
        subject: campaign.subject,
        ...(campaign.campaignType ===
        "wallet_expiry"
          ? {
              expiryStage: Number(
                campaign.metadata
                  .expiryStage
              ) as WalletExpiryStage,
            }
          : {}),
        ...(campaign.campaignType ===
        "abandoned_cart"
          ? {
              cartId:
                campaign.cart?.cartId,
              cartItems:
                campaign.cart?.itemCount,
              cartTotal:
                campaign.cart?.subtotal,
            }
          : {}),
        ...(campaign.campaignType ===
        "wishlist"
          ? {
              wishlistItems:
                campaign.wishlist?.itemCount,
            }
          : {}),
        ...(campaign.campaignType ===
        "wishlist_price_drop"
          ? {
              productId:
                campaign.wishlistPriceDrop?.productId,
              previousPrice:
                campaign.wishlistPriceDrop?.previousPrice,
              newPrice:
                campaign.wishlistPriceDrop?.newPrice,
              priceDrop:
                campaign.wishlistPriceDrop?.priceDrop,
            }
          : {}),
        ...(campaign.campaignType ===
        "back_in_stock"
          ? {
              productId:
                campaign.backInStock?.productId,
              productName:
                campaign.backInStock?.productName,
              price:
                campaign.backInStock?.price,
              restockedAt:
                campaign.backInStock?.restockedAt,
            }
          : {}),
      });
    } catch (error) {
      failed++;

      const errorMessage =
        error instanceof Error
          ? error.message
          : (() => {
              try {
                return JSON.stringify(error);
              } catch {
                return String(error);
              }
            })();

      console.error(
        "Customer re-engagement failed:",
        {
          customerId: customer.id,
          email: customer.email,
          campaignType:
            campaign?.campaignType ?? null,
          subject:
            campaign?.subject ?? null,
          error,
        }
      );

      failedTo.push({
        email: customer.email,
        campaign:
          campaign?.campaignType ??
          "wallet_balance",
        subject:
          campaign?.subject ??
          "T&M Jewels re-engagement email",
        error: errorMessage,
      });

      const { error: failureLogError } =
        await supabaseAdmin
          .from("customer_email_campaigns")
          .insert({
            customer_id: customer.id,
            campaign_type:
              campaign?.campaignType ??
              "wallet_balance",
            status: "failed",
            subject:
              campaign?.subject ??
              "T&M Jewels re-engagement email",
            reference_id:
              campaign?.referenceId ??
              null,
            metadata: {
              ...(campaign?.metadata ?? {}),
              error: errorMessage,
            },
          });

      if (failureLogError) {
        console.error(
          "Failed to record customer re-engagement failure:",
          failureLogError
        );
      }
    }
  }

  return {
    processed,
    sent,
    skipped,
    failed,
    sentTo,
    dryRunTo,
    failedTo,
  };
}

async function processTestEmail(
  req: Request
) {
  let body: Record<string, unknown> = {};

  try {
    body = await req.json();
  } catch {
    // Empty body is allowed.
  }

  if (body.testMode !== true) {
    return null;
  }

  /*
   * DIAGNOSTIC MODE:
   * Runs wishlist price-drop detection and the relevant campaign
   * selection/eligibility checks for one customer.
   *
   * No email is sent and no campaign row is created.
   *
   * Usage:
   * {
   *   "testMode": true,
   *   "testCampaign": "wishlist_price_drop_diagnostic",
   *   "customerId": "..."
   * }
   */
  if (
    body.testCampaign ===
    "wishlist_price_drop_diagnostic"
  ) {
    const customerId = String(
      body.customerId ??
        "6ce69a6d-99f3-4139-b372-798d58242596"
    );

    const { data: customer, error: customerError } =
      await supabaseAdmin
        .from("customers")
        .select(
          "id,email,first_name,last_name,status,marketing_email_enabled,deleted_at"
        )
        .eq("id", customerId)
        .maybeSingle();

    if (customerError) throw customerError;

    if (!customer) {
      return {
        success: true,
        testMode: true,
        testCampaign:
          "wishlist_price_drop_diagnostic",
        customerId,
        customer: null,
        error: "Customer not found.",
        note:
          "DIAGNOSTIC ONLY: no email sent and no campaign logged.",
      };
    }

    const priceDrop =
      await getWishlistPriceDropSignal(customerId);

    const priceDropAlreadySent =
      priceDrop
        ? await campaignAlreadySent(
            customerId,
            "wishlist_price_drop",
            priceDrop.referenceId
          )
        : null;

    const recentEmail =
      await recentlyEmailed(customerId);

    let campaign: Campaign | null = null;
    let campaignBuildError: string | null = null;

    try {
      campaign = await buildCampaign(customer);
    } catch (error) {
      campaignBuildError =
        error instanceof Error
          ? error.message
          : String(error);
    }

    let canSend: boolean | null = null;
    let canSendError: string | null = null;

    if (campaign) {
      try {
        canSend =
          await canSendCampaign(campaign);
      } catch (error) {
        canSendError =
          error instanceof Error
            ? error.message
            : String(error);
      }
    }

    return {
      success: true,
      testMode: true,
      testCampaign:
        "wishlist_price_drop_diagnostic",
      customerId,
      customer: {
        id: customer.id,
        email: customer.email,
        name: getCustomerName(
          customer.first_name,
          customer.last_name
        ),
        status: customer.status,
        marketing_email_enabled:
          customer.marketing_email_enabled,
        deleted_at: customer.deleted_at,
      },
      diagnostics: {
        wishlistPriceDropSignal: priceDrop,
        wishlistPriceDropAlreadySent:
          priceDropAlreadySent,
        recentMarketingEmailWithinCooldown:
          recentEmail,
        cooldownRule:
          "wishlist_price_drop bypasses the normal 7-day marketing cooldown because it is a high-intent wishlist event; exact price-drop references are still deduplicated",
        campaignBuildError,
        selectedCampaign: campaign
          ? {
              campaignType:
                campaign.campaignType,
              subject: campaign.subject,
              referenceId:
                campaign.referenceId,
              metadata:
                campaign.metadata,
              hasWishlistPriceDropSignal:
                Boolean(
                  campaign.wishlistPriceDrop
                ),
              wishlistPriceDrop:
                campaign.wishlistPriceDrop ??
                null,
            }
          : null,
        canSend,
        canSendError,
      },
      diagnosis:
        !priceDrop
          ? "getWishlistPriceDropSignal returned null."
          : priceDropAlreadySent
          ? "The exact wishlist price-drop reference is already logged as sent."
          : !campaign
          ? "The price-drop signal exists, but buildCampaign returned null."
          : campaign.campaignType !==
            "wishlist_price_drop"
          ? `buildCampaign selected ${campaign.campaignType} instead of wishlist_price_drop.`
          : canSend === false
          ? "The price-drop campaign was selected, but canSendCampaign returned false, most likely because of the 7-day cooldown."
          : canSend === true
          ? "WISHLIST PRICE-DROP FLOW IS CLEAR: the campaign is selected and allowed to send. The remaining issue is in processCustomers/sendEmail/logging."
          : "The flow could not determine send eligibility.",
      note:
        "DIAGNOSTIC ONLY: no email sent and no campaign logged.",
    };
  }

  if (
    body.testCampaign ===
    "back_in_stock"
  ) {
    const testSignal: BackInStockSignal = {
      productId: "TEST-PRODUCT-BACK-IN-STOCK",
      productName:
        "Elegant Heritage Necklace",
      productSlug: "elegant-heritage-necklace",
      productImage:
        "https://wzphyyoftwxvpqxtfgtb.supabase.co/storage/v1/object/public/Logo/MainLogo.png",
      price: 999,
      restockedAt: new Date().toISOString(),
      referenceId: "TEST-RESTOCK",
    };

    const campaign: Campaign = {
      customerId: "TEST-ONLY",
      email: TEST_EMAIL,
      customerName: "Shivam",
      campaignType: "back_in_stock",
      subject:
        "[TEST] ✨ It's back — your wishlist favourite is available",
      title: "It's back",
      message:
        `${testSignal.productName} is available again. You saved it to your wishlist, and now you can finally make it yours.`,
      ctaText: "SHOP THIS PIECE",
      ctaUrl:
        `${SITE_URL}/product/${testSignal.productSlug}`,
      referenceId: null,
      metadata: {
        testMode: true,
        productId: testSignal.productId,
        price: testSignal.price,
      },
      backInStock: testSignal,
    };

    await sendEmail(
      TEST_EMAIL,
      campaign.subject,
      backInStockEmailHtml(
        campaign,
        testSignal
      )
    );

    return {
      success: true,
      testMode: true,
      testCampaign:
        "back_in_stock",
      sent: 1,
      sentTo: [
        {
          email: TEST_EMAIL,
          campaign:
            "back_in_stock",
          subject:
            campaign.subject,
          productId:
            testSignal.productId,
          productName:
            testSignal.productName,
          price:
            testSignal.price,
        },
      ],
      note:
        "TEST MODE: no customer records were queried and no campaign was logged.",
    };
  }

  if (
    body.testCampaign ===
    "abandoned_cart"
  ) {
    const oldActivity = new Date(
      Date.now() -
        48 * 60 * 60 * 1000
    ).toISOString();

    const testCart: CartSignal = {
      cartId: "TEST-CART",
      lastActivityAt: oldActivity,
      itemCount: 2,
      subtotal: 1498,
      items: [
        {
          id: "TEST-ITEM-1",
          product_id:
            "TEST-PRODUCT-1",
          product_name:
            "Elegant Heritage Necklace",
          product_image:
            "https://wzphyyoftwxvpqxtfgtb.supabase.co/storage/v1/object/public/Logo/MainLogo.png",
          price: 999,
          quantity: 1,
          updated_at: oldActivity,
        },
        {
          id: "TEST-ITEM-2",
          product_id:
            "TEST-PRODUCT-2",
          product_name:
            "Classic Pearl Earrings",
          product_image:
            "https://wzphyyoftwxvpqxtfgtb.supabase.co/storage/v1/object/public/Logo/MainLogo.png",
          price: 499,
          quantity: 1,
          updated_at: oldActivity,
        },
      ],
    };

    const campaign: Campaign = {
      customerId: "TEST-ONLY",
      email: TEST_EMAIL,
      customerName: "Shivam",
      campaignType: "abandoned_cart",
      subject:
        "[TEST] ✨ You left something beautiful behind",
      title: "Your cart is waiting",
      message:
        "You picked 2 beautiful pieces. They're still waiting in your cart whenever you're ready.",
      ctaText: "VIEW MY CART",
      ctaUrl: `${SITE_URL}/cart`,
      referenceId: null,
      metadata: {
        testMode: true,
        cartId: testCart.cartId,
        itemCount: testCart.itemCount,
        subtotal: testCart.subtotal,
      },
      cart: testCart,
    };

    await sendEmail(
      TEST_EMAIL,
      campaign.subject,
      cartEmailHtml(
        campaign,
        testCart
      )
    );

    return {
      success: true,
      testMode: true,
      testCampaign:
        "abandoned_cart",
      sent: 1,
      sentTo: [
        {
          email: TEST_EMAIL,
          campaign:
            "abandoned_cart",
          subject:
            campaign.subject,
          cartItems:
            testCart.itemCount,
          cartTotal:
            testCart.subtotal,
        },
      ],
      note:
        "TEST MODE: no customer records were queried and no campaign was logged.",
    };
  }

  const rawStage = Number(
    body.expiryStage ?? 2
  );

  const expiryStage: WalletExpiryStage =
    [0, 1, 2, 3, 7].includes(
      rawStage
    )
      ? (rawStage as WalletExpiryStage)
      : 2;

  const expiresAt = new Date(
    Date.now() +
      (expiryStage === 0
        ? 2 * 60 * 60 * 1000
        : expiryStage *
          24 *
          60 *
          60 *
          1000)
  ).toISOString();

  const testBalance = 500;
  const copy = getExpiryCopy(
    testBalance,
    expiresAt,
    expiryStage
  );

  const campaign: Campaign = {
    customerId: "TEST-ONLY",
    email: TEST_EMAIL,
    customerName: "Shivam",
    campaignType: "wallet_expiry",
    subject:
      `[TEST] ${copy.subject}`,
    title: copy.title,
    message: copy.message,
    ctaText: "USE MY WALLET",
    ctaUrl: SITE_URL,
    referenceId: null,
    metadata: {
      testMode: true,
      expiryStage,
      expiresAt,
      balance: testBalance,
    },
  };

  await sendEmail(
    TEST_EMAIL,
    campaign.subject,
    emailHtml(campaign)
  );

  return {
    success: true,
    testMode: true,
    sent: 1,
    sentTo: [
      {
        email: TEST_EMAIL,
        campaign:
          "wallet_expiry",
        subject:
          campaign.subject,
        expiryStage,
      },
    ],
    note:
      "TEST MODE: no customer records were queried and no campaign was logged.",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }

  if (
    !SUPABASE_URL ||
    !SUPABASE_SERVICE_ROLE_KEY ||
    !RESEND_API_KEY
  ) {
    return new Response(
      JSON.stringify({
        error:
          "SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and RESEND_API_KEY are required",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }

  try {
    const testResult =
      await processTestEmail(req);

    if (testResult) {
      return new Response(
        JSON.stringify(testResult),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    let requestBody: Record<string, unknown> = {};

    try {
      // A normal invocation may have no body.
      // Test-mode requests are consumed above, so this only applies
      // to normal/dry-run requests.
      requestBody = await req.json();
    } catch {
      requestBody = {};
    }

    const dryRun =
      requestBody.dryRun === true;

    const result =
      await processCustomers(dryRun);

    return new Response(
      JSON.stringify({
        success: true,
        dryRun,
        ...result,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "Customer re-engagement job failed:",
      error
    );

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }
});
