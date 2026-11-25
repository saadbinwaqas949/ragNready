import { canEmailOwner } from "@/lib/server/email";
import { whatsAppConfigured } from "@/lib/server/whatsapp";

/** Tells the owner which order alerts cannot reach them yet, and what to add. */
export function AlertSetup() {
  const missing = [
    canEmailOwner() ? "" : "Email: add SMTP_USER and SMTP_PASSWORD (a Gmail app password) so alerts reach ADMIN_EMAIL.",
    whatsAppConfigured() ? "" : "WhatsApp: add CALLMEBOT_API_KEY so alerts reach your phone.",
  ].filter(Boolean);
  if (!missing.length) return null;
  return <div className="admin-card admin-setup" role="status"><h2>Order alerts are not fully set up</h2><ul>{missing.map((item) => <li key={item}>{item}</li>)}</ul><p>Add these to the server settings and restart. The README has the steps.</p></div>;
}
