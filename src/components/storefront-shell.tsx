"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BrandWordmark } from "@/components/brand-wordmark";
import type { SiteSettings } from "@/lib/data/types";
import { useShopStore } from "@/lib/storefront/store";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { SearchOverlay } from "@/components/storefront/search-overlay";
import { CustomCursor } from "@/components/storefront/custom-cursor";
import { NewsletterForm } from "@/components/storefront/newsletter-form";

function Icon({ name }: { name: "search" | "user" | "heart" | "bag" | "menu" | "close" }) {
  const paths: Record<typeof name, React.ReactNode> = {
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    user: <><circle cx="12" cy="7.5" r="3.5" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>,
    heart: <path d="M20.8 8.7c0 5-8.8 11-8.8 11s-8.8-6-8.8-11a4.5 4.5 0 0 1 8.8-1.3 4.5 4.5 0 0 1 8.8 1.3Z" />,
    bag: <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    menu: <><path d="M3 7h18M3 12h18M3 17h18" /></>,
    close: <><path d="m5 5 14 14M19 5 5 19" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function AnnouncementBar({ messages }: { messages: string[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (paused || reduced || messages.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % messages.length), 4000);
    return () => window.clearInterval(timer);
  }, [paused, reduced, messages.length]);
  return <div className="announcement" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-live="polite"><AnimatePresence mode="wait"><motion.span key={active % messages.length} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }} transition={{ duration: 0.26 }}>{messages[active % messages.length]}</motion.span></AnimatePresence></div>;
}

export function StorefrontShell({ settings }: { settings: SiteSettings | null }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const cartCount = useShopStore((state) => state.cart.reduce((sum, item) => sum + item.quantity, 0));
  const wishlistCount = useShopStore((state) => state.wishlist.length);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const messages = settings?.announcement_messages?.length ? settings.announcement_messages : ["Soft beginnings, thoughtfully chosen.", "A thoughtfully designed ragNready card is included with selected gift orders.", "New starter set now available."];

  useEffect(() => {
    let previous = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const current = window.scrollY;
        setScrolled(current > 12);
        setShowTop(current > 500);
        const shouldHide = current > 120 && current > previous + 2;
        if (shouldHide) setHidden(true);
        else if (current < previous - 2 || current < 120) setHidden(false);
        previous = current;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (frame) window.cancelAnimationFrame(frame); };
  }, []);

  const whatsappDigits = (settings?.whatsapp_number || "+92 300 0000000").replace(/\D/g, "");
  const whatsappNumber = whatsappDigits.startsWith("0") ? `92${whatsappDigits.slice(1)}` : whatsappDigits.startsWith("92") ? whatsappDigits : `92${whatsappDigits}`;
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi ragNready! I have a question.")}`;

  return <>
    <AnnouncementBar messages={messages} />
    <header className={`site-header${scrolled ? " is-scrolled" : ""}${hidden ? " is-hidden" : ""}`}>
      <div className="header-inner">
        <button className="icon-button mobile-menu-toggle" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? "close" : "menu"} /></button>
        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/">Home</Link>
          <div className="nav-dropdown-group"><Link href="/collections/all">Shop</Link><div className="nav-mega"><Link href="/collections/body-suits">Baby Body Suits</Link><Link href="/collections/frocks">Little Occasion Wear</Link><Link href="/collections/rompers">Everyday Rompers</Link><Link href="/collections/caps-accessories">Baby Accessories</Link></div></div>
          <Link href="/collections/gift-set">The ragNready Gift</Link><Link href="/pages/about-us">About ragNready</Link><Link href="/pages/contact">Contact</Link>
        </nav>
        <Link href="/" aria-label="ragNready home"><BrandWordmark /></Link>
        <div className="header-actions">
          <button className="icon-button" aria-label="Search" onClick={() => setSearchOpen(true)}><Icon name="search" /></button>
          <Link className="icon-button account-action" href="/admin" aria-label="Shop admin"><Icon name="user" /></Link>
          <Link className="icon-button wishlist-action" href="/pages/wishlist" aria-label={`Wishlist, ${wishlistCount} saved items`}><Icon name="heart" />{wishlistCount > 0 && <span className="cart-count wishlist-count">{wishlistCount}</span>}</Link>
          <button className="icon-button" id="cart-trigger" aria-label={`Open cart, ${cartCount} items`} onClick={() => setCartOpen(true)}><Icon name="bag" /><AnimatePresence mode="popLayout"><motion.span className="cart-count" key={cartCount} initial={{ scale: 0.65 }} animate={{ scale: [1.22, 1] }} exit={{ scale: 0.65 }} transition={{ duration: 0.28 }}>{cartCount}</motion.span></AnimatePresence></button>
        </div>
      </div>
      <AnimatePresence>{menuOpen && <motion.nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation" initial={{ height: 0, opacity: 0 }} animate={{ height: "calc(100svh - 104px)", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
        {[ ["Shop all", "/collections/all"], ["Baby Body Suits", "/collections/body-suits"], ["Little Occasion Wear", "/collections/frocks"], ["Gift sets", "/collections/gift-set"], ["About ragNready", "/pages/about-us"], ["Contact", "/pages/contact"] ].map(([label, href], index) => <motion.div key={href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.045 }}><Link href={href} onClick={() => setMenuOpen(false)}>{label}</Link></motion.div>)}
      </motion.nav>}</AnimatePresence>
    </header>
    <CartDrawer open={cartOpen} onClose={closeCart} />
    <SearchOverlay open={searchOpen} onClose={closeSearch} />
    <a className="whatsapp" href={whatsappHref} aria-label="Chat with ragNready on WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.7a8.5 8.5 0 0 1-12.7 7.4L3 20l1-4.5a8.5 8.5 0 1 1 16.5-3.8Z" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M8.1 8.1c.2-.5.4-.5.7-.5h.5c.2 0 .4 0 .5.4l.7 1.6c.1.3.1.4-.1.6l-.5.6c-.2.2-.2.3 0 .6.4.7 1.1 1.3 1.8 1.7.3.2.5.2.7-.1l.7-.8c.2-.2.4-.2.6-.1l1.5.7c.3.1.4.3.3.6-.1.5-.4 1.1-.8 1.3-.5.4-1.1.5-1.8.3-.6-.2-1.3-.4-2.3-1.1-1.3-.9-2.2-2-2.7-2.8-.5-.9-.8-1.9-.3-2.8.2-.4.5-.7.8-.8Z" fill="currentColor"/></svg></a>
    {showTop && <button className="back-to-top" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}>↑</button>}
    <CustomCursor />
  </>;
}

export function SiteFooter({ settings }: { settings: SiteSettings | null }) {
  const email = settings?.email ?? "hello@example.com";
  const phone = settings?.phone ?? "+92 300 0000000";
  const address = settings?.address ?? "Lahore, Pakistan";
  const socialLinks = Object.entries(settings?.social_links ?? {}).filter(([, url]) => url);
  return <footer className="site-footer"><div className="footer-grid">
    <div className="footer-brand"><Link href="/" aria-label="ragNready home"><BrandWordmark light /></Link><p className="footer-blurb">Soft, breathable clothing for newborn to 12 months. Thoughtfully chosen for life&apos;s littlest moments.</p><div className="footer-contact"><a href={`mailto:${email}`}>{email}</a><a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a><span>{address}</span></div>{socialLinks.length > 0 && <div className="footer-socials" aria-label="Social media">{socialLinks.map(([name, url]) => <a href={url} key={name} target="_blank" rel="noreferrer">{name}</a>)}</div>}</div>
    <div><h2 className="footer-title">Shop</h2><div className="footer-links"><Link href="/collections/all">Shop all</Link><Link href="/collections/body-suits">Baby Body Suits</Link><Link href="/collections/frocks">Little Occasion Wear</Link><Link href="/collections/rompers">Everyday Rompers</Link><Link href="/collections/gift-set">Gift sets</Link><Link href="/collections/caps-accessories">Baby Accessories</Link></div></div>
    <div><h2 className="footer-title">Support</h2><div className="footer-links"><Link href="/pages/shipping-returns">Shipping &amp; Returns</Link><Link href="/pages/refund-policy">Refund Policy</Link><Link href="/pages/privacy-policy">Privacy Policy</Link><Link href="/pages/terms-and-conditions">Terms &amp; Conditions</Link><Link href="/pages/size-guide">Size Guide</Link><Link href="/pages/faq">FAQ</Link><Link href="/pages/contact">Contact</Link></div></div>
    <div className="footer-newsletter"><h2 className="footer-title">A little note from us</h2><p className="footer-blurb">Join the ragNready family for thoughtful updates and little surprises.</p><NewsletterForm compact /></div>
  </div><div className="footer-bottom">{settings?.legal_owner_line ? `${settings.legal_owner_line} ` : ""}© {new Date().getFullYear()} ragNready. All rights reserved.</div></footer>;
}
