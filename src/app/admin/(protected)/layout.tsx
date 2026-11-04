import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { AdminNavigation } from "@/components/admin/admin-navigation";
import { getAdminNewOrdersCount } from "@/lib/data/admin";
import { getPendingReviewCount } from "@/lib/data/reviews";
import "../admin.css";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [{ user }, newOrderCount, pendingReviewCount] = await Promise.all([requireAdmin(), getAdminNewOrdersCount(), getPendingReviewCount()]);
  return <div className="admin-root"><a className="skip-link" href="#admin-content">Skip to admin content</a><div className="admin-layout">
    <aside className="admin-sidebar"><div className="admin-sidebar-top"><Link className="admin-brand" href="/admin/products">rag<span>N</span>ready</Link></div>
      <p className="admin-sidebar-label">Store management</p><AdminNavigation newOrderCount={newOrderCount} pendingReviewCount={pendingReviewCount} />
      <div className="admin-sidebar-bottom"><span className="admin-user-email">{user.email}</span><AdminLogoutButton /></div>
    </aside>
    <main className="admin-main" id="admin-content" tabIndex={-1}><div className="admin-content">{children}</div></main>
  </div></div>;
}
