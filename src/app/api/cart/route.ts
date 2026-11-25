import { NextResponse } from "next/server";
import { z } from "zod";
import { getProducts, getSiteSettings } from "@/lib/data";

const schema = z.object({ items: z.array(z.object({ key: z.string().max(200), productId: z.string().uuid(), size: z.string().max(80).nullable() })).max(60) });

/** Current price, stock and size id for every cart line, so a saved cart never goes stale. */
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Invalid cart." }, { status: 400 });
  try {
    const [products, settings] = await Promise.all([getProducts(), getSiteSettings()]);
    const lines = parsed.data.items.map(({ key, productId, size }) => {
      const product = products.find((item) => item.id === productId);
      const variant = product?.variants.find((item) => item.size === size) ?? null;
      const needsSize = Boolean(product?.variants.length);
      const stock = !product || product.is_sold_out ? 0 : needsSize ? variant?.stock ?? 0 : 20;
      return { key, stock, variantId: variant?.id ?? null, price: product ? Number(product.price) : null, title: product?.title ?? null, image: product?.images[0]?.url ?? null };
    });
    return NextResponse.json({ lines, delivery: { fee: Number(settings?.delivery_fee ?? 0), freeOver: settings?.free_delivery_over == null ? null : Number(settings.free_delivery_over) } });
  } catch {
    return NextResponse.json({ message: "Cart check is unavailable." }, { status: 503 });
  }
}
