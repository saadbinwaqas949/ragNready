import Link from "next/link";
import { HeroClothesline } from "./hero-clothesline";

const stars = [[6, 18, 2], [14, 52, 1.5], [22, 12, 1.5], [31, 40, 2.5], [43, 16, 1.5], [52, 48, 2], [61, 10, 2], [68, 34, 1.5], [77, 56, 2], [90, 44, 2.5], [95, 14, 1.5], [37, 64, 1.5], [9, 74, 2], [84, 70, 1.5]];

export function HomeHero({ headline, subtext, ctaText }: { headline: string; subtext: string; ctaText: string }) {
  const words = headline.trim().split(/\s+/);
  return <section className="hero" aria-labelledby="hero-title">
    <div className="hero-sky" aria-hidden="true">
      <span className="hero-orb" />
      <span className="hero-stars">{stars.map(([left, top, size], index) => <i key={index} style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, animationDelay: `${index * 0.37}s` }} />)}</span>
    </div>
    <HeroClothesline />
    <div className="hero-copy">
      <h1 id="hero-title">{words.map((word, index) => <span className="hero-word" key={index}><span style={{ "--word": index } as React.CSSProperties}>{word}</span>{" "}</span>)}</h1>
      <div className="hero-side"><p>{subtext}</p><div className="hero-actions"><Link className="button button-primary" href="/collections/all">{ctaText}</Link><Link className="stitch-link" href="/pages/about-us">About ragNready</Link></div></div>
    </div>
  </section>;
}
