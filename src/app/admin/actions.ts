"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteCollection, deleteProduct, revalidateStorefront, saveCollection, saveProduct, saveSiteSettings } from "@/lib/data";
import { sendOrderNotification } from "@/lib/server/order-notifications";

export type ActionResult = { success: boolean; message: string; id?: string; handle?: string };

const imageSchema = z.object({ url: z.string().min(1), alt: z.string().max(300).default(""), position: z.number().int().min(0) });
const variantSchema = z.object({ size: z.string().min(1).max(80), stock: z.number().int().min(0), sku: z.string().nullable().optional() });
const productSchema = z.object({
  id: z.string().uuid().optional(), title: z.string().trim().min(2).max(160), handle: z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(10000), price: z.number().finite().min(0), compare_at_price: z.number().finite().min(0).nullable(),
  gender: z.enum(["Boys", "Girls", "Unisex"]), season: z.enum(["Winter", "Summer", "All Seasons"]),
  status: z.enum(["draft", "published"]), is_sold_out: z.boolean(), badges: z.array(z.string().max(40)).max(10),
  sort_order: z.number().int().default(0), fabric_care: z.string().max(3000),
  images: z.array(imageSchema).max(12), variants: z.array(variantSchema).min(1).max(10), collection_handles: z.array(z.string()).max(30),
});
const collectionSchema = z.object({ id: z.string().uuid().optional(), title: z.string().trim().min(2).max(120), handle: z.string().trim().min(2).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), description: z.string().max(3000), image: z.string().max(1000).nullable().optional(), sort_order: z.number().int().default(0) });
const settingsSchema = z.object({
  store_name: z.string().min(1).max(120), tagline: z.string().max(300), phone: z.string().max(60), whatsapp_number: z.string().max(60),
  email: z.string().email().max(254), address: z.string().max(500), social_links: z.record(z.string(), z.string()).default({}), legal_owner_line: z.string().max(250).nullable(),
  announcement_messages: z.array(z.string().max(300)).max(8), hero_headline: z.string().max(200), hero_subtext: z.string().max(1000), hero_cta_text: z.string().max(80), popup_discount_code: z.string().max(60), is_published: z.boolean().default(true),
});

export async function saveProductAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Check the product details and try again." };
  try { const id = await saveProduct(parsed.data); return { success: true, id, message: "Product saved." }; }
  catch { return { success: false, message: "The product could not be saved. Check your connection and image details." }; }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!z.string().uuid().safeParse(id).success) return { success: false, message: "That product could not be found." };
  try { await deleteProduct(id); return { success: true, message: "Product deleted." }; }
  catch { return { success: false, message: "The product could not be deleted." }; }
}

export async function setProductStatusAction(id: string, status: "draft" | "published"): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!z.string().uuid().safeParse(id).success || !z.enum(["draft", "published"]).safeParse(status).success) return { success: false, message: "Invalid product update." };
  const { error } = await supabase.from("products").update({ status }).eq("id", id);
  if (error) return { success: false, message: "Could not update publish status." };
  revalidateStorefront();
  return { success: true, message: "Publish status updated." };
}

export async function setSoldOutAction(id: string, isSoldOut: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!z.string().uuid().safeParse(id).success || !z.boolean().safeParse(isSoldOut).success) return { success: false, message: "Invalid stock update." };
  const { error } = await supabase.from("products").update({ is_sold_out: isSoldOut }).eq("id", id);
  if (error) return { success: false, message: "Could not update sold-out status." };
  revalidateStorefront();
  return { success: true, message: "Stock status updated." };
}

export async function saveCollectionAction(input: unknown): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = collectionSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Check the collection details and try again." };
  try {
    let handle = parsed.data.handle;
    let suffix = 2;
    while (true) {
      const existing = await supabase.from("collections").select("id").eq("handle", handle).maybeSingle();
      if (existing.error) throw existing.error;
      if (!existing.data || existing.data.id === parsed.data.id) break;
      handle = `${parsed.data.handle}-${suffix++}`;
      if (suffix > 100) throw new Error("Could not reserve a unique handle.");
    }
    const id = await saveCollection({ ...parsed.data, handle });
    return { success: true, id, handle, message: "Collection saved." };
  }
  catch { return { success: false, message: "The collection could not be saved." }; }
}

export async function deleteCollectionAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!z.string().uuid().safeParse(id).success) return { success: false, message: "Invalid collection." };
  try { await deleteCollection(id); return { success: true, message: "Collection deleted." }; }
  catch { return { success: false, message: "Could not delete the collection. Remove its products first." }; }
}

export async function saveSiteSettingsAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Check the settings fields and try again." };
  try { await saveSiteSettings(parsed.data); return { success: true, message: "Site settings saved." }; }
  catch { return { success: false, message: "The settings could not be saved." }; }
}

export async function sendTestOrderEmailAction(): Promise<ActionResult> {
  await requireAdmin();
  if (!process.env.RESEND_API_KEY || !process.env.NOTIFY_EMAIL) return { success: false, message: "Add RESEND_API_KEY and NOTIFY_EMAIL to the server environment, then restart the site." };
  const result = await sendOrderNotification({ id: "test-order", order_number: "RR-TEST", created_at: new Date().toISOString(), customer_name: "Test Customer", phone: "03001234567", address: "Test Street 1", city: "Lahore", notes: "Sample notification", total: 1999, order_items: [{ title: "Sample product", size: "0-3 Months", quantity: 1, unit_price: 1999 }] });
  return { success: result.sent, message: result.message };
}

export async function moderateReviewAction(id: string, status: "approved" | "rejected" | "deleted"): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!z.string().uuid().safeParse(id).success || !["approved", "rejected", "deleted"].includes(status)) return { success: false, message: "Invalid review update." };
  if (status === "deleted") {
    const { data: photos } = await supabase.from("review_images").select("url").eq("review_id", id);
    const paths = (photos ?? []).map((photo) => photo.url.split("/review-images/")[1]?.split("?")[0]).filter((path): path is string => Boolean(path));
    if (paths.length) await supabase.storage.from("review-images").remove(paths);
  }
  const result = status === "deleted" ? await supabase.from("reviews").delete().eq("id", id) : await supabase.from("reviews").update({ status }).eq("id", id);
  if (result.error) return { success: false, message: "Could not update this review." };
  revalidatePath("/admin/reviews"); revalidateTag("reviews");
  return { success: true, message: status === "deleted" ? "Review deleted." : `Review ${status}.` };
}

export async function setOrderStatusAction(id: string, status: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const idResult = z.string().uuid().safeParse(id);
  const statusResult = z.enum(["new", "confirmed", "shipped", "delivered", "cancelled"]).safeParse(status);
  if (!idResult.success || !statusResult.success) return { success: false, message: "Invalid order status." };
  const { error } = await supabase.from("orders").update({ status: statusResult.data }).eq("id", idResult.data);
  if (error) return { success: false, message: "Could not update the order." };
  return { success: true, message: "Order status updated." };
}

export async function setMessageStatusAction(id: string, status: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsedId = z.string().uuid().safeParse(id);
  const parsedStatus = z.enum(["new", "read", "replied"]).safeParse(status);
  if (!parsedId.success || !parsedStatus.success) return { success: false, message: "Invalid message update." };
  const { error } = await supabase.from("messages").update({ status: parsedStatus.data }).eq("id", parsedId.data);
  if (error) return { success: false, message: "Could not update the message." };
  revalidatePath("/admin/messages");
  return { success: true, message: "Message updated." };
}

export async function setSubscriberStatusAction(id: string, status: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsedId = z.string().uuid().safeParse(id);
  const parsedStatus = z.enum(["active", "unsubscribed"]).safeParse(status);
  if (!parsedId.success || !parsedStatus.success) return { success: false, message: "Invalid subscriber update." };
  const { error } = await supabase.from("subscribers").update({ status: parsedStatus.data }).eq("id", parsedId.data);
  if (error) return { success: false, message: "Could not update the subscriber." };
  revalidatePath("/admin/subscribers");
  return { success: true, message: "Subscriber updated." };
}
