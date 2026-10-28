import type { Metadata } from "next";
import { CollectionPage } from "@/components/storefront/collection-page";
import { getProducts } from "@/lib/data";
import type { ProductFilters } from "@/lib/data";

export const metadata: Metadata = { title: "Shop all baby essentials", alternates: { canonical: "/collections/all" } };
export const revalidate = 3600;

type Search = Record<string, string | string[] | undefined>;
const validSizes = ["0-3 Months", "3-6 Months", "6-9 Months", "9-12 Months", "12-18 Months"];
const validSorts = ["featured", "newest", "price-ascending", "price-descending", "title-ascending"] as const;
function one(value: string | string[] | undefined) { return typeof value === "string" ? value : undefined; }
function price(value: string | undefined) { const parsed = Number(value); return value && Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined; }

export default async function AllCollectionPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const raw = { size: one(params.size), gender: one(params.gender), season: one(params.season), minPrice: one(params.minPrice), maxPrice: one(params.maxPrice), availability: one(params.availability), sort: one(params.sort), view: one(params.view) };
  const filters: ProductFilters = {
    ...(validSizes.includes(raw.size ?? "") ? { size: raw.size } : {}),
    ...(raw.gender === "Boys" || raw.gender === "Girls" || raw.gender === "Unisex" ? { gender: raw.gender } : {}),
    ...(raw.season === "Winter" || raw.season === "Summer" || raw.season === "All Seasons" ? { season: raw.season } : {}),
    ...(raw.availability === "in-stock" || raw.availability === "sold-out" ? { availability: raw.availability } : {}),
    ...(validSorts.includes(raw.sort as typeof validSorts[number]) ? { sort: raw.sort as ProductFilters["sort"] } : {}),
    minPrice: price(raw.minPrice), maxPrice: price(raw.maxPrice),
  };
  const products = await getProducts(filters);
  return <CollectionPage basePath="/collections/all" products={products} values={raw} />;
}
