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

    orderNumber,

    totalAmount,

    paymentMethod,

  }: {

    to: string;

    orderNumber: string;

    totalAmount: number;

    paymentMethod: "partial_cod" | "prepaid";

  }) {





    const isPrepaid =
      paymentMethod === "prepaid";





    const paymentLabel =
      isPrepaid
        ? "Prepaid"
        : "Partial COD";





    const paymentMessage =
      isPrepaid

        ? "Your payment has been received successfully."

        : "Your order has been placed successfully with Partial COD.";





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

  <meta name="color-scheme" content="light">

  <meta name="supported-color-schemes" content="light">

  <title>T&M Jewels — Order Confirmed</title>

</head>





<body

  style="

    margin:0;

    padding:0;

    background-color:#f6f5f2;

    font-family:Arial,Helvetica,sans-serif;

    color:#171717;

    -webkit-text-size-adjust:100%;

    -ms-text-size-adjust:100%;

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

    background-color:#f6f5f2;

    margin:0;

    padding:0;

  "

>

  <tr>

    <td

      align="center"

      style="padding:32px 14px;"

    >





      <!-- Main Container -->

      <table

        role="presentation"

        width="100%"

        cellspacing="0"

        cellpadding="0"

        border="0"

        style="

          width:100%;

          max-width:620px;

          background-color:#ffffff;

          border:1px solid #e9e6df;

        "

      >





        <!-- Header -->

        <tr>

          <td

            align="center"

            style="

              padding:38px 24px 30px;

              border-bottom:1px solid #eeeae2;

            "

          >

            <div

              style="

                font-family:Georgia,'Times New Roman',serif;

                font-size:31px;

                line-height:38px;

                font-weight:600;

                letter-spacing:1px;

                color:#171717;

              "

            >

              T&amp;M Jewels

            </div>





            <div

              style="

                margin-top:9px;

                font-size:12px;

                line-height:18px;

                letter-spacing:1.5px;

                color:#99958d;

                text-transform:uppercase;

              "

            >

              Create your own style. Create your own trend.

            </div>

          </td>

        </tr>





        <!-- Confirmation -->

        <tr>

          <td

            align="center"

            style="padding:38px 24px 24px;"

          >





            <table

              role="presentation"

              cellspacing="0"

              cellpadding="0"

              border="0"

              align="center"

            >

              <tr>

                <td

                  align="center"

                  valign="middle"

                  style="

                    width:58px;

                    height:58px;

                    border-radius:50%;

                    background-color:#f3f7f1;

                    color:#4c8a4c;

                    font-size:29px;

                    line-height:58px;

                  "

                >

                  ✓

                </td>

              </tr>

            </table>





            <div

              style="

                margin-top:22px;

                font-family:Georgia,'Times New Roman',serif;

                font-size:28px;

                line-height:36px;

                font-weight:600;

                color:#171717;

              "

            >

              Order Confirmed 🎉

            </div>





            <div

              style="

                margin-top:10px;

                font-size:14px;

                line-height:23px;

                color:#6f6b65;

                max-width:440px;

                margin-left:auto;

                margin-right:auto;

              "

            >

              Thank you for choosing T&amp;M Jewels.

              Your order has been successfully placed.

            </div>





          </td>

        </tr>





        <!-- Order Details -->

        <tr>

          <td

            style="

              padding:10px 24px 0;

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

                background-color:#faf9f6;

                border:1px solid #eeeae2;

                border-radius:12px;

              "

            >

              <tr>

                <td

                  style="

                    padding:20px;

                  "

                >





                  <div

                    style="

                      font-size:11px;

                      line-height:16px;

                      color:#a09b92;

                      letter-spacing:1.4px;

                      text-transform:uppercase;

                    "

                  >

                    Order Number

                  </div>





                  <div

                    style="

                      margin-top:7px;

                      font-size:19px;

                      line-height:27px;

                      font-weight:600;

                      color:#171717;

                      word-break:break-word;

                    "

                  >

                    #${orderNumber}

                  </div>





                </td>

              </tr>

            </table>





          </td>

        </tr>





        <!-- Amount / Payment -->

        <tr>

          <td

            style="

              padding:20px 24px 0;

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

                border-top:1px solid #eeeae2;

                border-bottom:1px solid #eeeae2;

              "

            >





              <tr>

                <td

                  style="

                    padding:17px 0;

                    font-size:14px;

                    line-height:20px;

                    color:#6f6b65;

                  "

                >

                  Order Total

                </td>





                <td

                  align="right"

                  style="

                    padding:17px 0;

                    font-size:16px;

                    line-height:20px;

                    font-weight:600;

                    color:#171717;

                    white-space:nowrap;

                  "

                >

                  ₹${totalAmount.toLocaleString("en-IN", {

                    minimumFractionDigits:2,

                    maximumFractionDigits:2

                  })}

                </td>

              </tr>





              <tr>

                <td

                  style="

                    padding:0 0 17px;

                    font-size:14px;

                    line-height:20px;

                    color:#6f6b65;

                  "

                >

                  Payment

                </td>





                <td

                  align="right"

                  style="

                    padding:0 0 17px;

                    font-size:14px;

                    line-height:20px;

                    font-weight:600;

                    color:#171717;

                  "

                >

                  ${paymentLabel}

                </td>

              </tr>





            </table>





          </td>

        </tr>





        <!-- Message -->

        <tr>

          <td

            style="

              padding:24px 24px 0;

            "

          >

            <div

              style="

                font-size:14px;

                line-height:24px;

                color:#5f5b55;

              "

            >

              ${paymentMessage}

              We will keep you updated as your order moves

              through each stage.

            </div>

          </td>

        </tr>





        <!-- What's Next -->

        <tr>

          <td

            style="

              padding:24px 24px 0;

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

                background-color:#fbfaf8;

                border-left:3px solid #c8a44d;

              "

            >

              <tr>

                <td

                  style="

                    padding:16px 18px;

                  "

                >

                  <div

                    style="

                      font-size:13px;

                      line-height:20px;

                      font-weight:600;

                      color:#292722;

                    "

                  >

                    What happens next?

                  </div>





                  <div

                    style="

                      margin-top:5px;

                      font-size:13px;

                      line-height:21px;

                      color:#77736c;

                    "

                  >

                    We will carefully prepare your jewellery

                    and share an update when your order moves

                    to the next stage.

                  </div>

                </td>

              </tr>

            </table>





          </td>

        </tr>





        <!-- Footer -->

        <tr>

          <td

            align="center"

            style="

              padding:34px 24px 30px;

            "

          >





            <div

              style="

                width:100%;

                height:1px;

                background-color:#eeeae2;

                margin-bottom:24px;

              "

            ></div>





            <div

              style="

                font-family:Georgia,'Times New Roman',serif;

                font-size:17px;

                line-height:24px;

                color:#171717;

              "

            >

              T&amp;M Jewels

            </div>





            <div

              style="

                margin-top:8px;

                font-size:12px;

                line-height:19px;

                color:#9a968f;

              "

            >

              Thank you for being a part of T&amp;M Jewels.

            </div>





            <div

              style="

                margin-top:14px;

                font-size:11px;

                line-height:18px;

                color:#b0aca5;

              "

            >

              © T&amp;M Jewels

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