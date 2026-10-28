import "server-only";

import { requireAdmin } from "@/lib/admin/auth";
import type { Collection, SiteSettings } from "./types";

export type AdminProductRow = {
  id: string; title: string; handle: string; description: string; price: number;
  compare_at_price: number | null; status: "draft" | "published"; is_sold_out: boolean;
  sort_order: number; gender: string; season: string; fabric_care: string; badges: string[];
  created_at: string; updated_at: string;
  product_images: { url: string; alt: string; position: number }[];
  product_variants: { id: string; size: string; stock: number; sku: string | null }[];
  product_collections: { collections: { handle: string; title: string } | null }[];
};

export async function getAdminProducts(filters: { search?: string; collection?: string; status?: string } = {}) {
  const { supabase } = await requireAdmin();
  const selection = filters.collection
    ? "*, product_images(url,alt,position), product_variants(id,size,stock,sku), product_collections!inner(collections!inner(handle,title))"
    : "*, product_images(url,alt,position), product_variants(id,size,stock,sku), product_collections(collections(handle,title))";
  let query = supabase.from("products").select(selection).order("sort_order").order("created_at", { ascending: false });
  if (filters.search) query = query.ilike("title", `%${filters.search}%`);
  if (filters.status === "draft" || filters.status === "published") query = query.eq("status", filters.status);
  if (filters.collection) query = query.eq("product_collections.collections.handle", filters.collection);
  const { data, error } = await query;
  if (error) throw new Error("Could not load the product list. Check the Supabase setup and try again.");
  return (data ?? []) as unknown as AdminProductRow[];
}

export async function getAdminProduct(id: string): Promise<AdminProductRow | null> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("products").select("*, product_images(url,alt,position), product_variants(id,size,stock,sku), product_collections(collections(handle,title))").eq("id", id).maybeSingle();
  if (error) throw new Error("Could not load this product.");
  return (data as unknown as AdminProductRow | null) ?? null;
}

export async function getAdminCollections(): Promise<Collection[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("collections").select("*").order("sort_order").order("title");
  if (error) throw new Error("Could not load collections.");
  return (data ?? []) as Collection[];
}

export async function getAdminOrders() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
  if (error) throw new Error("Could not load orders.");
  return data ?? [];
}

export async function getAdminOrder(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (error) throw new Error("Could not load this order.");
  return data;
}

export async function getAdminSiteSettings(): Promise<SiteSettings | null> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("site_settings").select("*").eq("setting_key", "storefront").maybeSingle();
  if (error) throw new Error("Could not load site settings.");
  return (data as SiteSettings | null) ?? null;
}

export async function getAdminSubscribers() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("subscribers").select("id,email,status,created_at").order("created_at", { ascending: false });
  if (error) throw new Error("Could not load newsletter subscribers.");
  return data ?? [];
}

export async function getAdminMessages() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("messages").select("id,name,email,phone,message,status,created_at").order("created_at", { ascending: false });
  if (error) throw new Error("Could not load contact messages.");
  return data ?? [];
}
