"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/data/types";
import { formatPrice } from "@/lib/storefront/format";
import { useDialogFocus } from "@/hooks/use-dialog-focus";

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    try {
      const stored = JSON.parse(window.localStorage.getItem("ragnready-recent-searches") ?? "[]") as unknown;
      setRecent(Array.isArray(stored) ? stored.filter((item): item is string => typeof item === "string").slice(0, 5) : []);
    } catch { setRecent([]); }
    return;
  }, [open, onClose]);

  useDialogFocus(open, onClose, overlayRef, inputRef);

  useEffect(() => {
    const value = query.trim();
    if (!value) { setResults([]); setLoading(false); return; }
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
        const data = await response.json() as { products?: Product[] };
        setResults(data.products ?? []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 260);
    return () => window.clearTimeout(timer);
  }, [query]);

  function remember(value: string) {
    const items = [value, ...recent.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, 5);
    setRecent(items);
    window.localStorage.setItem("ragnready-recent-searches", JSON.stringify(items));
  }

  return <AnimatePresence>{open && <motion.div ref={overlayRef} tabIndex={-1} className="search-overlay" role="dialog" aria-modal="true" aria-label="Search ragNready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="search-overlay-top"><Link href="/" onClick={onClose} className="search-brand">ragNready</Link><button className="search-close" onClick={onClose} aria-label="Close search">×</button></div>
    <form className="search-main-form" action="/search" onSubmit={() => query.trim() && remember(query.trim())}><label htmlFor="search-query">What little thing are you looking for?</label><div><input ref={inputRef} id="search-query" name="query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search baby essentials…" autoComplete="off" /><button type="submit" aria-label="Search">⌕</button></div></form>
    <div className="search-suggestions">
      {loading && <p className="search-muted">Finding thoughtful pieces…</p>}
      {!loading && query && results.length === 0 && <p className="search-muted">No matching products yet.</p>}
      {results.length > 0 && <><p className="search-kicker">Products</p><div className="search-result-list">{results.slice(0, 6).map((product) => <Link className="search-result" href={`/products/${product.handle}`} onClick={() => { remember(query.trim()); onClose(); }} key={product.id}><span className="search-result-image"><Image src={product.images[0]?.url ?? "/images/placeholders/product-generic.svg"} alt="" fill sizes="56px" /></span><span>{product.title}<small>{formatPrice(Number(product.price))}</small></span><span aria-hidden="true">↗</span></Link>)}</div><Link className="search-all-link" href={`/search?query=${encodeURIComponent(query)}`} onClick={() => { remember(query.trim()); onClose(); }}>See all results →</Link></>}
      {!query && recent.length > 0 && <><p className="search-kicker">Recent searches</p><div className="recent-searches">{recent.map((item) => <button key={item} onClick={() => setQuery(item)}>{item}</button>)}</div></>}
    </div>
  </motion.div>}</AnimatePresence>;
}
