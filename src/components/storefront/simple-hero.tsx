"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { MagneticLink } from "./magnetic-link";

export function SimpleHero({ headline, subtext, ctaText }: { headline: string; subtext: string; ctaText: string }) {
  const reduced = useReducedMotion();
  const words = headline.split(/\s+/);

  return <section className="hero" aria-labelledby="hero-title">
    <div className="hero-copy"><p className="eyebrow">A little something lovely</p><h1 id="hero-title">{words.map((word, index) => <motion.span className="hero-word" key={`${word}-${index}`} initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : index * 0.055 }}>{word}{index < words.length - 1 ? " " : ""}</motion.span>)}</h1><p>{subtext}</p><MagneticLink href="/collections/new-arrivals">{ctaText}</MagneticLink></div>
    <div className="hero-art" aria-label="Soft pastel baby essentials illustration" role="img"><Image className="hero-placeholder-image" src="/images/placeholders/product-lavender.svg" alt="" fill priority quality={75} sizes="(max-width: 800px) 100vw, 55vw" /><span className="hero-doodle hero-cloud" aria-hidden="true">☁</span><span className="hero-doodle hero-star" aria-hidden="true">✦</span><span className="hero-doodle hero-sparkle" aria-hidden="true">✧</span></div>
  </section>;
}
