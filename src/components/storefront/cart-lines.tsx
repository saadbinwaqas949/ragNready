"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { formatPrice } from "@/lib/storefront/format";
import { useShopStore } from "@/lib/storefront/store";

/** Cart rows shared by the drawer and the cart page. */
export function CartLines({ onNavigate }: { onNavigate?: () => void }) {
  const cart = useShopStore((state) => state.cart);
  const setQuantity = useShopStore((state) => state.setQuantity);
  const remove = useShopStore((state) => state.removeFromCart);
  return <ul className="cart-lines"><AnimatePresence initial={false}>{cart.map((line) => {
    const soldOut = line.stock === 0;
    const atLimit = line.quantity >= Math.min(line.stock ?? 20, 20);
    return <motion.li key={line.key} className={`cart-line${soldOut ? " is-unavailable" : ""}`} layout="position" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40, height: 0, paddingBlock: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
      <Link className="cart-line-image" href={`/products/${line.handle}`} onClick={onNavigate} tabIndex={-1} aria-hidden="true"><Image src={line.image} alt="" fill quality={75} sizes="96px" /></Link>
      <div className="cart-line-info">
        <div className="cart-line-top"><Link href={`/products/${line.handle}`} onClick={onNavigate}>{line.title}</Link><strong>{soldOut ? "Sold out" : formatPrice(line.price * line.quantity)}</strong></div>
        {line.size && <span className="cart-line-size">{line.size}</span>}
        <div className="cart-line-actions">
          {soldOut ? <span className="field-error">No longer available</span> : <div className="stepper stepper-small" role="group" aria-label={`Quantity of ${line.title}`}><button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(line.key, line.quantity - 1)}><Minus aria-hidden="true" /></button><output aria-live="polite">{line.quantity}</output><button type="button" aria-label="Increase quantity" disabled={atLimit} onClick={() => setQuantity(line.key, line.quantity + 1)}><Plus aria-hidden="true" /></button></div>}
          <button type="button" className="text-button" onClick={() => remove(line.key)} aria-label={`Remove ${line.title}`}>Remove</button>
        </div>
        {!soldOut && atLimit && line.stock !== undefined && line.stock < 20 && <span className="stock-note">That is all we have in this size.</span>}
      </div>
    </motion.li>;
  })}</AnimatePresence></ul>;
}
