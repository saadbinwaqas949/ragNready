import type { Metadata } from "next";
import { WishlistProducts } from "@/components/storefront/wishlist-products";
import { googleSignInEnabled } from "@/lib/supabase/auth-providers";
import { getProducts } from "@/lib/data";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false, follow: false } };

export default async function WishlistPage() {
  const [products, googleEnabled] = await Promise.all([getProducts(), googleSignInEnabled()]);
  return <main className="section page-full"><header className="collection-head"><h1 className="page-title">Wishlist</h1></header><WishlistProducts googleEnabled={googleEnabled} products={products} /></main>;
}
