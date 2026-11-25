"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { ArrowRight, Check } from "lucide-react";

const emailSchema = z.string().trim().email();

export function NewsletterForm() {
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const checked = emailSchema.safeParse(String(new FormData(formElement).get("email") ?? ""));
    if (!checked.success) { setNotice({ text: "Enter a valid email address.", ok: false }); return; }
    setBusy(true); setNotice(null);
    try {
      const response = await fetch("/api/subscribers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: checked.data }) });
      const result = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(result.message || "Please try again in a moment.");
      setNotice({ text: "You are on the list.", ok: true }); formElement.reset();
    } catch (error) { setNotice({ text: error instanceof Error && !(error instanceof TypeError) ? error.message : "Check your connection and try again.", ok: false }); }
    finally { setBusy(false); }
  }
  return <form className="newsletter-form" onSubmit={submit} noValidate>
    <label htmlFor="newsletter-email">Hear about new pieces first</label>
    <div><input id="newsletter-email" type="email" name="email" autoComplete="email" placeholder="Your email" required /><button disabled={busy} aria-label="Join the list">{notice?.ok ? <Check aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}</button></div>
    {notice && <span className={notice.ok ? "form-success" : "field-error"} role="status">{notice.text}</span>}
  </form>;
}
