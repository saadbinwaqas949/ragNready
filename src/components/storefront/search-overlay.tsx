"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import type { Product } from "@/lib/data/types";
import { formatPrice } from "@/lib/storefront/format";
import { PLACEHOLDER_IMAGE } from "@/lib/storefront/product";
import { useDialogFocus } from "@/hooks/use-dialog-focus";

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "failed">("idle");
  useDialogFocus(open, onClose, overlayRef, inputRef);

  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, [open]);

  useEffect(() => {
    const value = query.trim();
    if (!value) { setResults([]); setStatus("idle"); return; }
    setStatus("loading");
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(value)}`, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const data = await response.json() as { products?: Product[] };
        setResults(data.products ?? []); setStatus("done");
      } catch (reason) { if (!(reason instanceof DOMException)) { setResults([]); setStatus("failed"); } }
    }, 220);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    onClose(); router.push(`/search?query=${encodeURIComponent(query.trim())}`);
  }

  return <AnimatePresence>{open && <>
    <motion.div key="backdrop" className="drawer-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
    <motion.div key="panel" ref={overlayRef} tabIndex={-1} className="search-panel" role="dialog" aria-modal="true" aria-label="Search" initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={{ type: "spring", stiffness: 320, damping: 36 }}>
      <form className="search-form" onSubmit={submit}><Search aria-hidden="true" /><input ref={inputRef} type="search" aria-label="Search the shop" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rompers, caps, gift sets" autoComplete="off" maxLength={100} enterKeyHint="search" /><button type="button" className="icon-button" onClick={onClose} aria-label="Close search"><X aria-hidden="true" /></button></form>
      <div className="search-results" aria-live="polite">
        {status === "done" && !results.length && <p>Nothing matches “{query.trim()}”. Try a shorter word.</p>}
        {status === "failed" && <p>Search is not responding. Check your connection and try again.</p>}
        {results.map((product, index) => <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}><Link className="search-result" href={`/products/${product.handle}`} onClick={onClose}><span className="search-result-image"><Image src={product.images[0]?.url ?? PLACEHOLDER_IMAGE} alt="" fill quality={75} sizes="64px" /></span><span>{product.title}</span><strong>{formatPrice(Number(product.price))}</strong></Link></motion.div>)}
      </div>
    </motion.div>
  </>}</AnimatePresence>;
}
