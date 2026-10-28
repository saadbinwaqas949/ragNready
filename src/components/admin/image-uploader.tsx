"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProductImageInput } from "@/lib/data/types";

type Photo = ProductImageInput & { key: string };

function compressImage(file: File): Promise<Blob> {
  return createImageBitmap(file).then(async (bitmap) => {
    const scale = Math.min(1, 1200 / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not prepare this image.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    let quality = 0.84;
    let blob: Blob | null = null;
    while (quality >= 0.48) {
      blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
      if (blob && blob.size <= 300 * 1024) return blob;
      quality -= 0.1;
    }
    if (!blob) throw new Error("The image could not be converted to WebP.");
    return blob;
  });
}

function storedObjectPath(url: string) {
  const marker = "/storage/v1/object/public/product-images/";
  const position = url.indexOf(marker);
  return position < 0 ? null : decodeURIComponent(url.slice(position + marker.length));
}

export function ImageUploader({ initialImages = [], onChange, maxFiles = 8, folder = "products" }: {
  initialImages?: ProductImageInput[];
  onChange: (images: ProductImageInput[]) => void;
  maxFiles?: number;
  folder?: "products" | "collections";
}) {
  const [photos, setPhotos] = useState<Photo[]>(initialImages.map((photo) => ({ ...photo, key: photo.url })));
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function update(next: Photo[]) {
    const ordered = next.map((photo, position) => ({ ...photo, position }));
    setPhotos(ordered);
    onChange(ordered.map(({ url, alt, position }) => ({ url, alt, position })));
  }

  async function uploadFiles(files: FileList | File[]) {
    const remaining = Math.max(0, maxFiles - photos.length);
    const selected = Array.from(files).filter((file) => file.type.startsWith("image/")).slice(0, remaining);
    if (!selected.length) return;
    setError(""); setBusy(true); setProgress(0); setTotal(selected.length);
    const client = createSupabaseBrowserClient();
    const added: Photo[] = [];
    try {
      for (const file of selected) {
        const blob = await compressImage(file);
        const objectPath = `${folder}/${crypto.randomUUID()}.webp`;
        const { error: uploadError } = await client.storage.from("product-images").upload(objectPath, blob, { contentType: "image/webp", cacheControl: "31536000" });
        if (uploadError) throw uploadError;
        const url = client.storage.from("product-images").getPublicUrl(objectPath).data.publicUrl;
        added.push({ key: objectPath, url, alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "), position: photos.length + added.length });
        setProgress(added.length);
      }
      update([...photos, ...added]);
      setBusy(false);
    } catch {
      const uploadedPaths = added.map((photo) => photo.key).filter((path) => path.includes("/"));
      if (uploadedPaths.length) await client.storage.from("product-images").remove(uploadedPaths);
      setError("Upload failed. Confirm the product-images bucket exists and your account has admin upload access.");
      setBusy(false);
    }
  }

  async function removePhoto(index: number) {
    const photo = photos[index];
    const path = storedObjectPath(photo.url);
    if (path) {
      const { error: removeError } = await createSupabaseBrowserClient().storage.from("product-images").remove([path]);
      if (removeError) { setError("This image could not be deleted from storage."); return; }
    }
    update(photos.filter((_, current) => current !== index));
  }

  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (event.dataTransfer.files.length) void uploadFiles(event.dataTransfer.files);
  }

  function inputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) void uploadFiles(event.target.files);
    event.target.value = "";
  }

  return <div className="admin-upload">
    <div className="admin-upload-drop" onDragOver={(event) => event.preventDefault()} onDrop={drop}>
      <p>Drop photos here, or <button type="button" className="admin-plain-button" onClick={() => inputRef.current?.click()}>choose files</button></p>
      <span className="admin-help">Images are resized to max 1200px and compressed to WebP (about 300 KB). {photos.length}/{maxFiles} photos</span>
      <input ref={inputRef} hidden type="file" accept="image/*" multiple={maxFiles > 1} onChange={inputChange} />
    </div>
    {busy && <div><span className="admin-help">Uploading {progress} of {total}…</span><progress className="admin-progress" value={progress} max={total || 1} /></div>}
    {error && <p className="admin-notice admin-notice-error" role="alert">{error}</p>}
    {photos.length > 0 && <div className="admin-photo-list">{photos.map((photo, index) => <div className="admin-photo-row" key={photo.key}>
      <Image src={photo.url} alt={photo.alt || "Product photo preview"} width={62} height={68} unoptimized />
      <label className="admin-field">Alt text<input className="admin-input" value={photo.alt} onChange={(event) => update(photos.map((item, current) => current === index ? { ...item, alt: event.target.value } : item))} /></label>
      <div className="admin-photo-actions">{index === 0 ? <span className="admin-badge">Main image</span> : <button type="button" onClick={() => { const next = [...photos]; const [main] = next.splice(index, 1); next.unshift(main); update(next); }}>Make main</button>}<button type="button" disabled={index === 0} aria-label="Move image earlier" onClick={() => { const next = [...photos]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; update(next); }}>↑</button><button type="button" disabled={index === photos.length - 1} aria-label="Move image later" onClick={() => { const next = [...photos]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; update(next); }}>↓</button><button type="button" className="admin-button-danger" onClick={() => void removePhoto(index)}>Delete</button></div>
    </div>)}</div>}
  </div>;
}
