import type { Metadata } from "next";
import { CollectionPage } from "@/components/storefront/collection-page";
import { getProducts } from "@/lib/data";
import { readFilters, type SearchValues } from "@/lib/storefront/filters";

export const metadata: Metadata = { title: "Shop all baby clothing", description: "Shop every ragNready piece: bodysuits, frocks, rompers, caps and gift sets. Cash on delivery across Pakistan.", alternates: { canonical: "/collections/all" } };

export default async function AllCollectionPage({ searchParams }: { searchParams: Promise<SearchValues> }) {
  const filters = readFilters(await searchParams);
  const [products, allProducts] = await Promise.all([getProducts(filters), getProducts()]);
  return <CollectionPage basePath="/collections/all" products={products} allProducts={allProducts} current={{ size: filters.size, gender: filters.gender, season: filters.season, sort: filters.sort }} />;
}
