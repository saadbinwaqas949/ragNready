"use client";

import { BrandWordmark } from "@/components/brand-wordmark";
import { SITE_CONTACT_FALLBACKS } from "@/lib/site";
import { whatsAppLink } from "@/lib/storefront/phone";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="message-page"><BrandWordmark /><h1 className="page-title">The shop did not load.</h1><p className="page-intro">This is usually brief. Try again, or order directly on WhatsApp.</p><div className="order-actions"><button type="button" className="button button-primary" onClick={reset}>Try again</button><a className="button button-outline" href={whatsAppLink(SITE_CONTACT_FALLBACKS.whatsapp_number, "Hi ragNready! The website is not loading and I would like to order.")}>Order on WhatsApp</a></div></main>;
}
