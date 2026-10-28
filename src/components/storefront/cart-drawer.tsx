"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";
import { formatPrice } from "@/lib/storefront/format";
import { useShopStore } from "@/lib/storefront/store";
import { useDialogFocus } from "@/hooks/use-dialog-focus";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cart = useShopStore((state) => state.cart);
  const setQuantity = useShopStore((state) => state.setQuantity);
  const removeFromCart = useShopStore((state) => state.removeFromCart);
  const drawerRef = useRef<HTMLElement>(null);
  const subtotal = cart.reduce((total, line) => total + line.price * line.quantity, 0);
  useDialogFocus(open, onClose, drawerRef);

  return <>
    <AnimatePresence>{open && <motion.button key="cart-backdrop" className="drawer-backdrop" aria-label="Close cart" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />}</AnimatePresence>
    <AnimatePresence>{open && <motion.aside ref={drawerRef} tabIndex={-1} key="cart-drawer" className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.24, ease: "easeOut" }}>
      <div className="drawer-heading"><h2 id="cart-title">Your cart <span>({cart.reduce((count, line) => count + line.quantity, 0)})</span></h2><button className="icon-button" onClick={onClose} aria-label="Close cart">×</button></div>
      {cart.length === 0 ? <div className="drawer-empty"><p>Your cart is empty.</p><Link className="button-primary" href="/collections/all" onClick={onClose}>Continue shopping</Link></div> : <>
        <div className="cart-lines">{cart.map((line) => <article className="cart-line" key={line.key}>
          <Link className="cart-line-image" href={`/products/${line.handle}`} onClick={onClose}><Image src={line.image} alt="" fill sizes="92px" /></Link>
          <div className="cart-line-info"><Link href={`/products/${line.handle}`} onClick={onClose}>{line.title}</Link>{line.size && <span>Size: {line.size}</span>}<strong>{formatPrice(line.price)}</strong>
            <div className="cart-line-actions"><div className="quantity-control"><button aria-label={`Decrease ${line.title} quantity`} onClick={() => setQuantity(line.key, line.quantity - 1)}>−</button><span>{line.quantity}</span><button aria-label={`Increase ${line.title} quantity`} onClick={() => setQuantity(line.key, line.quantity + 1)}>+</button></div><button className="cart-remove" onClick={() => removeFromCart(line.key)}>Remove</button></div>
          </div>
        </article>)}</div>
        <div className="drawer-footer"><p><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></p><Link className="button-primary" href="/checkout" onClick={onClose}>Checkout</Link><Link className="continue-link" href="/collections/all" onClick={onClose}>Continue shopping</Link></div>
      </>}
    </motion.aside>}</AnimatePresence>
  </>;
}
