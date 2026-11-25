"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import type { Product } from "@/lib/data/types";
import { formatPrice } from "@/lib/storefront/format";
import { isSoldOut, PLACEHOLDER_IMAGE, salePriceFrom, shortSize, toCartLine } from "@/lib/storefront/product";
import { useShopStore } from "@/lib/storefront/store";
import { WishlistButton } from "./wishlist-button";

const imageSizes = "(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw";

export function ProductCard({ product, index = 0, priority = false }: { product: Product; index?: number; priority?: boolean }) {
  const [choosing, setChoosing] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const addToCart = useShopStore((state) => state.addToCart);
  const setCartOpen = useShopStore((state) => state.setCartOpen);
  const soldOut = isSoldOut(product);
  const before = salePriceFrom(product);
  const [first, second] = product.images;

  useEffect(() => {
    if (!choosing) return;
    const onPointer = (event: PointerEvent) => { if (!cardRef.current?.contains(event.target as Node)) setChoosing(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setChoosing(false); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [choosing]);

  function add(size: string | null) {
    addToCart(toCartLine(product, size));
    setChoosing(false);
    setCartOpen(true);
  }

  function quickAdd() {
    const available = product.variants.filter((variant) => variant.stock > 0);
    if (!product.variants.length) add(null);
    else if (available.length === 1 && product.variants.length === 1) add(available[0].size);
    else setChoosing((value) => !value);
  }

  return <article ref={cardRef} className={`product-card reveal${soldOut ? " is-sold-out" : ""}`} style={{ "--reveal-delay": `${Math.min(index % 4, 3) * 70}ms` } as React.CSSProperties}>
    <div className="product-card-media">
      <Link href={`/products/${product.handle}`} className="product-card-link" aria-label={`View ${product.title}`}>
        <Image className="product-card-image" src={first?.url ?? PLACEHOLDER_IMAGE} alt={first?.alt || product.title} fill quality={75} sizes={imageSizes} priority={priority} />
        {second && <Image className="product-card-image product-card-image-hover" src={second.url} alt="" fill quality={75} sizes={imageSizes} />}
      </Link>
      <div className="product-flags">{soldOut ? <span className="flag flag-sold">Sold out</span> : before ? <span className="flag flag-sale">Save {Math.round((1 - Number(product.price) / before) * 100)}%</span> : product.badges?.[0] ? <span className="flag">{product.badges[0]}</span> : null}</div>
      <WishlistButton productId={product.id} title={product.title} />
      {!soldOut && <button type="button" className={`quick-add${choosing ? " is-open" : ""}`} aria-expanded={product.variants.length > 1 ? choosing : undefined} aria-label={choosing ? "Close sizes" : `Add ${product.title} to cart`} onClick={quickAdd}>{choosing ? <X aria-hidden="true" /> : <Plus aria-hidden="true" />}</button>}
      <div className={`quick-sizes${choosing ? " is-open" : ""}`} inert={!choosing} aria-label="Choose a size" role="group">{product.variants.map((variant) => <button key={variant.id} type="button" disabled={variant.stock < 1} aria-label={`${variant.size}${variant.stock < 1 ? ", sold out" : ""}`} onClick={() => add(variant.size)}>{shortSize(variant.size)}</button>)}</div>
    </div>
    <div className="product-card-copy">
      <Link href={`/products/${product.handle}`} className="product-card-title">{product.title}</Link>
      <p className="price"><span>{formatPrice(Number(product.price))}</span>{before && <s>{formatPrice(before)}</s>}</p>
    </div>
  </article>;
}
