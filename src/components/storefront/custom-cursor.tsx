"use client";

import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState("");
  const shown = useRef(false);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cursor = document.querySelector<HTMLElement>(".custom-cursor");
    if (!cursor) return;
    const move = (event: PointerEvent) => { cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`; if (!shown.current) { shown.current = true; setVisible(true); } };
    const over = (event: Event) => { const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-cursor-label]") : null; setLabel(target?.dataset.cursorLabel ?? ""); };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over);
    return () => { window.removeEventListener("pointermove", move); document.removeEventListener("pointerover", over); };
  }, []);
  return <div className={`custom-cursor${visible ? " is-visible" : ""}${label ? " has-label" : ""}`} aria-hidden="true">{label || ""}</div>;
}
