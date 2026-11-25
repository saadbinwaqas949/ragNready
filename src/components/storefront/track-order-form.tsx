"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function TrackOrderForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderNumber: form.get("orderNumber"), phone: form.get("phone") }) });
      const result = await response.json().catch(() => ({})) as { id?: string; message?: string };
      if (!response.ok || !result.id) throw new Error(result.message || "Order tracking is unavailable right now.");
      router.push(`/order/${result.id}`);
    } catch (reason) { setError(reason instanceof TypeError ? "Check your internet connection and try again." : (reason as Error).message); setBusy(false); }
  }
  return <form className="stack-form" onSubmit={submit}>
    <div className="field"><label htmlFor="track-number">Order number</label><input id="track-number" name="orderNumber" placeholder="RR-000123" autoComplete="off" required maxLength={40} /></div>
    <div className="field"><label htmlFor="track-phone">WhatsApp number</label><input id="track-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0300 1234567" required minLength={7} maxLength={60} /></div>
    {error && <p className="form-alert" role="alert">{error}</p>}
    <button className="button button-primary" disabled={busy}>{busy ? "Looking…" : "Track order"}</button>
  </form>;
}
