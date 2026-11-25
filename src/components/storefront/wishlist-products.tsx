"use client";

import Link from "next/link";
import { useShopStore } from "@/lib/storefront/store";
import type { Product } from "@/lib/data/types";
import { ProductGrid } from "./product-grid";

export function WishlistProducts({ products, googleEnabled }: { products: Product[]; googleEnabled: boolean }) {
  const ids = useShopStore((state) => state.wishlist);
  const hasHydrated = useShopStore((state) => state.hasHydrated);
  const signedIn = useShopStore((state) => state.signedIn);
  if (!hasHydrated) return <div className="skeleton skeleton-block" aria-busy="true" />;
  const saved = [...ids].reverse().map((id) => products.find((product) => product.id === id)).filter((product): product is Product => Boolean(product));
  return <>
    <p className="page-intro">{signedIn ? "Saved to your account, on every device you sign in to." : <>Saved on this device.{googleEnabled && <> <Link className="stitch-link is-drawn" href="/account?next=/pages/wishlist">Sign in with Google</Link> to keep it everywhere.</>}</>}</p>
    {saved.length ? <ProductGrid products={saved} /> : <div className="empty-state"><p>Tap the heart on anything you like and it will wait for you here.</p><Link className="button button-primary" href="/collections/all">Shop all</Link></div>}
  </>;
}
