import "server-only";
import { SITE_CONTACT_FALLBACKS, SITE_URL } from "@/lib/site";
import { formatPrice } from "@/lib/storefront/format";
import { whatsAppLink } from "@/lib/storefront/phone";
import { canEmailCustomers, emailConfigured, sendEmail } from "./email";
import { sendAdminWhatsApp, whatsAppConfigured } from "./whatsapp";

export type NotificationItem = { title: string; size?: string | null; quantity: number; unit_price: number; line_total?: number };
export type NotificationOrder = { id: string; order_number: string; created_at: string; customer_name: string; phone: string; email?: string | null; address: string; city: string; notes: string; subtotal?: number; delivery_fee?: number; total: number; order_items: NotificationItem[] };
export type ChannelResult = { channel: "email" | "whatsapp" | "customer-email"; sent: boolean; message: string };
export type OrderAlerts = { at: string; results: ChannelResult[] };

/** Short outages at the mail or WhatsApp provider should not lose an alert. */
async function withRetry(send: () => Promise<void>) {
  for (let attempt = 1; ; attempt++) {
    try { return await send(); }
    catch (error) {
      if (attempt === 3 || isPermanent(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }
}
const isPermanent = (error: unknown) => /verify a domain|testing emails|invalid|rejected|not configured|Username and Password/i.test(error instanceof Error ? error.message : "");

const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => entities[char]);
const reason = (error: unknown) => error instanceof Error ? error.message : "Unknown error";
const siteUrl = () => SITE_URL.replace(/\/$/, "");
const lineTotal = (item: NotificationItem) => Number(item.line_total ?? Number(item.unit_price) * item.quantity);
const itemName = (item: NotificationItem) => `${item.title}${item.size ? ` (${item.size})` : ""}`;
const itemLines = (order: NotificationOrder) => (order.order_items ?? []).map((item) => `${item.quantity} x ${itemName(item)}: ${formatPrice(lineTotal(item))}`);
const deliveryLabel = (order: NotificationOrder) => Number(order.delivery_fee ?? 0) > 0 ? formatPrice(Number(order.delivery_fee)) : "Free";

function itemsTable(order: NotificationOrder) {
  const cell = "padding:10px 0;border-bottom:1px solid #e8e4dc";
  const rows = (order.order_items ?? []).map((item) => `<tr><td style="${cell}">${escapeHtml(itemName(item))}<br><span style="color:#667587;font-size:13px">Qty ${item.quantity}</span></td><td style="${cell};text-align:right;vertical-align:top">${formatPrice(lineTotal(item))}</td></tr>`).join("");
  return `<table style="width:100%;border-collapse:collapse;margin:18px 0">${rows}<tr><td style="padding:10px 0;color:#667587">Delivery</td><td style="padding:10px 0;text-align:right">${deliveryLabel(order)}</td></tr><tr><td style="padding:6px 0;font-size:18px"><strong>Cash on delivery</strong></td><td style="padding:6px 0;text-align:right;font-size:18px"><strong>${formatPrice(Number(order.total))}</strong></td></tr></table>`;
}

function emailShell(body: string) {
  return `<div style="background:#faf8f4;padding:28px 14px;font-family:Arial,Helvetica,sans-serif;color:#1f3350;line-height:1.55"><div style="max-width:560px;margin:auto;background:#ffffff;border-radius:18px;padding:30px"><p style="margin:0 0 22px;font-size:22px;font-weight:bold;letter-spacing:-.04em">rag<span style="color:#2c6e9e">N</span>ready</p>${body}</div></div>`;
}

const button = (href: string, label: string, color: string) => `<a href="${escapeHtml(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 20px;border-radius:999px;background:${color};color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px">${label}</a>`;

function ownerEmail(order: NotificationOrder) {
  const placed = new Intl.DateTimeFormat("en-PK", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" }).format(new Date(order.created_at));
  const adminUrl = `${siteUrl()}/admin/orders/${encodeURIComponent(order.id)}`;
  const chatUrl = whatsAppLink(order.phone, `Hi ${order.customer_name}, thank you for your ragNready order ${order.order_number}. Can you please confirm it?`);
  const subject = `New order ${order.order_number}: ${formatPrice(Number(order.total))} from ${order.customer_name}`;
  const text = [`New order ${order.order_number}`, placed, "", `Name: ${order.customer_name}`, `WhatsApp: ${order.phone}`, `Email: ${order.email || "-"}`, `Address: ${order.address}, ${order.city}`, `Notes: ${order.notes || "-"}`, "", ...itemLines(order), `Delivery: ${deliveryLabel(order)}`, `Collect on delivery: ${formatPrice(Number(order.total))}`, "", `Open order: ${adminUrl}`, `WhatsApp customer: ${chatUrl}`].join("\n");
  const note = order.notes ? `<p style="margin:14px 0 0;padding:12px 14px;border-radius:12px;background:#f4efe4"><strong>Note:</strong> ${escapeHtml(order.notes)}</p>` : "";
  const html = emailShell(`<h1 style="font-size:22px;margin:0">New order ${escapeHtml(order.order_number)}</h1><p style="margin:4px 0 18px;color:#667587">${escapeHtml(placed)}</p><p style="margin:0"><strong>${escapeHtml(order.customer_name)}</strong><br>${escapeHtml(order.phone)}<br>${escapeHtml(order.email || "")}<br>${escapeHtml(order.address)}<br>${escapeHtml(order.city)}</p>${note}${itemsTable(order)}${button(adminUrl, "Open order", "#1f3350")}${button(chatUrl, "WhatsApp customer", "#1c7f4c")}`);
  return { subject, text, html };
}

function customerEmail(order: NotificationOrder) {
  const orderUrl = `${siteUrl()}/order/${encodeURIComponent(order.id)}`;
  const firstName = order.customer_name.trim().split(/\s+/)[0];
  const subject = `We received your order ${order.order_number}`;
  const next = "We will message you on WhatsApp to confirm delivery. You pay in cash when your parcel arrives.";
  const text = [`Thank you, ${firstName}. We received your ragNready order ${order.order_number}.`, next, "", ...itemLines(order), `Delivery: ${deliveryLabel(order)}`, `Total to pay on delivery: ${formatPrice(Number(order.total))}`, "", `View your order: ${orderUrl}`].join("\n");
  const html = emailShell(`<h1 style="font-size:24px;margin:0">Thank you, ${escapeHtml(firstName)}</h1><p>We received order <strong>${escapeHtml(order.order_number)}</strong>. ${next}</p>${itemsTable(order)}<p style="color:#667587">Delivering to ${escapeHtml(order.address)}, ${escapeHtml(order.city)}</p>${button(orderUrl, "View your order", "#1f3350")}`);
  return { subject, text, html };
}

/** Short on purpose: the full address stays in the email and admin, not in a third-party gateway. */
function whatsAppText(order: NotificationOrder) {
  return [`*New ragNready order ${order.order_number}*`, `${order.customer_name}, ${order.city}`, `WhatsApp: ${order.phone}`, "", ...(order.order_items ?? []).map((item) => `${item.quantity} x ${itemName(item)}`), "", `*Collect ${formatPrice(Number(order.total))}* (cash on delivery)`, `${siteUrl()}/admin/orders/${order.id}`].join("\n");
}

async function emailOwner(order: NotificationOrder): Promise<ChannelResult> {
  // Each address is sent separately so one rejected recipient cannot block the other.
  const recipients = [...new Set([process.env.ADMIN_EMAIL, process.env.NOTIFY_EMAIL].map((value) => value?.trim().toLowerCase()).filter((value): value is string => Boolean(value)))];
  if (!emailConfigured() || !recipients.length) return { channel: "email", sent: false, message: "Email is not set up: add ADMIN_EMAIL and an email provider." };
  const content = ownerEmail(order);
  const delivered: string[] = [], failed: string[] = [];
  await Promise.all(recipients.map(async (to) => {
    try { await withRetry(() => sendEmail({ to, ...content, ...(order.email ? { replyTo: order.email } : {}) })); delivered.push(to); }
    catch (error) { failed.push(`${to}: ${reason(error)}`); }
  }));
  if (failed.length) console.error(`Order email was not delivered to ${failed.length} of ${recipients.length} addresses.`);
  return { channel: "email", sent: failed.length === 0, message: [delivered.length ? `Email sent to ${delivered.join(", ")}.` : "", failed.length ? `Not delivered to ${failed.join("; ")}` : ""].filter(Boolean).join(" ") };
}

async function emailCustomer(order: NotificationOrder): Promise<ChannelResult> {
  if (!order.email || !canEmailCustomers()) return { channel: "customer-email", sent: false, message: "Customer email skipped." };
  try {
    await sendEmail({ to: order.email, ...customerEmail(order), replyTo: process.env.ADMIN_EMAIL || SITE_CONTACT_FALLBACKS.email });
    return { channel: "customer-email", sent: true, message: "Customer email sent." };
  } catch (error) {
    console.error("Customer email failed:", reason(error));
    return { channel: "customer-email", sent: false, message: reason(error) };
  }
}

async function whatsAppOwner(order: NotificationOrder): Promise<ChannelResult> {
  if (!whatsAppConfigured()) return { channel: "whatsapp", sent: false, message: "WhatsApp alerts are not set up: add WHATSAPP_NOTIFY_NUMBER and CALLMEBOT_API_KEY." };
  try { await withRetry(() => sendAdminWhatsApp(whatsAppText(order))); return { channel: "whatsapp", sent: true, message: "WhatsApp message sent." }; }
  catch (error) { console.error("Order WhatsApp failed:", reason(error)); return { channel: "whatsapp", sent: false, message: `WhatsApp failed: ${reason(error)}` }; }
}

/** Never throws: an alert problem must not affect an order that is already saved. */
export async function sendOrderNotifications(order: NotificationOrder, options: { includeCustomer?: boolean } = {}) {
  return Promise.all([emailOwner(order), whatsAppOwner(order), ...(options.includeCustomer ? [emailCustomer(order)] : [])]);
}
