import Link from "next/link";
import type { Metadata } from "next";
import { BrandWordmark } from "@/components/brand-wordmark";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default function NotFound() {
  return <main className="message-page"><Link href="/" aria-label="ragNready home"><BrandWordmark /></Link><svg className="lost-sock" viewBox="0 0 120 130" aria-hidden="true"><path className="cloth cloth-lavender" d="M34 10h38v60c0 14 6 20 20 26 17 8 20 28 6 35-16 7-38 3-50-8-10-9-14-20-14-35Z" transform="translate(0 -6)" /><path className="cloth-band" d="M34 4h38v18H34Z" /><path className="stitch" d="M39 30h28" /></svg><h1 className="page-title">This page went missing, like one of the socks.</h1><p className="page-intro">The link may be old or mistyped.</p><div className="order-actions"><Link className="button button-primary" href="/collections/all">Shop all</Link><Link className="button button-outline" href="/">Go to the homepage</Link></div></main>;
}
