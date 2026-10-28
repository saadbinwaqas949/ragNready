import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default function NotFound() {
  return <main className="not-found-page"><div className="not-found-art" aria-hidden="true">✦</div><p className="eyebrow">a little detour</p><h1>We can’t find that page.</h1><p>It may have moved, or the link may have had a tiny mix-up.</p><Link className="button-primary" href="/">Back to ragNready</Link><Link className="text-link" href="/collections/all">Browse the collection</Link></main>;
}
