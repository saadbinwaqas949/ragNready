import Link from "next/link";
import { HandCoins, MessageCircle, PackageCheck, Ruler } from "lucide-react";
import { HomeHero } from "@/components/storefront/home-hero";
import { ProductGrid } from "@/components/storefront/product-grid";
import { InView } from "@/components/storefront/reveal";
import { getCollections, getProducts, getSiteSettings } from "@/lib/data";
import { SITE_CONTACT_FALLBACKS } from "@/lib/site";
import { isSoldOut, shortSize } from "@/lib/storefront/product";
import { whatsAppLink } from "@/lib/storefront/phone";

export const revalidate = 3600;

const promises = [
  { icon: HandCoins, title: "Pay when it arrives", text: "Cash on delivery for every order. No card, no advance payment." },
  { icon: MessageCircle, title: "Confirmed on WhatsApp", text: "We message you before we ship, so you always know who you are buying from." },
  { icon: PackageCheck, title: "Delivered across Pakistan", text: "Sent to your door, or straight to the new parents as a gift." },
  { icon: Ruler, title: "Help with sizing", text: "Between sizes? Ask us. We will tell you how each piece really fits." },
];

export default async function HomePage() {
  const [products, collections, settings] = await Promise.all([getProducts(), getCollections(), getSiteSettings()]);
  const available = products.filter((product) => !isSoldOut(product));
  const featured = [...available, ...products.filter(isSoldOut)].slice(0, 8);
  const sizes = [...new Set(available.flatMap((product) => product.variants.filter((variant) => variant.stock > 0).map((variant) => variant.size)))].sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  const stocked = collections.map((collection) => ({ ...collection, count: products.filter((product) => product.collection_handles.includes(collection.handle)).length })).filter((collection) => collection.count > 0);
  const whatsapp = settings?.whatsapp_number || SITE_CONTACT_FALLBACKS.whatsapp_number;

  return <main>
    <HomeHero headline={settings?.hero_headline || "soft beginnings, thoughtfully chosen"} subtext={settings?.hero_subtext || "Baby clothing, everyday essentials and gift sets for life's littlest moments."} ctaText={settings?.hero_cta_text || "Shop the collection"} />

    <section className="section" aria-labelledby="featured-title">
      <div className="section-head"><h2 id="featured-title">In the shop now</h2>{products.length > 4 && <Link className="stitch-link" href="/collections/all">See all {products.length} pieces</Link>}</div>
      {featured.length ? <ProductGrid products={featured} /> : <div className="empty-state"><p>New pieces are being folded and photographed. Message us and we will tell you when they land.</p><a className="button button-primary" href={whatsAppLink(whatsapp, "Hi ragNready! Please tell me when new pieces arrive.")} target="_blank" rel="noreferrer">Message us on WhatsApp</a></div>}
    </section>

    {(sizes.length > 1 || stocked.length > 1) && <section className="section section-tight finder" aria-label="Find a piece">
      {sizes.length > 1 && <div className="finder-row"><h2>How old is your little one?</h2><div className="tag-row">{sizes.map((size) => <Link className="size-tag" key={size} href={`/collections/all?size=${encodeURIComponent(size)}`} aria-label={size}>{shortSize(size)}</Link>)}</div></div>}
      {stocked.length > 1 && <div className="finder-row"><h2>What are you looking for?</h2><div className="tag-row">{stocked.map((collection) => <Link className="pill" key={collection.handle} href={`/collections/${collection.handle}`}>{collection.title}</Link>)}</div></div>}
    </section>}

    <InView className="promises">
      <h2 className="sr-only">Shopping with ragNready</h2>
      {promises.map(({ icon: Icon, title, text }) => <article key={title}><Icon aria-hidden="true" strokeWidth={1.4} /><h3>{title}</h3><p>{text}</p></article>)}
    </InView>

    <section className="section closing">
      <h2>Not sure what to get? Ask a person.</h2>
      <p>Tell us the baby&apos;s age and the occasion, and we will suggest something that fits your budget.</p>
      <a className="button button-primary" href={whatsAppLink(whatsapp, "Hi ragNready! Can you help me choose something?")} target="_blank" rel="noreferrer">Chat on WhatsApp</a>
    </section>
  </main>;
}
