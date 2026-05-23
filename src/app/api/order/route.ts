import { Resend } from "resend";

import { adminEmail, resendFromEmail } from "@/lib/email";

const resend = new Resend(process.env.RESEND_API_KEY);

export type OrderPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  deliveryDate: string;
  deliveryWindow: string;
  dropOffNotes: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  services: string[];
  materialSubtotal: number;
  deliveryFee: number;
  serviceTotal: number;
  total: number;
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents);
}

function buildAdminHtml(order: OrderPayload) {
  const itemRows = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:6px 0;color:#1a3a2a;">${item.quantity} yd — ${item.name}</td>
          <td style="padding:6px 0;text-align:right;font-weight:700;color:#1a3a2a;">${formatCurrency(item.quantity * item.unitPrice)}</td>
        </tr>`,
    )
    .join("");

  const serviceList =
    order.services.length > 0
      ? `<p style="margin:4px 0;color:#4a7a5a;">${order.services.join(", ")}</p>`
      : `<p style="margin:4px 0;color:#999;">None</p>`;

  return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f4faf6;padding:32px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #d1e8da;">
    <h1 style="color:#1a3a2a;margin:0 0 4px;">New Order Received</h1>
    <p style="color:#4a7a5a;margin:0 0 24px;font-size:14px;">Mulch Movers</p>

    <h2 style="color:#1a3a2a;font-size:16px;margin:0 0 12px;">Customer</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:4px 0;color:#666;width:140px;">Name</td><td style="color:#1a3a2a;font-weight:700;">${order.firstName} ${order.lastName}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Email</td><td style="color:#1a3a2a;font-weight:700;">${order.email}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Phone</td><td style="color:#1a3a2a;font-weight:700;">${order.phone}</td></tr>
    </table>

    <hr style="border:none;border-top:1px solid #e0ede6;margin:20px 0;" />

    <h2 style="color:#1a3a2a;font-size:16px;margin:0 0 12px;">Delivery</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:4px 0;color:#666;width:140px;">Address</td><td style="color:#1a3a2a;font-weight:700;">${order.address}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Date</td><td style="color:#1a3a2a;font-weight:700;">${order.deliveryDate}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Window</td><td style="color:#1a3a2a;font-weight:700;">${order.deliveryWindow}</td></tr>
      ${order.dropOffNotes ? `<tr><td style="padding:4px 0;color:#666;vertical-align:top;">Notes</td><td style="color:#1a3a2a;">${order.dropOffNotes}</td></tr>` : ""}
    </table>

    <hr style="border:none;border-top:1px solid #e0ede6;margin:20px 0;" />

    <h2 style="color:#1a3a2a;font-size:16px;margin:0 0 12px;">Materials</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">${itemRows}</table>

    <h2 style="color:#1a3a2a;font-size:16px;margin:20px 0 8px;">Services</h2>
    ${serviceList}

    <hr style="border:none;border-top:1px solid #e0ede6;margin:20px 0;" />

    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:4px 0;color:#666;">Materials</td><td style="text-align:right;color:#1a3a2a;">${formatCurrency(order.materialSubtotal)}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Delivery</td><td style="text-align:right;color:#1a3a2a;">${formatCurrency(order.deliveryFee)}</td></tr>
      ${order.serviceTotal > 0 ? `<tr><td style="padding:4px 0;color:#666;">Services</td><td style="text-align:right;color:#1a3a2a;">${formatCurrency(order.serviceTotal)}</td></tr>` : ""}
      <tr style="border-top:2px solid #1a3a2a;">
        <td style="padding:10px 0 4px;font-weight:700;font-size:16px;color:#1a3a2a;">Total</td>
        <td style="padding:10px 0 4px;text-align:right;font-weight:700;font-size:16px;color:#1a3a2a;">${formatCurrency(order.total)}</td>
      </tr>
    </table>

    <p style="margin:24px 0 0;font-size:12px;color:#999;">Payment collected on delivery.</p>
  </div>
</body>
</html>`;
}

function buildConfirmationHtml(order: OrderPayload) {
  const itemList = order.items
    .map((item) => `<li style="margin:4px 0;color:#1a3a2a;">${item.quantity} yd — ${item.name} (${formatCurrency(item.quantity * item.unitPrice)})</li>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f4faf6;padding:32px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #d1e8da;">
    <h1 style="color:#1a3a2a;margin:0 0 4px;">Order Confirmed</h1>
    <p style="color:#4a7a5a;margin:0 0 24px;font-size:14px;">Thanks, ${order.firstName}! Here's what we have on file.</p>

    <h2 style="color:#1a3a2a;font-size:16px;margin:0 0 12px;">Delivery</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:4px 0;color:#666;width:120px;">Address</td><td style="color:#1a3a2a;font-weight:700;">${order.address}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Date</td><td style="color:#1a3a2a;font-weight:700;">${order.deliveryDate}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Window</td><td style="color:#1a3a2a;font-weight:700;">${order.deliveryWindow}</td></tr>
    </table>

    <hr style="border:none;border-top:1px solid #e0ede6;margin:20px 0;" />

    <h2 style="color:#1a3a2a;font-size:16px;margin:0 0 12px;">Your order</h2>
    <ul style="margin:0;padding-left:20px;font-size:14px;">${itemList}</ul>
    ${order.services.length > 0 ? `<p style="margin:12px 0 0;font-size:14px;color:#4a7a5a;">Services: ${order.services.join(", ")}</p>` : ""}

    <hr style="border:none;border-top:1px solid #e0ede6;margin:20px 0;" />

    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:4px 0;color:#666;">Materials</td><td style="text-align:right;color:#1a3a2a;">${formatCurrency(order.materialSubtotal)}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Delivery</td><td style="text-align:right;color:#1a3a2a;">${formatCurrency(order.deliveryFee)}</td></tr>
      ${order.serviceTotal > 0 ? `<tr><td style="padding:4px 0;color:#666;">Services</td><td style="text-align:right;color:#1a3a2a;">${formatCurrency(order.serviceTotal)}</td></tr>` : ""}
      <tr style="border-top:2px solid #1a3a2a;">
        <td style="padding:10px 0 4px;font-weight:700;font-size:16px;color:#1a3a2a;">Total</td>
        <td style="padding:10px 0 4px;text-align:right;font-weight:700;font-size:16px;color:#1a3a2a;">${formatCurrency(order.total)}</td>
      </tr>
    </table>

    <div style="margin-top:24px;padding:16px;background:#f0faf4;border-radius:12px;">
      <p style="margin:0;font-size:14px;color:#1a3a2a;font-weight:700;">Payment on delivery</p>
      <p style="margin:4px 0 0;font-size:13px;color:#4a7a5a;">Our crew will collect payment when we arrive. We accept cash, check, or card on-site.</p>
    </div>

    <p style="margin:24px 0 0;font-size:12px;color:#999;">Questions? Reply to this email or call us directly.</p>
  </div>
</body>
</html>`;
}

export async function POST(request: Request) {
  const order = (await request.json()) as OrderPayload;

  const [adminResult, customerResult] = await Promise.all([
    resend.emails.send({
      from: resendFromEmail,
      to: adminEmail,
      subject: `New order — ${order.firstName} ${order.lastName} — ${order.deliveryDate}`,
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
    return Response.json(
      { error: adminResult.error ?? customerResult.error },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
