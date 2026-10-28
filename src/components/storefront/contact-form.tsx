"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";

const schema = z.object({ name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(254), phone: z.string().trim().max(60), message: z.string().trim().min(10).max(3000) });

export function ContactForm() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const checked = schema.safeParse({ name: form.get("name"), email: form.get("email"), phone: form.get("phone") || "", message: form.get("message") });
    if (!checked.success) { setMessage("Please check your details and try again."); return; }
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(checked.data) });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "Your note could not be sent. Please try again.");
      setMessage("Thank you. Your note has been sent to our team."); formElement.reset();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Your note could not be sent. Please try again."); }
    finally { setBusy(false); }
  }
  return <form className="contact-form" onSubmit={submit}>
    <label>Name<input name="name" autoComplete="name" required maxLength={120} /></label>
    <label>Email<input type="email" name="email" autoComplete="email" required maxLength={254} /></label>
    <label>Phone (optional)<input name="phone" type="tel" autoComplete="tel" maxLength={60} /></label>
    <label>Your message<textarea name="message" rows={5} required minLength={10} maxLength={3000} /></label>
    <button className="button-primary" disabled={busy}>{busy ? "Sending…" : "Send a note"}</button>{message && <p role="status">{message}</p>}
  </form>;
}
