"use client";

import { useState, type FormEvent } from "react";
import type { SiteSettings } from "@/lib/data/types";
import { saveSiteSettingsAction } from "@/app/admin/actions";

const socialNames = ["Instagram", "Pinterest", "X", "LinkedIn", "Facebook"] as const;

export function SiteSettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [failed, setFailed] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice("");
    const form = new FormData(event.currentTarget);
    const social_links = Object.fromEntries(socialNames.flatMap((social) => {
      const url = String(form.get(`social_${social}`) ?? "").trim();
      return url ? [[social.toLowerCase(), url] as [string, string]] : [];
    }));
    const result = await saveSiteSettingsAction({
      store_name: String(form.get("store_name") ?? ""), tagline: String(form.get("tagline") ?? ""), phone: String(form.get("phone") ?? ""),
      whatsapp_number: String(form.get("whatsapp_number") ?? ""), email: String(form.get("email") ?? ""), address: String(form.get("address") ?? ""),
      social_links, legal_owner_line: String(form.get("legal_owner_line") ?? "") || null,
      announcement_messages: String(form.get("announcement_messages") ?? "").split("\n").map((line) => line.trim()).filter(Boolean),
      hero_headline: String(form.get("hero_headline") ?? ""), hero_subtext: String(form.get("hero_subtext") ?? ""),
      hero_cta_text: String(form.get("hero_cta_text") ?? ""), popup_discount_code: String(form.get("popup_discount_code") ?? ""), is_published: true,
    });
    setNotice(result.message); setFailed(!result.success); setBusy(false);
  }

  return <form onSubmit={submit}>
    {notice && <p className={`admin-notice${failed ? " admin-notice-error" : ""}`} role={failed ? "alert" : "status"}>{notice}</p>}
    <div className="admin-card"><div className="admin-form-grid">
      <label className="admin-field">Store name<input className="admin-input" name="store_name" defaultValue={settings?.store_name ?? "ragNready"} required /></label>
      <label className="admin-field">Tagline<input className="admin-input" name="tagline" defaultValue={settings?.tagline ?? ""} /></label>
      <label className="admin-field">Phone<input className="admin-input" name="phone" defaultValue={settings?.phone ?? "+92 300 0000000"} /></label>
      <label className="admin-field">WhatsApp number<input className="admin-input" name="whatsapp_number" defaultValue={settings?.whatsapp_number ?? "+92 300 0000000"} /></label>
      <label className="admin-field">Email<input className="admin-input" name="email" type="email" defaultValue={settings?.email ?? "hello@example.com"} required /></label>
      <label className="admin-field">Address<input className="admin-input" name="address" defaultValue={settings?.address ?? "Lahore, Pakistan"} /></label>
      <label className="admin-field admin-field-full">Optional legal-owner line<input className="admin-input" name="legal_owner_line" defaultValue={settings?.legal_owner_line ?? ""} /></label>
      <fieldset className="admin-field admin-field-full" style={{ border: 0, margin: 0, padding: 0 }}><legend style={{ marginBottom: 10 }}>Social links</legend><div className="admin-form-grid">{socialNames.map((social) => <label className="admin-field" key={social}>{social}<input className="admin-input" name={`social_${social}`} type="url" defaultValue={settings?.social_links?.[social.toLowerCase()] ?? ""} placeholder="https://" /></label>)}</div></fieldset>
      <label className="admin-field admin-field-full">Announcement messages <span className="admin-help">One message per line. The bar rotates through these.</span><textarea className="admin-textarea" name="announcement_messages" defaultValue={(settings?.announcement_messages ?? []).join("\n")} /></label>
      <label className="admin-field">Hero headline<input className="admin-input" name="hero_headline" defaultValue={settings?.hero_headline ?? "soft beginnings, thoughtfully chosen"} /></label>
      <label className="admin-field">Hero button text<input className="admin-input" name="hero_cta_text" defaultValue={settings?.hero_cta_text ?? "Shop new arrivals"} /></label>
      <label className="admin-field admin-field-full">Hero subtext<textarea className="admin-textarea" name="hero_subtext" defaultValue={settings?.hero_subtext ?? ""} /></label>
      <label className="admin-field">Popup discount code<input className="admin-input" name="popup_discount_code" defaultValue={settings?.popup_discount_code ?? "CODE20OFF"} /></label>
    </div><div className="admin-form-actions"><button className="admin-button admin-button-primary" disabled={busy}>{busy ? "Saving…" : "Save site settings"}</button></div></div>
  </form>;
}
