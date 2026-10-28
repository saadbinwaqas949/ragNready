import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { allowRequest, requestAddress } from "@/lib/server/rate-limit";

const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(120), phone: z.string().trim().min(7).max(60),
    email: z.union([z.string().trim().email().max(254), z.literal("")]).optional(),
    address: z.string().trim().min(5).max(500), city: z.string().trim().min(2).max(120), notes: z.string().trim().max(1000).default(""),
  }),
  items: z.array(z.object({ productId: z.string().uuid(), variantId: z.string().uuid().nullable(), quantity: z.number().int().min(1).max(20) })).min(1).max(30),
});

export async function POST(request: Request) {
  const address = requestAddress(request);
  if (!allowRequest(`order:${address}`, 5, 10 * 60_000)) return NextResponse.json({ message: "Please wait before placing another order." }, { status: 429 });
  const parsed = orderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Please check your delivery details and cart." }, { status: 400 });
  try {
    const { data, error } = await createSupabaseAdminClient().rpc("create_cod_order", {
      p_customer: parsed.data.customer,
      p_items: parsed.data.items,
    });
    if (error) {
      if (["P0001", "22023"].includes(error.code ?? "")) return NextResponse.json({ message: "A selected item is unavailable or its stock changed. Please review your cart." }, { status: 409 });
      throw error;
    }
    revalidateTag("products");
    return NextResponse.json({ order: data }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "We could not place your order just now. Please try again." }, { status: 503 });
  }
}
