import type { Metadata } from "next";
import { WishlistProducts } from "@/components/storefront/wishlist-products";
import { getProducts } from "@/lib/data";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false, follow: false } };

export default async function WishlistPage() {
  const products = await getProducts();
  return <main className="section wishlist-page"><p className="eyebrow center-eyebrow">your saved little things</p><h1 className="section-heading">Your Wishlist</h1><p className="section-subtitle">Keep your thoughtful favourites close.</p><WishlistProducts products={products} /></main>;
}
