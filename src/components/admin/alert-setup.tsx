import { canEmailOwner } from "@/lib/server/email";
import { whatsAppConfigured } from "@/lib/server/whatsapp";

/** Tells the owner which order alerts cannot reach them yet, and what to add. */
export function AlertSetup() {
  const missing = [
    canEmailOwner() ? "" : "Email: alerts reach NOTIFY_EMAIL only, and customers get no confirmation email. Verify your domain in Resend and set EMAIL_FROM.",
    whatsAppConfigured() ? "" : "WhatsApp: no alerts yet. Add the WhatsApp Cloud API settings.",
  ].filter(Boolean);
  if (!missing.length) return null;
  return <div className="admin-card admin-setup" role="status"><h2>Optional order alert setup</h2><ul>{missing.map((item) => <li key={item}>{item}</li>)}</ul><p>Add these to the server settings and restart. The README has the steps.</p></div>;
}
