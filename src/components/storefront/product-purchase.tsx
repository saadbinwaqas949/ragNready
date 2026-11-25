"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { Check, Minus, Plus, X } from "lucide-react";
import type { Product } from "@/lib/data/types";
import { useShopStore } from "@/lib/storefront/store";
import { formatPrice } from "@/lib/storefront/format";
import { isSoldOut, shortSize, toCartLine } from "@/lib/storefront/product";
import { useDialogFocus } from "@/hooks/use-dialog-focus";
import { SizeTable } from "./size-table";
import { WishlistButton } from "./wishlist-button";

function SizeGuide({ close }: { close: () => void }) {
  const ref = useRef<HTMLElement>(null);
  useDialogFocus(true, close, ref);
  return <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <motion.section ref={ref} tabIndex={-1} className="modal" role="dialog" aria-modal="true" aria-labelledby="size-guide-title" initial={{ y: 24, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 16, opacity: 0 }} transition={{ type: "spring", stiffness: 380, damping: 32 }}>
      <button className="icon-button modal-close" onClick={close} aria-label="Close size guide"><X aria-hidden="true" /></button>
      <h2 id="size-guide-title">Size guide</h2><p>Sizes follow your baby&apos;s age. Between two sizes, choose the larger one so there is room to grow.</p><SizeTable />
    </motion.section>
  </motion.div>;
}

export function ProductPurchase({ product, whatsappHref }: { product: Product; whatsappHref: string }) {
  const router = useRouter();
  const available = product.variants.filter((variant) => variant.stock > 0);
  const [size, setSize] = useState(available.length === 1 ? available[0].size : "");
  const [quantity, setQuantity] = useState(1);
  const [sizeGuide, setSizeGuide] = useState(false);
  const [added, setAdded] = useState(false);
  const [needsSize, setNeedsSize] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const sizesRef = useRef<HTMLFieldSetElement>(null);
  const addToCart = useShopStore((state) => state.addToCart);
  const setCartOpen = useShopStore((state) => state.setCartOpen);
  const variant = product.variants.find((item) => item.size === size);
  const soldOut = isSoldOut(product);
  const limit = Math.min(variant?.stock ?? 20, 20);

  useEffect(() => { setQuantity((count) => Math.max(1, Math.min(count, limit))); }, [limit]);
  useEffect(() => {
    const target = buttonsRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setShowBar(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  function add(buyNow = false) {
    if (soldOut) return;
    if (product.variants.length && !variant) {
      setNeedsSize(true);
      sizesRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      sizesRef.current?.querySelector<HTMLInputElement>("input:not(:disabled)")?.focus({ preventScroll: true });
      return;
    }
    addToCart(toCartLine(product, variant?.size ?? null, quantity));
    if (buyNow) { router.push("/checkout"); return; }
    setAdded(true); window.setTimeout(() => setAdded(false), 1600);
    setCartOpen(true);
  }

  return <MotionConfig reducedMotion="user">
    <div className="purchase">
      {product.variants.length > 0 && <fieldset ref={sizesRef} className={`size-picker${needsSize ? " has-error" : ""}`} disabled={soldOut}>
        <legend>Size{size && <span> {size}</span>}</legend>
        <button type="button" className="stitch-link size-guide-link" onClick={() => setSizeGuide(true)}>Size guide</button>
        <div className="size-options">{product.variants.map((item) => <label key={item.id} className="size-option"><input type="radio" name="size" value={item.size} checked={size === item.size} disabled={item.stock < 1} onChange={() => { setSize(item.size); setNeedsSize(false); }} /><span>{shortSize(item.size)}</span></label>)}</div>
        {needsSize && <p className="field-error" role="alert">Choose a size first.</p>}
        {variant && variant.stock <= 3 && <p className="stock-note">Only {variant.stock} left in this size.</p>}
      </fieldset>}
      {!soldOut && <div className="quantity-row"><span id="quantity-label">Quantity</span><div className="stepper" role="group" aria-labelledby="quantity-label"><button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((count) => count - 1)}><Minus aria-hidden="true" /></button><output aria-live="polite">{quantity}</output><button type="button" aria-label="Increase quantity" disabled={quantity >= limit} onClick={() => setQuantity((count) => count + 1)}><Plus aria-hidden="true" /></button></div></div>}
      <div ref={buttonsRef} className="purchase-buttons">
        {soldOut
          ? <a className="button button-primary" href={whatsappHref} target="_blank" rel="noreferrer">Ask when it is back</a>
          : <><button type="button" className={`button button-primary add-button${added ? " is-added" : ""}`} onClick={() => add()}><span className="add-label">Add to cart</span><span className="add-done" aria-hidden={!added}><Check aria-hidden="true" />Added</span></button><button type="button" className="button button-outline" onClick={() => add(true)}>Buy now</button></>}
      </div>
      <div className="purchase-links"><WishlistButton productId={product.id} title={product.title} className="text-button heart-text" withLabel /><a className="text-button" href={whatsappHref} target="_blank" rel="noreferrer">Ask about this on WhatsApp</a></div>
    </div>
    <AnimatePresence>{showBar && !soldOut && <motion.div className="sticky-bar" initial={{ y: "110%" }} animate={{ y: 0 }} exit={{ y: "110%" }} transition={{ type: "spring", stiffness: 380, damping: 36 }}><div><strong>{product.title}</strong><span>{formatPrice(Number(product.price))}{size ? `, ${size}` : ""}</span></div><button type="button" className="button button-primary" onClick={() => add()}>{product.variants.length && !variant ? "Choose size" : "Add to cart"}</button></motion.div>}</AnimatePresence>
    <AnimatePresence>{sizeGuide && <SizeGuide close={() => setSizeGuide(false)} />}</AnimatePresence>
  </MotionConfig>;
}
