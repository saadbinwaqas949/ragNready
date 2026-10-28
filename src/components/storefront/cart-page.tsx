"use client";

import Image from "next/image";
import Link from "next/link";
import { useShopStore } from "@/lib/storefront/store";
import { formatPrice } from "@/lib/storefront/format";

export function CartPage() {
  const cart = useShopStore((state) => state.cart);
  const setQuantity = useShopStore((state) => state.setQuantity);
  const remove = useShopStore((state) => state.removeFromCart);
  const subtotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
  if (!cart.length) return <main className="section cart-page"><p className="eyebrow center-eyebrow">a little room for something lovely</p><h1 className="section-heading">Your cart</h1><div className="store-empty"><p>Your cart is empty.</p><Link className="button-primary" href="/collections/all">Continue shopping</Link></div></main>;
  return <main className="section cart-page"><p className="eyebrow">your thoughtful picks</p><h1 className="section-heading section-heading-left">Your cart</h1><div className="full-cart-layout"><div className="full-cart-lines">{cart.map((line) => <article className="full-cart-line" key={line.key}><Link href={`/products/${line.handle}`}><Image src={line.image} alt="" width={120} height={145} /></Link><div><Link href={`/products/${line.handle}`}>{line.title}</Link>{line.size && <p>Size: {line.size}</p>}<div className="quantity-control"><button onClick={() => setQuantity(line.key, line.quantity - 1)} aria-label="Decrease quantity">−</button><span>{line.quantity}</span><button onClick={() => setQuantity(line.key, line.quantity + 1)} aria-label="Increase quantity">+</button></div><button className="cart-remove" onClick={() => remove(line.key)}>Remove</button></div><strong>{formatPrice(line.price * line.quantity)}</strong></article>)}</div><aside className="full-cart-summary"><h2>Order summary</h2><p><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></p><small>Shipping and payment are confirmed at checkout.</small><Link className="button-primary" href="/checkout">Checkout</Link><Link className="continue-link" href="/collections/all">Continue shopping</Link></aside></div></main>;
}
