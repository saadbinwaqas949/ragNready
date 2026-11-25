"use client";

import Link from "next/link";
import { MotionConfig } from "framer-motion";
import { deliveryFee, formatPrice } from "@/lib/storefront/format";
import { cartSubtotal, useShopStore } from "@/lib/storefront/store";
import { useCartCheck } from "@/hooks/use-cart-check";
import { CartLines } from "./cart-lines";

export function CartPage() {
  const cart = useShopStore((state) => state.cart);
  const hasHydrated = useShopStore((state) => state.hasHydrated);
  const delivery = useShopStore((state) => state.delivery);
  useCartCheck(true);
  const subtotal = cartSubtotal(cart);
  const fee = delivery ? deliveryFee(subtotal, delivery) : null;
  if (!hasHydrated) return <main className="section page-narrow" aria-busy="true"><h1 className="page-title">Your cart</h1><div className="skeleton skeleton-block" /></main>;
  if (!cart.length) return <main className="section page-narrow"><h1 className="page-title">Your cart</h1><div className="empty-state"><p>Your cart is empty.</p><Link className="button button-primary" href="/collections/all">Continue shopping</Link></div></main>;
  return <MotionConfig reducedMotion="user"><main className="section page-wide"><h1 className="page-title">Your cart</h1><div className="split-layout"><CartLines />
    <aside className="summary-card"><h2>Summary</h2><p className="total-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></p><p className="total-row"><span>Delivery</span><span>{fee === null ? "At checkout" : fee === 0 ? "Free" : formatPrice(fee)}</span></p><p className="total-row total-row-grand"><span>Total</span><strong>{formatPrice(subtotal + (fee ?? 0))}</strong></p><Link className="button button-primary" href="/checkout">Checkout</Link><p className="fine-print">Cash on delivery. You pay when your parcel arrives.</p></aside>
  </div></main></MotionConfig>;
}
