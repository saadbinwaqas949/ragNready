import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import "../admin.css";

export const metadata = { robots: { index: false, follow: false } };

const nav = [["Products", "/admin/products"], ["Collections", "/admin/collections"], ["Orders", "/admin/orders"], ["Messages", "/admin/messages"], ["Subscribers", "/admin/subscribers"], ["Site Settings", "/admin/settings"]] as const;

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user } = await requireAdmin();
  return <div className="admin-root"><a className="skip-link" href="#admin-content">Skip to admin content</a><div className="admin-layout">
    <aside className="admin-sidebar"><div className="admin-sidebar-top"><Link className="admin-brand" href="/admin/products">rag<span>N</span>ready</Link></div>
      <p className="admin-sidebar-label">Store management</p><nav className="admin-nav" aria-label="Admin navigation">{nav.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</nav>
      <div className="admin-sidebar-bottom"><span className="admin-user-email">{user.email}</span><AdminLogoutButton /></div>
    </aside>
    <main className="admin-main" id="admin-content" tabIndex={-1}><div className="admin-content">{children}</div></main>
  </div></div>;
}
