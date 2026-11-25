"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { HandCoins, Lock, MessageCircle } from "lucide-react";
import { deliveryFee, formatPrice } from "@/lib/storefront/format";
import { checkoutSchema } from "@/lib/storefront/checkout-schema";
import { cartSubtotal, useShopStore } from "@/lib/storefront/store";
import { randomUuid } from "@/lib/storefront/uuid";
import { useCartCheck } from "@/hooks/use-cart-check";

export type CheckoutDefaults = { name?: string; phone?: string; email?: string; address?: string; city?: string };
type FieldName = "name" | "phone" | "email" | "address" | "city" | "notes";

const cities = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad", "Bahawalpur", "Sargodha", "Sukkur", "Abbottabad", "Gujrat", "Sahiwal", "Rahim Yar Khan", "Mardan", "Okara", "Sheikhupura", "Jhelum", "Kasur", "Dera Ghazi Khan", "Mirpur"];

function Field({ name, label, hint, error, children }: { name: FieldName; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return <div className={`field${error ? " has-error" : ""}`}><label htmlFor={`checkout-${name}`}>{label}</label>{children}{error ? <p className="field-error" id={`${name}-message`} role="alert">{error}</p> : hint && <p className="field-hint" id={`${name}-message`}>{hint}</p>}</div>;
}

export function CheckoutForm({ defaults, signedIn, googleEnabled }: { defaults: CheckoutDefaults; signedIn: boolean; googleEnabled: boolean }) {
  const router = useRouter();
  const cart = useShopStore((state) => state.cart);
  const hasHydrated = useShopStore((state) => state.hasHydrated);
  const clearCart = useShopStore((state) => state.clearCart);
  const delivery = useShopStore((state) => state.delivery);
  const checkCart = useCartCheck(true);
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const token = useRef("");
  useEffect(() => { token.current = randomUuid(); }, []);

  const buyable = cart.filter((line) => line.stock !== 0);
  const subtotal = cartSubtotal(cart);
  const fee = delivery ? deliveryFee(subtotal, delivery) : null;

  function validateField(name: FieldName, value: string) {
    const result = checkoutSchema.shape[name].safeParse(value);
    setErrors((current) => ({ ...current, [name]: result.success ? undefined : result.error.issues[0]?.message }));
  }
  const onBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { if (event.target.value.trim()) validateField(event.target.name as FieldName, event.target.value); };
  const onChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { if (errors[event.target.name as FieldName]) validateField(event.target.name as FieldName, event.target.value); };
  const props = (name: FieldName) => ({ id: `checkout-${name}`, name, onBlur, onChange, "aria-invalid": Boolean(errors[name]), "aria-describedby": `${name}-message` });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const parsed = checkoutSchema.safeParse(values);
    if (!parsed.success) {
      const found: Partial<Record<FieldName, string>> = {};
      for (const issue of parsed.error.issues) found[issue.path[0] as FieldName] ??= issue.message;
      setErrors(found);
      const first = (["name", "phone", "email", "address", "city", "notes"] as FieldName[]).find((name) => found[name]);
      if (first) formRef.current?.querySelector<HTMLElement>(`#checkout-${first}`)?.focus();
      return;
    }
    setErrors({});
    if (!buyable.length) { setError("Nothing in your cart is available right now."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: parsed.data, checkoutToken: token.current, items: buyable.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })) }),
      });
      const result = await response.json().catch(() => ({})) as { order?: { id: string }; message?: string; code?: string };
      if (!response.ok || !result.order?.id) {
        if (result.code === "stock") await checkCart();
        throw new Error(result.message || "We could not place your order. Please try again.");
      }
      setPlaced(true);
      router.push(`/order/${result.order.id}?new=1`);
      clearCart();
    } catch (reason) {
      setError(reason instanceof TypeError ? "Your connection dropped. Check your internet and try again; you will not be charged twice." : reason instanceof Error ? reason.message : "We could not place your order. Please try again.");
      setBusy(false);
    }
  }

  if (placed) return <div className="empty-state" role="status"><p>Order placed. Opening your confirmation…</p></div>;
  if (hasHydrated && !cart.length) return <div className="empty-state"><p>Your cart is empty.</p><Link className="button button-primary" href="/collections/all">Continue shopping</Link></div>;

  return <div className="split-layout">
    <form ref={formRef} className="checkout-form" onSubmit={submit} noValidate>
      <p className="account-note">{signedIn ? <>Signed in as <strong>{defaults.email}</strong>. This order will be saved to your account.</> : <>No account needed.{googleEnabled && <> <Link className="stitch-link is-drawn" href="/account?next=/checkout">Sign in with Google</Link> only if you want to save this order.</>}</>}</p>
      <fieldset><legend>Contact</legend>
        <Field name="name" label="Full name" error={errors.name}><input {...props("name")} autoComplete="name" defaultValue={defaults.name} maxLength={120} required /></Field>
        <div className="field-pair">
          <Field name="phone" label="WhatsApp number" hint="We confirm your order here." error={errors.phone}><input {...props("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="0300 1234567" defaultValue={defaults.phone} maxLength={60} required /></Field>
          <Field name="email" label="Email" error={errors.email}><input {...props("email")} type="email" inputMode="email" autoComplete="email" placeholder="name@gmail.com" defaultValue={defaults.email} maxLength={254} required /></Field>
        </div>
      </fieldset>
      <fieldset><legend>Delivery address</legend>
        <Field name="address" label="House, street and area" error={errors.address}><textarea {...props("address")} autoComplete="street-address" rows={2} defaultValue={defaults.address} maxLength={500} required /></Field>
        <Field name="city" label="City" error={errors.city}><input {...props("city")} autoComplete="address-level2" list="checkout-cities" defaultValue={defaults.city} maxLength={120} required /></Field>
        <datalist id="checkout-cities">{cities.map((city) => <option value={city} key={city} />)}</datalist>
        <Field name="notes" label="Note for us (optional)" hint="A landmark, a gift message or the best time to call." error={errors.notes}><textarea {...props("notes")} rows={2} maxLength={1000} /></Field>
      </fieldset>
      <fieldset><legend>Payment</legend><div className="payment-option"><HandCoins aria-hidden="true" /><div><strong>Cash on delivery</strong><span>Pay the courier when your parcel arrives.</span></div></div></fieldset>
      {error && <p className="form-alert" role="alert">{error}</p>}
      <button className="button button-primary checkout-submit" disabled={busy || !hasHydrated || !buyable.length}>{busy ? <><span className="spinner" aria-hidden="true" />Placing your order…</> : `Place order${fee === null ? "" : `, ${formatPrice(subtotal + fee)}`}`}</button>
      <ul className="checkout-assurance"><li><Lock aria-hidden="true" />Your details are only used for this order.</li><li><MessageCircle aria-hidden="true" />Change your mind? Message us before we ship.</li></ul>
    </form>
    <aside className="summary-card"><h2>Your order</h2>
      {!hasHydrated ? <div className="skeleton skeleton-block" /> : <>
        <ul className="summary-lines">{cart.map((line) => <li key={line.key} className={line.stock === 0 ? "is-unavailable" : undefined}><span className="summary-image"><Image src={line.image} alt="" fill sizes="64px" quality={75} /><i>{line.quantity}</i></span><span>{line.title}<small>{line.stock === 0 ? "Sold out, not included" : line.size ?? ""}</small></span><strong>{line.stock === 0 ? "" : formatPrice(line.price * line.quantity)}</strong></li>)}</ul>
        <p className="total-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></p>
        <p className="total-row"><span>Delivery</span><span>{fee === null ? "…" : fee === 0 ? "Free" : formatPrice(fee)}</span></p>
        <p className="total-row total-row-grand"><span>Total</span><strong>{formatPrice(subtotal + (fee ?? 0))}</strong></p>
        <Link className="text-button" href="/cart">Edit cart</Link>
      </>}
    </aside>
  </div>;
}
