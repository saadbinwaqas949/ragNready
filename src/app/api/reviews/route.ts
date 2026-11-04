import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { revalidateTag } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { allowRequest, requestAddress } from "@/lib/server/rate-limit";
import { SHOW_REVIEWS } from "@/lib/site-config";

function normalizePhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `92${digits.slice(1)}`;
  if (!digits.startsWith("92")) digits = `92${digits}`;
  return digits;
}

const invalidOrder = () => NextResponse.json({ message: "We couldn't find a delivered order matching those details." }, { status: 400 });

export async function POST(request: Request) {
  if (!SHOW_REVIEWS) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const address = requestAddress(request);
  if (!allowRequest(`review:${address}`, 5, 60 * 60_000)) return NextResponse.json({ message: "Please wait before submitting another review." }, { status: 429 });
  const form = await request.formData().catch(() => null);
  if (!form) return invalidOrder();
  const productId = String(form.get("productId") ?? "");
  const orderNumber = String(form.get("orderNumber") ?? "").trim().slice(0, 100);
  const phone = String(form.get("phone") ?? "").trim();
  const rating = Number(form.get("rating"));
  const comment = String(form.get("comment") ?? "").trim();
  const reviewerName = String(form.get("name") ?? "").trim();
  const photos = form.getAll("photos").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (!/^[0-9a-f-]{36}$/i.test(productId) || !orderNumber || phone.length < 7 || !Number.isInteger(rating) || rating < 1 || rating > 5 || !comment || comment.length > 3000 || !reviewerName || reviewerName.length > 120 || photos.length > 3) return NextResponse.json({ message: "Please check your review details and try again." }, { status: 400 });
  for (const photo of photos) if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type) || photo.size > 307_200) return NextResponse.json({ message: "Photos must be JPEG, PNG or WebP and about 300 KB or smaller." }, { status: 400 });

  try {
    const supabase = createSupabaseAdminClient();
    const { data: order, error: orderError } = await supabase.from("orders").select("id,phone,status").eq("order_number", orderNumber).maybeSingle();
    if (orderError) throw orderError;
    if (!order || order.status !== "delivered" || normalizePhone(order.phone) !== normalizePhone(phone)) return invalidOrder();
    const { data: item, error: itemError } = await supabase.from("order_items").select("id").eq("order_id", order.id).eq("product_id", productId).maybeSingle();
    if (itemError) throw itemError;
    if (!item) return invalidOrder();
    const { data: previous, error: previousError } = await supabase.from("reviews").select("id").eq("order_id", order.id).eq("product_id", productId).maybeSingle();
    if (previousError) throw previousError;
    if (previous) return invalidOrder();

    const { data: review, error: reviewError } = await supabase.from("reviews").insert({ product_id: productId, order_id: order.id, rating, comment, reviewer_name: reviewerName, status: "pending" }).select("id").single();
    if (reviewError) throw reviewError;
    const paths: string[] = [];
    try {
      const uploaded: { review_id: string; url: string; position: number }[] = [];
      for (const [position, photo] of photos.entries()) {
        const extension = photo.type === "image/jpeg" ? "jpg" : photo.type === "image/png" ? "png" : "webp";
        const path = `${review.id}/${randomUUID()}.${extension}`;
        const { error } = await supabase.storage.from("review-images").upload(path, Buffer.from(await photo.arrayBuffer()), { contentType: photo.type, upsert: false });
        if (error) throw error;
        paths.push(path);
        const { data: publicUrl } = supabase.storage.from("review-images").getPublicUrl(path);
        uploaded.push({ review_id: review.id, url: publicUrl.publicUrl, position });
      }
      if (uploaded.length) {
        const { error } = await supabase.from("review_images").insert(uploaded);
        if (error) throw error;
      }
    } catch (error) {
      if (paths.length) await supabase.storage.from("review-images").remove(paths);
      await supabase.from("reviews").delete().eq("id", review.id);
      throw error;
    }
    revalidateTag("reviews");
    return NextResponse.json({ message: "Thanks! Your review will appear once it is approved." }, { status: 201 });
  } catch (error) {
    console.error("Review submission failed:", error instanceof Error ? error.message : "Unknown review error");
    return NextResponse.json({ message: "We could not submit your review right now. Please try again." }, { status: 503 });
  }
}
