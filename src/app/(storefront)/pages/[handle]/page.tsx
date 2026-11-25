import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getSiteSettings } from "@/lib/data";
import { ContactForm } from "@/components/storefront/contact-form";
import { SizeTable } from "@/components/storefront/size-table";
import { SITE_CONTACT_FALLBACKS } from "@/lib/site";
import { formatPrice } from "@/lib/storefront/format";
import { whatsAppLink } from "@/lib/storefront/phone";

const pages: Record<string, { title: string; intro: string }> = {
  "about-us": { title: "About ragNready", intro: "A small Pakistani shop for baby clothes and gifts, chosen one piece at a time." },
  contact: { title: "Contact us", intro: "WhatsApp is the fastest way to reach us. You can also send a note here." },
  faq: { title: "Frequently asked questions", intro: "Short answers about ordering, sizes and delivery." },
  "size-guide": { title: "Size guide", intro: "Sizes follow your baby's age. Between two sizes, choose the larger one so there is room to grow." },
  "shipping-returns": { title: "Shipping and returns", intro: "How your order gets to you, and what to do if something is not right." },
  "refund-policy": { title: "Refund policy", intro: "What we exchange or refund, and how." },
  "privacy-policy": { title: "Privacy policy", intro: "What we collect, why we need it, and how to have it removed." },
  "terms-and-conditions": { title: "Terms and conditions", intro: "The terms that apply when you order from ragNready." },
};

export const revalidate = 3600;
export function generateStaticParams() { return Object.keys(pages).map((handle) => ({ handle })); }

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  return pages[handle] ? { title: pages[handle].title, description: pages[handle].intro, alternates: { canonical: `/pages/${handle}` } } : { title: "Page not found", robots: { index: false, follow: false } };
}

export default async function InfoPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const content = pages[handle];
  if (!content) notFound();
  const settings = await getSiteSettings();
  const email = settings?.email || SITE_CONTACT_FALLBACKS.email;
  const phone = settings?.phone || SITE_CONTACT_FALLBACKS.phone;
  const whatsapp = settings?.whatsapp_number || SITE_CONTACT_FALLBACKS.whatsapp_number;
  const chat = whatsAppLink(whatsapp, "Hi ragNready! I have a question.");
  const fee = Number(settings?.delivery_fee ?? 0), freeOver = settings?.free_delivery_over;
  const feeText = fee === 0 ? "Delivery is free on every order." : `Delivery is ${formatPrice(fee)} per order${freeOver ? `, and free on orders from ${formatPrice(Number(freeOver))}` : ""}.`;
  const reach = <>message us on <a className="stitch-link is-drawn" href={chat} target="_blank" rel="noreferrer">WhatsApp</a> or email <a className="stitch-link is-drawn" href={`mailto:${email}`}>{email}</a></>;

  const faqs: [string, ReactNode][] = [
    ["Do I need an account to order?", <>No. Add to cart, enter your delivery details and place the order. An account only keeps your orders and wishlist together.</>],
    ["How do I pay?", <>Cash on delivery. You pay the courier when your parcel arrives. We never ask for card details or advance payment.</>],
    ["Where do you deliver?", <>Anywhere in Pakistan. {feeText}</>],
    ["How will I know my order went through?", <>You see an order number straight away, and we message you on WhatsApp to confirm. You can also <Link className="stitch-link is-drawn" href="/track-order">track your order</Link>.</>],
    ["Which size should I choose?", <>Use the <Link className="stitch-link is-drawn" href="/pages/size-guide">size guide</Link>. Between two sizes, choose the larger one.</>],
    ["Can I send a gift directly?", <>Yes. Enter the recipient&apos;s address at checkout and write your gift message in the note.</>],
    ["Can I change or cancel my order?", <>Yes, until it is shipped. Please {reach} with your order number.</>],
  ];

  const bodies: Record<string, ReactNode> = {
    "about-us": <div className="prose prose-large">
      <p>Those first months go quickly. Sleeves get short, knees go through, and the tiny hat that swallowed their head suddenly fits. We look for clothes that are soft enough for new skin, simple to put on at three in the morning, and nice enough to be photographed.</p>
      <p>We keep the shop small on purpose. Fewer pieces means we can look at each one properly before it reaches you.</p>
      <h2>How we work</h2>
      <p>You order online and pay when it arrives. A real person confirms every order on WhatsApp, and the same person answers if you need help choosing a size or a gift.</p>
      <p><Link className="button button-primary" href="/collections/all">Shop the collection</Link></p>
    </div>,
    contact: <div className="contact-layout"><div className="contact-details"><a className="button button-primary" href={chat} target="_blank" rel="noreferrer">Chat on WhatsApp</a><dl><div><dt>Phone</dt><dd><a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a></dd></div><div><dt>Email</dt><dd><a href={`mailto:${email}`}>{email}</a></dd></div><div><dt>Based in</dt><dd>{settings?.address || "Lahore, Pakistan"}</dd></div></dl></div><ContactForm /></div>,
    faq: <div className="accordions">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>,
    "size-guide": <><SizeTable /><p className="fine-print">Measurements are a general guide for babies at each age and can vary a little between pieces. Not sure? Please {reach}.</p></>,
    "shipping-returns": <div className="prose">
      <h2>Delivery</h2><p>We deliver across Pakistan. {feeText} We confirm every order on WhatsApp before sending it, and share the expected delivery time for your city then.</p>
      <h2>Tracking</h2><p>Use the <Link className="stitch-link is-drawn" href="/track-order">track your order</Link> page with your order number and WhatsApp number.</p>
      <h2>If something is wrong</h2><p>If an item arrives damaged, or is not what you ordered, please {reach} within 7 days of delivery with your order number and a photo. We will send a replacement or refund you.</p>
      <h2>Exchanges</h2><p>Wrong size? Contact us within 7 days of delivery. Items must be unworn, unwashed and with their tags. For hygiene, caps and socks can only be exchanged if they arrive faulty.</p>
    </div>,
    "refund-policy": <div className="prose">
      <h2>When you can get a refund</h2><p>We refund or replace items that arrive damaged, faulty or different from what you ordered, if you tell us within 7 days of delivery.</p>
      <h2>How refunds are paid</h2><p>Orders are paid in cash on delivery, so we refund by bank transfer or mobile wallet, after we receive and check the returned item.</p>
      <h2>What we cannot refund</h2><p>Items that have been worn or washed, items without their tags, and items reported after 7 days. A change of mind can be exchanged for another size or piece instead, if it is unworn.</p>
      <h2>Ask for one</h2><p>Please {reach} with your order number and a photo of the problem.</p>
    </div>,
    "privacy-policy": <div className="prose">
      <h2>What we collect</h2><p>When you order: your name, WhatsApp number, email, delivery address and any note you add. If you sign in with Google: your name, email and profile picture address. If you write to us or join our list: what you send us.</p>
      <h2>What we use it for</h2><p>To confirm, pack and deliver your order, to answer you, and to send updates if you joined our list. We do not sell your information or use it for advertising.</p>
      <h2>Who handles it</h2><p>The courier gets your name, phone and address. Our website is stored with Supabase. Order alerts reach us by email and by a WhatsApp message service. Google handles sign-in if you choose it.</p>
      <h2>On your device</h2><p>Your cart, wishlist, recently viewed pieces and theme are saved in your own browser. We use a cookie only to keep you signed in.</p>
      <h2>Your choices</h2><p>To see, correct or delete your information, please {reach}. We may need to keep basic order records for our accounts.</p>
    </div>,
    "terms-and-conditions": <div className="prose">
      <h2>Orders</h2><p>Your order is accepted when we confirm it with you on WhatsApp. We may cancel an order if an item is unavailable, a price was listed by mistake, or we cannot reach you.</p>
      <h2>Prices and payment</h2><p>Prices are in Pakistani rupees. The total at checkout, including delivery, is what you pay the courier in cash.</p>
      <h2>Products</h2><p>We photograph pieces as accurately as we can. Colours can look slightly different on your screen.</p>
      <h2>Returns</h2><p>Our <Link className="stitch-link is-drawn" href="/pages/shipping-returns">shipping and returns</Link> and <Link className="stitch-link is-drawn" href="/pages/refund-policy">refund</Link> pages form part of these terms.</p>
      <h2>Law</h2><p>These terms follow the laws of Pakistan. For any question, please {reach}.</p>
    </div>,
  };

  return <main className="section page-narrow"><h1 className="page-title">{content.title}</h1><p className="page-intro">{content.intro}</p>{bodies[handle]}</main>;
}
