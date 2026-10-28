"use client";

import { useEffect } from "react";
import { useShopStore } from "@/lib/storefront/store";
import type { Product } from "@/lib/data/types";
import { ProductGrid } from "./product-grid";

export function RecentlyViewed({ productId, products }: { productId: string; products: Product[] }) {
  const ids = useShopStore((state) => state.recentlyViewed);
  const push = useShopStore((state) => state.pushRecentlyViewed);
  useEffect(() => { push(productId); }, [productId, push]);
  const viewed = ids.filter((id) => id !== productId).map((id) => products.find((product) => product.id === id)).filter((product): product is Product => Boolean(product)).slice(0, 4);
  if (!viewed.length) return null;
  return <section className="section compact-section"><h2 className="section-heading">Recently viewed</h2><ProductGrid products={viewed} /></section>;
}
