import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/storefront/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order received", robots: { index: false, follow: false } };

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const supabase = createSupabaseAdminClient();
  const { data: order, error } = await supabase.from("orders").select("id,order_number,total,created_at,order_items(title,size,quantity,unit_price,line_total)").eq("id", id).maybeSingle();
  if (error || !order) notFound();
  const items = (order.order_items ?? []) as { title: string; size: string | null; quantity: number; unit_price: number; line_total: number }[];
  return <main className="section order-confirmation"><div className="order-confirmation-mark" aria-hidden="true">✓</div><p className="eyebrow">a little moment to celebrate</p><h1 className="section-heading">Thank you, your order is in.</h1><p className="section-subtitle">We’ll be in touch to confirm delivery details. You can pay by cash when your parcel arrives.</p>
    <section className="order-receipt" aria-labelledby="receipt-title"><h2 id="receipt-title">Order {order.order_number}</h2><p className="receipt-date">Placed {new Date(order.created_at).toLocaleDateString("en-PK", { dateStyle: "long" })}</p><ul>{items.map((item, index) => <li key={`${item.title}-${index}`}><span>{item.title}{item.size && <small>Size: {item.size}</small>}<small>Qty {item.quantity}</small></span><strong>{formatPrice(Number(item.line_total))}</strong></li>)}</ul><p className="checkout-total"><span>Total due on delivery</span><strong>{formatPrice(Number(order.total))}</strong></p></section>
    <Link className="button-primary" href="/collections/all">Continue exploring</Link>
  </main>;
}
