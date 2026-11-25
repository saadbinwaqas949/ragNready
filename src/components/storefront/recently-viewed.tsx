"use client";

import { useEffect } from "react";
import { useShopStore } from "@/lib/storefront/store";
import type { Product } from "@/lib/data/types";
import { ProductGrid } from "./product-grid";

export function RecentlyViewed({ productId, products, exclude }: { productId: string; products: Product[]; exclude: string[] }) {
  const ids = useShopStore((state) => state.recentlyViewed);
  const hasHydrated = useShopStore((state) => state.hasHydrated);
  const push = useShopStore((state) => state.pushRecentlyViewed);
  // Wait for the saved list, or restoring it would overwrite this visit.
  useEffect(() => { if (hasHydrated) push(productId); }, [hasHydrated, productId, push]);
  const viewed = ids.filter((id) => id !== productId && !exclude.includes(id)).map((id) => products.find((product) => product.id === id)).filter((product): product is Product => Boolean(product)).slice(0, 4);
  if (!viewed.length) return null;
  return <section className="section section-tight"><div className="section-head"><h2>Recently viewed</h2></div><ProductGrid products={viewed} /></section>;
}
