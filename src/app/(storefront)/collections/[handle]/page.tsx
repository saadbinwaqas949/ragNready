import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionPage } from "@/components/storefront/collection-page";
import { getCollectionByHandle, getProducts } from "@/lib/data";
import { readFilters, type SearchValues } from "@/lib/storefront/filters";

type Props = { params: Promise<{ handle: string }>; searchParams: Promise<SearchValues> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);
  return collection ? { title: collection.title, description: collection.description, alternates: { canonical: `/collections/${collection.handle}` }, openGraph: { title: collection.title, description: collection.description } } : { title: "Collection not found", robots: { index: false, follow: false } };
}

export default async function CollectionHandlePage({ params, searchParams }: Props) {
  const [{ handle }, search] = await Promise.all([params, searchParams]);
  const collection = await getCollectionByHandle(handle);
  if (!collection) notFound();
  const filters = readFilters(search);
  const [products, allProducts] = await Promise.all([getProducts({ ...filters, collectionHandle: handle }), getProducts({ collectionHandle: handle })]);
  return <CollectionPage collection={collection} basePath={`/collections/${handle}`} products={products} allProducts={allProducts} current={{ size: filters.size, gender: filters.gender, season: filters.season, sort: filters.sort }} />;
}
