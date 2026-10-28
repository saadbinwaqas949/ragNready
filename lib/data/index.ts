import "server-only";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { Collection, CollectionInput, Product, ProductInput, SiteSettings } from "./types";

type ProductRecord = Omit<Product, "images" | "variants" | "collection_handles">;
export type ProductFilters = {
  collectionHandle?: string;
  search?: string;
  size?: string;
  gender?: Product["gender"];
  season?: Product["season"];
  minPrice?: number;
  maxPrice?: number;
  availability?: "in-stock" | "sold-out";
  sort?: "featured" | "newest" | "price-ascending" | "price-descending" | "title-ascending";
};

function schemaNotInstalled(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "PGRST205");
}

async function productDetails(productIds: string[]) {
  if (productIds.length === 0) return { images: [], variants: [], links: [] };
  const supabase = createSupabasePublicClient();
  const [imageResult, variantResult, linkResult] = await Promise.all([
    supabase.from("product_images").select("product_id,url,alt,position").in("product_id", productIds).order("position"),
    supabase.from("product_variants").select("id,product_id,size,stock,sku").in("product_id", productIds),
    supabase.from("product_collections").select("product_id,collection_id").in("product_id", productIds),
  ]);
  if (imageResult.error) throw imageResult.error;
  if (variantResult.error) throw variantResult.error;
  if (linkResult.error) throw linkResult.error;
  return {
    images: (imageResult.data ?? []) as { product_id: string; url: string; alt: string; position: number }[],
    variants: (variantResult.data ?? []) as { id: string; product_id: string; size: string; stock: number; sku: string | null }[],
    links: (linkResult.data ?? []) as { product_id: string; collection_id: string }[],
  };
}

async function attachDetails(rows: ProductRecord[]): Promise<Product[]> {
  const detail = await productDetails(rows.map((row) => row.id));
  const collectionIds = [...new Set(detail.links.map((row) => row.collection_id))];
  const supabase = createSupabasePublicClient();
  const collectionResult = collectionIds.length
    ? await supabase.from("collections").select("id,handle").in("id", collectionIds)
    : { data: [], error: null };
  if (collectionResult.error) throw collectionResult.error;
  const handles = new Map(((collectionResult.data ?? []) as { id: string; handle: string }[]).map((row) => [row.id, row.handle]));

  return rows.map((row) => ({
    ...row,
    images: detail.images.filter((image) => image.product_id === row.id).map(({ url, alt, position }) => ({ url, alt, position })),
    variants: detail.variants.filter((variant) => variant.product_id === row.id).map(({ id, size, stock, sku }) => ({ id, size, stock, sku })),
    collection_handles: detail.links.filter((link) => link.product_id === row.id).map((link) => handles.get(link.collection_id)).filter((handle): handle is string => Boolean(handle)),
  }));
}

/** Published catalog reads are public-safe and remain protected by Supabase RLS. */
const readProducts = unstable_cache(async (filters: ProductFilters): Promise<Product[]> => {
  const supabase = createSupabasePublicClient();
  const idFilters: string[][] = [];
  if (filters.collectionHandle) {
    const collection = await supabase.from("collections").select("id").eq("handle", filters.collectionHandle).maybeSingle();
    if (collection.error) throw collection.error;
    if (!collection.data) return [];
    const links = await supabase.from("product_collections").select("product_id").eq("collection_id", collection.data.id);
    if (links.error) throw links.error;
    idFilters.push((links.data ?? []).map((link) => link.product_id as string));
  }
  if (filters.size) {
    const variants = await supabase.from("product_variants").select("product_id").eq("size", filters.size);
    if (variants.error) throw variants.error;
    idFilters.push((variants.data ?? []).map((variant) => variant.product_id as string));
  }
  const selectedIds = idFilters.length ? idFilters[0].filter((id) => idFilters.every((ids) => ids.includes(id))) : undefined;
  if (selectedIds?.length === 0) return [];

  let query = supabase.from("products").select("*").eq("status", "published");
  if (filters.gender) query = query.eq("gender", filters.gender);
  if (filters.season) query = query.eq("season", filters.season);
  if (filters.availability === "in-stock") query = query.eq("is_sold_out", false);
  if (filters.availability === "sold-out") query = query.eq("is_sold_out", true);
  if (typeof filters.minPrice === "number") query = query.gte("price", filters.minPrice);
  if (typeof filters.maxPrice === "number") query = query.lte("price", filters.maxPrice);
  if (filters.search?.trim()) {
    const search = filters.search.trim().slice(0, 100).replace(/[%,_]/g, " ");
    query = query.ilike("title", `%${search}%`);
  }
  if (selectedIds) query = query.in("id", selectedIds);
  if (filters.sort === "newest") query = query.order("created_at", { ascending: false });
  else if (filters.sort === "price-ascending") query = query.order("price", { ascending: true });
  else if (filters.sort === "price-descending") query = query.order("price", { ascending: false });
  else if (filters.sort === "title-ascending") query = query.order("title", { ascending: true });
  else query = query.order("sort_order").order("created_at", { ascending: false });
  const result = await query;
  if (result.error) throw result.error;
  return attachDetails((result.data ?? []) as ProductRecord[]);
}, ["ragnready-products"], { revalidate: 3600, tags: ["products"] });

export async function getProducts(options: ProductFilters = {}): Promise<Product[]> {
  try { return await readProducts(options); }
  catch (error) { if (schemaNotInstalled(error)) return []; throw error; }
}

const readProductByHandle = unstable_cache(async (handle: string): Promise<Product | null> => {
  const supabase = createSupabasePublicClient();
  const result = await supabase.from("products").select("*").eq("handle", handle).eq("status", "published").maybeSingle();
  if (result.error) throw result.error;
  if (!result.data) return null;
  const [product] = await attachDetails([result.data as ProductRecord]);
  return product ?? null;
}, ["ragnready-product"], { revalidate: 3600, tags: ["products"] });

export async function getProductByHandle(handle: string): Promise<Product | null> {
  try { return await readProductByHandle(handle); }
  catch (error) { if (schemaNotInstalled(error)) return null; throw error; }
}

const readCollections = unstable_cache(async (): Promise<Collection[]> => {
  const supabase = createSupabasePublicClient();
  const result = await supabase.from("collections").select("*").order("sort_order").order("title");
  if (result.error) throw result.error;
  return (result.data ?? []) as Collection[];
}, ["ragnready-collections"], { revalidate: 3600, tags: ["collections"] });

export async function getCollections(): Promise<Collection[]> {
  try { return await readCollections(); }
  catch (error) { if (schemaNotInstalled(error)) return []; throw error; }
}

const readCollectionByHandle = unstable_cache(async (handle: string): Promise<Collection | null> => {
  const supabase = createSupabasePublicClient();
  const result = await supabase.from("collections").select("*").eq("handle", handle).maybeSingle();
  if (result.error) throw result.error;
  return (result.data as Collection | null) ?? null;
}, ["ragnready-collection"], { revalidate: 3600, tags: ["collections"] });

export async function getCollectionByHandle(handle: string): Promise<Collection | null> {
  try { return await readCollectionByHandle(handle); }
  catch (error) { if (schemaNotInstalled(error)) return null; throw error; }
}

const readSiteSettings = unstable_cache(async (): Promise<SiteSettings | null> => {
  const supabase = createSupabasePublicClient();
  const result = await supabase.from("site_settings").select("*").eq("setting_key", "storefront").maybeSingle();
  if (result.error) throw result.error;
  return (result.data as SiteSettings | null) ?? null;
}, ["ragnready-site-settings"], { revalidate: 3600, tags: ["site-settings"] });

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try { return await readSiteSettings(); }
  catch (error) { if (schemaNotInstalled(error)) return null; throw error; }
}

function revalidateStorefront() {
  revalidatePath("/", "layout");
  revalidateTag("products");
  revalidateTag("collections");
  revalidateTag("site-settings");
}

/** Admin writes use the caller's Supabase session, so RLS checks their admin email. */
export async function saveProduct(input: ProductInput): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { images, variants, collection_handles, ...fields } = input;
  const productResult = await supabase.from("products").upsert(fields, { onConflict: "handle" }).select("id").single();
  if (productResult.error) throw productResult.error;
  const productId = productResult.data.id as string;

  const [collectionRows, oldImages, oldVariants, oldLinks] = await Promise.all([
    collection_handles.length ? supabase.from("collections").select("id,handle").in("handle", collection_handles) : Promise.resolve({ data: [], error: null }),
    supabase.from("product_images").delete().eq("product_id", productId),
    supabase.from("product_variants").delete().eq("product_id", productId),
    supabase.from("product_collections").delete().eq("product_id", productId),
  ]);
  for (const result of [collectionRows, oldImages, oldVariants, oldLinks]) if (result.error) throw result.error;

  const writes = [
    images.length ? supabase.from("product_images").insert(images.map((image) => ({ ...image, product_id: productId }))) : Promise.resolve({ error: null }),
    variants.length ? supabase.from("product_variants").insert(variants.map((variant) => ({ ...variant, product_id: productId }))) : Promise.resolve({ error: null }),
    collectionRows.data?.length ? supabase.from("product_collections").insert(collectionRows.data.map((collection) => ({ product_id: productId, collection_id: collection.id }))) : Promise.resolve({ error: null }),
  ];
  const results = await Promise.all(writes);
  for (const result of results) if (result.error) throw result.error;
  revalidateStorefront();
  return productId;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const result = await supabase.from("products").delete().eq("id", id);
  if (result.error) throw result.error;
  revalidateStorefront();
}

export async function saveCollection(input: CollectionInput): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const result = await supabase.from("collections").upsert(input, { onConflict: "handle" }).select("id").single();
  if (result.error) throw result.error;
  revalidateStorefront();
  return result.data.id as string;
}

export async function deleteCollection(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const result = await supabase.from("collections").delete().eq("id", id);
  if (result.error) throw result.error;
  revalidateStorefront();
}

export async function saveSiteSettings(settings: Partial<Omit<SiteSettings, "id" | "updated_at">>): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const result = await supabase.from("site_settings").upsert({ setting_key: "storefront", ...settings }, { onConflict: "setting_key" });
  if (result.error) throw result.error;
  revalidateStorefront();
}

export type { Collection, CollectionInput, Product, ProductInput, SiteSettings } from "./types";
