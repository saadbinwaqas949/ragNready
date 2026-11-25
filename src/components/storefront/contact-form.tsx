"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";

const schema = z.object({ name: z.string().trim().min(2, "Enter your name.").max(120), email: z.string().trim().email("Enter a valid email address.").max(254), phone: z.string().trim().max(60), message: z.string().trim().min(10, "Write at least a short sentence.").max(3000) });

export function ContactForm() {
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const checked = schema.safeParse({ name: form.get("name"), email: form.get("email"), phone: form.get("phone") || "", message: form.get("message") });
    if (!checked.success) { setNotice({ text: checked.error.issues[0]?.message ?? "Check your details and try again.", ok: false }); return; }
    setBusy(true); setNotice(null);
    try {
      const response = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(checked.data) });
      const result = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(result.message || "Your note could not be sent. Please try again.");
      setNotice({ text: "Note sent. We will reply by email or WhatsApp.", ok: true }); formElement.reset();
    } catch (error) { setNotice({ text: error instanceof Error && !(error instanceof TypeError) ? error.message : "Your note could not be sent. Check your connection and try again.", ok: false }); }
    finally { setBusy(false); }
  }
  return <form className="stack-form" onSubmit={submit} noValidate>
    <div className="field"><label htmlFor="contact-name">Name</label><input id="contact-name" name="name" autoComplete="name" required maxLength={120} /></div>
    <div className="field"><label htmlFor="contact-email">Email</label><input id="contact-email" type="email" name="email" autoComplete="email" required maxLength={254} /></div>
    <div className="field"><label htmlFor="contact-phone">WhatsApp number (optional)</label><input id="contact-phone" name="phone" type="tel" autoComplete="tel" maxLength={60} /></div>
    <div className="field"><label htmlFor="contact-message">Your note</label><textarea id="contact-message" name="message" rows={5} required maxLength={3000} /></div>
    {notice && <p className={notice.ok ? "form-success" : "form-alert"} role={notice.ok ? "status" : "alert"}>{notice.text}</p>}
    <button className="button button-primary" disabled={busy}>{busy ? "Sending…" : "Send note"}</button>
  </form>;
}
