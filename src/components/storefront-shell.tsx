"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { BrandWordmark } from "@/components/brand-wordmark";
import { ThemeToggle } from "@/components/storefront/theme-toggle";
import { cartCount, useShopStore } from "@/lib/storefront/store";
import { whatsAppLink } from "@/lib/storefront/phone";

const CartDrawer = dynamic(() => import("@/components/storefront/cart-drawer").then((module) => module.CartDrawer), { ssr: false, loading: () => null });
const SearchOverlay = dynamic(() => import("@/components/storefront/search-overlay").then((module) => module.SearchOverlay), { ssr: false, loading: () => null });

type MenuCollection = { title: string; handle: string };

function AnnouncementBar({ messages }: { messages: string[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || messages.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % messages.length), 4500);
    return () => window.clearInterval(timer);
  }, [paused, messages.length]);
  if (!messages.length) return null;
  return <div className="announcement" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
    <AnimatePresence mode="wait" initial={false}><motion.span key={active % messages.length} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>{messages[active % messages.length]}</motion.span></AnimatePresence>
  </div>;
}

function CountBadge({ value }: { value: number }) {
  return <AnimatePresence>{value > 0 && <motion.span key={value} className="count-badge" initial={{ scale: 0.4 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 620, damping: 18 }}>{value}</motion.span>}</AnimatePresence>;
}

export function StorefrontShell({ announcements, whatsapp, collections }: { announcements: string[]; whatsapp: string; collections: MenuCollection[] }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const cartOpen = useShopStore((state) => state.cartOpen);
  const setCartOpen = useShopStore((state) => state.setCartOpen);
  const searchOpen = useShopStore((state) => state.searchOpen);
  const setSearchOpen = useShopStore((state) => state.setSearchOpen);
  const count = useShopStore((state) => state.hasHydrated ? cartCount(state.cart) : 0);
  const wishlistCount = useShopStore((state) => state.hasHydrated ? state.wishlist.length : 0);
  const signedIn = useShopStore((state) => state.signedIn);
  // Panels load on first use and stay mounted so their closing animation can play.
  const [loaded, setLoaded] = useState({ cart: false, search: false });
  useEffect(() => { if (cartOpen) setLoaded((value) => ({ ...value, cart: true })); }, [cartOpen]);
  useEffect(() => { if (searchOpen) setLoaded((value) => ({ ...value, search: true })); }, [searchOpen]);
  const closeCart = useCallback(() => setCartOpen(false), [setCartOpen]);
  const closeSearch = useCallback(() => setSearchOpen(false), [setSearchOpen]);

  useEffect(() => { setMenuOpen(false); setCartOpen(false); setSearchOpen(false); }, [pathname, setCartOpen, setSearchOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", onKey); };
  }, [menuOpen]);

  useEffect(() => {
    let previous = window.scrollY, frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const current = window.scrollY;
        setScrolled(current > 24);
        if (current > 180 && current > previous + 4) setHidden(true);
        else if (current < previous - 4 || current < 180) setHidden(false);
        previous = current;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (frame) window.cancelAnimationFrame(frame); };
  }, []);

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  const accountLabel = signedIn ? "Your account" : "Account and order tracking";
  const mobileLinks: [string, string][] = [["Home", "/"], ["Shop all", "/collections/all"], ...collections.map(({ title, handle }): [string, string] => [title, `/collections/${handle}`]), ["About", "/pages/about-us"], ["Contact", "/pages/contact"]];
  const bareCheckout = pathname === "/checkout";

  return <MotionConfig reducedMotion="user">
    <AnnouncementBar messages={announcements} />
    <header className={`site-header${scrolled ? " is-scrolled" : ""}${hidden && !menuOpen ? " is-hidden" : ""}${menuOpen ? " is-open" : ""}`}>
      <div className="header-inner">
        <button className="icon-button menu-button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
        <nav className="main-nav" aria-label="Main navigation">
          <div className="nav-group">
            <Link className="stitch-link" href="/collections/all" aria-current={isActive("/collections") ? "page" : undefined}>Shop{collections.length > 1 && <ChevronDown aria-hidden="true" />}</Link>
            {collections.length > 1 && <div className="nav-panel"><Link href="/collections/all">Shop all</Link>{collections.map(({ title, handle }) => <Link href={`/collections/${handle}`} key={handle}>{title}</Link>)}</div>}
          </div>
          <Link className="stitch-link" href="/pages/about-us" aria-current={isActive("/pages/about-us") ? "page" : undefined}>About</Link>
          <Link className="stitch-link" href="/pages/contact" aria-current={isActive("/pages/contact") ? "page" : undefined}>Contact</Link>
        </nav>
        <Link href="/" className="header-logo" aria-label="ragNready home"><BrandWordmark /></Link>
        <div className="header-actions">
          <ThemeToggle />
          <button className="icon-button" aria-label="Search" onClick={() => setSearchOpen(true)}><Search aria-hidden="true" /></button>
          <Link className="icon-button" href="/account" aria-label={accountLabel} title={accountLabel}><UserRound aria-hidden="true" />{signedIn && <span className="signed-in-dot" />}</Link>
          <Link className="icon-button" href="/pages/wishlist" aria-label={`Wishlist, ${wishlistCount} saved`}><Heart aria-hidden="true" /><CountBadge value={wishlistCount} /></Link>
          <button className="icon-button" id="cart-trigger" aria-label={`Open cart, ${count} items`} onClick={() => setCartOpen(true)}><motion.span key={count} className="bag-wiggle" initial={count ? { rotate: 0 } : false} animate={count ? { rotate: [0, -14, 11, -6, 0] } : undefined} transition={{ duration: 0.5 }}><ShoppingBag aria-hidden="true" /></motion.span><CountBadge value={count} /></button>
        </div>
      </div>
      <AnimatePresence>{menuOpen && <motion.div id="mobile-navigation" className="mobile-nav" initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }} animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }} exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }} transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}>
        <nav aria-label="Mobile navigation">{mobileLinks.map(([label, href], index) => <motion.div key={href} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}><Link href={href} onClick={() => setMenuOpen(false)} aria-current={pathname === href ? "page" : undefined}>{label}</Link></motion.div>)}</nav>
      </motion.div>}</AnimatePresence>
    </header>
    {loaded.cart && <CartDrawer open={cartOpen} onClose={closeCart} />}
    {loaded.search && <SearchOverlay open={searchOpen} onClose={closeSearch} />}
    {!bareCheckout && <a className="whatsapp" href={whatsAppLink(whatsapp, "Hi ragNready! I have a question.")} target="_blank" rel="noreferrer" aria-label="Chat with ragNready on WhatsApp"><svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 4.5A11.4 11.4 0 0 0 6.2 21.7L4.6 27.4l5.9-1.5A11.4 11.4 0 1 0 16 4.5Zm0 2.1a9.3 9.3 0 1 1-4.9 17.2l-.4-.2-3.2.8.9-3.1-.3-.4A9.3 9.3 0 0 1 16 6.6Zm-4 4.3c-.2 0-.6.1-.9.4-.3.4-1.1 1.1-1.1 2.6 0 1.6 1.1 3.1 1.3 3.3.2.2 2.2 3.5 5.5 4.8 2.7 1 3.3.8 3.9.8.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4l-2.2-1c-.3-.1-.5-.2-.8.2l-1 1.2c-.2.2-.3.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.6-1.8-1.7-2.2-.2-.3 0-.5.1-.6l.5-.6.4-.5v-.6l-1-2.4c-.3-.6-.5-.5-.7-.5H12Z" /></svg></a>}
  </MotionConfig>;
}
