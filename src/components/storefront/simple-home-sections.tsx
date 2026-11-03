import type { Product, SiteSettings } from "@/lib/data/types";
import { ProductGrid } from "./product-grid";
import { Reveal } from "./reveal";
import { SimpleHero } from "./simple-hero";

export function SimpleHomeSections({ products, settings }: { products: Product[]; settings: SiteSettings | null }) {
  return <main>
    <SimpleHero headline={settings?.hero_headline || "soft beginnings, thoughtfully chosen"} subtext={settings?.hero_subtext || "Discover thoughtfully selected baby clothing, everyday essentials and meaningful gift sets created for life's littlest moments."} ctaText={settings?.hero_cta_text || "Shop new arrivals"} />
    <section className="section featured-section"><Reveal><div className="section-head-row"><div><p className="eyebrow">thoughtfully chosen</p><h2 className="section-heading section-heading-left">Our products</h2></div></div></Reveal><ProductGrid products={products} /></section>
  </main>;
}
