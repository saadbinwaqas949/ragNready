"use client";

import Link from "next/link";
import { useShopStore } from "@/lib/storefront/store";
import type { Product } from "@/lib/data/types";
import { ProductGrid } from "./product-grid";

export function WishlistProducts({ products }: { products: Product[] }) {
  const ids = useShopStore((state) => state.wishlist);
  const saved = products.filter((product) => ids.includes(product.id));
  if (ids.length === 0) return <div className="store-empty"><p>Your wishlist is waiting for a little something.</p><Link className="button-primary" href="/collections/all">Find a favourite</Link></div>;
  return <ProductGrid products={saved} />;
}
