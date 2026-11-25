import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSiteSettings } from "@/lib/data";
import { SITE_CONTACT_FALLBACKS } from "@/lib/site";
import { formatPrice } from "@/lib/storefront/format";
import { whatsAppLink } from "@/lib/storefront/phone";
import { OrderProgress } from "@/components/storefront/order-progress";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false }, referrer: "no-referrer" };

type Item = { title: string; size: string | null; quantity: number; line_total: number };

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string }> }) {
  const [{ id }, { new: isNew }] = await Promise.all([params, searchParams]);
  if (!z.string().uuid().safeParse(id).success) notFound();
  const [{ data: order, error }, settings] = await Promise.all([
    // The address and contact details stay out of this page: the link may be shared.
    createSupabaseAdminClient().from("orders").select("id,order_number,customer_name,city,status,subtotal,total,created_at,order_items(title,size,quantity,line_total)").eq("id", id).maybeSingle(),
    getSiteSettings(),
  ]);
  if (error || !order) notFound();
  const items = (order.order_items ?? []) as Item[];
  const fee = Number(order.total) - Number(order.subtotal);
  const firstName = String(order.customer_name).trim().split(/\s+/)[0];
  const message = [`Hi ragNready! I just placed order ${order.order_number}.`, ...items.map((item) => `${item.quantity} x ${item.title}${item.size ? ` (${item.size})` : ""}`), `Total: ${formatPrice(Number(order.total))}`, "Please confirm it."].join("\n");
  const chat = whatsAppLink(settings?.whatsapp_number || SITE_CONTACT_FALLBACKS.whatsapp_number, isNew ? message : `Hi ragNready! I have a question about my order ${order.order_number}.`);

  return <main className="section page-narrow order-page">
    {isNew && <div className="order-tick" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" /><path d="m20 33 8.5 8.5L45 25" /></svg></div>}
    <h1 className="page-title">{isNew ? `Thank you, ${firstName}. Your order is in.` : `Order ${order.order_number}`}</h1>
    <p className="page-intro">{isNew ? "We will message you on WhatsApp to confirm delivery. You pay in cash when your parcel arrives." : `Placed on ${new Date(order.created_at).toLocaleDateString("en-PK", { dateStyle: "long", timeZone: "Asia/Karachi" })}, delivering to ${order.city}.`}</p>
    <OrderProgress status={order.status} />
    <section className="summary-card" aria-labelledby="receipt-title"><h2 id="receipt-title">{isNew ? `Order ${order.order_number}` : "Items"}</h2>
      <ul className="summary-lines">{items.map((item, index) => <li key={index}><span>{item.title}<small>{item.size ? `${item.size}, ` : ""}Qty {item.quantity}</small></span><strong>{formatPrice(Number(item.line_total))}</strong></li>)}</ul>
      <p className="total-row"><span>Delivery</span><span>{fee > 0 ? formatPrice(fee) : "Free"}</span></p>
      <p className="total-row total-row-grand"><span>Pay on delivery</span><strong>{formatPrice(Number(order.total))}</strong></p>
    </section>
    <div className="order-actions"><a className="button button-primary" href={chat} target="_blank" rel="noreferrer">{isNew ? "Confirm on WhatsApp" : "Ask about this order"}</a><Link className="button button-outline" href="/collections/all">Continue shopping</Link></div>
    {isNew && <p className="fine-print">Keep your order number, {order.order_number}. You can <Link className="stitch-link is-drawn" href="/track-order">track your order</Link> any time.</p>}
  </main>;
}
