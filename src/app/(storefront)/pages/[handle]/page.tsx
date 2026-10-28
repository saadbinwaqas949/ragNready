import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteSettings } from "@/lib/data";
import { ContactForm } from "@/components/storefront/contact-form";

const pages: Record<string, { title: string; intro: string }> = {
  "about-us": { title: "Welcome to ragNready", intro: "Soft beginnings, thoughtfully chosen. We gather baby clothing, everyday essentials and meaningful gifts for life's littlest moments." },
  contact: { title: "Contact us", intro: "We would love to hear from you. Send us a note and our team will be glad to help." },
  faq: { title: "Frequently asked questions", intro: "A few helpful answers for shopping with ragNready." },
  "size-guide": { title: "Size guide", intro: "Our sizes are based on your baby's age. If you are between sizes, a roomier fit leaves space to grow." },
  "shipping-returns": { title: "Shipping & Returns", intro: "We deliver thoughtful little essentials to families across Pakistan." },
  "refund-policy": { title: "Refund Policy", intro: "We want your order to feel right. Contact us if something needs our attention." },
  "privacy-policy": { title: "Privacy Policy", intro: "We use your information to help with your order and improve your shopping experience." },
  "terms-and-conditions": { title: "Terms & Conditions", intro: "These simple terms help make shopping with ragNready clear and comfortable." },
};

const faqs = [
  ["What ages do you offer?", "Our selected sizes cover newborn to 12–18 months, depending on the piece. Please check each product's available sizes."],
  ["Where do you deliver?", "We offer nationwide delivery across Pakistan."],
  ["How do I choose a size?", "Use the size selector on each product and our size guide. If your baby is between sizes, consider the roomier option."],
  ["Can I send a gift directly?", "Yes. Add the recipient's delivery address when placing an order. Selected gift orders include a thoughtfully designed ragNready card."],
];

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  return pages[handle] ? { title: pages[handle].title, description: pages[handle].intro, alternates: { canonical: `/pages/${handle}` } } : { title: "Page not found", robots: { index: false, follow: false } };
}

export default async function InfoPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const content = pages[handle];
  if (!content) notFound();
  const settings = await getSiteSettings();

  return <main className="info-page section"><p className="eyebrow center-eyebrow">ragNready</p><h1 className="section-heading">{content.title}</h1><p className="section-subtitle info-intro">{content.intro}</p>
    {handle === "about-us" && <section className="info-story"><div className="info-story-image" aria-hidden="true">♡</div><div className="info-timeline"><article><strong>Thoughtfully selected</strong><p>We choose useful, soft essentials with care and purpose.</p></article><article><strong>Easy to gift</strong><p>Coordinated pieces make finding a meaningful baby gift simpler.</p></article><article><strong>Made for little moments</strong><p>For new arrivals, visits, celebrations and ordinary days together.</p></article></div></section>}
    {handle === "contact" && <div className="contact-layout"><div className="contact-details"><h2>We’re here to help</h2><p><a href={`mailto:${settings?.email ?? "hello@example.com"}`}>{settings?.email ?? "hello@example.com"}</a></p><p><a href={`tel:${(settings?.phone ?? "+92 300 0000000").replace(/\s/g, "")}`}>{settings?.phone ?? "+92 300 0000000"}</a></p><p>{settings?.address ?? "Lahore, Pakistan"}</p><div className="map-placeholder" role="img" aria-label={`Map placeholder for ${settings?.address ?? "Lahore, Pakistan"}`}><span>⌖</span><strong>{settings?.address ?? "Lahore, Pakistan"}</strong><small>Location map</small></div></div><ContactForm /></div>}
    {handle === "faq" && <div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>}
    {handle === "size-guide" && <div className="size-table-wrap"><table className="size-table"><thead><tr><th>Size</th><th>Approximate age</th><th>Fit note</th></tr></thead><tbody>{["0-3 Months", "3-6 Months", "6-9 Months", "9-12 Months", "12-18 Months"].map((size) => <tr key={size}><td>{size}</td><td>{size}</td><td>For little ones around this age</td></tr>)}</tbody></table></div>}
    {handle === "shipping-returns" && <div className="policy-copy"><h2>Delivery across Pakistan</h2><p>We prepare orders with care and share delivery details when the order is confirmed. Delivery timing may vary by destination.</p><h2>Need help with a return?</h2><p>Contact us with your order details and we will help you with the next steps.</p><p>Write to <a href={`mailto:${settings?.email ?? "hello@example.com"}`}>{settings?.email ?? "hello@example.com"}</a>.</p></div>}
    {(handle === "refund-policy" || handle === "privacy-policy" || handle === "terms-and-conditions") && <div className="policy-copy"><h2>Questions?</h2><p>If you would like help with this information, contact us at <a href={`mailto:${settings?.email ?? "hello@example.com"}`}>{settings?.email ?? "hello@example.com"}</a>.</p>{handle === "privacy-policy" && <p>We do not sell your personal information. Order details are used to process and support your purchase.</p>}{handle === "terms-and-conditions" && <p>Product availability and pricing may change as our collection is updated.</p>}</div>}
  </main>;
}

