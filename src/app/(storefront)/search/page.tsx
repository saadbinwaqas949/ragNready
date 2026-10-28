import type { Metadata } from "next";
import { getProducts } from "@/lib/data";
import { ProductGrid } from "@/components/storefront/product-grid";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: false } };

export default async function SearchResultsPage({ searchParams }: { searchParams: Promise<{ query?: string | string[] }> }) {
  const params = await searchParams;
  const query = typeof params.query === "string" ? params.query.trim().slice(0, 100) : "";
  const products = query ? await getProducts({ search: query, sort: "featured" }) : [];
  return <main className="section search-results-page"><p className="eyebrow center-eyebrow">find a little something lovely</p><h1 className="section-heading">{query ? `Results for “${query}”` : "Search"}</h1><p className="section-subtitle">{query ? `${products.length} ${products.length === 1 ? "piece" : "pieces"} found` : "Use the search icon to find a thoughtful little favourite."}</p>{query && <ProductGrid products={products} />}</main>;
}
