"use client";

import { useId, useState, type FormEvent } from "react";
import { z } from "zod";

const emailSchema = z.string().email();

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const generatedId = useId();
  const fieldId = compact ? "footer-newsletter-email" : generatedId;
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const checked = emailSchema.safeParse(String(form.get("email") ?? "").trim());
    if (!checked.success) { setStatus("Please enter a valid email address."); return; }
    setBusy(true); setStatus("");
    try {
      const response = await fetch("/api/subscribers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: checked.data }) });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "Please try again in a moment.");
      setStatus("Thank you for joining the ragNready family."); formElement.reset();
    } catch (error) { setStatus(error instanceof Error ? error.message : "Please try again in a moment."); }
    finally { setBusy(false); }
  }
  return <form className={`newsletter-form${compact ? " newsletter-form-compact" : ""}`} onSubmit={submit}>
    <label className="sr-only" htmlFor={fieldId}>Email address</label>
    <div><input id={fieldId} type="email" name="email" autoComplete="email" placeholder="Your email address" required /><button disabled={busy}>{busy ? "Joining…" : "Join us"}</button></div>
    {status && <span className="newsletter-status" role="status">{status}</span>}
  </form>;
}
