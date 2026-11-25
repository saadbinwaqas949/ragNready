import { after, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { allowRequest, requestAddress } from "@/lib/server/rate-limit";
import { sendOrderNotifications, type NotificationOrder } from "@/lib/server/order-notifications";
import { checkoutSchema } from "@/lib/storefront/checkout-schema";
import { phoneDigits } from "@/lib/storefront/phone";

export const maxDuration = 60;

const orderSchema = z.object({
  customer: checkoutSchema,
  checkoutToken: z.string().uuid(),
  items: z.array(z.object({ productId: z.string().uuid(), variantId: z.string().uuid().nullable(), quantity: z.number().int().min(1).max(20) })).min(1).max(30),
});

/** Accounts are optional: guests simply have no user id. */
async function currentUserId() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? "";
  } catch { return ""; }
}

export async function POST(request: Request) {
  const address = requestAddress(request);
  if (!allowRequest(`order:${address}`, 8, 10 * 60_000)) return NextResponse.json({ message: "Too many orders from this connection. Please wait a few minutes." }, { status: 429 });
  const parsed = orderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Please check your delivery details and cart." }, { status: 400 });
  const { customer, items, checkoutToken } = parsed.data;
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc("create_cod_order", {
      p_customer: { ...customer, phone: `+${phoneDigits(customer.phone)}`, user_id: await currentUserId(), checkout_token: checkoutToken },
      p_items: items,
    });
    if (error) {
      if (["P0001", "22023"].includes(error.code ?? "")) {
        revalidateTag("products");
        return NextResponse.json({ code: "stock", message: "Something in your cart sold out or changed just now. Review your cart and place the order again." }, { status: 409 });
      }
      throw error;
    }
    // Sent for every order, whether or not the customer taps "Confirm on WhatsApp". Runs after the
    // customer already has their confirmation, so a slow provider never delays checkout.
    if (!data.duplicate) after(async () => {
      const { data: saved, error: loadError } = await supabase.from("orders").select("*, order_items(title,size,quantity,unit_price,line_total)").eq("id", data.id).single();
      if (loadError || !saved) { console.error("Saved order could not be loaded for its alerts."); return; }
      const results = await sendOrderNotifications(saved as unknown as NotificationOrder, { includeCustomer: true });
      await supabase.from("orders").update({ alerts: { at: new Date().toISOString(), results } }).eq("id", data.id);
    });
    revalidateTag("products");
    return NextResponse.json({ order: { id: data.id, order_number: data.order_number } }, { status: 201 });
  } catch (error) {
    console.error("Order could not be saved:", (error as { message?: string })?.message ?? "Unknown error");
    return NextResponse.json({ message: "We could not place your order just now. Your cart is safe, please try again." }, { status: 503 });
  }
}
