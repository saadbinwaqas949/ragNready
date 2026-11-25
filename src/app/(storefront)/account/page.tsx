import type { Metadata } from "next";
import Link from "next/link";
import { GoogleSignIn, SignOutButton } from "@/components/storefront/account-controls";
import { statusLabel } from "@/components/storefront/order-progress";
import { TrackOrderForm } from "@/components/storefront/track-order-form";
import { formatPrice } from "@/lib/storefront/format";
import { safeNextPath } from "@/lib/storefront/safe-path";
import { googleSignInEnabled } from "@/lib/supabase/auth-providers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };

async function loadAccount() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: orders, error } = await supabase.from("orders").select("id,order_number,status,total,created_at,order_items(title,quantity)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    return { user, orders: orders ?? [], failed: Boolean(error) };
  } catch { return null; }
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ next?: string | string[]; error?: string }> }) {
  const params = await searchParams;
  const account = await loadAccount();
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);

  if (!account) {
    const google = await googleSignInEnabled();
    return <main className="section page-narrow"><h1 className="page-title">{google ? "Sign in" : "Find your order"}</h1>
      <p className="page-intro">{google ? "An account is optional. It keeps your orders and wishlist together on every device." : "You do not need an account to shop with us. Look up any order here."}</p>
      {params.error === "signin" && <p className="form-alert" role="alert">Google sign-in did not finish. Please try again.</p>}
      {google && <><GoogleSignIn next={next} /><p className="divider"><span>or track an order without signing in</span></p></>}
      <TrackOrderForm />
      {next === "/checkout" && <p className="fine-print"><Link className="stitch-link is-drawn" href="/checkout">Continue as a guest</Link></p>}
    </main>;
  }

  const name = String(account.user.user_metadata?.full_name ?? "").trim().split(/\s+/)[0];
  return <main className="section page-narrow"><div className="account-head"><div><h1 className="page-title">{name ? `Hello, ${name}` : "Your account"}</h1><p className="page-intro">{account.user.email}</p></div><SignOutButton /></div>
    <section aria-labelledby="orders-title"><h2 id="orders-title" className="block-title">Your orders</h2>
      {account.failed ? <p className="form-alert">Your orders could not be loaded. Refresh the page to try again.</p> : account.orders.length === 0
        ? <div className="empty-state"><p>Orders you place while signed in appear here.</p><Link className="button button-primary" href="/collections/all">Shop the collection</Link></div>
        : <ul className="order-list">{account.orders.map((order) => <li key={order.id}><Link href={`/order/${order.id}`}><span><strong>{order.order_number}</strong><small>{new Date(order.created_at).toLocaleDateString("en-PK", { dateStyle: "medium", timeZone: "Asia/Karachi" })}, {(order.order_items as { title: string; quantity: number }[]).reduce((sum, item) => sum + item.quantity, 0)} items</small></span><span className={`status status-${order.status}`}>{statusLabel(order.status)}</span><strong>{formatPrice(Number(order.total))}</strong></Link></li>)}</ul>}
    </section>
    <p className="fine-print"><Link className="stitch-link is-drawn" href="/pages/wishlist">Open your wishlist</Link></p>
  </main>;
}
