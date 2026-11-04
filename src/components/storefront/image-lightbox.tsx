"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent, type PointerEvent } from "react";
import type { ProductImageInput } from "@/lib/data/types";

type Props = { title: string; images: ProductImageInput[]; initialIndex: number; onClose: () => void; opener: HTMLElement | null };
const focusable = "button:not([disabled]),[href],input:not([disabled]),[tabindex]:not([tabindex='-1'])";

export function ImageLightbox({ title, images, initialIndex, onClose, opener }: Props) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [active, setActive] = useState(initialIndex);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const image = images[active];
  const move = useCallback((delta: number) => setActive((index) => (index + delta + images.length) % images.length), [images.length]);
  const close = useCallback(() => { setClosing(true); window.setTimeout(onClose, 180); }, [onClose]);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!mounted) return;
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = dialogRef.current?.querySelector<HTMLElement>(focusable);
    first?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
      if (event.key === "Tab") {
        const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(focusable) ?? []).filter((item) => item.getClientRects().length);
        const firstItem = items[0], lastItem = items.at(-1);
        if (!items.length) { event.preventDefault(); dialogRef.current?.focus(); }
        else if (event.shiftKey && document.activeElement === firstItem) { event.preventDefault(); lastItem?.focus(); }
        else if (!event.shiftKey && document.activeElement === lastItem) { event.preventDefault(); firstItem?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = priorOverflow; document.removeEventListener("keydown", onKey); opener?.focus(); };
  }, [close, mounted, move, opener]);
  useEffect(() => {
    if (!image) return;
    const preload = new window.Image();
    preload.src = image.url;
  }, [image]);

  if (!mounted || !image) return null;
  const point = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setOrigin(`${((event.clientX - rect.left) / rect.width) * 100}% ${((event.clientY - rect.top) / rect.height) * 100}%`);
  };
  const pictureClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const element = event.currentTarget.querySelector("img");
    const bounds = event.currentTarget.getBoundingClientRect();
    const width = element?.naturalWidth || bounds.width, height = element?.naturalHeight || bounds.height;
    const scale = Math.min(bounds.width / width, bounds.height / height);
    const renderedWidth = width * scale, renderedHeight = height * scale;
    const left = bounds.left + (bounds.width - renderedWidth) / 2, top = bounds.top + (bounds.height - renderedHeight) / 2;
    const onImage = event.clientX >= left && event.clientX <= left + renderedWidth && event.clientY >= top && event.clientY <= top + renderedHeight;
    if (!onImage) { close(); return; }
    if (window.matchMedia("(hover: none)").matches && !dragged.current) setZoom((value) => !value);
    dragged.current = false;
  };

  return createPortal(<div className={`lightbox-backdrop${closing ? " is-closing" : ""}`} onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <div className="lightbox-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-label={`${title} photos`} tabIndex={-1}>
      <button className="lightbox-close" type="button" aria-label="Close image viewer" onClick={close}>&times;</button>
      {images.length > 1 && <button className="lightbox-arrow lightbox-prev" type="button" aria-label="Previous image" onClick={() => move(-1)}>&lsaquo;</button>}
      <div className={`lightbox-picture${zoom ? " is-touch-zoomed" : ""}`} style={{ "--lightbox-origin": origin, "--lightbox-pan-x": `${pan.x}px`, "--lightbox-pan-y": `${pan.y}px` } as CSSProperties} onPointerMove={point} onClick={pictureClick} onPointerDown={(event) => { if (zoom && event.pointerType === "touch") { event.currentTarget.setPointerCapture(event.pointerId); setDragStart({ x: event.clientX - pan.x, y: event.clientY - pan.y }); dragged.current = false; } }} onPointerUp={() => setDragStart(null)} onPointerLeave={() => setDragStart(null)} onPointerMoveCapture={(event) => { if (dragStart) { if (Math.abs(event.clientX - dragStart.x - pan.x) + Math.abs(event.clientY - dragStart.y - pan.y) > 1) dragged.current = true; setPan({ x: event.clientX - dragStart.x, y: event.clientY - dragStart.y }); } }}>
        <Image key={image.url} className="lightbox-image" src={image.url} alt={image.alt || title} fill quality={85} sizes="92vw" priority />
      </div>
      {images.length > 1 && <button className="lightbox-arrow lightbox-next" type="button" aria-label="Next image" onClick={() => move(1)}>&rsaquo;</button>}
      {images.length > 1 && <div className="lightbox-thumbnails" aria-label="Choose image">{images.map((thumb, index) => <button key={`${thumb.url}-${index}`} type="button" aria-label={`Show image ${index + 1}`} aria-current={active === index ? "true" : undefined} onClick={() => setActive(index)}><Image src={thumb.url} alt="" fill sizes="64px" /></button>)}</div>}
    </div>
  </div>, document.body);
}
