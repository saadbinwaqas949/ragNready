import "server-only";
import { phoneDigits } from "@/lib/storefront/phone";

const adminNumber = () => phoneDigits(process.env.WHATSAPP_NOTIFY_NUMBER || "");

export function whatsAppConfigured() {
  return Boolean(adminNumber() && process.env.WHATSAPP_CLOUD_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

/**
 * Messages the shop owner's own WhatsApp through Meta's WhatsApp Cloud API. Meta's test number can
 * message a short list of verified phones, which is all an owner alert needs (see README).
 * Uses an approved template (WHATSAPP_TEMPLATE, default "new_order") with one body variable.
 */
export async function sendAdminWhatsApp(text: string): Promise<void> {
  const { WHATSAPP_CLOUD_TOKEN: token, WHATSAPP_PHONE_NUMBER_ID: phoneId } = process.env;
  const to = adminNumber();
  if (!to || !token || !phoneId) throw new Error("WhatsApp is not configured.");
  // Template variables cannot contain line breaks, tabs or long runs of spaces.
  const parameter = text.replace(/\s*\n+\s*/g, " | ").replace(/\s{2,}/g, " ").slice(0, 900);
  const response = await fetch(`https://graph.facebook.com/v23.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp", to, type: "template",
      template: { name: process.env.WHATSAPP_TEMPLATE || "new_order", language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en" }, components: [{ type: "body", parameters: [{ type: "text", text: parameter }] }] },
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(payload.error?.message || `WhatsApp returned HTTP ${response.status}.`);
  }
}
