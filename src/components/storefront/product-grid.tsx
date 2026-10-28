"use client";

import type { Product } from "@/lib/data/types";
import Link from "next/link";
import { ProductCard } from "./product-card";

export function ProductGrid({ products, view = "grid" }: { products: Product[]; view?: "grid" | "list" }) {
  if (!products.length) return <div className="store-empty"><p>No little treasures found for those filters.</p><Link className="text-link" href="/collections/all">Clear filters and browse all</Link></div>;
  return <div className={`product-grid${view === "list" ? " product-grid-list" : ""}`}>{products.map((product, index) => <ProductCard product={product} index={index} key={product.id} />)}</div>;
}
