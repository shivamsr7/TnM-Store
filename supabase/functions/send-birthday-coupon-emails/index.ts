import { createClient } from "jsr:@supabase/supabase-js@2";

type BirthdayCoupon = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discount_type: "fixed" | "percentage";
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount: number | null;
  one_use_per_customer: boolean;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  coupon_type: "standard" | "birthday";
  birthday_year: number | null;
  stacking_mode: "exclusive" | "stackable";
  auto_apply: boolean;
};

type Customer = {
  id: string;
  email: string | null;
  date_of_birth: string | null;
  first_name?: string | null;
  last_name?: string | null;
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const secretKeys = JSON.parse(
  Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}",
);
const serviceRoleKey =
  secretKeys["default"] ??
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const cronSecret = Deno.env.get("BIRTHDAY_CRON_SECRET");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase server credentials.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

function corsHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

function customerName(customer: Customer) {
  return (
    [customer.first_name, customer.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || "Beautiful"
  );
}

function formatMoney(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildBirthdayEmail(
  customer: Customer,
  coupon: BirthdayCoupon,
) {
  const name = escapeHtml(customerName(customer));

  const discountText =
    coupon.discount_type === "percentage"
      ? `${coupon.discount_value}% OFF`
      : `${formatMoney(coupon.discount_value)} OFF`;

  const minimumText = formatMoney(
    coupon.minimum_order_amount,
  );

  const startText = formatDate(coupon.starts_at);
  const expiryText = formatDate(coupon.expires_at);

  const validityText =
    startText && expiryText
      ? `${startText} – ${expiryText}`
      : expiryText
        ? `Valid until ${expiryText}`
        : "Valid throughout your birthday month";

  const maxDiscountText =
    coupon.discount_type === "percentage" &&
    coupon.maximum_discount !== null
      ? `
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#77736c;">
            Maximum Discount
          </td>
          <td
            align="right"
            style="padding:6px 0;font-size:13px;font-weight:600;color:#333333;"
          >
            ${formatMoney(coupon.maximum_discount)}
          </td>
        </tr>
      `
      : "";

  const oneUseText = coupon.one_use_per_customer
    ? "One-time birthday reward"
    : "Birthday reward";

  const title = coupon.title?.trim()
    ? escapeHtml(coupon.title.trim())
    : "Birthday Month Reward";

  const description = coupon.description?.trim()
    ? escapeHtml(coupon.description.trim())
    : "Celebrate your birthday month with a special reward from T&M Jewels.";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >
  <meta name="color-scheme" content="light">
  <meta
    name="supported-color-schemes"
    content="light"
  >
  <title>T&amp;M Jewels — Birthday Reward</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f3ef;
    color:#222;
    font-family:Arial,Helvetica,sans-serif;
    -webkit-text-size-adjust:100%;
  "
>
<table
  role="presentation"
  width="100%"
  cellspacing="0"
  cellpadding="0"
  border="0"
  style="background:#f5f3ef;"
>
<tr>
<td align="center" style="padding:28px 12px;">

<table
  role="presentation"
  width="100%"
  cellspacing="0"
  cellpadding="0"
  border="0"
  style="
    width:100%;
    max-width:640px;
    background:#fff;
    border:1px solid #e9e3d8;
  "
>

<tr>
<td
  align="center"
  style="
    padding:30px 20px 24px;
    border-bottom:1px solid #eeeae2;
  "
>
<img
  src="https://wzphyyoftwxvpqxtfgtb.supabase.co/storage/v1/object/public/Logo/MainLogo.png"
  alt="T&M Jewels"
  width="190"
  style="
    display:block;
    width:190px;
    max-width:80%;
    height:auto;
    margin:0 auto;
  "
>

<div
  style="
    margin-top:10px;
    font-size:11px;
    line-height:18px;
    letter-spacing:1.5px;
    color:#999287;
    text-transform:uppercase;
  "
>
  Create your own style. Create your own trend.
</div>
</td>
</tr>

<tr>
<td
  align="center"
  style="
    padding:38px 24px 20px;
    background:#fffdf7;
  "
>
<div style="font-size:54px;line-height:64px;">
  🎂
</div>

<div
  style="
    margin-top:14px;
    font-size:11px;
    line-height:18px;
    font-weight:700;
    letter-spacing:2px;
    color:#b18427;
    text-transform:uppercase;
  "
>
  A Little Something From T&amp;M Jewels
</div>

<h1
  style="
    margin:10px 0 8px;
    font-family:Georgia,'Times New Roman',serif;
    font-size:32px;
    line-height:40px;
    font-weight:600;
    color:#49371d;
  "
>
  Happy Birthday, ${name}! 💛
</h1>

<p
  style="
    margin:0 auto;
    max-width:470px;
    font-size:14px;
    line-height:24px;
    color:#6e6a63;
  "
>
  Your birthday deserves a little extra sparkle.
  We've unlocked a special birthday reward just for you. ✨
</p>
</td>
</tr>

<tr>
<td style="padding:10px 24px 0;">

<table
  role="presentation"
  width="100%"
  cellspacing="0"
  cellpadding="0"
  border="0"
  style="
    background:#fffaf0;
    border:1px solid #e7d49a;
  "
>
<tr>
<td align="center" style="padding:28px 20px;">

<div
  style="
    font-size:10px;
    line-height:16px;
    font-weight:700;
    letter-spacing:2px;
    color:#a58a50;
    text-transform:uppercase;
  "
>
  ${title}
</div>

<div
  style="
    margin-top:7px;
    font-family:Georgia,'Times New Roman',serif;
    font-size:38px;
    line-height:46px;
    font-weight:700;
    color:#49371d;
  "
>
  ${discountText}
</div>

<div
  style="
    margin-top:5px;
    font-size:13px;
    line-height:21px;
    color:#77736c;
  "
>
  on orders above
  <strong style="color:#49371d;">
    ${minimumText}
  </strong>
</div>

<div
  style="
    margin-top:16px;
    font-size:12px;
    line-height:20px;
    color:#8a806d;
  "
>
  ${description}
</div>

</td>
</tr>
</table>

</td>
</tr>

<tr>
<td style="padding:18px 24px 0;">

<table
  role="presentation"
  width="100%"
  cellspacing="0"
  cellpadding="0"
  border="0"
  style="
    background:#fffcf2;
    border:1px dashed #d8b96c;
  "
>
<tr>
<td align="center" style="padding:22px 16px;">

<div
  style="
    font-size:10px;
    line-height:16px;
    font-weight:700;
    letter-spacing:2px;
    color:#999287;
    text-transform:uppercase;
  "
>
  Your Birthday Code
</div>

<div
  style="
    margin-top:10px;
    display:inline-block;
    padding:11px 18px;
    background:#fff;
    border:1px solid #eadfca;
    font-size:18px;
    line-height:24px;
    font-weight:700;
    letter-spacing:2px;
    color:#9a7420;
  "
>
  ${escapeHtml(coupon.code)}
</div>

<div
  style="
    margin-top:10px;
    font-size:11px;
    line-height:18px;
    color:#999287;
  "
>
  Copy this code at checkout to enjoy your birthday reward.
</div>

</td>
</tr>
</table>

</td>
</tr>

<tr>
<td style="padding:18px 24px 0;">

<table
  role="presentation"
  width="100%"
  cellspacing="0"
  cellpadding="0"
  border="0"
  style="
    background:#faf8f3;
    border:1px solid #e8dfd0;
  "
>
<tr>
<td style="padding:16px;">

<div
  style="
    font-family:Georgia,'Times New Roman',serif;
    font-size:19px;
    line-height:25px;
    font-weight:600;
    color:#49371d;
  "
>
  Your Birthday Reward Details
</div>

<table
  role="presentation"
  width="100%"
  cellspacing="0"
  cellpadding="0"
  border="0"
  style="margin-top:10px;"
>

<tr>
<td
  style="
    padding:6px 0;
    font-size:13px;
    color:#77736c;
  "
>
  Reward
</td>

<td
  align="right"
  style="
    padding:6px 0;
    font-size:13px;
    font-weight:600;
    color:#333;
  "
>
  ${discountText}
</td>
</tr>

<tr>
<td
  style="
    padding:6px 0;
    font-size:13px;
    color:#77736c;
  "
>
  Minimum Order
</td>

<td
  align="right"
  style="
    padding:6px 0;
    font-size:13px;
    font-weight:600;
    color:#333;
  "
>
  ${minimumText}
</td>
</tr>

${maxDiscountText}

<tr>
<td
  style="
    padding:6px 0;
    font-size:13px;
    color:#77736c;
  "
>
  Validity
</td>

<td
  align="right"
  style="
    padding:6px 0;
    font-size:13px;
    font-weight:600;
    color:#333;
  "
>
  ${escapeHtml(validityText)}
</td>
</tr>

<tr>
<td
  style="
    padding:8px 0 2px;
    border-top:1px solid #eeeae2;
    font-size:13px;
    font-weight:600;
    color:#55514b;
  "
>
  Usage
</td>

<td
  align="right"
  style="
    padding:8px 0 2px;
    border-top:1px solid #eeeae2;
    font-size:13px;
    font-weight:600;
    color:#8b6424;
  "
>
  ${oneUseText}
</td>
</tr>

</table>

</td>
</tr>
</table>

</td>
</tr>

<tr>
<td align="center" style="padding:26px 24px 0;">

<a
  href="https://www.tnmonline.in/shop"
  target="_blank"
  style="
    display:inline-block;
    padding:14px 30px;
    background:#181818;
    color:#fff;
    text-decoration:none;
    font-size:12px;
    font-weight:700;
    letter-spacing:1px;
  "
>
  SHOP YOUR BIRTHDAY EDIT ✨
</a>

<div
  style="
    margin-top:12px;
    font-size:11px;
    line-height:18px;
    color:#aaa49a;
  "
>
  Your birthday reward is ready whenever you are. 💛
</div>

</td>
</tr>

<tr>
<td align="center" style="padding:32px 24px;">

<div
  style="
    height:1px;
    background:#eeeae2;
    margin-bottom:22px;
  "
></div>

<img
  src="https://wzphyyoftwxvpqxtfgtb.supabase.co/storage/v1/object/public/Logo/MainLogo.png"
  alt="T&M Jewels"
  width="125"
  style="
    display:block;
    width:125px;
    height:auto;
    margin:0 auto;
  "
>

<div
  style="
    margin-top:12px;
    font-size:12px;
    line-height:20px;
    color:#999287;
  "
>
  Need help?<br>
  Contact us at
  <strong>shop.tnm.official@gmail.com</strong>
</div>

<div
  style="
    margin-top:14px;
    font-size:11px;
    line-height:18px;
    color:#aaa49a;
  "
>
  © T&amp;M Jewels. All rights reserved.
</div>

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

async function sendThroughExistingEmailFunction(
  to: string,
  html: string,
) {
  const response = await fetch(
    `${supabaseUrl}/functions/v1/send-email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        to,
        subject:
          "🎂 Happy Birthday from T&M Jewels — Your Gift Awaits!",
        html,
      }),
    },
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `send-email failed (${response.status}): ${text}`,
    );
  }

  return text;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed",
      }),
      {
        status: 405,
        headers: corsHeaders(),
      },
    );
  }

  const startedAt = Date.now();

  try {
    /*
     * Only the scheduler/service-to-service caller should reach
     * this function. The cron job will use the Supabase secret key.
     */
    const providedSecret =
      req.headers.get("x-birthday-cron-secret");

    if (
      !cronSecret ||
      !providedSecret ||
      providedSecret !== cronSecret
    ) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: corsHeaders(),
        },
      );
    }

    const today = new Date();
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth() + 1;

    const {
      data: customers,
      error: customerError,
    } = await supabase
      .from("customers")
      .select(
        "id,email,date_of_birth,first_name,last_name",
      )
      .is("deleted_at", null)
      .not("email", "is", null)
      .not("date_of_birth", "is", null);

    if (customerError) {
      throw customerError;
    }

    const results = {
      checked: 0,
      eligible: 0,
      sent: 0,
      skippedAlreadySent: 0,
      skippedUsed: 0,
      failed: 0,
    };

    for (const customer of (customers ?? []) as Customer[]) {
      results.checked += 1;

      if (
        !customer.email?.trim() ||
        !customer.date_of_birth
      ) {
        continue;
      }

      const birthdayMonth = Number(
        customer.date_of_birth.slice(5, 7),
      );

      if (birthdayMonth !== month) {
        continue;
      }

      results.eligible += 1;

      /*
       * Use the existing secure generation RPC through the database.
       *
       * If this RPC still requires auth.uid(), it cannot be called
       * by cron/service-role. In that case, we will add a dedicated
       * service-role birthday generation RPC in the next step.
       */
      const {
        data: coupon,
        error: couponError,
      } = await supabase.rpc(
        "get_or_create_birthday_coupon_admin",
        {
          p_customer_id: customer.id,
        },
      );

      if (couponError) {
        console.error(
          "Birthday coupon generation failed:",
          customer.id,
          couponError,
        );

        results.failed += 1;
        continue;
      }

      if (!coupon) {
        continue;
      }

      const birthdayCoupon =
        coupon as BirthdayCoupon;

      /*
       * Do not keep sending after the one-use birthday coupon
       * has already been consumed.
       */
      if (
        birthdayCoupon.one_use_per_customer &&
        Number(
          (
            birthdayCoupon as BirthdayCoupon & {
              used_count?: number;
            }
          ).used_count ?? 0,
        ) > 0
      ) {
        results.skippedUsed += 1;
        continue;
      }

      /*
       * Atomic daily claim. Only the first cron invocation for
       * this customer/coupon/date receives TRUE.
       */
      const {
        data: claimed,
        error: claimError,
      } = await supabase.rpc(
        "claim_birthday_coupon_email_admin",
        {
          p_customer_id: customer.id,
          p_coupon_id: birthdayCoupon.id,
        },
      );

      if (claimError) {
        console.error(
          "Birthday email claim failed:",
          customer.id,
          claimError,
        );

        results.failed += 1;
        continue;
      }

      if (!claimed) {
        results.skippedAlreadySent += 1;
        continue;
      }

      try {
        const html = buildBirthdayEmail(
          customer,
          birthdayCoupon,
        );

        await sendThroughExistingEmailFunction(
          customer.email.trim(),
          html,
        );

        const {
          error: completeError,
        } = await supabase.rpc(
          "complete_birthday_coupon_email_admin",
          {
            p_customer_id: customer.id,
            p_coupon_id: birthdayCoupon.id,
            p_success: true,
            p_error_message: null,
          },
        );

        if (completeError) {
          console.error(
            "Birthday email completion logging failed:",
            customer.id,
            completeError,
          );
        }

        results.sent += 1;
      } catch (emailError) {
        const message =
          emailError instanceof Error
            ? emailError.message
            : String(emailError);

        console.error(
          "Birthday email failed:",
          customer.id,
          message,
        );

        await supabase.rpc(
          "complete_birthday_coupon_email_admin",
          {
            p_customer_id: customer.id,
            p_coupon_id: birthdayCoupon.id,
            p_success: false,
            p_error_message: message,
          },
        );

        results.failed += 1;
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        durationMs: Date.now() - startedAt,
        results,
      }),
      {
        status: 200,
        headers: corsHeaders(),
      },
    );
  } catch (error) {
    console.error(
      "Birthday email job failed:",
      error,
    );

    return new Response(
      JSON.stringify({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      }),
      {
        status: 500,
        headers: corsHeaders(),
      },
    );
  }
});