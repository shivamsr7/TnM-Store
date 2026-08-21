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





export interface OrderConfirmationEmailPayload {

  to: string;

  customerName: string;

  orderNumber: string;

  orderDate: string;

  orderStatus: string;

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

  tax: number;

  totalAmount: number;

  paymentMethod:
    | "partial_cod"
    | "prepaid";

  advanceAmount: number;

  remainingAmount: number;

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







  async sendOrderConfirmationEmail({

    to,

    customerName,

    orderNumber,

    orderDate,

    orderStatus,

    items,

    subtotal,

    discount,

    shippingCharge,

    tax,

    totalAmount,

    paymentMethod,

    advanceAmount,

    remainingAmount,

    paymentTransactionId,

    couponCode,

    shipping,

  }: OrderConfirmationEmailPayload) {





    const isPrepaid =
      paymentMethod === "prepaid";





    const paymentLabel =
      isPrepaid
        ? "Prepaid"
        : "Partial COD";





    const paymentStatus =
      isPrepaid
        ? "Payment Received"
        : "Advance Payment Received";





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

        `T&M Jewels — Order Confirmed #${orderNumber}`,





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

    T&amp;M Jewels — Order Confirmation

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

              Order Confirmed! 🎉

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

              Your order has been successfully placed.

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

                    ${escapeHtml(
                      orderStatus
                    )}

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

                    Advance Paid

                  </td>





                  <td

                    align="right"

                    style="

                      padding:6px 0;

                      font-size:13px;

                      font-weight:600;

                    "

                  >

                    ${formatMoney(
                      advanceAmount
                    )}

                  </td>

                </tr>





                ${remainingRow}

                ${transactionRow}

              </table>

            </div>

          </td>

        </tr>





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

                <td

                  align="center"

                  width="25%"

                >

                  <div

                    style="

                      margin:auto;

                      width:34px;

                      height:34px;

                      line-height:34px;

                      border-radius:50%;

                      background:#8b6424;

                      color:#ffffff;

                      font-size:16px;

                    "

                  >

                    ✓

                  </div>





                  <div

                    style="

                      margin-top:7px;

                      font-size:10px;

                      line-height:15px;

                      font-weight:600;

                      color:#8b6424;

                    "

                  >

                    Confirmed

                  </div>

                </td>





                <td

                  align="center"

                  width="25%"

                >

                  <div

                    style="

                      margin:auto;

                      width:34px;

                      height:34px;

                      line-height:34px;

                      border-radius:50%;

                      background:#f4f0e8;

                      color:#aaa297;

                      font-size:15px;

                    "

                  >

                    2

                  </div>





                  <div

                    style="

                      margin-top:7px;

                      font-size:10px;

                      line-height:15px;

                      color:#8f8a82;

                    "

                  >

                    Packed

                  </div>

                </td>





                <td

                  align="center"

                  width="25%"

                >

                  <div

                    style="

                      margin:auto;

                      width:34px;

                      height:34px;

                      line-height:34px;

                      border-radius:50%;

                      background:#f4f0e8;

                      color:#aaa297;

                      font-size:15px;

                    "

                  >

                    3

                  </div>





                  <div

                    style="

                      margin-top:7px;

                      font-size:10px;

                      line-height:15px;

                      color:#8f8a82;

                    "

                  >

                    Shipped

                  </div>

                </td>





                <td

                  align="center"

                  width="25%"

                >

                  <div

                    style="

                      margin:auto;

                      width:34px;

                      height:34px;

                      line-height:34px;

                      border-radius:50%;

                      background:#f4f0e8;

                      color:#aaa297;

                      font-size:15px;

                    "

                  >

                    4

                  </div>





                  <div

                    style="

                      margin-top:7px;

                      font-size:10px;

                      line-height:15px;

                      color:#8f8a82;

                    "

                  >

                    Delivered

                  </div>

                </td>

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