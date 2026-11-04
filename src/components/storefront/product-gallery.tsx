"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import type { ProductImageInput } from "@/lib/data/types";
import { useDialogFocus } from "@/hooks/use-dialog-focus";

export function ProductGallery({ title, images }: { title: string; images: ProductImageInput[] }) {
  const gallery = images.length ? images : [{ url: "/images/placeholders/product-generic.svg", alt: title, position: 0 }];
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();
  const zoomRef = useRef<HTMLDivElement>(null);
  const closeZoom = useCallback(() => setZoom(false), []);
  useDialogFocus(zoom, closeZoom, zoomRef);

  const showImage = useCallback((index: number) => {
    const next = (index + gallery.length) % gallery.length;
    setDirection(next === (active + 1) % gallery.length ? 1 : next === (active + gallery.length - 1) % gallery.length ? -1 : next > active ? 1 : -1);
    setActive(next);
  }, [active, gallery.length]);

  useEffect(() => {
    if (gallery.length < 2) return;
    for (const index of [(active + 1) % gallery.length, (active + gallery.length - 1) % gallery.length]) {
      const image = new window.Image();
      image.src = gallery[index].url;
    }
  }, [active, gallery]);

  function touchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStart === null) return;
    const endX = event.changedTouches[0]?.clientX;
    if (endX !== undefined && Math.abs(endX - touchStart) > 45) showImage(active + (endX < touchStart ? 1 : -1));
    setTouchStart(null);
  }

  return <div className="product-gallery">
    <div className="product-gallery-main" onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)} onTouchEnd={touchEnd}>
      <button className="product-zoom-button" aria-label="Zoom image" onClick={() => setZoom(true)}>+</button>
      <AnimatePresence mode="wait" initial={false}><motion.div key={active} className="product-gallery-frame" initial={{ opacity: 0, x: reducedMotion ? 0 : direction * 24, scale: reducedMotion ? 1 : 1.03 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: reducedMotion ? 0 : direction * -24, scale: reducedMotion ? 1 : .99 }} transition={{ duration: reducedMotion ? 0 : .28, ease: "easeOut" }}><Image src={gallery[active]?.url ?? gallery[0].url} alt={gallery[active]?.alt || title} fill quality={75} sizes="(max-width: 800px) 100vw, 55vw" /></motion.div></AnimatePresence>
      {gallery.length > 1 && <><button className="gallery-arrow gallery-arrow-left" aria-label="Previous image" onClick={() => showImage(active - 1)}>&lsaquo;</button><button className="gallery-arrow gallery-arrow-right" aria-label="Next image" onClick={() => showImage(active + 1)}>&rsaquo;</button></>}
    </div>
    {gallery.length > 1 && <div className="product-thumbnails" role="group" aria-label="Product images">{gallery.map((image, index) => <button className={index === active ? "is-active" : ""} aria-label={`Show image ${index + 1}`} aria-pressed={index === active} key={image.position} onClick={() => showImage(index)}><Image src={image.url} alt="" fill quality={75} sizes="78px" />{index === active && <motion.span className="product-thumbnail-highlight" layoutId="product-thumbnail-highlight" transition={{ duration: .25, ease: "easeOut" }} />}</button>)}</div>}
    <AnimatePresence>{zoom && <motion.div ref={zoomRef} tabIndex={-1} className="image-zoom-backdrop" role="dialog" aria-modal="true" aria-label={`Zoomed ${title} image`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeZoom}><button className="image-zoom-close" onClick={closeZoom} aria-label="Close zoom">&times;</button><motion.div className="image-zoom-image" initial={{ scale: .9 }} animate={{ scale: 1 }} exit={{ scale: .9 }} onClick={(event) => event.stopPropagation()}><Image src={gallery[active]?.url ?? gallery[0].url} alt={gallery[active]?.alt || title} fill quality={75} sizes="90vw" /></motion.div></motion.div>}</AnimatePresence>
  </div>;
}
