"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { formatPrice } from "@/lib/storefront/format";
import { cartCount, cartSubtotal, useShopStore } from "@/lib/storefront/store";
import { useDialogFocus } from "@/hooks/use-dialog-focus";
import { useCartCheck } from "@/hooks/use-cart-check";
import { CartLines } from "./cart-lines";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cart = useShopStore((state) => state.cart);
  const drawerRef = useRef<HTMLElement>(null);
  const subtotal = cartSubtotal(cart);
  const blocked = cart.length > 0 && cart.every((line) => line.stock === 0);
  useDialogFocus(open, onClose, drawerRef);
  useCartCheck(open);
  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, [open]);

  return <AnimatePresence>{open && <>
    <motion.div key="backdrop" className="drawer-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} />
    <motion.aside key="drawer" ref={drawerRef} tabIndex={-1} className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 360, damping: 38, mass: 0.9 }}>
      <div className="drawer-heading"><h2 id="cart-title">Your cart <span>{cartCount(cart)}</span></h2><button className="icon-button" onClick={onClose} aria-label="Close cart"><X aria-hidden="true" /></button></div>
      {cart.length === 0
        ? <div className="empty-state"><p>Your cart is empty.</p><Link className="button button-primary" href="/collections/all" onClick={onClose}>Continue shopping</Link></div>
        : <><CartLines onNavigate={onClose} />
          <div className="drawer-footer"><p className="total-row"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></p><Link className="button button-primary" href={blocked ? "/collections/all" : "/checkout"} onClick={onClose}>{blocked ? "Continue shopping" : "Checkout"}</Link>{!blocked && <button type="button" className="text-button" onClick={onClose}>Continue shopping</button>}</div></>}
    </motion.aside>
  </>}</AnimatePresence>;
}
