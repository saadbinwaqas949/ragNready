"use client";

import { flushSync } from "react-dom";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";
type ViewTransitionDocument = Document & { startViewTransition?: (update: () => void) => { ready: Promise<void> } };

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0e1829" : "#faf8f4");
  try { window.localStorage.setItem("ragnready-theme", theme); } catch { /* private mode */ }
}

/** The night light: the new theme spreads out from the switch. */
export function ThemeToggle({ withLabel = false }: { withLabel?: boolean }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const sync = () => setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const doc = document as ViewTransitionDocument;
    if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { applyTheme(next); return; }
    const box = event.currentTarget.getBoundingClientRect();
    const x = box.left + box.width / 2, y = box.top + box.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const transition = doc.startViewTransition(() => { applyTheme(next); flushSync(() => setTheme(next)); });
    void transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 620, easing: "cubic-bezier(.65,0,.2,1)", pseudoElement: "::view-transition-new(root)" },
      );
    }).catch(() => undefined);
  }

  const label = theme === "dark" ? "Switch to day theme" : "Switch to night theme";
  return <button type="button" className={withLabel ? "theme-toggle theme-toggle-wide" : "icon-button theme-toggle"} onClick={toggle} aria-label={label} title={label}>
    <svg className="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
      <mask id={withLabel ? "moon-cut-wide" : "moon-cut"}><rect width="24" height="24" fill="#fff" /><circle className="theme-icon-cut" cx="17" cy="8" r="6.5" fill="#000" /></mask>
      <circle className="theme-icon-disc" cx="12" cy="12" r="5" mask={`url(#${withLabel ? "moon-cut-wide" : "moon-cut"})`} />
      <g className="theme-icon-rays"><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></g>
    </svg>
    {withLabel && <span>{theme === "dark" ? "Day theme" : "Night theme"}</span>}
  </button>;
}
