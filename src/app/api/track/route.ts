import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { allowRequest, requestAddress } from "@/lib/server/rate-limit";
import { phoneDigits } from "@/lib/storefront/phone";

const schema = z.object({ orderNumber: z.string().trim().min(1).max(40), phone: z.string().trim().min(7).max(60) });

/** Guests find an order with its number plus the WhatsApp number used at checkout. */
export async function POST(request: Request) {
  if (!allowRequest(`track:${requestAddress(request)}`, 10, 10 * 60_000)) return NextResponse.json({ message: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Enter your order number and WhatsApp number." }, { status: 400 });
  const digits = parsed.data.orderNumber.replace(/\D/g, "");
  const orderNumber = digits ? `RR-${digits.padStart(6, "0")}` : parsed.data.orderNumber.toUpperCase();
  try {
    const { data, error } = await createSupabaseAdminClient().from("orders").select("id,phone").eq("order_number", orderNumber).maybeSingle();
    if (error) throw error;
    if (!data || phoneDigits(data.phone) !== phoneDigits(parsed.data.phone)) return NextResponse.json({ message: "No order matches that number and WhatsApp number. Check both and try again." }, { status: 404 });
    return NextResponse.json({ id: data.id });
  } catch {
    return NextResponse.json({ message: "Order tracking is unavailable right now. Please try again shortly." }, { status: 503 });
  }
}
