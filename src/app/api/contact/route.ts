import { Resend } from "resend";

import { adminEmail, resendFromEmail } from "@/lib/email";
import { isValidUsPhone } from "@/lib/phone";

const resend = new Resend(process.env.RESEND_API_KEY);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const materialLabels: Record<string, string> = {
  gravel: "Gravel",
  mulch: "Mulch",
  other: "Other material",
  sand: "Sand",
  soil: "Soil",
};

type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  material: string;
  deliveryAddress: string;
  message: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function formatMaterial(value: string) {
  return materialLabels[value.toLowerCase()] ?? value;
}

function buildContactHtml(contact: ContactPayload) {
  const rows = [
    ["Name", contact.name],
    ["Email", contact.email],
    ["Phone", contact.phone],
    ["Material needed", contact.material || "Not specified"],
    ["Delivery address", contact.deliveryAddress || "Not specified"],
  ];

  return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f4faf6;padding:32px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #d1e8da;">
    <h1 style="color:#1a3a2a;margin:0 0 4px;">New Contact Request</h1>
    <p style="color:#4a7a5a;margin:0 0 24px;font-size:14px;">Mulch Movers</p>

    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="padding:6px 0;color:#666;width:150px;">${escapeHtml(label)}</td><td style="color:#1a3a2a;font-weight:700;">${escapeHtml(value)}</td></tr>`,
        )
        .join("")}
    </table>

    <hr style="border:none;border-top:1px solid #e0ede6;margin:20px 0;" />

    <h2 style="color:#1a3a2a;font-size:16px;margin:0 0 12px;">Message</h2>
    <p style="white-space:pre-wrap;color:#1a3a2a;font-size:14px;line-height:1.6;margin:0;">${escapeHtml(contact.message || "No message provided.")}</p>
  </div>
</body>
</html>`;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<ContactPayload> | null;

  const contact: ContactPayload = {
    name: normalizeString(body?.name),
    email: normalizeString(body?.email).toLowerCase(),
    phone: normalizeString(body?.phone),
    material: formatMaterial(normalizeString(body?.material)),
    deliveryAddress: normalizeString(body?.deliveryAddress),
    message: normalizeString(body?.message),
  };

  if (!contact.name) {
    return Response.json({ error: "Enter your name." }, { status: 400 });
  }

  if (!emailPattern.test(contact.email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!isValidUsPhone(contact.phone)) {
    return Response.json(
      { error: "Enter a valid 10-digit U.S. phone number." },
      { status: 400 },
    );
  }

  const result = await resend.emails.send({
    from: resendFromEmail,
    to: adminEmail,
    replyTo: contact.email,
    subject: `New contact request - ${contact.name}`,
    html: buildContactHtml(contact),
  });

  if (result.error) {
    return Response.json({ error: result.error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
