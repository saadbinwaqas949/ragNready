import "server-only";
import { SITE_URL } from "@/lib/site";

export type NotificationItem = { title: string; size?: string | null; quantity: number; unit_price: number; line_total?: number };
export type NotificationOrder = { id: string; order_number: string; created_at: string; customer_name: string; phone: string; address: string; city: string; notes: string; total: number; order_items: NotificationItem[] };

let warnedMissingConfiguration = false;
const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

export async function sendOrderNotification(order: NotificationOrder) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!apiKey || !to) {
    if (!warnedMissingConfiguration) { console.warn("Order email skipped: RESEND_API_KEY or NOTIFY_EMAIL is not configured."); warnedMissingConfiguration = true; }
    return { sent: false as const, message: "Email settings are missing." };
  }
  try {
    const total = Number(order.total).toLocaleString("en-PK", { minimumFractionDigits: 2 });
    const pakistanTime = new Intl.DateTimeFormat("en-PK", { timeZone: "Asia/Karachi", dateStyle: "full", timeStyle: "short" }).format(new Date(order.created_at));
    const digits = order.phone.replace(/\D/g, "");
    const normalizedPhone = digits.startsWith("0") ? `92${digits.slice(1)}` : digits.startsWith("92") ? digits : `92${digits}`;
    const adminUrl = `${SITE_URL.replace(/\/$/, "")}/admin/orders/${encodeURIComponent(order.id)}`;
    const whatsAppText = encodeURIComponent(`Hi ${order.customer_name}, thank you for your ragNready order ${order.order_number}.`);
    const whatsAppUrl = `https://wa.me/${normalizedPhone}?text=${whatsAppText}`;
    const rows = (order.order_items ?? []).map((item) => `<tr><td style="padding:10px;border-bottom:1px solid #eee">${escapeHtml(item.title)}${item.size ? ` · ${escapeHtml(item.size)}` : ""}</td><td style="padding:10px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td><td style="padding:10px;border-bottom:1px solid #eee;text-align:right">Rs.${Number(item.unit_price).toLocaleString("en-PK")}</td></tr>`).join("");
    const subject = `New order #${order.order_number} - Rs.${total} - ${order.customer_name}`;
    const text = [`Order ${order.order_number}`, `Time: ${pakistanTime} (Pakistan time)`, `Customer: ${order.customer_name}`, `Phone: ${order.phone}`, `Address: ${order.address}`, `City: ${order.city}`, `Notes: ${order.notes || "None"}`, "Items:", ...(order.order_items ?? []).map((item) => `- ${item.title}${item.size ? ` (${item.size})` : ""} × ${item.quantity} — Rs.${Number(item.unit_price).toLocaleString("en-PK")}`), `Total: Rs.${total}`, "Payment: Cash on Delivery", `Open in admin: ${adminUrl}`, `WhatsApp the customer: ${whatsAppUrl}`].join("\n");
    const html = `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#24394c;line-height:1.55"><h1 style="font-size:22px">New order ${escapeHtml(order.order_number)}</h1><p>${escapeHtml(pakistanTime)} (Pakistan time)</p><p><strong>${escapeHtml(order.customer_name)}</strong><br>${escapeHtml(order.phone)}<br>${escapeHtml(order.address)}<br>${escapeHtml(order.city)}<br>Notes: ${escapeHtml(order.notes || "None")}</p><table style="width:100%;border-collapse:collapse"><thead><tr><th align="left">Product / size</th><th>Qty</th><th align="right">Price</th></tr></thead><tbody>${rows}</tbody></table><p style="text-align:right;font-size:18px"><strong>Total: Rs.${total}</strong></p><p>Payment: Cash on Delivery</p><p><a href="${escapeHtml(adminUrl)}" style="display:inline-block;padding:12px 18px;background:#315f7a;color:white;text-decoration:none;border-radius:6px">Open in admin</a> <a href="${escapeHtml(whatsAppUrl)}" style="display:inline-block;padding:12px 18px;background:#278b59;color:white;text-decoration:none;border-radius:6px">WhatsApp the customer</a></p></div>`;
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: "ragNready <onboarding@resend.dev>", to: [to], subject, html, text }) });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({})) as { message?: string };
      console.error("Resend order email failed:", payload.message || `HTTP ${response.status}`);
      return { sent: false as const, message: payload.message || `Resend returned HTTP ${response.status}.` };
    }
    return { sent: true as const, message: `Email sent to ${to}.` };
  } catch (error) {
    console.error("Order email could not be sent:", error instanceof Error ? error.message : "Unknown email error");
    return { sent: false as const, message: "Email could not be sent. Check the server logs." };
  }
}
