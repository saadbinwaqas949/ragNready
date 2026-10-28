"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AdminLoginForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    const checked = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse({ email, password });
    if (!checked.success) { setError("Enter a valid email and password."); setBusy(false); return; }
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      router.replace("/admin/products"); router.refresh();
    } catch {
      setError("We couldn't sign you in. Check the email and password, then try again."); setBusy(false);
    }
  }

  return <form className="admin-login-form" onSubmit={submit}>
    {error && <p className="admin-notice admin-notice-error" role="alert">{error}</p>}
    <label className="admin-field">Email<input className="admin-input" autoComplete="username" type="email" name="email" required /></label>
    <label className="admin-field">Password<input className="admin-input" autoComplete="current-password" type="password" name="password" required /></label>
    <button className="admin-button admin-button-primary" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
  </form>;
}
