"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Collection, Product, SiteSettings } from "@/lib/data/types";
import { sampleReviews } from "@/lib/data/sample-reviews";
import { MagneticLink } from "./magnetic-link";
import { ProductGrid } from "./product-grid";
import { Reveal } from "./reveal";
import { NewsletterForm } from "./newsletter-form";

const ageOptions = ["0-3 Months", "3-6 Months", "6-9 Months", "9-12 Months", "12-18 Months"];
const values = [
  { icon: "✳", title: "Thoughtfully Selected", copy: "Useful baby products chosen with care and purpose." },
  { icon: "♡", title: "Easy to Gift", copy: "Coordinated products make choosing a meaningful baby gift simpler." },
  { icon: "✦", title: "Considered Presentation", copy: "Selected gift orders include a thoughtfully designed ragNready card." },
  { icon: "⌁", title: "Made for Little Moments", copy: "Everyday clothing and gifts for new arrivals, visits and celebrations." },
];
const categories = [
  ["body-suits", "Baby Bodysuits", "/images/placeholders/product-sky.svg"],
  ["frocks", "Little Occasion Wear", "/images/placeholders/product-blush.svg"],
  ["rompers", "Everyday Rompers", "/images/placeholders/product-sand.svg"],
  ["gift-set", "The ragNready Gift", "/images/placeholders/product-lavender.svg"],
  ["caps-accessories", "Baby Accessories", "/images/placeholders/product-sunshine.svg"],
] as const;

export function HomeSections({ products, collections, settings }: { products: Product[]; collections: Collection[]; settings: SiteSettings | null }) {
  const reduced = useReducedMotion();
  const heading = settings?.hero_headline || "soft beginnings, thoughtfully chosen";
  const words = heading.split(/\s+/);
  const giftCollection = collections.find((collection) => collection.handle === "gift-set");
  const categoryCards = categories.map(([handle, title, fallback]) => ({
    handle, title: collections.find((collection) => collection.handle === handle)?.title || title, fallback,
    collection: collections.find((collection) => collection.handle === handle),
  }));

  return <main>
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy"><p className="eyebrow">A little something lovely</p><h1 id="hero-title">{words.map((word, index) => <motion.span className="hero-word" key={`${word}-${index}`} initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : index * 0.055 }}>{word}{index < words.length - 1 ? " " : ""}</motion.span>)}</h1><p>{settings?.hero_subtext || "Discover thoughtfully selected baby clothing, everyday essentials and meaningful gift sets created for life's littlest moments."}</p><MagneticLink href="/collections/new-arrivals">{settings?.hero_cta_text || "Shop new arrivals"}</MagneticLink></div>
      <div className="hero-art" aria-label="Soft pastel baby essentials illustration" role="img"><Image className="hero-placeholder-image" src="/images/placeholders/product-lavender.svg" alt="" fill priority sizes="(max-width: 800px) 100vw, 55vw" /><span className="hero-doodle hero-cloud" aria-hidden="true">☁</span><span className="hero-doodle hero-star" aria-hidden="true">✦</span><span className="hero-doodle hero-sparkle" aria-hidden="true">✧</span></div>
    </section>

    <Reveal className="section"><div className="gift-banner"><div className="gift-copy"><p className="eyebrow">for little arrivals</p><h2>thoughtful gifts,<br />thoughtfully presented</h2><p>Explore coordinated baby essentials created for showers, hospital visits, welcome-home celebrations and meaningful family moments.</p><MagneticLink href="/collections/gift-set" className="button-primary">Explore gift sets</MagneticLink></div><div className="gift-art" data-parallax="-5"><Image src={giftCollection?.image || "/images/placeholders/product-seafoam.svg"} alt="A thoughtful baby gift set" fill sizes="(max-width: 800px) 100vw, 45vw" /></div></div></Reveal>

    <section className="section fit-section"><Reveal><h2 className="section-heading">Find the perfect fit</h2><p className="section-subtitle">Shop by age, gender or season</p></Reveal>
      <div className="chip-group"><span className="chip-label">Age</span>{ageOptions.map((size) => <Link className="chip" href={`/collections/all?size=${encodeURIComponent(size)}`} key={size}>{size}</Link>)}</div>
      <div className="chip-group"><span className="chip-label">For</span>{["Boys", "Girls", "Unisex"].map((gender) => <Link className="chip" href={`/collections/all?gender=${gender}`} key={gender}>{gender}</Link>)}</div>
      <div className="chip-group"><span className="chip-label">Season</span>{["Winter", "Summer", "All Seasons"].map((season) => <Link className="chip" href={`/collections/all?season=${encodeURIComponent(season)}`} key={season}>{season}</Link>)}</div>
    </section>

    <section className="section value-section"><div className="value-grid">{values.map((value, index) => <Reveal key={value.title} delay={index * 0.06}><article className="value-item"><motion.div className="value-icon" aria-hidden="true" whileInView={{ rotate: [0, -8, 0], scale: [0.88, 1] }} viewport={{ once: true }}>{value.icon}</motion.div><h3>{value.title}</h3><p>{value.copy}</p></article></Reveal>)}</div></section>

    <section className="section"><Reveal><p className="eyebrow center-eyebrow">little things, chosen with care</p><h2 className="section-heading">Shop by Category</h2></Reveal><div className="category-grid">{categoryCards.map(({ handle, title, fallback, collection }, index) => <Reveal key={handle} delay={index * 0.05}><Link className="category-card" href={`/collections/${handle}`} data-cursor-label="view"><div className="category-card-image"><Image src={collection?.image || fallback} alt="" fill sizes="(max-width: 600px) 80vw, 30vw" /></div><span>{title}</span><span className="category-arrow" aria-hidden="true">↗</span></Link></Reveal>)}</div></section>

    <section className="section featured-section"><Reveal><div className="section-head-row"><div><p className="eyebrow">thoughtfully chosen</p><h2 className="section-heading section-heading-left">Featured at ragNready</h2><p className="section-subtitle section-subtitle-left">Thoughtfully chosen pieces for your little one</p></div><Link className="text-link" href="/collections/all">Shop all pieces →</Link></div></Reveal><ProductGrid products={products.slice(0, 4)} /></section>

    <section className="promo-band"><div className="promo-marquee" aria-hidden="true"><span>✦　☁　✧　♡　✦　☼　✧　☁　</span><span>✦　☁　✧　♡　✦　☼　✧　☁　</span></div><div className="promo-copy"><p className="eyebrow">A little something to celebrate</p><h2>Thoughtful gifts for little arrivals.</h2><Link className="button-primary" href="/collections/gift-set">Explore Gift Sets</Link></div></section>

    <section className="section story-section"><div className="story-image" data-parallax="-6"><Image src="/images/placeholders/product-cream.svg" alt="Soft, thoughtfully chosen newborn essentials" fill sizes="(max-width: 800px) 100vw, 48vw" /></div><Reveal><div className="story-copy"><p className="eyebrow">A softer way to welcome them</p><h2 className="section-heading section-heading-left">Welcome to ragNready</h2><p>We believe the smallest moments deserve thoughtful details. From newborn essentials to meaningful gifts, each piece is chosen to bring a little comfort to life with a new little one.</p><p className="story-counter"><strong>0–12</strong><span>months of little beginnings</span></p><Link className="text-link" href="/pages/about-us">Our story →</Link></div></Reveal></section>

    <section className="section reviews-section"><Reveal><p className="eyebrow center-eyebrow">kind words from our community</p><h2 className="section-heading">Customers are saying</h2><p className="section-subtitle">A few thoughtful words from families and gift-givers.</p></Reveal><div className="reviews-row">{sampleReviews.map((review, index) => <Reveal key={review.name} delay={index * 0.035}><article className="review-card"><div className="review-stars" aria-label={`${review.rating} out of 5 stars`}>★★★★★</div><p>“{review.text}”</p><div className="review-person"><strong>{review.name}</strong><span>{review.city} · <span className="verified-badge">Verified</span></span></div></article></Reveal>)}</div><p className="sample-review-note">Sample review content shown for layout preview.</p></section>

    <section className="section newsletter-section"><Reveal><div className="newsletter-panel"><div><p className="eyebrow">little notes, lovely things</p><h2 className="section-heading section-heading-left">Join the ragNready family</h2><p>Thoughtful updates and a little something lovely, now and then.</p></div><NewsletterForm /></div></Reveal></section>
  </main>;
}
