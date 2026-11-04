"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useRef, useState, type FormEvent } from "react";
import { useDialogFocus } from "@/hooks/use-dialog-focus";
import type { ProductImageInput } from "@/lib/data/types";
import type { PublicReview } from "@/lib/data/reviews";

const ImageLightbox = dynamic(() => import("./image-lightbox").then((module) => module.ImageLightbox), { ssr: false });
type Photo = { file: File; preview: string };

async function compressPhoto(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  for (const quality of [.82, .7, .58, .48]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (blob && blob.size <= 300 * 1024) return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
  }
  const last = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", .4));
  if (!last || last.size > 300 * 1024) throw new Error("Choose a smaller photo and try again.");
  return new File([last], "review-photo.webp", { type: "image/webp" });
}

function ReviewForm({ productId, close }: { productId: string; close: () => void }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(true, close, dialogRef);

  async function addPhotos(files: FileList | null) {
    if (!files) return;
    const incoming = Array.from(files).slice(0, 3 - photos.length);
    try {
      const compressed = await Promise.all(incoming.map(compressPhoto));
      setPhotos((existing) => [...existing, ...compressed.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
    } catch (error) { setMessage(error instanceof Error ? error.message : "A photo could not be processed."); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const data = new FormData(event.currentTarget);
    data.delete("photos");
    data.set("productId", productId);
    for (const photo of photos) data.append("photos", photo.file);
    const response = await fetch("/api/reviews", { method: "POST", body: data });
    const result = await response.json().catch(() => ({})) as { message?: string };
    setMessage(result.message || "We could not submit your review right now."); setSuccess(response.ok); setBusy(false);
  }

  return <div className="review-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}><div ref={dialogRef} className="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-form-title" tabIndex={-1}><button className="review-modal-close" type="button" aria-label="Close review form" onClick={close}>×</button><h2 id="review-form-title">Write a review</h2>{success ? <p role="status">Thanks! Your review will appear once it is approved.</p> : <form ref={formRef} onSubmit={submit}>
    <label>Order number<input name="orderNumber" required maxLength={100} /></label><label>Phone number used for the order<input name="phone" type="tel" required maxLength={60} /></label><label>Rating<select name="rating" defaultValue="5" required><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select></label><label>Your name<input name="name" required maxLength={120} /></label><label>Your review<textarea name="comment" required maxLength={3000} rows={4} /></label><label>Photos (optional, up to 3)<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => void addPhotos(event.target.files)} disabled={photos.length >= 3} /></label><div className="review-photo-previews">{photos.map((photo, index) => <div key={photo.preview}><Image src={photo.preview} alt={`Review photo ${index + 1}`} width={72} height={72} unoptimized /><button type="button" aria-label={`Remove photo ${index + 1}`} onClick={() => { URL.revokeObjectURL(photo.preview); setPhotos((items) => items.filter((item) => item !== photo)); }}>Remove</button></div>)}</div>{message && <p role={success ? "status" : "alert"}>{message}</p>}<button className="button-primary" type="submit" disabled={busy}>{busy ? "Sending…" : "Submit review"}</button></form>}</div></div>;
}

export function ProductReviews({ productId, reviews }: { productId: string; reviews: PublicReview[] }) {
  const [formOpen, setFormOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ images: ProductImageInput[]; index: number; opener: HTMLElement | null } | null>(null);
  const allPhotos = reviews.flatMap((review) => review.review_images.map((photo) => ({ ...photo, alt: `Photo shared by ${review.reviewer_name}` })));
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  return <section className="section product-reviews" id="reviews"><div className="section-head-row"><div><p className="eyebrow">kind words from our community</p><h2 className="section-heading section-heading-left">Customer reviews</h2></div>{reviews.length > 0 && <div className="review-rating-large" aria-label={`${average.toFixed(1)} out of 5 stars`}>★ {average.toFixed(1)} <span>{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</span></div>}</div><button className="button-primary" type="button" onClick={() => setFormOpen(true)}>Write a review</button>{reviews.length === 0 ? <p>No reviews yet.</p> : <div className="reviews-row">{reviews.map((review) => <article className="review-card" key={review.id}><div className="review-stars" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div><p>{review.comment}</p><div className="review-person"><strong>{review.reviewer_name}</strong><span>{new Date(review.created_at).toLocaleDateString("en-PK", { dateStyle: "medium" })} · <span className="verified-badge">Verified purchase</span></span></div>{review.review_images.length > 0 && <div className="review-photo-row">{review.review_images.map((photo) => <button type="button" key={photo.position} aria-label="Open review photo" onClick={(event) => setLightbox({ images: review.review_images.map((entry) => ({ url: entry.url, alt: `Photo shared by ${review.reviewer_name}`, position: entry.position })), index: review.review_images.findIndex((entry) => entry.url === photo.url), opener: event.currentTarget })}><Image src={photo.url} alt={`Photo shared by ${review.reviewer_name}`} width={76} height={76} quality={75} /></button>)}</div>}</article>)}</div>}{formOpen && <ReviewForm productId={productId} close={() => setFormOpen(false)} />}{lightbox && <ImageLightbox title="Customer review photos" images={lightbox.images} initialIndex={lightbox.index} onClose={() => setLightbox(null)} opener={lightbox.opener} />}</section>;
}
