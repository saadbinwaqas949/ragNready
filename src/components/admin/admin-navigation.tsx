"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [["Products", "/admin/products"], ["Collections", "/admin/collections"], ["Orders", "/admin/orders"], ["Messages", "/admin/messages"], ["Subscribers", "/admin/subscribers"], ["Site Settings", "/admin/settings"]] as const;

export function AdminNavigation() {
  const pathname = usePathname();

  return <nav className="admin-nav" aria-label="Admin navigation">{nav.map(([label, href]) => {
    const isRootLink = (href as string) === "/admin";
    const active = pathname === href || (!isRootLink && pathname.startsWith(`${href}/`));
    return <Link href={href} key={href} aria-current={active ? "page" : undefined} className={active ? "is-active" : undefined}>{label}</Link>;
  })}</nav>;
}
