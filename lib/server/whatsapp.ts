import "server-only";
import { phoneDigits } from "@/lib/storefront/phone";

const adminNumber = () => phoneDigits(process.env.WHATSAPP_NOTIFY_NUMBER || "");

export function whatsAppConfigured() {
  if (!adminNumber()) return false;
  return Boolean((process.env.WHATSAPP_CLOUD_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) || process.env.CALLMEBOT_API_KEY);
}

/**
 * Messages the shop owner's own WhatsApp.
 *  1. WHATSAPP_CLOUD_TOKEN + WHATSAPP_PHONE_NUMBER_ID - Meta's official API, using an approved
 *     template (WHATSAPP_TEMPLATE, default "new_order") with one body variable.
 *  2. CALLMEBOT_API_KEY - free personal gateway; see README for the two-minute activation.
 */
export async function sendAdminWhatsApp(text: string): Promise<void> {
  const to = adminNumber();
  if (!to) throw new Error("WHATSAPP_NOTIFY_NUMBER is not set.");
  const { WHATSAPP_CLOUD_TOKEN: token, WHATSAPP_PHONE_NUMBER_ID: phoneId, CALLMEBOT_API_KEY: callMeBotKey } = process.env;
  if (token && phoneId) {
    // Template variables cannot contain line breaks.
    const parameter = text.replace(/\s*\n+\s*/g, " | ").slice(0, 1000);
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
    return;
  }
  if (!callMeBotKey) throw new Error("No WhatsApp provider is configured.");
  const query = new URLSearchParams({ phone: `+${to}`, text, apikey: callMeBotKey });
  const response = await fetch(`https://api.callmebot.com/whatsapp.php?${query}`, { signal: AbortSignal.timeout(20_000) });
  const body = await response.text();
  // CallMeBot can answer 200 with an error message in the page.
  if (!response.ok || /apikey is invalid|\berror\b/i.test(body)) throw new Error(`CallMeBot rejected the message (HTTP ${response.status}).`);
}
