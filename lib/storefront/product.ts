import type { Product } from "@/lib/data/types";

export const PLACEHOLDER_IMAGE = "/images/placeholders/product-generic.svg";

export const isSoldOut = (product: Product) => product.is_sold_out || (product.variants.length > 0 && product.variants.every((variant) => variant.stock < 1));

/** The old price, only when it is really higher than the current one. */
export function salePriceFrom(product: Product) {
  const before = Number(product.compare_at_price ?? 0);
  return before > Number(product.price) ? before : null;
}

export function toCartLine(product: Product, size: string | null, quantity = 1) {
  const variant = product.variants.find((item) => item.size === size);
  return { productId: product.id, handle: product.handle, title: product.title, price: Number(product.price), image: product.images[0]?.url ?? PLACEHOLDER_IMAGE, size: variant?.size ?? null, variantId: variant?.id ?? null, quantity, ...(variant ? { stock: variant.stock } : {}) };
}

/** "0-3 Months" reads as "0–3m" on small controls. */
export const shortSize = (size: string) => size.replace(/\s*months?/i, "m").replace("-", "–");
