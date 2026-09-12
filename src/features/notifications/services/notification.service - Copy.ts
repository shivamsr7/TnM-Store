import {
  supabase
} from "@/shared/lib/supabase";





export type NotificationType =
  | "order"
  | "payment"
  | "reward"
  | "shipping"
  | "system";





export interface CreateNotificationPayload {

  customerId: string;

  title: string;

  message: string;

  type: NotificationType;

  referenceId?: string | null;

}





export interface SendEmailPayload {

  to: string;

  subject: string;

  html: string;

}





export type OrderStatusEmailStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered";

export interface ReviewEmailLink {
  productId: string;
  productName: string;
  productImage: string | null;
  reviewUrl: string;
}

export interface OrderStatusEmailPayload {

  to: string;

  customerName: string;

  orderNumber: string;

  orderDate: string;

  status: OrderStatusEmailStatus;

  items: {

    productName: string;

    productImage?: string | null;

    price: number;

    quantity: number;

    total: number;

  }[];

  subtotal: number;

  discount: number;

  shippingCharge: number;

  giftWrapAmount: number;

  giftMessage?: string | null;

  tax: number;

  totalAmount: number;

  paymentMethod:
    | "partial_cod"
    | "prepaid";

  advanceAmount: number;

  remainingAmount: number;

  walletAmount?: number;

  walletBalanceRemaining?: number | null;

  courierName?: string | null;

  trackingNumber?: string | null;

  reviewLinks?: ReviewEmailLink[];

  paymentTransactionId?: string | null;

  couponCode?: string | null;

  shipping: {

    fullName: string;

    phone: string;

    address: string;

    city: string;

    state: string;

    pincode: string;

    landmark?: string | null;

  };

}







export interface BirthdayCouponEmailPayload {
  to: string;
  customerName?: string | null;
  couponCode: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscount?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  oneUsePerCustomer?: boolean;
  title?: string | null;
  description?: string | null;
}


class NotificationService {





  async createNotification({

    customerId,

    title,

    message,

    type,

    referenceId = null,

  }: CreateNotificationPayload) {





    const {

      error

    } = await supabase

      .from("notifications")

      .insert({

        customer_id:
          customerId,

        title,

        message,

        type,

        reference_id:
          referenceId,

      });





    if (error)

      throw error;

  }







  async sendEmail({

    to,

    subject,

    html,

  }: SendEmailPayload) {





    if (!to)

      return;





    const {

      data,

      error

    } = await supabase.functions.invoke(

      "send-email",

      {

        body: {

          to,

          subject,

          html,

        },

      }

    );





    if (error) {

      console.error(

        "Email notification failed:",

        error

      );





      return {

        success: false,

        error,

      };

    }





    return {

      success: true,

      data,

    };

  }







  async sendOrderStatusEmail({

    to,

    customerName,

    orderNumber,

    orderDate,

    status,

    items,

    subtotal,

    discount,

    shippingCharge,

    giftWrapAmount,

    giftMessage,

    tax,

    totalAmount,

    paymentMethod,

    advanceAmount,

    remainingAmount,

    paymentTransactionId,

    couponCode,

    shipping,

    walletAmount = 0,
    walletBalanceRemaining = null,
    courierName = null,
    trackingNumber = null,
    reviewLinks = [],

  }: OrderStatusEmailPayload) {





    const isPrepaid =
      paymentMethod === "prepaid";

    const formattedDate =
      new Date(orderDate).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      );





    const formatMoney = (
      amount: number
    ) =>

      `₹${amount.toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`;





    const escapeHtml = (
      value: string
    ) =>

      value

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");





    const statusLabels: Record<OrderStatusEmailStatus, string> = {
      placed: "Order Placed",
      confirmed: "Order Confirmed",
      packed: "Order Packed",
      shipped: "Order Shipped",
      delivered: "Order Delivered",
    };

    const statusLabel = statusLabels[status];

    const statusMessage: Record<OrderStatusEmailStatus, string> = {
      placed: "We’ve received your order and our team is now getting everything ready for you.",
      confirmed: "Your order has been confirmed and is now moving forward for processing.",
      packed: "Your jewellery has been carefully packed and is ready for dispatch.",
      shipped: "Your order is on its way. You can track its latest status anytime.",
      delivered: "Your order has been delivered. We hope you love your jewellery!",
    };

    const totalPaid =
      paymentMethod === "prepaid"
        ? Math.max(0, totalAmount - Math.max(0, walletAmount))
        : Math.max(0, advanceAmount);

    const walletUsed =
      Math.max(0, walletAmount);

    const walletBalanceAfter =
      walletBalanceRemaining !== null &&
      walletBalanceRemaining !== undefined
        ? Math.max(0, walletBalanceRemaining)
        : null;

    const walletBalanceBefore =
      walletBalanceAfter !== null
        ? Math.max(
            0,
            walletBalanceAfter + walletUsed
          )
        : null;

    const walletActivitySection =
      (status === "placed" || walletUsed > 0) &&
      walletBalanceAfter !== null
        ? `
          <tr>
            <td style="padding:24px 24px 0;">
              <div style="padding:16px;background:#faf8f3;border:1px solid #e8dfd0;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:24px;font-weight:600;color:#49371d;">
                  T&amp;M Wallet Activity
                </div>
                <div style="margin-top:6px;font-size:12px;line-height:19px;color:#77736c;">
                  Your wallet activity for this order
                </div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:12px;">
                  ${
                    walletBalanceBefore !== null
                      ? `
                        <tr>
                          <td style="padding:6px 0;font-size:13px;color:#77736c;">Wallet Balance Before Order</td>
                          <td align="right" style="padding:6px 0;font-size:13px;font-weight:600;color:#333333;">${formatMoney(walletBalanceBefore)}</td>
                        </tr>
                      `
                      : ""
                  }
                  ${
                    walletUsed > 0
                      ? `
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#77736c;">Wallet Used</td>
                    <td align="right" style="padding:6px 0;font-size:13px;font-weight:700;color:#9a5a3a;">−${formatMoney(walletUsed)}</td>
                  </tr>
                      `
                      : ""
                  }
                  ${
                    walletBalanceAfter !== null
                      ? `
                        <tr>
                          <td style="padding:8px 0 2px;font-size:13px;font-weight:600;color:#55514b;border-top:1px solid #eeeae2;">Wallet Balance After Order</td>
                          <td align="right" style="padding:8px 0 2px;font-size:14px;font-weight:700;color:#4d8a4b;border-top:1px solid #eeeae2;">${formatMoney(walletBalanceAfter)}</td>
                        </tr>
                      `
                      : ""
                  }
                </table>
              </div>
            </td>
          </tr>
        `
        : "";




    const trackingSection =
      status === "shipped" || status === "delivered"
        ? `
          <tr><td style="padding:24px 24px 0;">
            <div style="padding:16px;background:#faf8f3;border:1px solid #e8dfd0;">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:600;color:#49371d;">Shipping &amp; Tracking</div>
              <div style="margin-top:10px;font-size:13px;line-height:22px;color:#55514b;">
                ${courierName ? `<strong>Courier:</strong> ${escapeHtml(courierName)}<br>` : ""}
                ${trackingNumber ? `<strong>Tracking Number:</strong> ${escapeHtml(trackingNumber)}` : "Your tracking details will appear here once available."}
              </div>
              <div style="margin-top:14px;text-align:center;">
                <a href="https://www.tnmonline.in/track-order" target="_blank" style="display:inline-block;padding:11px 20px;background:#8b6424;color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:.7px;">TRACK YOUR ORDER →</a>
              </div>
            </div>
          </td></tr>
        `
        : `
          <tr><td style="padding:24px 24px 0;text-align:center;">
            <a href="https://www.tnmonline.in/track-order" target="_blank" style="display:inline-block;padding:11px 20px;background:#8b6424;color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:.7px;">TRACK YOUR ORDER →</a>
          </td></tr>
        `;

    const reviewSection =
      status === "delivered" && reviewLinks.length > 0
        ? `
          <tr><td style="padding:24px 24px 0;">
            <div style="padding:16px;background:#faf8f3;border:1px solid #e8dfd0;">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:600;color:#49371d;">How did you like your jewellery?</div>
              <div style="margin-top:6px;font-size:13px;line-height:21px;color:#77736c;">Your review helps other customers shop with confidence.</div>
              ${reviewLinks.map(link => `<div style="margin-top:14px;padding-top:12px;border-top:1px solid #eeeae2;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td style="font-size:13px;font-weight:600;color:#333;">${escapeHtml(link.productName)}</td><td align="right"><a href="${escapeHtml(link.reviewUrl)}" target="_blank" style="display:inline-block;padding:9px 12px;background:#8b6424;color:#fff;text-decoration:none;font-size:10px;font-weight:700;letter-spacing:.5px;">REVIEW PRODUCT</a></td></tr></table></div>`).join("")}
            </div>
          </td></tr>
        `
        : "";





    const paymentLabel =
      isPrepaid
        ? "Prepaid"
        : "Partial COD";





    const paymentStatus =
      status === "placed"
        ? "Payment Received"
        : isPrepaid
          ? "Payment Received"
          : "Advance Payment Received";





    const productRows = items

      .map(

        (item) => {

          const imageHtml =

            item.productImage

              ? `

                <img

                  src="${item.productImage}"

                  alt="${escapeHtml(
                    item.productName
                  )}"

                  width="70"

                  height="70"

                  style="

                    display:block;

                    width:70px;

                    height:70px;

                    object-fit:cover;

                    border-radius:10px;

                    border:1px solid #eee7da;

                  "

                />

              `

              : `

                <div

                  style="

                    width:70px;

                    height:70px;

                    border-radius:10px;

                    background:#f7f3eb;

                    border:1px solid #eee7da;

                  "

                ></div>

              `;





          return `

            <tr>

              <td

                style="

                  padding:16px 8px 16px 0;

                  vertical-align:middle;

                  border-bottom:1px solid #eeeae2;

                "

              >

                <table

                  role="presentation"

                  cellspacing="0"

                  cellpadding="0"

                  border="0"

                >

                  <tr>

                    <td

                      style="

                        width:70px;

                        vertical-align:middle;

                      "

                    >

                      ${imageHtml}

                    </td>





                    <td

                      style="

                        padding-left:12px;

                        vertical-align:middle;

                      "

                    >

                      <div

                        style="

                          font-size:14px;

                          line-height:20px;

                          font-weight:600;

                          color:#222222;

                        "

                      >

                        ${escapeHtml(
                          item.productName
                        )}

                      </div>





                      <div

                        style="

                          margin-top:4px;

                          font-size:12px;

                          line-height:18px;

                          color:#8c877e;

                        "

                      >

                        Qty: ${item.quantity}

                      </div>

                    </td>

                  </tr>

                </table>

              </td>





              <td

                align="right"

                style="

                  padding:16px 0;

                  vertical-align:middle;

                  border-bottom:1px solid #eeeae2;

                  white-space:nowrap;

                "

              >

                <div

                  style="

                    font-size:13px;

                    color:#77736c;

                  "

                >

                  ${formatMoney(
                    item.price
                  )}

                </div>





                <div

                  style="

                    margin-top:4px;

                    font-size:14px;

                    font-weight:600;

                    color:#222222;

                  "

                >

                  ${formatMoney(
                    item.total
                  )}

                </div>

              </td>

            </tr>

          `;

        }

      )

      .join("");





    const couponRow = couponCode

      ? `

        <tr>

          <td

            style="

              padding:7px 0;

              font-size:13px;

              color:#77736c;

            "

          >

            Coupon

          </td>





          <td

            align="right"

            style="

              padding:7px 0;

              font-size:13px;

              font-weight:600;

              color:#5d754f;

            "

          >

            ${escapeHtml(
              couponCode
            )}

          </td>

        </tr>

      `

      : "";





    const discountRow =

      discount > 0

        ? `

          <tr>

            <td

              style="

                padding:7px 0;

                font-size:13px;

                color:#77736c;

              "

            >

              Discount

            </td>





            <td

              align="right"

              style="

                padding:7px 0;

                font-size:13px;

                color:#4f7b45;

              "

            >

              -${formatMoney(
                discount
              )}

            </td>

          </tr>

        `

        : "";





    const taxRow =

      tax > 0

        ? `

          <tr>

            <td

              style="

                padding:7px 0;

                font-size:13px;

                color:#77736c;

              "

            >

              Tax

            </td>





            <td

              align="right"

              style="

                padding:7px 0;

                font-size:13px;

                color:#333333;

              "

            >

              ${formatMoney(
                tax
              )}

            </td>

          </tr>

        `

        : "";





    const remainingRow =

      paymentMethod === "partial_cod"

        ? `

          <tr>

            <td

              style="

                padding:7px 0;

                font-size:13px;

                color:#77736c;

              "

            >

              Remaining on Delivery

            </td>





            <td

              align="right"

              style="

                padding:7px 0;

                font-size:13px;

                font-weight:600;

                color:#222222;

              "

            >

              ${formatMoney(
                remainingAmount
              )}

            </td>

          </tr>

        `

        : "";





    const transactionRow =

      paymentTransactionId

        ? `

          <tr>

            <td

              style="

                padding:7px 0;

                font-size:13px;

                color:#77736c;

              "

            >

              Payment Reference

            </td>





            <td

              align="right"

              style="

                padding:7px 0;

                font-size:12px;

                color:#333333;

                word-break:break-all;

              "

            >

              ${escapeHtml(
                paymentTransactionId
              )}

            </td>

          </tr>

        `

        : "";





    return this.sendEmail({

      to,





      subject:

        `T&M Jewels — ${statusLabel} #${orderNumber}`,





      html: `

<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta

    name="viewport"

    content="width=device-width, initial-scale=1.0"

  >

  <meta

    name="color-scheme"

    content="light"

  >

  <meta

    name="supported-color-schemes"

    content="light"

  >

  <title>

    T&amp;M Jewels — Order Update

  </title>

</head>





<body

  style="

    margin:0;

    padding:0;

    background:#f5f3ef;

    color:#222222;

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

    <td

      align="center"

      style="padding:28px 12px;"

    >





      <table

        role="presentation"

        width="100%"

        cellspacing="0"

        cellpadding="0"

        border="0"

        style="

          width:100%;

          max-width:640px;

          background:#ffffff;

          border:1px solid #e9e3d8;

        "

      >





        <!-- LOGO -->

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

            />





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





        <!-- CONFIRMATION -->

        <tr>

          <td

            align="center"

            style="

              padding:34px 24px 24px;

            "

          >

            <div

              style="

                display:inline-block;

                width:54px;

                height:54px;

                line-height:54px;

                border-radius:50%;

                background:#f3f7ef;

                color:#4d8a4b;

                font-size:28px;

                font-weight:bold;

              "

            >

              ✓

            </div>





            <h1

              style="

                margin:18px 0 8px;

                font-family:Georgia,'Times New Roman',serif;

                font-size:30px;

                line-height:38px;

                font-weight:600;

                color:#8b6424;

              "

            >

              ${statusLabel}! 🎉

            </h1>





            <p

              style="

                margin:0;

                font-size:14px;

                line-height:23px;

                color:#6e6a63;

              "

            >

              Thank you for choosing T&amp;M Jewels,

              ${escapeHtml(customerName)}.

              <br>

              ${statusMessage[status]}

            </p>

          </td>

        </tr>





        <!-- ORDER META -->

        <tr>

          <td

            style="

              padding:4px 24px 20px;

            "

          >

            <table

              role="presentation"

              width="100%"

              cellspacing="0"

              cellpadding="0"

              border="0"

              style="

                width:100%;

                background:#faf8f3;

                border:1px solid #e8dfd0;

              "

            >

              <tr>

                <td

                  width="50%"

                  style="

                    padding:17px;

                    border-right:1px solid #e5ddcf;

                  "

                >

                  <div

                    style="

                      font-size:10px;

                      line-height:16px;

                      color:#9c968c;

                      text-transform:uppercase;

                      letter-spacing:1.2px;

                    "

                  >

                    Order Number

                  </div>





                  <div

                    style="

                      margin-top:5px;

                      font-size:16px;

                      line-height:22px;

                      font-weight:600;

                      color:#222222;

                      word-break:break-word;

                    "

                  >

                    #${orderNumber}

                  </div>

                </td>





                <td

                  width="50%"

                  style="

                    padding:17px;

                  "

                >

                  <div

                    style="

                      font-size:10px;

                      line-height:16px;

                      color:#9c968c;

                      text-transform:uppercase;

                      letter-spacing:1.2px;

                    "

                  >

                    Order Date

                  </div>





                  <div

                    style="

                      margin-top:5px;

                      font-size:14px;

                      line-height:22px;

                      font-weight:600;

                      color:#222222;

                    "

                  >

                    ${formattedDate}

                  </div>

                </td>

              </tr>

            </table>

          </td>

        </tr>





        <!-- STATUS / PAYMENT -->

        <tr>

          <td

            style="

              padding:0 24px 24px;

            "

          >

            <table

              role="presentation"

              width="100%"

              cellspacing="0"

              cellpadding="0"

              border="0"

            >

              <tr>

                <td

                  width="50%"

                  style="

                    padding:15px;

                    background:#fbfaf7;

                    border:1px solid #eee8dc;

                  "

                >

                  <div

                    style="

                      font-size:11px;

                      color:#999287;

                      text-transform:uppercase;

                      letter-spacing:1px;

                    "

                  >

                    Order Status

                  </div>





                  <div

                    style="

                      margin-top:6px;

                      font-size:14px;

                      font-weight:600;

                      color:#4d8a4b;

                    "

                  >

                    ${escapeHtml(statusLabel)}

                  </div>

                </td>





                <td

                  width="12"

                  style="font-size:0;"

                >

                  &nbsp;

                </td>





                <td

                  width="50%"

                  style="

                    padding:15px;

                    background:#fbfaf7;

                    border:1px solid #eee8dc;

                  "

                >

                  <div

                    style="

                      font-size:11px;

                      color:#999287;

                      text-transform:uppercase;

                      letter-spacing:1px;

                    "

                  >

                    Payment Status

                  </div>





                  <div

                    style="

                      margin-top:6px;

                      font-size:14px;

                      font-weight:600;

                      color:#4d8a4b;

                    "

                  >

                    ${paymentStatus}

                  </div>

                </td>

              </tr>

            </table>

          </td>

        </tr>





        <!-- ORDER DETAILS -->

        <tr>

          <td

            style="

              padding:0 24px;

            "

          >

            <div

              style="

                padding:13px 16px;

                background:#f7f1e5;

                color:#59431f;

                font-family:Georgia,'Times New Roman',serif;

                font-size:20px;

                line-height:28px;

                font-weight:600;

              "

            >

              Order Details

            </div>





            <table

              role="presentation"

              width="100%"

              cellspacing="0"

              cellpadding="0"

              border="0"

            >

              <tr>

                <td

                  style="

                    padding:12px 0;

                    font-size:11px;

                    font-weight:600;

                    color:#999287;

                    text-transform:uppercase;

                    letter-spacing:.7px;

                    border-bottom:1px solid #eeeae2;

                  "

                >

                  Product

                </td>





                <td

                  align="right"

                  style="

                    padding:12px 0;

                    font-size:11px;

                    font-weight:600;

                    color:#999287;

                    text-transform:uppercase;

                    letter-spacing:.7px;

                    border-bottom:1px solid #eeeae2;

                  "

                >

                  Amount

                </td>

              </tr>





              ${productRows}

            </table>

          </td>

        </tr>





        <!-- PRICE SUMMARY -->

        <tr>

          <td

            style="

              padding:22px 24px 0;

            "

          >

            <table

              role="presentation"

              width="100%"

              cellspacing="0"

              cellpadding="0"

              border="0"

              style="

                border-top:1px solid #eeeae2;

                border-bottom:1px solid #eeeae2;

              "

            >

              <tr>

                <td

                  style="

                    padding:7px 0;

                    font-size:13px;

                    color:#77736c;

                  "

                >

                  Subtotal

                </td>





                <td

                  align="right"

                  style="

                    padding:7px 0;

                    font-size:13px;

                    color:#333333;

                  "

                >

                  ${formatMoney(
                    subtotal
                  )}

                </td>

              </tr>





              ${discountRow}

              ${couponRow}





              <tr>

                <td

                  style="

                    padding:7px 0;

                    font-size:13px;

                    color:#77736c;

                  "

                >

                  Shipping

                </td>





                <td

                  align="right"

                  style="

                    padding:7px 0;

                    font-size:13px;

                    color:#333333;

                  "

                >

                  ${

                    shippingCharge === 0

                      ? "FREE"

                      : formatMoney(
                          shippingCharge
                        )

                  }

                </td>

              </tr>





              ${
                giftWrapAmount > 0
                  ? `

                    <tr>

                      <td
                        style="
                          padding:7px 0;
                          font-size:13px;
                          color:#77736c;
                        "
                      >

                        🎁 Gift Wrap

                      </td>

                      <td
                        align="right"
                        style="
                          padding:7px 0;
                          font-size:13px;
                          font-weight:600;
                          color:#8b6424;
                        "
                      >

                        ${formatMoney(
                          giftWrapAmount
                        )}

                      </td>

                    </tr>

                  `
                  : ""
              }





              ${taxRow}





              <tr>

                <td

                  style="

                    padding:16px 0;

                    font-size:16px;

                    font-weight:700;

                    color:#222222;

                    border-top:1px solid #eeeae2;

                  "

                >

                  Total Amount

                </td>





                <td

                  align="right"

                  style="

                    padding:16px 0;

                    font-size:18px;

                    font-weight:700;

                    color:#8b6424;

                    border-top:1px solid #eeeae2;

                  "

                >

                  ${formatMoney(
                    totalAmount
                  )}

                </td>

              </tr>





            </table>

          </td>

        </tr>





        <!-- GIFT MESSAGE -->

        ${
          giftWrapAmount > 0 &&
          giftMessage?.trim()
            ? `

              <tr>

                <td
                  style="
                    padding:24px 24px 0;
                  "
                >

                  <div
                    style="
                      padding:16px;
                      background:#faf8f3;
                      border:1px solid #e8dfd0;
                    "
                  >

                    <div
                      style="
                        font-family:Georgia,'Times New Roman',serif;
                        font-size:18px;
                        line-height:24px;
                        font-weight:600;
                        color:#49371d;
                      "
                    >

                      🎁 Gift Message

                    </div>

                    <div
                      style="
                        margin-top:9px;
                        font-size:13px;
                        line-height:22px;
                        color:#55514b;
                      "
                    >

                      ${escapeHtml(
                        giftMessage.trim()
                      )}

                    </div>

                  </div>

                </td>

              </tr>

            `
            : ""
        }





        <!-- PAYMENT INFORMATION -->

        <tr>

          <td

            style="

              padding:24px 24px 0;

            "

          >

            <div

              style="

                padding:16px;

                background:#faf8f3;

                border:1px solid #e8dfd0;

              "

            >

              <div

                style="

                  font-family:Georgia,'Times New Roman',serif;

                  font-size:18px;

                  font-weight:600;

                  color:#49371d;

                "

              >

                Payment Information

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

                    Payment Method

                  </td>





                  <td

                    align="right"

                    style="

                      padding:6px 0;

                      font-size:13px;

                      font-weight:600;

                    "

                  >

                    ${paymentLabel}

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

                    Total Paid

                  </td>

                  <td

                    align="right"

                    style="

                      padding:6px 0;

                      font-size:13px;

                      font-weight:700;

                    "

                  >

                    ${formatMoney(
                      totalPaid
                    )}

                  </td>

                </tr>





                ${remainingRow}

                ${transactionRow}

              </table>

            </div>

          </td>

        </tr>





        ${walletActivitySection}

        <!-- SHIPPING ADDRESS -->

        <tr>

          <td

            style="

              padding:24px 24px 0;

            "

          >

            <div

              style="

                padding:16px;

                background:#faf8f3;

                border:1px solid #e8dfd0;

              "

            >

              <div

                style="

                  font-family:Georgia,'Times New Roman',serif;

                  font-size:18px;

                  font-weight:600;

                  color:#49371d;

                "

              >

                Shipping Address

              </div>





              <div

                style="

                  margin-top:12px;

                  font-size:14px;

                  line-height:23px;

                  color:#55514b;

                "

              >

                <strong>

                  ${escapeHtml(
                    shipping.fullName
                  )}

                </strong>

                <br>

                ${escapeHtml(
                  shipping.address
                )}

                ${

                  shipping.landmark

                    ? `<br>${escapeHtml(
                        shipping.landmark
                      )}`

                    : ""

                }

                <br>

                ${escapeHtml(
                  shipping.city
                )},

                ${escapeHtml(
                  shipping.state
                )}

                — ${escapeHtml(
                  shipping.pincode
                )}

                <br>

                Phone:

                ${escapeHtml(
                  shipping.phone
                )}

              </div>

            </div>

          </td>

        </tr>





        <!-- ORDER JOURNEY -->

        <tr>

          <td

            style="

              padding:28px 24px 0;

            "

          >

            <div

              style="

                text-align:center;

                font-family:Georgia,'Times New Roman',serif;

                font-size:20px;

                font-weight:600;

                color:#49371d;

              "

            >

              Your Order Journey

            </div>





            <table

              role="presentation"

              width="100%"

              cellspacing="0"

              cellpadding="0"

              border="0"

              style="margin-top:18px;"

            >

              <tr>

                ${
                  [
                    ["placed", "Placed", "1"],
                    ["confirmed", "Confirmed", "2"],
                    ["packed", "Packed", "3"],
                    ["shipped", "Shipped", "4"],
                    ["delivered", "Delivered", "5"],
                  ]
                    .map(
                      ([stepStatus, stepLabel, stepNumber]) => `
                <td
                  align="center"
                  width="20%"
                >

                  <div
                    style="
                      margin:auto;
                      width:34px;
                      height:34px;
                      line-height:34px;
                      border-radius:50%;
                      background:${status === stepStatus ? "#8b6424" : "#f4f0e8"};
                      color:${status === stepStatus ? "#ffffff" : "#aaa297"};
                      font-size:15px;
                    "
                  >
                    ${status === stepStatus ? "✓" : stepNumber}
                  </div>

                  <div
                    style="
                      margin-top:7px;
                      font-size:10px;
                      line-height:15px;
                      font-weight:${status === stepStatus ? "600" : "400"};
                      color:${status === stepStatus ? "#8b6424" : "#8f8a82"};
                    "
                  >
                    ${stepLabel}
                  </div>

                </td>
                      `
                    )
                    .join("")
                }
              </tr>

            </table>

          </td>

        </tr>





        <!-- MESSAGE -->

        <tr>

          <td

            style="

              padding:26px 24px 0;

            "

          >

            <div

              style="

                padding:16px;

                background:#fbfaf7;

                border-left:3px solid #c8a44d;

                font-size:13px;

                line-height:22px;

                color:#68635c;

              "

            >

              Your jewellery is now being prepared with

              care. We will keep you updated as your

              order moves through each stage.

            </div>

          </td>

        </tr>





        ${trackingSection}

        ${reviewSection}

        <!-- FOOTER -->

        <tr>

          <td

            align="center"

            style="

              padding:32px 24px;

            "

          >

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

            />





            <div

              style="

                margin-top:12px;

                font-size:12px;

                line-height:20px;

                color:#999287;

              "

            >

              Need help with your order?

              <br>

              Contact us at

              <strong>

                shop.tnm.official@gmail.com

              </strong>

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

      `,

    });

  }








  async sendBirthdayCouponEmail({
    to,
    customerName,
    couponCode,
    discountType,
    discountValue,
    minimumOrderAmount,
    maximumDiscount = null,
    startsAt = null,
    expiresAt = null,
    oneUsePerCustomer = true,
    title = null,
    description = null,
  }: BirthdayCouponEmailPayload) {

    if (!to || !couponCode) {
      return {
        success: false,
        skipped: true,
      };
    }

    const formatMoney = (amount: number) =>
      `₹${Number(amount || 0).toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }
      )}`;

    const formatDate = (
      value: string | null | undefined
    ) => {
      if (!value) {
        return "";
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "";
      }

      return date.toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      );
    };

    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const safeName =
      customerName?.trim()
        ? escapeHtml(customerName.trim())
        : "Beautiful";

    const discountText =
      discountType === "percentage"
        ? `${discountValue}% OFF`
        : `${formatMoney(discountValue)} OFF`;

    const minimumText =
      formatMoney(minimumOrderAmount);

    const startText = formatDate(startsAt);
    const expiryText = formatDate(expiresAt);

    const validityText =
      startText && expiryText
        ? `${startText} – ${expiryText}`
        : expiryText
          ? `Valid until ${expiryText}`
          : "Valid throughout your birthday month";

    const maxDiscountText =
      discountType === "percentage" &&
      maximumDiscount !== null &&
      maximumDiscount !== undefined
        ? `
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#77736c;">
              Maximum Discount
            </td>
            <td align="right" style="padding:6px 0;font-size:13px;font-weight:600;color:#333333;">
              ${formatMoney(maximumDiscount)}
            </td>
          </tr>
        `
        : "";

    const oneUseText =
      oneUsePerCustomer
        ? "One-time birthday reward"
        : "Birthday reward";

    const safeTitle =
      title?.trim()
        ? escapeHtml(title.trim())
        : "Birthday Month Reward";

    const safeDescription =
      description?.trim()
        ? escapeHtml(description.trim())
        : "Celebrate your birthday month with a special reward from T&M Jewels.";

    return this.sendEmail({
      to,
      subject: "🎂 Happy Birthday from T&M Jewels — Your Gift Awaits!",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>T&amp;M Jewels — Birthday Reward</title>
</head>

<body style="margin:0;padding:0;background:#f5f3ef;color:#222222;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f3ef;">
  <tr>
    <td align="center" style="padding:28px 12px;">

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
        style="width:100%;max-width:640px;background:#ffffff;border:1px solid #e9e3d8;">

        <!-- LOGO -->
        <tr>
          <td align="center" style="padding:30px 20px 24px;border-bottom:1px solid #eeeae2;">
            <img
              src="https://wzphyyoftwxvpqxtfgtb.supabase.co/storage/v1/object/public/Logo/MainLogo.png"
              alt="T&M Jewels"
              width="190"
              style="display:block;width:190px;max-width:80%;height:auto;margin:0 auto;"
            >
            <div style="margin-top:10px;font-size:11px;line-height:18px;letter-spacing:1.5px;color:#999287;text-transform:uppercase;">
              Create your own style. Create your own trend.
            </div>
          </td>
        </tr>

        <!-- BIRTHDAY HERO -->
        <tr>
          <td align="center" style="padding:38px 24px 20px;background:linear-gradient(180deg,#fffdf7 0%,#ffffff 100%);">

            <div style="font-size:54px;line-height:64px;">🎂</div>

            <div style="margin-top:14px;font-size:11px;line-height:18px;font-weight:700;letter-spacing:2px;color:#b18427;text-transform:uppercase;">
              A Little Something From T&amp;M Jewels
            </div>

            <h1 style="margin:10px 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:40px;font-weight:600;color:#49371d;">
              Happy Birthday, ${safeName}! 💛
            </h1>

            <p style="margin:0 auto;max-width:470px;font-size:14px;line-height:24px;color:#6e6a63;">
              Your birthday deserves a little extra sparkle.
              We've unlocked a special birthday reward just for you. ✨
            </p>

          </td>
        </tr>

        <!-- REWARD CARD -->
        <tr>
          <td style="padding:10px 24px 0;">

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
              style="background:#fffaf0;border:1px solid #e7d49a;">

              <tr>
                <td align="center" style="padding:28px 20px;">

                  <div style="font-size:10px;line-height:16px;font-weight:700;letter-spacing:2px;color:#a58a50;text-transform:uppercase;">
                    ${safeTitle}
                  </div>

                  <div style="margin-top:7px;font-family:Georgia,'Times New Roman',serif;font-size:38px;line-height:46px;font-weight:700;color:#49371d;">
                    ${discountText}
                  </div>

                  <div style="margin-top:5px;font-size:13px;line-height:21px;color:#77736c;">
                    on orders above <strong style="color:#49371d;">${minimumText}</strong>
                  </div>

                  <div style="margin-top:16px;font-size:12px;line-height:20px;color:#8a806d;">
                    ${safeDescription}
                  </div>

                </td>
              </tr>

            </table>

          </td>
        </tr>

        <!-- COUPON CODE -->
        <tr>
          <td style="padding:18px 24px 0;">

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
              style="background:#fffcf2;border:1px dashed #d8b96c;">

              <tr>
                <td align="center" style="padding:22px 16px;">

                  <div style="font-size:10px;line-height:16px;font-weight:700;letter-spacing:2px;color:#999287;text-transform:uppercase;">
                    Your Birthday Code
                  </div>

                  <div style="margin-top:10px;display:inline-block;padding:11px 18px;background:#ffffff;border:1px solid #eadfca;font-size:18px;line-height:24px;font-weight:700;letter-spacing:2px;color:#9a7420;">
                    ${escapeHtml(couponCode)}
                  </div>

                  <div style="margin-top:10px;font-size:11px;line-height:18px;color:#999287;">
                    Copy this code at checkout to enjoy your birthday reward.
                  </div>

                </td>
              </tr>

            </table>

          </td>
        </tr>

        <!-- DETAILS -->
        <tr>
          <td style="padding:18px 24px 0;">

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
              style="background:#faf8f3;border:1px solid #e8dfd0;">

              <tr>
                <td style="padding:16px;">

                  <div style="font-family:Georgia,'Times New Roman',serif;font-size:19px;line-height:25px;font-weight:600;color:#49371d;">
                    Your Birthday Reward Details
                  </div>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:10px;">

                    <tr>
                      <td style="padding:6px 0;font-size:13px;color:#77736c;">
                        Reward
                      </td>
                      <td align="right" style="padding:6px 0;font-size:13px;font-weight:600;color:#333333;">
                        ${discountText}
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:6px 0;font-size:13px;color:#77736c;">
                        Minimum Order
                      </td>
                      <td align="right" style="padding:6px 0;font-size:13px;font-weight:600;color:#333333;">
                        ${minimumText}
                      </td>
                    </tr>

                    ${maxDiscountText}

                    <tr>
                      <td style="padding:6px 0;font-size:13px;color:#77736c;">
                        Validity
                      </td>
                      <td align="right" style="padding:6px 0;font-size:13px;font-weight:600;color:#333333;">
                        ${escapeHtml(validityText)}
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:8px 0 2px;border-top:1px solid #eeeae2;font-size:13px;font-weight:600;color:#55514b;">
                        Usage
                      </td>
                      <td align="right" style="padding:8px 0 2px;border-top:1px solid #eeeae2;font-size:13px;font-weight:600;color:#8b6424;">
                        ${oneUseText}
                      </td>
                    </tr>

                  </table>

                </td>
              </tr>

            </table>

          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td align="center" style="padding:26px 24px 0;">

            <a
              href="https://www.tnmonline.in/shop"
              target="_blank"
              style="display:inline-block;padding:14px 30px;background:#181818;color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:1px;"
            >
              SHOP YOUR BIRTHDAY EDIT ✨
            </a>

            <div style="margin-top:12px;font-size:11px;line-height:18px;color:#aaa49a;">
              Your birthday reward is ready whenever you are. 💛
            </div>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td align="center" style="padding:32px 24px;">

            <div style="height:1px;background:#eeeae2;margin-bottom:22px;"></div>

            <img
              src="https://wzphyyoftwxvpqxtfgtb.supabase.co/storage/v1/object/public/Logo/MainLogo.png"
              alt="T&M Jewels"
              width="125"
              style="display:block;width:125px;height:auto;margin:0 auto;"
            >

            <div style="margin-top:12px;font-size:12px;line-height:20px;color:#999287;">
              Need help?
              <br>
              Contact us at <strong>shop.tnm.official@gmail.com</strong>
            </div>

            <div style="margin-top:14px;font-size:11px;line-height:18px;color:#aaa49a;">
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
      `,
    });
  }


  async sendBirthdayCouponEmailOnceDaily({
    customerId,
    coupon,
    email,
    customerName,
  }: {
    customerId: string;
    coupon: {
      id: string;
      code: string;
      title?: string | null;
      description?: string | null;
      discount_type: "fixed" | "percentage";
      discount_value: number;
      minimum_order_amount: number;
      maximum_discount?: number | null;
      starts_at?: string | null;
      expires_at?: string | null;
      one_use_per_customer?: boolean;
    };
    email: string;
    customerName?: string | null;
  }) {

    if (!customerId || !coupon?.id || !email?.trim()) {
      return {
        success: false,
        skipped: true,
      };
    }

    let claimed = false;

    try {

      const {
        data: claimResult,
        error: claimError,
      } = await supabase.rpc(
        "claim_birthday_coupon_email",
        {
          p_customer_id: customerId,
          p_coupon_id: coupon.id,
        }
      );

      if (claimError) {
        throw claimError;
      }

      claimed = claimResult === true;

      /*
       * Supabase is the source of truth for the daily email
       * limit. FALSE means it was already sent today or another
       * session has already claimed today's send.
       */
      if (!claimed) {
        return {
          success: true,
          skipped: true,
          alreadySentToday: true,
        };
      }

      const emailResult =
        await this.sendBirthdayCouponEmail({
          to: email.trim(),
          customerName,
          couponCode: coupon.code,
          discountType: coupon.discount_type,
          discountValue: Number(
            coupon.discount_value || 0
          ),
          minimumOrderAmount: Number(
            coupon.minimum_order_amount || 0
          ),
          maximumDiscount:
            coupon.maximum_discount ?? null,
          startsAt:
            coupon.starts_at ?? null,
          expiresAt:
            coupon.expires_at ?? null,
          oneUsePerCustomer:
            coupon.one_use_per_customer ?? true,
          title:
            coupon.title ?? null,
          description:
            coupon.description ?? null,
        });

      const success =
        emailResult?.success === true;

      const {
        error: completeError,
      } = await supabase.rpc(
        "complete_birthday_coupon_email",
        {
          p_customer_id: customerId,
          p_coupon_id: coupon.id,
          p_success: success,
          p_error_message: success
            ? null
            : "Birthday coupon email could not be sent.",
        }
      );

      if (completeError) {
        console.error(
          "Unable to update birthday email status:",
          completeError
        );
      }

      return {
        ...emailResult,
        alreadySentToday: false,
      };

    } catch (error) {

      /*
       * Birthday-email failures must never interrupt the
       * customer's normal website experience.
       */
      console.error(
        "Birthday coupon daily email failed:",
        error
      );

      if (claimed) {
        try {
          await supabase.rpc(
            "complete_birthday_coupon_email",
            {
              p_customer_id: customerId,
              p_coupon_id: coupon.id,
              p_success: false,
              p_error_message:
                error instanceof Error
                  ? error.message
                  : "Unknown birthday email error.",
            }
          );
        } catch (statusError) {
          console.error(
            "Unable to record birthday email failure:",
            statusError
          );
        }
      }

      return {
        success: false,
        error,
      };
    }
  }


  async getCustomerNotifications(

    customerId: string

  ) {





    const {

      data,

      error

    } = await supabase

      .from("notifications")

      .select("*")

      .eq(

        "customer_id",

        customerId

      )

      .order(

        "created_at",

        {

          ascending: false

        }

      );





    if (error)

      throw error;





    return data ?? [];

  }







  async getUnreadCount(

    customerId: string

  ) {





    const {

      count,

      error

    } = await supabase

      .from("notifications")

      .select(

        "id",

        {

          count: "exact",

          head: true

        }

      )

      .eq(

        "customer_id",

        customerId

      )

      .eq(

        "is_read",

        false

      );





    if (error)

      throw error;





    return count ?? 0;

  }







  async markAsRead(

    notificationId: string

  ) {





    const {

      error

    } = await supabase

      .from("notifications")

      .update({

        is_read: true

      })

      .eq(

        "id",

        notificationId

      );





    if (error)

      throw error;

  }







  async markAllAsRead(

    customerId: string

  ) {





    const {

      error

    } = await supabase

      .from("notifications")

      .update({

        is_read: true

      })

      .eq(

        "customer_id",

        customerId

      )

      .eq(

        "is_read",

        false

      );





    if (error)

      throw error;

  }







}





export const notificationService =

  new NotificationService();