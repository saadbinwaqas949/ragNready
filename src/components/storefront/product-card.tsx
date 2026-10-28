"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { Product } from "@/lib/data/types";
import { formatPrice } from "@/lib/storefront/format";
import { useShopStore } from "@/lib/storefront/store";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const reduced = useReducedMotion();
  const [size, setSize] = useState(product.variants.find((variant) => variant.stock > 0)?.size ?? "");
  const [added, setAdded] = useState(false);
  const [flight, setFlight] = useState<{ left: number; top: number; x: number; y: number } | null>(null);
  const addToCart = useShopStore((state) => state.addToCart);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const isWishlisted = useShopStore((state) => state.wishlist.includes(product.id));
  const selectedVariant = product.variants.find((variant) => variant.size === size);
  const soldOut = product.is_sold_out || (product.variants.length > 0 && product.variants.every((variant) => variant.stock < 1));
  const firstImage = product.images[0]?.url ?? "/images/placeholders/product-generic.svg";
  const secondImage = product.images[1]?.url ?? firstImage;

  function add() {
    if (soldOut || (product.variants.length > 0 && (!selectedVariant || selectedVariant.stock < 1))) return;
    addToCart({ productId: product.id, handle: product.handle, title: product.title, price: Number(product.price), image: firstImage, size: selectedVariant?.size ?? null, variantId: selectedVariant?.id ?? null, quantity: 1 });
    setAdded(true); window.setTimeout(() => setAdded(false), 1100);
    const source = document.querySelector<HTMLElement>(`[data-product-add="${product.id}"]`)?.getBoundingClientRect();
    const target = document.getElementById("cart-trigger")?.getBoundingClientRect();
    if (source && target && !reduced) {
      setFlight({ left: source.left + source.width / 2, top: source.top + source.height / 2, x: target.left + target.width / 2 - source.left - source.width / 2, y: target.top + target.height / 2 - source.top - source.height / 2 });
      window.setTimeout(() => setFlight(null), 650);
    }
  }

  return <motion.article className={`product-card${soldOut ? " product-card-sold-out" : ""}`} initial={reduced ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: reduced ? 0 : 0.45, delay: Math.min(index % 4, 3) * 0.055 }} whileHover={reduced ? undefined : { y: -4, rotateX: 1, rotateY: -1 }}>
    <div className="product-card-image-wrap" data-cursor-label="view">
      <Link href={`/products/${product.handle}`} className="product-card-image-link" aria-label={`View ${product.title}`}>
        <Image className="product-card-image" src={firstImage} alt={product.images[0]?.alt || product.title} fill sizes="(max-width: 600px) 48vw, (max-width: 1024px) 32vw, 24vw" />
        <Image className="product-card-image product-card-image-hover" src={secondImage} alt={product.images[1]?.alt || product.title} fill sizes="(max-width: 600px) 48vw, (max-width: 1024px) 32vw, 24vw" />
      </Link>
      {(product.compare_at_price && product.compare_at_price > product.price) && <span className="product-badge product-badge-sale">Sale</span>}
      {soldOut && <span className="product-badge product-badge-sold">Sold out</span>}
      <motion.button className={`product-heart${isWishlisted ? " is-active" : ""}`} aria-label={isWishlisted ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`} aria-pressed={isWishlisted} onClick={() => toggleWishlist(product.id)} whileTap={reduced ? undefined : { scale: [1, 1.4, 1] }}>{isWishlisted ? "♥" : "♡"}</motion.button>
    </div>
    <div className="product-card-copy"><Link href={`/products/${product.handle}`} className="product-card-title">{product.title}</Link>
      <div className="product-price">{formatPrice(Number(product.price))}{product.compare_at_price && product.compare_at_price > product.price && <s>{formatPrice(Number(product.compare_at_price))}</s>}</div>
      {product.variants.length > 0 && <label className="product-size-select"><span className="sr-only">Choose size for {product.title}</span><select value={size} onChange={(event) => setSize(event.target.value)} disabled={soldOut}><option value="">Select size</option>{product.variants.map((variant) => <option key={variant.id} value={variant.size} disabled={variant.stock < 1}>{variant.size}{variant.stock < 1 ? " · Sold out" : ""}</option>)}</select></label>}
      <button className="quick-add" data-product-add={product.id} onClick={add} disabled={soldOut || (product.variants.length > 0 && !selectedVariant)}>{soldOut ? "Sold out" : added ? "✓ Added" : "Add to cart"}</button>
    </div>
    {flight && <motion.span className="cart-fly-dot" style={{ left: flight.left, top: flight.top }} initial={{ x: 0, y: 0, scale: 1, opacity: 1 }} animate={{ x: flight.x, y: flight.y, scale: 0.2, opacity: 0 }} transition={{ duration: 0.58, ease: "easeIn" }} />}
  </motion.article>;
}
