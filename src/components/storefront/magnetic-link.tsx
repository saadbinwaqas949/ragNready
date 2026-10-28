"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";

export function MagneticLink({ href, children, className = "button-primary" }: { href: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  function move(event: MouseEvent<HTMLAnchorElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = ref.current?.getBoundingClientRect();
    if (!box || !ref.current) return;
    ref.current.style.transform = `translate(${(event.clientX - box.left - box.width / 2) * 0.08}px, ${(event.clientY - box.top - box.height / 2) * 0.12}px)`;
  }
  return <a ref={ref} className={className} href={href} onMouseMove={move} onMouseLeave={() => { if (ref.current) ref.current.style.transform = "translate(0, 0)"; }}>{children}</a>;
}
