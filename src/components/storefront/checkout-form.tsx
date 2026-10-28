"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useShopStore } from "@/lib/storefront/store";
import { formatPrice } from "@/lib/storefront/format";

const detailsSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  phone: z.string().trim().min(7, "Enter a phone number we can reach.").max(60),
  email: z.union([z.string().trim().email("Enter a valid email.").max(254), z.literal("")]),
  address: z.string().trim().min(5, "Enter your delivery address.").max(500),
  city: z.string().trim().min(2, "Enter your city.").max(120),
  notes: z.string().trim().max(1000),
});

export function CheckoutForm() {
  const router = useRouter();
  const cart = useShopStore((state) => state.cart);
  const hasHydrated = useShopStore((state) => state.hasHydrated);
  const clearCart = useShopStore((state) => state.clearCart);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const subtotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (!cart.length) { setError("Your cart is empty. Add a little something before checkout."); return; }
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const parsed = detailsSchema.safeParse({ ...values, notes: values.notes ?? "" });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check your delivery details."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: parsed.data, items: cart.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })) }),
      });
      const result = await response.json() as { order?: { id: string }; message?: string };
      if (!response.ok || !result.order?.id) throw new Error(result.message || "We could not place your order. Please try again.");
      clearCart(); router.push(`/order/${result.order.id}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "We could not place your order. Please try again."); setBusy(false); }
  }

  return <div className="checkout-layout">
    <form className="checkout-form" onSubmit={submit}>
      <h2>Delivery details</h2>
      <label>Full name<input name="name" autoComplete="name" required maxLength={120} /></label>
      <label>Phone number<input name="phone" type="tel" autoComplete="tel" required maxLength={60} /></label>
      <label>Email (optional)<input name="email" type="email" autoComplete="email" maxLength={254} /></label>
      <label>Street address<textarea name="address" autoComplete="street-address" rows={3} required maxLength={500} /></label>
      <label>City<input name="city" autoComplete="address-level2" required maxLength={120} /></label>
      <label>Order notes (optional)<textarea name="notes" rows={3} maxLength={1000} /></label>
      <p className="payment-note"><strong>Payment: Cash on Delivery</strong><span>Pay when your order arrives.</span></p>
      {error && <p className="checkout-error" role="alert">{error}</p>}
      <button className="button-primary checkout-submit" disabled={busy || !hasHydrated || cart.length === 0}>{busy ? "Placing your order…" : "Place COD order"}</button>
    </form>
    <aside className="checkout-summary"><h2>Your order</h2>
      {!hasHydrated ? <p>Loading your cart…</p> : cart.length ? <>
        <ul>{cart.map((line) => <li key={line.key}><span>{line.title}{line.size && <small>Size: {line.size}</small>}<small>Qty {line.quantity}</small></span><strong>{formatPrice(line.price * line.quantity)}</strong></li>)}</ul>
        <p className="checkout-total"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></p><small>Final prices and availability are confirmed when your order is placed.</small>
      </> : <p>Your cart is empty.</p>}
    </aside>
  </div>;
}
