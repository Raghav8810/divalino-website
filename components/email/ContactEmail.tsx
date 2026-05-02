import * as React from "react";

/* ------------------------------------------------------------------
 * Shared brand tokens — inlined because email clients strip <style>.
 * These mirror the Divalino palette from globals.css.
 * ------------------------------------------------------------------ */
const BRAND = {
  gold: "#8a6f3f",
  goldLight: "#b89656",
  goldPale: "#f1e8d2",
  ivory: "#faf6ee",
  sand: "#ebe2d4",
  sandBorder: "#d9cfbe",
  ink: "#1a1613",
  taupe: "#6b6258",
  white: "#ffffff",
} as const;

/* ------------------------------------------------------------------
 * Shared wrapper — centers content, sets max-width, adds the ivory
 * background strip so the email feels like a boutique card even in
 * Gmail's white chrome.
 * ------------------------------------------------------------------ */
function EmailShell({
  previewText,
  children,
}: {
  previewText: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: "#f4f0ea",
        margin: 0,
        padding: "40px 16px",
        fontFamily:
          "'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
        WebkitTextSizeAdjust: "100%",
      }}
    >
      {/* Preview text — visible in inbox list, hidden in body */}
      <div
        style={{
          display: "none",
          overflow: "hidden",
          lineHeight: "1px",
          opacity: 0,
          maxHeight: 0,
          maxWidth: 0,
        }}
      >
        {previewText}
      </div>

      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        style={{
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: BRAND.white,
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <tbody>
          <tr>
            <td style={{ padding: 0 }}>{children}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------
 * Brand header strip — gold bar + wordmark.
 * ------------------------------------------------------------------ */
function BrandHeader({ subtitle }: { subtitle?: string }) {
  return (
    <>
      {/* Gold accent bar */}
      <div style={{ height: "4px", backgroundColor: BRAND.gold }} />
      <div
        style={{
          padding: "32px 40px 24px",
          borderBottom: `1px solid ${BRAND.sandBorder}`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "3px",
            textTransform: "uppercase" as const,
            color: BRAND.ink,
          }}
        >
          Divalino
        </p>
        {subtitle && (
          <p
            style={{
              margin: "6px 0 0",
              fontSize: "11px",
              letterSpacing: "1.5px",
              textTransform: "uppercase" as const,
              color: BRAND.taupe,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------
 * Brand footer — tagline + muted legal line.
 * ------------------------------------------------------------------ */
function BrandFooter() {
  return (
    <div
      style={{
        padding: "24px 40px 32px",
        borderTop: `1px solid ${BRAND.sandBorder}`,
        backgroundColor: BRAND.ivory,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "10px",
          letterSpacing: "2.5px",
          textTransform: "uppercase" as const,
          color: BRAND.taupe,
          textAlign: "center" as const,
        }}
      >
        Considered Design · Made to Last
      </p>
    </div>
  );
}

/* ==================================================================
 * 1. OWNER NOTIFICATION — all form data, clean & scannable.
 * ================================================================== */
interface ContactEmailProps {
  name: string;
  email: string;
  mobile: string;
  state: string;
  summary: string;
}

export const OwnerNotificationEmail: React.FC<
  Readonly<ContactEmailProps>
> = ({ name, email, mobile, state, summary }) => {
  const timestamp = new Date().toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const rows: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Mobile", mobile || "—"],
    ["State", state || "—"],
  ];

  return (
    <EmailShell previewText={`New inquiry from ${name} — ${summary.slice(0, 80)}`}>
      <BrandHeader subtitle="New Contact Inquiry" />

      {/* Intro */}
      <div style={{ padding: "32px 40px 0" }}>
        <p
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: 300,
            lineHeight: 1.35,
            color: BRAND.ink,
          }}
        >
          New message from <strong style={{ fontWeight: 600 }}>{name}</strong>
        </p>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: "12px",
            color: BRAND.taupe,
            letterSpacing: "0.5px",
          }}
        >
          Received {timestamp}
        </p>
      </div>

      {/* Data table */}
      <div style={{ padding: "24px 40px" }}>
        <table
          role="presentation"
          cellPadding={0}
          cellSpacing={0}
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}>
                <td
                  style={{
                    padding: "12px 0",
                    borderBottom: `1px solid ${BRAND.sandBorder}`,
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase" as const,
                    color: BRAND.taupe,
                    width: "100px",
                    verticalAlign: "top",
                  }}
                >
                  {label}
                </td>
                <td
                  style={{
                    padding: "12px 0",
                    borderBottom: `1px solid ${BRAND.sandBorder}`,
                    fontSize: "15px",
                    color: BRAND.ink,
                    lineHeight: 1.5,
                  }}
                >
                  {label === "Email" ? (
                    <a
                      href={`mailto:${value}`}
                      style={{ color: BRAND.gold, textDecoration: "none" }}
                    >
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Message */}
      <div style={{ padding: "0 40px 32px" }}>
        <p
          style={{
            margin: "0 0 10px",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase" as const,
            color: BRAND.taupe,
          }}
        >
          Message
        </p>
        <div
          style={{
            padding: "20px 24px",
            backgroundColor: BRAND.ivory,
            borderLeft: `3px solid ${BRAND.gold}`,
            borderRadius: "0 4px 4px 0",
            fontSize: "14px",
            lineHeight: 1.7,
            color: BRAND.ink,
            whiteSpace: "pre-wrap" as const,
          }}
        >
          {summary}
        </div>
      </div>

      {/* Quick-reply CTA */}
      <div style={{ padding: "0 40px 36px", textAlign: "center" as const }}>
        <a
          href={`mailto:${email}?subject=Re: Your inquiry to The Divalino`}
          style={{
            display: "inline-block",
            padding: "12px 36px",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "2px",
            textTransform: "uppercase" as const,
            textDecoration: "none",
            color: BRAND.white,
            backgroundColor: BRAND.ink,
            borderRadius: "100px",
          }}
        >
          Reply to {name.split(" ")[0]} →
        </a>
      </div>

      <BrandFooter />
    </EmailShell>
  );
};

/* ==================================================================
 * 2. USER THANK-YOU — editorial, warm, brand-feeling.
 * ================================================================== */
export const UserThankYouEmail: React.FC<
  Readonly<{ name: string; summary: string }>
> = ({ name, summary }) => {
  return (
    <EmailShell previewText={`Thank you, ${name} — we've received your message.`}>
      <BrandHeader />

      {/* Hero block */}
      <div
        style={{
          padding: "48px 40px 8px",
          textAlign: "center" as const,
        }}
      >
        {/* Decorative gold dash */}
        <div
          style={{
            display: "inline-block",
            width: "48px",
            height: "2px",
            backgroundColor: BRAND.gold,
            marginBottom: "28px",
          }}
        />
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: 300,
            lineHeight: 1.3,
            color: BRAND.ink,
          }}
        >
          Thank you,{" "}
          <strong style={{ fontWeight: 600 }}>{name.split(" ")[0]}</strong>.
        </h1>
      </div>

      {/* Body copy */}
      <div style={{ padding: "20px 40px 0" }}>
        <p
          style={{
            margin: 0,
            fontSize: "15px",
            lineHeight: 1.75,
            color: BRAND.ink,
            textAlign: "center" as const,
          }}
        >
          We have received your message and a member of our team will be in
          touch shortly. We appreciate you reaching out.
        </p>
      </div>

      {/* Summary echo */}
      <div style={{ padding: "28px 40px 36px" }}>
        <p
          style={{
            margin: "0 0 12px",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "2px",
            textTransform: "uppercase" as const,
            color: BRAND.taupe,
            textAlign: "center" as const,
          }}
        >
          Your message
        </p>
        <div
          style={{
            padding: "20px 24px",
            backgroundColor: BRAND.ivory,
            border: `1px solid ${BRAND.sandBorder}`,
            borderRadius: "6px",
            fontSize: "14px",
            lineHeight: 1.7,
            color: BRAND.taupe,
            fontStyle: "italic" as const,
            whiteSpace: "pre-wrap" as const,
          }}
        >
          &ldquo;{summary}&rdquo;
        </div>
      </div>

      {/* Warm sign-off */}
      <div
        style={{
          padding: "0 40px 40px",
          textAlign: "center" as const,
        }}
      >
        <div
          style={{
            display: "inline-block",
            width: "28px",
            height: "1px",
            backgroundColor: BRAND.sandBorder,
            marginBottom: "20px",
          }}
        />
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            lineHeight: 1.7,
            color: BRAND.ink,
          }}
        >
          With warm regards,
        </p>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "14px",
            fontWeight: 600,
            color: BRAND.ink,
          }}
        >
          The Divalino Team
        </p>
      </div>

      <BrandFooter />
    </EmailShell>
  );
};
