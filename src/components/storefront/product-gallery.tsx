"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useRef, useState, type CSSProperties, type TouchEvent } from "react";
import type { ProductImageInput } from "@/lib/data/types";

const ImageLightbox = dynamic(() => import("./image-lightbox").then((module) => module.ImageLightbox), { ssr: false });

export function ProductGallery({ title, images }: { title: string; images: ProductImageInput[] }) {
  const gallery = useMemo(() => images.length ? images : [{ url: "/images/placeholders/product-generic.svg", alt: title, position: 0 }], [images, title]);
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [zoomHover, setZoomHover] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const zoomButtonRef = useRef<HTMLButtonElement>(null);
  const swiped = useRef(false);
  const reducedMotion = useReducedMotion();
  const closeZoom = useCallback(() => setZoom(false), []);
  const openZoom = useCallback(() => setZoom(true), []);

  const showImage = useCallback((index: number) => {
    const next = (index + gallery.length) % gallery.length;
    setDirection(next === (active + 1) % gallery.length ? 1 : next === (active + gallery.length - 1) % gallery.length ? -1 : next > active ? 1 : -1);
    setActive(next);
  }, [active, gallery.length]);

  function touchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStart === null) return;
    const endX = event.changedTouches[0]?.clientX;
    if (endX !== undefined && Math.abs(endX - touchStart) > 45) { swiped.current = true; showImage(active + (endX < touchStart ? 1 : -1)); window.setTimeout(() => { swiped.current = false; }, 0); }
    setTouchStart(null);
  }

  return <div className="product-gallery">
    <div className={`product-gallery-main${zoomHover ? " is-hover-zoomed" : ""}`} style={{ "--gallery-zoom-origin": zoomOrigin } as CSSProperties} onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)} onTouchEnd={touchEnd} onMouseMove={(event) => { if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return; const rect = event.currentTarget.getBoundingClientRect(); setZoomOrigin(`${((event.clientX - rect.left) / rect.width) * 100}% ${((event.clientY - rect.top) / rect.height) * 100}%`); }} onMouseEnter={() => { if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setZoomHover(true); }} onMouseLeave={() => setZoomHover(false)}>
      <button ref={zoomButtonRef} className="product-zoom-button" aria-label="Open image viewer" onClick={openZoom}><Expand aria-hidden="true" /></button>
      <AnimatePresence mode="wait" initial={false}><motion.div key={active} className="product-gallery-frame" initial={{ opacity: 0, x: reducedMotion ? 0 : direction * 24, scale: reducedMotion ? 1 : 1.03 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: reducedMotion ? 0 : direction * -24, scale: reducedMotion ? 1 : .99 }} transition={{ duration: reducedMotion ? 0 : .28, ease: "easeOut" }} onClick={() => { if (!swiped.current) openZoom(); }}><Image src={gallery[active]?.url ?? gallery[0].url} alt={gallery[active]?.alt || title} fill quality={75} priority={active === 0} sizes="(max-width: 860px) 100vw, 55vw" /></motion.div></AnimatePresence>
      {gallery.length > 1 && <><button className="gallery-arrow gallery-arrow-left" aria-label="Previous image" onClick={() => showImage(active - 1)}><ChevronLeft aria-hidden="true" /></button><button className="gallery-arrow gallery-arrow-right" aria-label="Next image" onClick={() => showImage(active + 1)}><ChevronRight aria-hidden="true" /></button></>}
    </div>
    {gallery.length > 1 && <div className="product-thumbnails" role="group" aria-label="Product images">{gallery.map((image, index) => <button className={index === active ? "is-active" : ""} aria-label={`Show image ${index + 1}`} aria-pressed={index === active} key={image.position} onClick={() => showImage(index)}><Image src={image.url} alt="" fill quality={75} sizes="78px" />{index === active && <motion.span className="product-thumbnail-highlight" layoutId="product-thumbnail-highlight" transition={{ duration: reducedMotion ? 0 : .25, ease: "easeOut" }} />}</button>)}</div>}
    {zoom && <ImageLightbox title={title} images={gallery} initialIndex={active} onClose={closeZoom} opener={zoomButtonRef.current} />}
  </div>;
}
