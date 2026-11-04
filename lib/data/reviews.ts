import "server-only";

import { unstable_cache } from "next/cache";
import { SHOW_REVIEWS } from "@/lib/site-config";
import { createSupabasePublicClient } from "@/lib/supabase/public";

export type PublicReview = { id: string; rating: number; comment: string; reviewer_name: string; created_at: string; review_images: { url: string; position: number }[] };
export type RecentApprovedReview = PublicReview & { product_title: string; product_handle: string };

const readProductReviews = unstable_cache(async (productId: string): Promise<PublicReview[]> => {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase.from("reviews").select("id,rating,comment,reviewer_name,created_at,review_images(url,position)").eq("product_id", productId).eq("status", "approved").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as PublicReview[];
}, ["ragnready-approved-reviews"], { revalidate: 3600, tags: ["reviews"] });

export async function getApprovedProductReviews(productId: string) {
  return SHOW_REVIEWS ? readProductReviews(productId) : [];
}

export async function getRecentApprovedReviews(limit = 6): Promise<RecentApprovedReview[]> {
  if (!SHOW_REVIEWS) return [];
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase.from("reviews").select("id,rating,comment,reviewer_name,created_at,product_id,review_images(url,position),products(title,handle)").eq("status", "approved").order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return ((data ?? []) as unknown as { id: string; rating: number; comment: string; reviewer_name: string; created_at: string; review_images: { url: string; position: number }[]; products: { title: string; handle: string } | null }[]).flatMap((review) => review.products ? [{ id: review.id, rating: review.rating, comment: review.comment, reviewer_name: review.reviewer_name, created_at: review.created_at, review_images: review.review_images, product_title: review.products.title, product_handle: review.products.handle }] : []);
}

export async function getAdminReviews() {
  const { requireAdmin } = await import("@/lib/admin/auth");
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("reviews").select("id,product_id,order_id,rating,comment,reviewer_name,status,created_at,orders(order_number),products(title),review_images(url,position)").order("created_at", { ascending: false });
  if (error) throw new Error("Could not load customer reviews.");
  return data ?? [];
}

export async function getPendingReviewCount() {
  if (!SHOW_REVIEWS) return 0;
  const { requireAdmin } = await import("@/lib/admin/auth");
  const { supabase } = await requireAdmin();
  const { count, error } = await supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending");
  if (error) throw new Error("Could not load the pending review count.");
  return count ?? 0;
}
