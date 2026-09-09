import { supabase } from "@/shared/lib/supabase";
import { notificationService } from "@/features/notifications/services/notification.service";

import type {
  CollaboratorApplicationData,
} from "../types/collaborator.types";

export const collaboratorService = {

  async submitApplication(
    data: CollaboratorApplicationData
  ) {

    const {
      error,
    } = await supabase
      .from("collaborator_applications")
      .insert({
        ...data,

        /*
         * Always force new applications to pending.
         *
         * Never accept an admin status from the browser.
         */

        status: "pending",
      });

    if (error) {

      console.error(
        "Collaborator application error:",
        error
      );

      throw new Error(
        error.message ||
        "Unable to submit application."
      );

    }

    /*
     * The application has been successfully saved.
     * Send the confirmation email only after the insert succeeds.
     *
     * If the email fails, we do NOT fail the application submission
     * because the application itself was already created successfully.
     */
    try {
      const escapeHtml = (value: string) =>
        value
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");

      const safeName = escapeHtml(data.full_name);
      const safeInstagram = escapeHtml(data.instagram_username);
      const safeCollaborationType = escapeHtml(
        data.collaboration_type
      );
      const safeCategory = data.content_category
        ? escapeHtml(data.content_category)
        : null;

      const emailResult = await notificationService.sendEmail({
        to: data.email,
        subject:
          "T&M Jewels — Your Collaboration Application Has Been Received ✨",
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>T&amp;M Jewels — Collaboration Application</title>
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
              alt="T&amp;M Jewels"
              width="190"
              style="display:block;width:190px;max-width:80%;height:auto;margin:0 auto;"
            />
            <div style="margin-top:10px;font-size:11px;line-height:18px;letter-spacing:1.5px;color:#999287;text-transform:uppercase;">
              Create your own style. Create your own trend.
            </div>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td align="center" style="padding:40px 24px 24px;">
            <div style="width:58px;height:58px;line-height:58px;border-radius:50%;background:#f3f7ef;color:#4f7b45;font-size:25px;font-weight:bold;">
              ✓
            </div>

            <h1 style="margin:18px 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:29px;line-height:38px;font-weight:600;color:#8b6424;">
              Application Received
            </h1>

            <p style="margin:0;max-width:500px;font-size:14px;line-height:24px;color:#6e6a63;">
              Dear ${safeName},<br><br>
              Thank you for your interest in collaborating with T&amp;M Jewels. Your application has been successfully received.
            </p>
          </td>
        </tr>

        <!-- STATUS -->
        <tr>
          <td style="padding:4px 24px 20px;">
            <div style="padding:22px;background:#fbfaf7;border-left:3px solid #c8a44d;">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:21px;line-height:29px;font-weight:600;color:#49371d;">
                What happens next?
              </div>
              <div style="margin-top:9px;font-size:13px;line-height:22px;color:#625e57;">
                Our team will review your profile, content and collaboration preferences. Once the review is complete, we'll email you with an update.
              </div>
            </div>
          </td>
        </tr>

        <!-- APPLICATION DETAILS -->
        <tr>
          <td style="padding:0 24px 24px;">
            <div style="padding:20px;background:#faf8f3;border:1px solid #e8dfd0;">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:28px;font-weight:600;color:#49371d;">
                Application Details
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:12px;">
                <tr>
                  <td style="padding:7px 0;font-size:13px;color:#77736c;">Instagram</td>
                  <td align="right" style="padding:7px 0;font-size:13px;font-weight:600;color:#222222;">
                    @${safeInstagram}
                  </td>
                </tr>

                <tr>
                  <td style="padding:7px 0;font-size:13px;color:#77736c;">Collaboration Type</td>
                  <td align="right" style="padding:7px 0;font-size:13px;font-weight:600;color:#222222;text-transform:capitalize;">
                    ${safeCollaborationType}
                  </td>
                </tr>

                ${safeCategory ? `
                <tr>
                  <td style="padding:7px 0;font-size:13px;color:#77736c;">Content Category</td>
                  <td align="right" style="padding:7px 0;font-size:13px;font-weight:600;color:#222222;text-transform:capitalize;">
                    ${safeCategory}
                  </td>
                </tr>
                ` : ""}

                <tr>
                  <td style="padding:7px 0;font-size:13px;color:#77736c;">Application Status</td>
                  <td align="right" style="padding:7px 0;font-size:13px;font-weight:700;color:#8b6424;">
                    Pending Review
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td align="center" style="padding:0 24px 34px;">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:29px;font-weight:600;color:#49371d;">
              We can't wait to explore what we can create together.
            </div>

            <a href="https://tnmonline.in" target="_blank"
              style="display:inline-block;margin-top:18px;padding:13px 28px;background:#8b6424;color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:.8px;">
              VISIT T&amp;M JEWELS
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td align="center" style="padding:32px 24px;">
            <div style="height:1px;background:#eeeae2;margin-bottom:22px;"></div>

            <img
              src="https://wzphyyoftwxvpqxtfgtb.supabase.co/storage/v1/object/public/Logo/MainLogo.png"
              alt="T&amp;M Jewels"
              width="125"
              style="display:block;width:125px;height:auto;margin:0 auto;"
            />

            <div style="margin-top:12px;font-size:12px;line-height:20px;color:#999287;">
              Have questions about your application?
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

      if (!emailResult?.success) {
        console.error(
          "Collaborator application saved, but confirmation email failed:",
          emailResult?.error
        );
      } else {
        console.log(
          "Collaborator application confirmation email sent successfully."
        );
      }
    } catch (emailError) {
      console.error(
        "Collaborator application saved, but confirmation email failed:",
        emailError
      );
    }

    return true;
  },

};