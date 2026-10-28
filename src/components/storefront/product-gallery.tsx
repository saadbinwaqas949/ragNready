"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState, type TouchEvent } from "react";
import type { ProductImageInput } from "@/lib/data/types";
import { useDialogFocus } from "@/hooks/use-dialog-focus";

export function ProductGallery({ title, images }: { title: string; images: ProductImageInput[] }) {
  const gallery = images.length ? images : [{ url: "/images/placeholders/product-generic.svg", alt: title, position: 0 }];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const closeZoom = useCallback(() => setZoom(false), []);
  useDialogFocus(zoom, closeZoom, zoomRef);

  function touchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStart === null) return;
    const endX = event.changedTouches[0]?.clientX;
    if (endX === undefined) return;
    const delta = endX - touchStart;
    if (delta && Math.abs(delta) > 45) setActive((index) => (index + (delta < 0 ? 1 : gallery.length - 1)) % gallery.length);
    setTouchStart(null);
  }

  return <div className="product-gallery">
    <div className="product-gallery-main" onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)} onTouchEnd={touchEnd}>
      <button className="product-zoom-button" aria-label="Zoom image" onClick={() => setZoom(true)}>⌕</button>
      <Image src={gallery[active]?.url ?? gallery[0].url} alt={gallery[active]?.alt || title} fill priority sizes="(max-width: 800px) 100vw, 55vw" />
      {gallery.length > 1 && <><button className="gallery-arrow gallery-arrow-left" aria-label="Previous image" onClick={() => setActive((active + gallery.length - 1) % gallery.length)}>‹</button><button className="gallery-arrow gallery-arrow-right" aria-label="Next image" onClick={() => setActive((active + 1) % gallery.length)}>›</button></>}
    </div>
    {gallery.length > 1 && <div className="product-thumbnails" role="group" aria-label="Product images">{gallery.map((image, index) => <button className={index === active ? "is-active" : ""} aria-label={`Show image ${index + 1}`} aria-pressed={index === active} key={image.position} onClick={() => setActive(index)}><Image src={image.url} alt="" fill sizes="78px" /></button>)}</div>}
    <AnimatePresence>{zoom && <motion.div ref={zoomRef} tabIndex={-1} className="image-zoom-backdrop" role="dialog" aria-modal="true" aria-label={`Zoomed ${title} image`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeZoom}><button className="image-zoom-close" onClick={closeZoom} aria-label="Close zoom">×</button><motion.div className="image-zoom-image" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(event) => event.stopPropagation()}><Image src={gallery[active]?.url ?? gallery[0].url} alt={gallery[active]?.alt || title} fill sizes="90vw" /></motion.div></motion.div>}</AnimatePresence>
  </div>;
}
