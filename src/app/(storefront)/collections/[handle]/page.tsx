import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionPage } from "@/components/storefront/collection-page";
import { getCollectionByHandle, getProducts } from "@/lib/data";
import type { ProductFilters } from "@/lib/data";

export const revalidate = 3600;
type Props = { params: Promise<{ handle: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const validSizes = ["0-3 Months", "3-6 Months", "6-9 Months", "9-12 Months", "12-18 Months"];
const validSorts = ["featured", "newest", "price-ascending", "price-descending", "title-ascending"] as const;
function val(value: string | string[] | undefined) { return typeof value === "string" ? value : undefined; }
function numeric(value?: string) { const number = Number(value); return value && Number.isFinite(number) && number >= 0 ? number : undefined; }
function readFilters(p: Record<string, string | string[] | undefined>): ProductFilters {
  const size = val(p.size), gender = val(p.gender), season = val(p.season), availability = val(p.availability), sort = val(p.sort);
  return {
    ...(validSizes.includes(size ?? "") ? { size } : {}),
    ...(gender === "Boys" || gender === "Girls" || gender === "Unisex" ? { gender } : {}),
    ...(season === "Winter" || season === "Summer" || season === "All Seasons" ? { season } : {}),
    ...(availability === "in-stock" || availability === "sold-out" ? { availability } : {}),
    ...(validSorts.includes(sort as typeof validSorts[number]) ? { sort: sort as ProductFilters["sort"] } : {}),
    minPrice: numeric(val(p.minPrice)), maxPrice: numeric(val(p.maxPrice)),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);
  return collection ? { title: collection.title, description: collection.description, alternates: { canonical: `/collections/${collection.handle}` }, openGraph: { title: collection.title, description: collection.description, images: collection.image ? [collection.image] : [] } } : { title: "Collection not found", robots: { index: false, follow: false } };
}

export default async function CollectionHandlePage({ params, searchParams }: Props) {
  const [{ handle }, search] = await Promise.all([params, searchParams]);
  const collection = await getCollectionByHandle(handle);
  if (!collection) notFound();
  const raw = Object.fromEntries(Object.entries(search).map(([key, value]) => [key, val(value)])) as Record<string, string | undefined>;
  const products = await getProducts({ ...readFilters(search), collectionHandle: handle });
  return <CollectionPage collection={collection} basePath={`/collections/${handle}`} products={products} values={raw} />;
}
