import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminOrder } from "@/lib/data/admin";
import { OrderStatusControl } from "@/components/admin/order-status-control";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();
  const phoneDigits = String(order.phone).replace(/\D/g, "");
  const phone = phoneDigits.startsWith("0") ? `92${phoneDigits.slice(1)}` : phoneDigits.startsWith("92") ? phoneDigits : `92${phoneDigits}`;
  return <><div className="admin-page-heading"><div><h1>Order {order.order_number}</h1><p>Placed {new Date(order.created_at).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}</p></div><Link className="admin-button" href="/admin/orders">Back to orders</Link></div>
    <div className="admin-order-summary"><div className="admin-stat"><span>Customer</span><strong>{order.customer_name}</strong></div><div className="admin-stat"><span>Total</span><strong>Rs.{Number(order.total).toLocaleString("en-PK", { minimumFractionDigits: 2 })}</strong></div><div className="admin-stat"><span>Status</span><strong>{order.status}</strong></div></div>
    <section className="admin-card" style={{ marginBottom: 18 }}><h2 style={{ marginTop: 0, fontSize: 18 }}>Delivery details</h2><p>{order.phone}{order.email ? ` · ${order.email}` : ""}</p><p>{order.address}, {order.city}</p>{order.notes && <p>Notes: {order.notes}</p>}<div className="admin-inline-actions"><a className="admin-button" href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">Message customer on WhatsApp</a><OrderStatusControl id={order.id} status={order.status} /></div></section>
    <section className="admin-card"><h2 style={{ marginTop: 0, fontSize: 18 }}>Items</h2><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Size</th><th>Qty</th><th>Unit price</th><th>Total</th></tr></thead><tbody>{order.order_items?.map((item: { id: string; title: string; size: string | null; quantity: number; unit_price: number; line_total: number }) => <tr key={item.id}><td>{item.title}</td><td>{item.size ?? "—"}</td><td>{item.quantity}</td><td>Rs.{Number(item.unit_price).toFixed(2)}</td><td>Rs.{Number(item.line_total).toFixed(2)}</td></tr>)}</tbody></table></div></section>
  </>;
}
