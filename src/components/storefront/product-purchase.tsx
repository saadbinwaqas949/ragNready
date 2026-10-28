"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/data/types";
import { useShopStore } from "@/lib/storefront/store";
import { formatPrice } from "@/lib/storefront/format";

export function ProductPurchase({ product }: { product: Product }) {
  const router = useRouter();
  const available = product.variants.filter((variant) => variant.stock > 0);
  const [size, setSize] = useState(available[0]?.size ?? "");
  const [quantity, setQuantity] = useState(1);
  const [sizeGuide, setSizeGuide] = useState(false);
  const [added, setAdded] = useState(false);
  const addToCart = useShopStore((state) => state.addToCart);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const isWishlisted = useShopStore((state) => state.wishlist.includes(product.id));
  const variant = product.variants.find((item) => item.size === size);
  const soldOut = product.is_sold_out || (product.variants.length > 0 && available.length === 0);
  const canAdd = !soldOut && (!product.variants.length || Boolean(variant && variant.stock > 0));

  useEffect(() => { if (variant && quantity > variant.stock) setQuantity(variant.stock || 1); }, [variant, quantity]);

  function add(buyNow = false) {
    if (!canAdd) return;
    addToCart({ productId: product.id, handle: product.handle, title: product.title, price: Number(product.price), image: product.images[0]?.url ?? "/images/placeholders/product-generic.svg", size: variant?.size ?? null, variantId: variant?.id ?? null, quantity });
    setAdded(true); window.setTimeout(() => setAdded(false), 1200);
    if (buyNow) router.push("/checkout");
  }

  const options = <>
    {product.variants.length > 0 && <div className="product-size-heading"><label htmlFor="product-size">Choose a size</label><button className="text-link" onClick={() => setSizeGuide(true)}>Size guide</button></div>}
    {product.variants.length > 0 && <select id="product-size" className="product-detail-size" value={size} onChange={(event) => { setSize(event.target.value); setQuantity(1); }} disabled={soldOut}><option value="">Select size</option>{product.variants.map((item) => <option key={item.id} value={item.size} disabled={item.stock < 1}>{item.size}{item.stock < 1 ? " · Sold out" : ""}</option>)}</select>}
    <div className="product-quantity-row"><span>Quantity</span><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => setQuantity((count) => Math.max(1, count - 1))}>−</button><span>{quantity}</span><button aria-label="Increase quantity" disabled={Boolean(variant && quantity >= variant.stock)} onClick={() => setQuantity((count) => Math.min(variant?.stock ?? 99, count + 1))}>+</button></div></div>
    <div className="product-purchase-buttons"><button className="button-primary" onClick={() => add()} disabled={!canAdd}>{soldOut ? "Sold out" : added ? "✓ Added to cart" : "Add to cart"}</button><button className="button-secondary" onClick={() => add(true)} disabled={!canAdd}>Buy now</button></div>
    <button className={`product-detail-wishlist${isWishlisted ? " is-active" : ""}`} aria-pressed={isWishlisted} onClick={() => toggleWishlist(product.id)}>{isWishlisted ? "♥ Saved to wishlist" : "♡ Add to wishlist"}</button>
  </>;

  return <>
    <div className="product-purchase-panel">{options}</div>
    {!soldOut && <div className="sticky-add-mobile"><span>{formatPrice(Number(product.price))}</span><button className="button-primary" onClick={() => add()} disabled={!canAdd}>{added ? "✓ Added" : "Add to cart"}</button></div>}
    {sizeGuide && <div className="size-guide-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSizeGuide(false); }}><section className="size-guide-dialog" role="dialog" aria-modal="true" aria-labelledby="size-guide-title"><button className="size-guide-close" onClick={() => setSizeGuide(false)} aria-label="Close size guide">×</button><h2 id="size-guide-title">A little size guide</h2><p>Our sizes follow your baby&apos;s age. If you&apos;re between sizes, choose the roomier fit for growing little ones.</p><table><thead><tr><th>Size</th><th>Approximate age</th></tr></thead><tbody>{["0-3 Months", "3-6 Months", "6-9 Months", "9-12 Months", "12-18 Months"].map((age) => <tr key={age}><td>{age}</td><td>{age}</td></tr>)}</tbody></table></section></div>}
  </>;
}
