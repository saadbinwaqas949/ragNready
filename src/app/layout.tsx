import type { Metadata } from "next";
import { DM_Sans, Nunito } from "next/font/google";
import { SITE_ORIGIN } from "@/lib/site";
import { jsonLd } from "@/lib/seo/json-ld";
import "./globals.css";

const bodyFont = DM_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const displayFont = Nunito({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: { default: "ragNready — soft beginnings, thoughtfully chosen", template: "%s | ragNready" },
  description: "Thoughtfully selected baby clothing, everyday essentials and meaningful gift sets for life's littlest moments.",
  openGraph: { title: "ragNready", description: "Soft beginnings, thoughtfully chosen.", type: "website", siteName: "ragNready", locale: "en_PK" },
  twitter: { card: "summary_large_image", title: "ragNready", description: "Soft beginnings, thoughtfully chosen." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: "ragNready", url: SITE_ORIGIN, description: "Thoughtfully selected baby clothing, everyday essentials and meaningful gift sets in Pakistan." };
  return <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organization) }} /></body></html>;
}
