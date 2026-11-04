"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SHOW_REVIEWS } from "@/lib/site-config";

const nav = [["Dashboard", "/admin"], ["Products", "/admin/products"], ["Collections", "/admin/collections"], ["Orders", "/admin/orders"], ["Reviews", "/admin/reviews"], ["Messages", "/admin/messages"], ["Subscribers", "/admin/subscribers"], ["Site Settings", "/admin/settings"]] as const;

export function AdminNavigation({ newOrderCount = 0, pendingReviewCount = 0 }: { newOrderCount?: number; pendingReviewCount?: number }) {
  const pathname = usePathname();

  return <nav className="admin-nav" aria-label="Admin navigation">{nav.filter(([label]) => label !== "Reviews" || SHOW_REVIEWS).map(([label, href]) => {
    const isRootLink = (href as string) === "/admin";
    const active = isRootLink ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
    return <Link href={href} key={href} aria-current={active ? "page" : undefined} className={active ? "is-active" : undefined}>{label}{label === "Orders" && newOrderCount > 0 && <span className="admin-nav-count" aria-label={`${newOrderCount} new orders`}>{newOrderCount}</span>}{label === "Reviews" && pendingReviewCount > 0 && <span className="admin-nav-count" aria-label={`${pendingReviewCount} pending reviews`}>{pendingReviewCount}</span>}</Link>;
  })}</nav>;
}
