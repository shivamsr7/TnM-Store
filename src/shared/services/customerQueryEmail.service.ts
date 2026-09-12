import { notificationService } from "@/features/notifications/services/notification.service";

export type CustomerQueryEmailStatus =
  | "new"
  | "in_progress"
  | "resolved"
  | "closed";

export interface CustomerQueryEmailData {
  to: string;
  customerName: string;
  ticketNumber: string;
  category: string;
  orderNumber?: string | null;
  message: string;
  status?: CustomerQueryEmailStatus;
  supportResponse?: string | null;
  createdAt?: string | null;
  resolvedAt?: string | null;
}

const SITE_URL = "https://tnmonline.in";
const CONTACT_URL = `${SITE_URL}/contact-us`;

function escapeHtml(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(value?: string | null) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusLabel(status: CustomerQueryEmailStatus) {
  switch (status) {
    case "in_progress":
      return "In Progress";
    case "resolved":
      return "Resolved";
    case "closed":
      return "Closed";
    default:
      return "New";
  }
}

function statusCopy(status: CustomerQueryEmailStatus) {
  switch (status) {
    case "in_progress":
      return "Our support team is currently working on your enquiry.";
    case "resolved":
      return "Your enquiry has been resolved by our support team.";
    case "closed":
      return "Your support ticket has been closed.";
    default:
      return "We've received your enquiry and our support team will review it shortly.";
  }
}

function statusColor(status: CustomerQueryEmailStatus) {
  switch (status) {
    case "resolved":
      return "#287a52";
    case "closed":
      return "#66615a";
    case "in_progress":
      return "#9a6a13";
    default:
      return "#6d5520";
  }
}

function baseEmailHtml(content: string) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>T&M Jewels Customer Support</title>
</head>
<body style="margin:0;padding:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#2b271f;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f1ea;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background:#ffffff;border:1px solid #e6e0d4;">
          <tr>
            <td style="padding:28px 30px 20px;text-align:center;border-bottom:1px solid #eeeae2;">
              <div style="font-size:23px;font-weight:700;letter-spacing:1.4px;color:#17130d;">T&amp;M JEWELS</div>
              <div style="margin-top:7px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#a18445;">Customer Care</div>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 28px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 28px;text-align:center;border-top:1px solid #eeeae2;">
              <div style="font-size:11px;line-height:18px;color:#9b958b;">
                Need more help? Visit <a href="${CONTACT_URL}" style="color:#8b6424;text-decoration:none;font-weight:600;">Contact Us</a>
              </div>
              <div style="margin-top:10px;font-size:10px;color:#aaa49a;">
                © T&amp;M Jewels. All rights reserved.
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

function ticketDetails(data: CustomerQueryEmailData) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;border:1px solid #eeeae2;background:#faf9f6;">
      <tr>
        <td style="padding:16px 18px;border-bottom:1px solid #eeeae2;">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.4px;color:#9b958b;">Ticket Number</div>
          <div style="margin-top:6px;font-size:17px;font-weight:700;letter-spacing:1px;color:#2b271f;">${escapeHtml(data.ticketNumber)}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 18px;">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.4px;color:#9b958b;">Category</div>
          <div style="margin-top:5px;font-size:13px;color:#4a443a;">${escapeHtml(data.category)}</div>
        </td>
      </tr>
      ${
        data.orderNumber
          ? `<tr>
              <td style="padding:0 18px 14px;">
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.4px;color:#9b958b;">Order Number</div>
                <div style="margin-top:5px;font-size:13px;color:#4a443a;">${escapeHtml(data.orderNumber)}</div>
              </td>
            </tr>`
          : ""
      }
    </table>
  `;
}

function supportResponseBlock(response: string) {
  return `
    <div style="margin-top:22px;padding:18px;border:1px solid #ead7a8;background:#fffaf0;">
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.4px;color:#9a772d;font-weight:700;">Support Response</div>
      <div style="margin-top:9px;font-size:13px;line-height:21px;color:#4a443a;white-space:pre-line;">${escapeHtml(response)}</div>
    </div>
  `;
}

function messageBlock(message: string) {
  return `
    <div style="margin-top:22px;padding:18px;border:1px solid #eeeae2;background:#ffffff;">
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.4px;color:#9b958b;">Your Message</div>
      <div style="margin-top:9px;font-size:13px;line-height:21px;color:#4a443a;white-space:pre-line;">${escapeHtml(message)}</div>
    </div>
  `;
}

function cta(ticketNumber: string) {
  const url = `${CONTACT_URL}?ticket=${encodeURIComponent(ticketNumber)}`;

  return `
    <div style="margin-top:26px;text-align:center;">
      <a href="${url}" style="display:inline-block;background:#8b6424;color:#ffffff;text-decoration:none;padding:13px 24px;font-size:12px;font-weight:700;letter-spacing:.5px;">
        TRACK YOUR TICKET
      </a>
    </div>
  `;
}

function buildEmail(
  data: CustomerQueryEmailData,
  kind: "created" | "status" | "response"
) {
  const status = data.status ?? "new";
  const label = statusLabel(status);
  const color = statusColor(status);

  let subject = "";
  let heading = "";
  let intro = "";

  if (kind === "created") {
    subject = `T&M Jewels — Ticket ${data.ticketNumber} Received`;
    heading = "We've received your enquiry";
    intro = `Hi ${escapeHtml(data.customerName)},<br><br>Thank you for contacting T&amp;M Jewels. Your support enquiry has been successfully received.`;
  } else if (kind === "response") {
    subject = `T&M Jewels — Update on Ticket ${data.ticketNumber}`;
    heading = "There's an update on your ticket";
    intro = `Hi ${escapeHtml(data.customerName)},<br><br>Our support team has added a response to your enquiry.`;
  } else {
    subject = `T&M Jewels — Ticket ${data.ticketNumber} ${label}`;
    heading = `Your ticket is ${label.toLowerCase()}`;
    intro = `Hi ${escapeHtml(data.customerName)},<br><br>${statusCopy(status)}`;
  }

  const statusBlock =
    kind === "created"
      ? ""
      : `<div style="margin-top:22px;">
          <span style="display:inline-block;padding:7px 12px;border:1px solid ${color}33;background:${color}12;color:${color};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;">
            ${escapeHtml(label)}
          </span>
        </div>`;

  const response =
    data.supportResponse?.trim()
      ? supportResponseBlock(data.supportResponse.trim())
      : "";

  const resolvedLine =
    status === "resolved" && data.resolvedAt
      ? `<div style="margin-top:10px;font-size:11px;color:#8f897f;">Resolved on ${escapeHtml(formatDate(data.resolvedAt))}</div>`
      : "";

  const content = `
    <h1 style="margin:0;font-size:25px;line-height:32px;color:#201b14;">${heading}</h1>
    <div style="margin-top:16px;font-size:13px;line-height:21px;color:#5c554b;">${intro}</div>
    ${statusBlock}
    ${ticketDetails(data)}
    ${messageBlock(data.message)}
    ${response}
    ${resolvedLine}
    ${cta(data.ticketNumber)}
    <div style="margin-top:16px;text-align:center;font-size:10px;line-height:17px;color:#aaa49a;">
      You can use your ticket number and the email used for your enquiry to track updates.
    </div>
  `;

  return {
    subject,
    html: baseEmailHtml(content),
  };
}

export async function sendCustomerQueryCreatedEmail(
  data: CustomerQueryEmailData
) {
  if (!data.to?.trim() || !data.ticketNumber?.trim()) {
    return { success: false, skipped: true };
  }

  const email = buildEmail(data, "created");
  return notificationService.sendEmail({
    to: data.to.trim(),
    subject: email.subject,
    html: email.html,
  });
}

export async function sendCustomerQueryStatusEmail(
  data: CustomerQueryEmailData
) {
  if (!data.to?.trim() || !data.ticketNumber?.trim()) {
    return { success: false, skipped: true };
  }

  const email = buildEmail(data, "status");
  return notificationService.sendEmail({
    to: data.to.trim(),
    subject: email.subject,
    html: email.html,
  });
}

export async function sendCustomerQueryResponseEmail(
  data: CustomerQueryEmailData
) {
  if (!data.to?.trim() || !data.ticketNumber?.trim()) {
    return { success: false, skipped: true };
  }

  const email = buildEmail(data, "response");
  return notificationService.sendEmail({
    to: data.to.trim(),
    subject: email.subject,
    html: email.html,
  });
}
