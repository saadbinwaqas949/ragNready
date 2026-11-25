import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/lib/data";
import { ProductGrid } from "@/components/storefront/product-grid";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: false } };

export default async function SearchResultsPage({ searchParams }: { searchParams: Promise<{ query?: string | string[] }> }) {
  const params = await searchParams;
  const query = typeof params.query === "string" ? params.query.trim().slice(0, 100) : "";
  const products = query ? await getProducts({ search: query }) : [];
  return <main className="section page-full"><header className="collection-head"><h1 className="page-title">{query ? `Results for “${query}”` : "Search"}</h1><p className="page-intro">{query ? `${products.length} ${products.length === 1 ? "piece" : "pieces"} found` : "Use the search icon at the top to look for a piece."}</p></header>
    {products.length > 0 ? <ProductGrid products={products} /> : <div className="empty-state"><Link className="button button-primary" href="/collections/all">Shop all</Link></div>}
  </main>;
}
