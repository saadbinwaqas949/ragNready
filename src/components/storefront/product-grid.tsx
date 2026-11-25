"use client";

import { useEffect, useRef } from "react";
import type { Product } from "@/lib/data/types";
import { ProductCard } from "./product-card";

/** Lays out one product as a feature and many as a grid, so a small shop never looks half empty. */
export function ProductGrid({ products, priority = false }: { products: Product[]; priority?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = Array.from(ref.current?.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)") ?? []);
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }), { rootMargin: "0px 0px -6% 0px" });
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [products]);

  return <div ref={ref} className="product-grid" data-count={Math.min(products.length, 4)}>{products.map((product, index) => <ProductCard product={product} index={index} priority={priority && index < 2} key={product.id} />)}</div>;
}
