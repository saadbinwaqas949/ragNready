import Link from "next/link";
import { BrandWordmark } from "@/components/brand-wordmark";
import { NewsletterForm } from "./newsletter-form";
import type { SiteSettings } from "@/lib/data/types";
import { SITE_CONTACT_FALLBACKS } from "@/lib/site";
import { whatsAppLink } from "@/lib/storefront/phone";

const socialNames: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", pinterest: "Pinterest", x: "X", linkedin: "LinkedIn", tiktok: "TikTok" };
const isWebUrl = (url: string) => /^https?:\/\//i.test(url);

export function SiteFooter({ settings, collections }: { settings: SiteSettings | null; collections: { title: string; handle: string }[] }) {
  const email = settings?.email || SITE_CONTACT_FALLBACKS.email;
  const whatsapp = settings?.whatsapp_number || SITE_CONTACT_FALLBACKS.whatsapp_number;
  const socialLinks = Object.entries(settings?.social_links ?? {}).filter(([, url]) => url && isWebUrl(url));
  return <footer className="site-footer">
    <div className="footer-stitch" aria-hidden="true" />
    <div className="footer-grid">
      <div className="footer-brand">
        <Link href="/" aria-label="ragNready home"><BrandWordmark /></Link>
        <p>Soft clothes and gifts for newborns to 18 months, delivered across Pakistan. Pay when your parcel arrives.</p>
        <NewsletterForm />
      </div>
      <nav aria-label="Shop"><h2>Shop</h2><Link href="/collections/all">Shop all</Link>{collections.slice(0, 5).map(({ title, handle }) => <Link href={`/collections/${handle}`} key={handle}>{title}</Link>)}<Link href="/pages/wishlist">Wishlist</Link></nav>
      <nav aria-label="Help"><h2>Help</h2><Link href="/track-order">Track your order</Link><Link href="/pages/shipping-returns">Shipping and returns</Link><Link href="/pages/size-guide">Size guide</Link><Link href="/pages/faq">FAQ</Link><Link href="/pages/contact">Contact</Link></nav>
      <div><h2>Reach us</h2><a href={whatsAppLink(whatsapp, "Hi ragNready! I have a question.")} target="_blank" rel="noreferrer">WhatsApp {whatsapp}</a><a href={`mailto:${email}`}>{email}</a><span>{settings?.address || "Lahore, Pakistan"}</span>{socialLinks.map(([name, url]) => <a href={url} key={name} target="_blank" rel="noreferrer">{socialNames[name] ?? name}</a>)}</div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} ragNready.{settings?.legal_owner_line ? ` ${settings.legal_owner_line}` : ""}</span><nav aria-label="Policies"><Link href="/pages/refund-policy">Refunds</Link><Link href="/pages/privacy-policy">Privacy</Link><Link href="/pages/terms-and-conditions">Terms</Link></nav></div>
  </footer>;
}
