import type { Metadata, Viewport } from "next";
import { Figtree, Fredoka } from "next/font/google";
import { SITE_ORIGIN } from "@/lib/site";
import { jsonLd } from "@/lib/seo/json-ld";
import "./globals.css";

const bodyFont = Figtree({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const displayFont = Fredoka({ subsets: ["latin"], variable: "--font-display", display: "swap" });

const description = "ragNready is a Pakistan-based baby clothing brand offering soft everyday essentials, from bodysuits, frocks and rompers to caps and gift sets. Cash on delivery nationwide.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: { default: "ragNready: soft beginnings, thoughtfully chosen", template: "%s | ragNready" },
  description,
  openGraph: { title: "ragNready", description, type: "website", siteName: "ragNready", locale: "en_PK" },
  twitter: { card: "summary_large_image", title: "ragNready", description },
};

export const viewport: Viewport = { themeColor: "#faf8f4" };

// Runs before first paint so the saved theme never flashes.
const themeScript = `(function(){try{var d=document.documentElement,s=localStorage.getItem("ragnready-theme"),t=s||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");d.dataset.theme=t;d.classList.add("js");if(t==="dark"){var m=document.querySelector('meta[name="theme-color"]');m&&m.setAttribute("content","#0e1829")}}catch(e){}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: "ragNready", url: SITE_ORIGIN, logo: new URL("/icon.svg", SITE_ORIGIN).toString(), description };
  return <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`} suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
    <body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organization) }} /></body>
  </html>;
}
