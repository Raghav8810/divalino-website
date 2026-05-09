import { Resend } from "resend";
import { NextResponse } from "next/server";

// ✅ NO special runtime export needed here.
// We use @opennextjs/cloudflare which runs Next.js on Cloudflare Workers
// using the full Node.js runtime — so your API route works exactly as it
// does locally. No changes needed to this file!

const resend = new Resend(process.env.RESEND_API_KEY);

/* ------------------------------------------------------------------
 * Config — update FROM_ADDRESS once divalino.com is verified on Resend
 * ------------------------------------------------------------------ */
const OWNER_EMAIL = "thedivalino@gmail.com";
const FROM_ADDRESS = "Atelier <onboarding@resend.dev>";
// After domain verified, switch to:
// const FROM_ADDRESS = "The Atelier <hello@divalino.com>";

/* ------------------------------------------------------------------
 * Brand palette (mirrored here for inline email styles)
 * ------------------------------------------------------------------ */
const B = {
  gold:       "#8a6f3f",
  ivory:      "#faf6ee",
  sand:       "#ebe2d4",
  sandBorder: "#d9cfbe",
  ink:        "#1a1613",
  taupe:      "#6b6258",
  white:      "#ffffff",
  bg:         "#f4f0ea",
};

/* ------------------------------------------------------------------
 * Email: Owner notification (all contact details)
 * ------------------------------------------------------------------ */
function ownerHtml(p: {
  name: string; email: string; mobile: string; state: string; summary: string;
}): string {
  const timestamp = new Date().toLocaleString("en-US", {
    dateStyle: "long", timeStyle: "short",
  });

  const rows = [
    ["Name",   p.name],
    ["Email",  p.email],
    ["Mobile", p.mobile || "—"],
    ["State",  p.state  || "—"],
  ];

  const tableRows = rows.map(([label, val]) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${B.sandBorder};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${B.taupe};width:90px;vertical-align:top;">${label}</td>
      <td style="padding:12px 0;border-bottom:1px solid ${B.sandBorder};font-size:15px;color:${B.ink};line-height:1.5;">
        ${label === "Email" ? `<a href="mailto:${val}" style="color:${B.gold};text-decoration:none;">${val}</a>` : val}
      </td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New Contact</title></head>
<body style="margin:0;padding:40px 16px;background:${B.bg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;margin:0 auto;background:${B.white};border-radius:2px;overflow:hidden;">
    <tbody>
      <tr><td style="padding:0;">

        <!-- Gold bar -->
        <div style="height:4px;background:${B.gold};"></div>

        <!-- Header -->
        <div style="padding:32px 40px 24px;border-bottom:1px solid ${B.sandBorder};">
          <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${B.ink};">THE ATELIER</p>
          <p style="margin:6px 0 0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${B.taupe};">New Contact Inquiry</p>
        </div>

        <!-- Intro -->
        <div style="padding:32px 40px 0;">
          <p style="margin:0;font-size:22px;font-weight:300;line-height:1.35;color:${B.ink};">New message from <strong style="font-weight:700;">${p.name}</strong></p>
          <p style="margin:8px 0 0;font-size:12px;color:${B.taupe};">Received ${timestamp}</p>
        </div>

        <!-- Data table -->
        <div style="padding:24px 40px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
            <tbody>${tableRows}</tbody>
          </table>
        </div>

        <!-- Message -->
        <div style="padding:0 40px 32px;">
          <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${B.taupe};">Message</p>
          <div style="padding:20px 24px;background:${B.ivory};border-left:3px solid ${B.gold};border-radius:0 4px 4px 0;font-size:14px;line-height:1.7;color:${B.ink};white-space:pre-wrap;">${p.summary}</div>
        </div>

        <!-- CTA -->
        <div style="padding:0 40px 36px;text-align:center;">
          <a href="mailto:${p.email}?subject=Re: Your inquiry to The Atelier" style="display:inline-block;padding:12px 36px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;color:${B.white};background:${B.ink};border-radius:100px;">Reply to ${p.name.split(" ")[0]} →</a>
        </div>

        <!-- Footer -->
        <div style="padding:24px 40px 32px;border-top:1px solid ${B.sandBorder};background:${B.ivory};">
          <p style="margin:0;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:${B.taupe};text-align:center;">Considered Design · Made to Last</p>
        </div>

      </td></tr>
    </tbody>
  </table>
</body>
</html>`;
}

/* ------------------------------------------------------------------
 * Email: User thank-you (editorial, warm)
 * ------------------------------------------------------------------ */
function userHtml(p: { name: string; summary: string }): string {
  const firstName = p.name.split(" ")[0];
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Thank you</title></head>
<body style="margin:0;padding:40px 16px;background:${B.bg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;margin:0 auto;background:${B.white};border-radius:2px;overflow:hidden;">
    <tbody>
      <tr><td style="padding:0;">

        <!-- Gold bar -->
        <div style="height:4px;background:${B.gold};"></div>

        <!-- Header -->
        <div style="padding:32px 40px 24px;border-bottom:1px solid ${B.sandBorder};">
          <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${B.ink};">THE ATELIER</p>
        </div>

        <!-- Hero -->
        <div style="padding:48px 40px 8px;text-align:center;">
          <div style="display:inline-block;width:48px;height:2px;background:${B.gold};margin-bottom:28px;"></div>
          <h1 style="margin:0;font-size:28px;font-weight:300;line-height:1.3;color:${B.ink};">Thank you, <strong style="font-weight:700;">${firstName}</strong>.</h1>
        </div>

        <!-- Body -->
        <div style="padding:20px 40px 0;">
          <p style="margin:0;font-size:15px;line-height:1.75;color:${B.ink};text-align:center;">We have received your message and a member of our team will be in touch shortly. We appreciate you reaching out.</p>
        </div>

        <!-- Message echo -->
        <div style="padding:28px 40px 36px;">
          <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${B.taupe};text-align:center;">Your message</p>
          <div style="padding:20px 24px;background:${B.ivory};border:1px solid ${B.sandBorder};border-radius:6px;font-size:14px;line-height:1.7;color:${B.taupe};font-style:italic;white-space:pre-wrap;">&ldquo;${p.summary}&rdquo;</div>
        </div>

        <!-- Sign-off -->
        <div style="padding:0 40px 40px;text-align:center;">
          <p style="margin:0;font-size:14px;line-height:1.7;color:${B.ink};">With warm regards,</p>
          <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:${B.ink};">The Atelier Team</p>
        </div>

        <!-- Footer -->
        <div style="padding:24px 40px 32px;border-top:1px solid ${B.sandBorder};background:${B.ivory};">
          <p style="margin:0;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:${B.taupe};text-align:center;">Considered Design · Made to Last</p>
        </div>

      </td></tr>
    </tbody>
  </table>
</body>
</html>`;
}

/* ------------------------------------------------------------------
 * API Route
 * ------------------------------------------------------------------ */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, mobile, state, summary } = body;

    /* ---- Basic validation ---- */
    if (!name?.trim() || !email?.trim() || !summary?.trim()) {
      return NextResponse.json(
        { error: "Name, email, and summary are required." },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 },
      );
    }

    /* ---- Send both emails concurrently ---- */
    const results = await Promise.allSettled([
      // 1. Owner notification — always works with free tier
      resend.emails.send({
        from: FROM_ADDRESS,
        to: [OWNER_EMAIL],
        subject: `New Contact: ${name}`,
        html: ownerHtml({ name, email, mobile, state, summary }),
      }),

      // 2. User thank-you — works after divalino.com domain is verified
      resend.emails.send({
        from: FROM_ADDRESS,
        to: email,
        subject: "Thank you for contacting The Atelier",
        html: userHtml({ name, summary }),
      }),
    ]);

    // Primary email must succeed
    if (results[0].status === "rejected") {
      console.error("Owner email failed:", results[0].reason);
      throw new Error("Failed to deliver notification email.");
    }

    // User email failure is non-blocking (expected on free tier)
    if (results[1].status === "rejected") {
      console.warn("User thank-you email failed:", (results[1] as PromiseRejectedResult).reason);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Failed to send email. Please try again later." },
      { status: 500 },
    );
  }
}
