import "server-only";

export type EmailMessage = { to: string; subject: string; html: string; text: string; replyTo?: string };

/**
 * Two ways to send, whichever is configured:
 *  1. SMTP_USER + SMTP_PASSWORD - any mailbox with an app password (Gmail by default). Can email anyone.
 *  2. RESEND_API_KEY - without EMAIL_FROM on a verified domain, Resend only delivers to its own account owner.
 */
export function emailConfigured() {
  return Boolean((process.env.SMTP_USER && process.env.SMTP_PASSWORD) || process.env.RESEND_API_KEY);
}

/** True when customers (not just the shop owner) can be emailed. */
export function canEmailCustomers() {
  return Boolean((process.env.SMTP_USER && process.env.SMTP_PASSWORD) || (process.env.RESEND_API_KEY && process.env.EMAIL_FROM));
}

/** Resend without a verified domain reaches only the Resend account owner, so it does not count. */
export const canEmailOwner = canEmailCustomers;

export async function sendEmail(message: EmailMessage): Promise<void> {
  const { SMTP_USER: user, SMTP_PASSWORD: pass, RESEND_API_KEY: resendKey } = process.env;
  if (user && pass) {
    const { createTransport } = await import("nodemailer");
    const port = Number(process.env.SMTP_PORT || 465);
    const transport = createTransport({ host: process.env.SMTP_HOST || "smtp.gmail.com", port, secure: port === 465, auth: { user, pass: pass.replace(/\s/g, "") }, connectionTimeout: 10_000, socketTimeout: 15_000 });
    await transport.sendMail({ from: process.env.EMAIL_FROM || `ragNready <${user}>`, to: message.to, subject: message.subject, html: message.html, text: message.text, replyTo: message.replyTo });
    return;
  }
  if (!resendKey) throw new Error("No email provider is configured.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM || "ragNready <onboarding@resend.dev>", to: [message.to], subject: message.subject, html: message.html, text: message.text, ...(message.replyTo ? { reply_to: message.replyTo } : {}) }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { message?: string };
    throw new Error(payload.message || `Resend returned HTTP ${response.status}.`);
  }
}
