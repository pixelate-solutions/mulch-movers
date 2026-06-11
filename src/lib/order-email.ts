import { Resend } from "resend";

import type { PaidOrder } from "@/lib/checkout-order";
import { formatCurrency } from "@/lib/delivery";
import { adminEmail, resendFromEmail } from "@/lib/email";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatPaymentId(value: string | undefined) {
  return value ? escapeHtml(value) : "Not provided";
}

function buildAdminHtml(order: PaidOrder) {
  const itemRows = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:6px 0;color:#1a3a2a;">${item.quantity} yd - ${escapeHtml(item.name)}</td>
          <td style="padding:6px 0;text-align:right;font-weight:700;color:#1a3a2a;">${formatCurrency(item.total)}</td>
        </tr>`,
    )
    .join("");

  const serviceList =
    order.services.length > 0
      ? `<p style="margin:4px 0;color:#4a7a5a;">${escapeHtml(order.services.join(", "))}</p>`
      : `<p style="margin:4px 0;color:#999;">None</p>`;
  const supplierHtml = order.supplier
    ? `<table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:4px 0;color:#666;width:140px;">Supplier</td><td style="color:#1a3a2a;font-weight:700;">${escapeHtml(order.supplier.name)}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Address</td><td style="color:#1a3a2a;font-weight:700;">${escapeHtml(order.supplier.address)}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Selection</td><td style="color:#1a3a2a;">${order.supplier.assignedByZip ? "Assigned by service ZIP" : "Closest supplier fallback"}</td></tr>
      ${typeof order.supplier.distanceMiles === "number" ? `<tr><td style="padding:4px 0;color:#666;">Distance</td><td style="color:#1a3a2a;">${order.supplier.distanceMiles.toFixed(1)} miles</td></tr>` : ""}
    </table>`
    : `<p style="margin:4px 0;color:#999;">No supplier recommendation available.</p>`;

  return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f4faf6;padding:32px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #d1e8da;">
    <h1 style="color:#1a3a2a;margin:0 0 4px;">Paid Order Received</h1>
    <p style="color:#4a7a5a;margin:0 0 24px;font-size:14px;">Mulch Movers</p>

    <h2 style="color:#1a3a2a;font-size:16px;margin:0 0 12px;">Customer</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:4px 0;color:#666;width:140px;">Name</td><td style="color:#1a3a2a;font-weight:700;">${escapeHtml(order.firstName)} ${escapeHtml(order.lastName)}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Email</td><td style="color:#1a3a2a;font-weight:700;">${escapeHtml(order.email)}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Phone</td><td style="color:#1a3a2a;font-weight:700;">${escapeHtml(order.phone)}</td></tr>
    </table>

    <hr style="border:none;border-top:1px solid #e0ede6;margin:20px 0;" />

    <h2 style="color:#1a3a2a;font-size:16px;margin:0 0 12px;">Delivery</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:4px 0;color:#666;width:140px;">Address</td><td style="color:#1a3a2a;font-weight:700;">${escapeHtml(order.address)}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Date</td><td style="color:#1a3a2a;font-weight:700;">${escapeHtml(order.deliveryDate)}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Window</td><td style="color:#1a3a2a;font-weight:700;">${escapeHtml(order.deliveryWindow)}</td></tr>
      ${order.dropOffNotes ? `<tr><td style="padding:4px 0;color:#666;vertical-align:top;">Notes</td><td style="color:#1a3a2a;">${escapeHtml(order.dropOffNotes)}</td></tr>` : ""}
    </table>

    <hr style="border:none;border-top:1px solid #e0ede6;margin:20px 0;" />

    <h2 style="color:#1a3a2a;font-size:16px;margin:0 0 12px;">Materials</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">${itemRows}</table>

    <h2 style="color:#1a3a2a;font-size:16px;margin:20px 0 8px;">Supplier to buy from</h2>
    ${supplierHtml}

    <h2 style="color:#1a3a2a;font-size:16px;margin:20px 0 8px;">Services</h2>
    ${serviceList}

    <hr style="border:none;border-top:1px solid #e0ede6;margin:20px 0;" />

    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:4px 0;color:#666;">Materials</td><td style="text-align:right;color:#1a3a2a;">${formatCurrency(order.materialSubtotal)}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Delivery</td><td style="text-align:right;color:#1a3a2a;">${formatCurrency(order.deliveryFee)}</td></tr>
      ${order.serviceTotal > 0 ? `<tr><td style="padding:4px 0;color:#666;">Services</td><td style="text-align:right;color:#1a3a2a;">${formatCurrency(order.serviceTotal)}</td></tr>` : ""}
      <tr style="border-top:2px solid #1a3a2a;">
        <td style="padding:10px 0 4px;font-weight:700;font-size:16px;color:#1a3a2a;">Paid total</td>
        <td style="padding:10px 0 4px;text-align:right;font-weight:700;font-size:16px;color:#1a3a2a;">${formatCurrency(order.total)}</td>
      </tr>
    </table>

    <div style="margin-top:24px;padding:16px;background:#f0faf4;border-radius:12px;">
      <p style="margin:0;font-size:14px;color:#1a3a2a;font-weight:700;">Stripe payment</p>
      <p style="margin:4px 0 0;font-size:12px;color:#4a7a5a;">Checkout session: ${formatPaymentId(order.stripeCheckoutSessionId)}</p>
      <p style="margin:4px 0 0;font-size:12px;color:#4a7a5a;">Payment intent: ${formatPaymentId(order.stripePaymentIntentId)}</p>
      <p style="margin:4px 0 0;font-size:12px;color:#4a7a5a;">Status: ${escapeHtml(order.stripePaymentStatus ?? "paid")}</p>
    </div>
  </div>
</body>
</html>`;
}

function buildConfirmationHtml(order: PaidOrder) {
  const itemList = order.items
    .map(
      (item) =>
        `<li style="margin:4px 0;color:#1a3a2a;">${item.quantity} yd - ${escapeHtml(item.name)} (${formatCurrency(item.total)})</li>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f4faf6;padding:32px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #d1e8da;">
    <h1 style="color:#1a3a2a;margin:0 0 4px;">Order Confirmed</h1>
    <p style="color:#4a7a5a;margin:0 0 24px;font-size:14px;">Thanks, ${escapeHtml(order.firstName)}! Your Stripe payment was received.</p>

    <h2 style="color:#1a3a2a;font-size:16px;margin:0 0 12px;">Delivery</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:4px 0;color:#666;width:120px;">Address</td><td style="color:#1a3a2a;font-weight:700;">${escapeHtml(order.address)}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Date</td><td style="color:#1a3a2a;font-weight:700;">${escapeHtml(order.deliveryDate)}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Window</td><td style="color:#1a3a2a;font-weight:700;">${escapeHtml(order.deliveryWindow)}</td></tr>
    </table>

    <hr style="border:none;border-top:1px solid #e0ede6;margin:20px 0;" />

    <h2 style="color:#1a3a2a;font-size:16px;margin:0 0 12px;">Your order</h2>
    <ul style="margin:0;padding-left:20px;font-size:14px;">${itemList}</ul>
    ${order.services.length > 0 ? `<p style="margin:12px 0 0;font-size:14px;color:#4a7a5a;">Services: ${escapeHtml(order.services.join(", "))}</p>` : ""}

    <hr style="border:none;border-top:1px solid #e0ede6;margin:20px 0;" />

    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:4px 0;color:#666;">Materials</td><td style="text-align:right;color:#1a3a2a;">${formatCurrency(order.materialSubtotal)}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Delivery</td><td style="text-align:right;color:#1a3a2a;">${formatCurrency(order.deliveryFee)}</td></tr>
      ${order.serviceTotal > 0 ? `<tr><td style="padding:4px 0;color:#666;">Services</td><td style="text-align:right;color:#1a3a2a;">${formatCurrency(order.serviceTotal)}</td></tr>` : ""}
      <tr style="border-top:2px solid #1a3a2a;">
        <td style="padding:10px 0 4px;font-weight:700;font-size:16px;color:#1a3a2a;">Paid total</td>
        <td style="padding:10px 0 4px;text-align:right;font-weight:700;font-size:16px;color:#1a3a2a;">${formatCurrency(order.total)}</td>
      </tr>
    </table>

    <div style="margin-top:24px;padding:16px;background:#f0faf4;border-radius:12px;">
      <p style="margin:0;font-size:14px;color:#1a3a2a;font-weight:700;">Payment received</p>
      <p style="margin:4px 0 0;font-size:13px;color:#4a7a5a;">No payment will be collected at delivery unless the order changes after checkout.</p>
    </div>

    <p style="margin:24px 0 0;font-size:12px;color:#999;">Questions? Reply to this email or call us directly.</p>
  </div>
</body>
</html>`;
}

export async function sendPaidOrderEmails(order: PaidOrder) {
  const [adminResult, customerResult] = await Promise.all([
    resend.emails.send({
      from: resendFromEmail,
      to: adminEmail,
      replyTo: order.email,
      subject: `Paid order - ${order.firstName} ${order.lastName} - ${order.deliveryDate}`,
      html: buildAdminHtml(order),
    }),
    resend.emails.send({
      from: resendFromEmail,
      to: order.email,
      subject: "Your Mulch Movers order is confirmed",
      html: buildConfirmationHtml(order),
    }),
  ]);

  if (adminResult.error || customerResult.error) {
    throw new Error(
      adminResult.error?.message ??
        customerResult.error?.message ??
        "Failed to send order email.",
    );
  }
}
