import Link from "next/link";
import { getAdminNewOrdersCount } from "@/lib/data/admin";

export default async function AdminIndexPage() {
  const newOrderCount = await getAdminNewOrdersCount();
  return <><div className="admin-page-heading"><div><h1>Dashboard</h1><p>A quick look at today’s store activity.</p></div></div><div className="admin-card admin-dashboard-card"><div><span>New orders</span><strong>{newOrderCount}</strong></div><Link className="admin-button admin-button-primary" href="/admin/orders">View orders</Link></div></>;
}
