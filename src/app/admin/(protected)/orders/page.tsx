import Link from "next/link";
import { getAdminOrders } from "@/lib/data/admin";
import { OrderStatusControl } from "@/components/admin/order-status-control";

export default async function OrdersPage() {
  const orders = await getAdminOrders();
  return <><div className="admin-page-heading"><div><h1>Orders</h1><p>Review cash-on-delivery orders and update their progress.</p></div></div>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Details</th></tr></thead><tbody>
      {orders.map((order) => <tr key={order.id}><td>{order.order_number}</td><td>{order.customer_name}<div className="admin-product-handle">{order.phone}</div></td><td>{new Date(order.created_at).toLocaleDateString("en-PK", { dateStyle: "medium" })}</td><td>Rs.{Number(order.total).toLocaleString("en-PK", { minimumFractionDigits: 2 })}</td><td><OrderStatusControl id={order.id} status={order.status} /></td><td><Link className="admin-button" href={`/admin/orders/${order.id}`}>View</Link></td></tr>)}
      {orders.length === 0 && <tr><td className="admin-empty" colSpan={6}>No orders yet.</td></tr>}
    </tbody></table></div>
  </>;
}
