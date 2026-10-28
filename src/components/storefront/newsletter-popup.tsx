"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NewsletterForm } from "./newsletter-form";
import { useDialogFocus } from "@/hooks/use-dialog-focus";

export function NewsletterPopup({ discountCode }: { discountCode: string }) {
  const [mode, setMode] = useState<"newsletter" | "exit" | null>(null);
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const newsletterSeen = window.sessionStorage.getItem("ragnready-newsletter-seen");
    if (!newsletterSeen && !window.sessionStorage.getItem("ragnready-exit-seen")) {
      const timer = window.setTimeout(() => { if (!window.sessionStorage.getItem("ragnready-exit-seen")) { setMode("newsletter"); window.sessionStorage.setItem("ragnready-newsletter-seen", "true"); } }, 8000);
      return () => window.clearTimeout(timer);
    }
    return;
  }, []);

  const dismiss = useCallback(() => {
    if (mode === "newsletter") window.sessionStorage.setItem("ragnready-newsletter-seen", "true");
    if (mode === "exit") window.sessionStorage.setItem("ragnready-exit-seen", "true");
    setMode(null);
  }, [mode]);

  useDialogFocus(Boolean(mode), dismiss, dialogRef);

  useEffect(() => {
    function exitIntent(event: MouseEvent) {
      if (event.clientY > 0 || mode || !window.sessionStorage.getItem("ragnready-newsletter-seen") || window.sessionStorage.getItem("ragnready-exit-seen")) return;
      setMode("exit"); window.sessionStorage.setItem("ragnready-exit-seen", "true");
    }
    document.addEventListener("mouseout", exitIntent);
    return () => document.removeEventListener("mouseout", exitIntent);
  }, [mode]);

  async function copyCode() {
    try { await navigator.clipboard.writeText(discountCode); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
    catch { setCopied(false); }
  }

  return <AnimatePresence>{mode && <motion.div className="popup-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) dismiss(); }}>
    <motion.section ref={dialogRef} tabIndex={-1} className="newsletter-popup" role="dialog" aria-modal="true" aria-labelledby="newsletter-popup-title" initial={{ opacity: 0, y: 18, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}>
      <button className="popup-close" onClick={dismiss} aria-label="Close popup">×</button>
      <p className="eyebrow">A little something lovely</p><h2 id="newsletter-popup-title">{mode === "exit" ? "Wait! Before you leave…" : "Get 20% discount shipped to your inbox"}</h2>
      <p>{mode === "exit" ? "Get 20% off your first order and save a little something for later." : "Join the ragNready family for thoughtful updates and a welcome treat."}</p>
      <NewsletterForm />
      {mode === "exit" && <button className="discount-code-button" onClick={() => void copyCode()}>{discountCode} <span>{copied ? "Link copied" : "Copy code"}</span></button>}
      <button className="popup-dismiss" onClick={dismiss}>No, thanks</button>
    </motion.section>
  </motion.div>}</AnimatePresence>;
}
