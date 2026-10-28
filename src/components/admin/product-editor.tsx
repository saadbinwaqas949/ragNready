"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import type { AdminProductRow } from "@/lib/data/admin";
import type { Collection, ProductImageInput, VariantInput } from "@/lib/data/types";
import { saveProductAction } from "@/app/admin/actions";
import { ImageUploader } from "./image-uploader";

const sizes = ["0-3 Months", "3-6 Months", "6-9 Months", "9-12 Months", "12-18 Months"];
const formCheck = z.object({ title: z.string().trim().min(2, "Enter a product name."), handle: z.string().min(2, "Add a product handle."), price: z.number().finite().min(0, "Price must be zero or more."), variants: z.array(z.object({ size: z.string(), stock: z.number().int().min(0) })).min(1) });

function slugify(value: string) {
  return value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function ProductEditor({ product, collections }: { product?: AdminProductRow | null; collections: Collection[] }) {
  const router = useRouter();
  const initialCollections = product?.product_collections.map((link) => link.collections?.handle).filter((handle): handle is string => Boolean(handle)) ?? [];
  const initialVariants = product?.product_variants ?? [];
  const [title, setTitle] = useState(product?.title ?? "");
  const [handle, setHandle] = useState(product?.handle ?? "");
  const [autoHandle, setAutoHandle] = useState(!product);
  const [images, setImages] = useState<ProductImageInput[]>(product?.product_images ?? []);
  const [collectionHandles, setCollectionHandles] = useState<string[]>(initialCollections);
  const [variants, setVariants] = useState<VariantInput[]>(sizes.map((size) => {
    const found = initialVariants.find((variant) => variant.size === size);
    return { size, stock: found?.stock ?? 0, sku: found?.sku ?? null };
  }));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [isError, setIsError] = useState(false);
  const ageOptions = useMemo(() => sizes.map((size, index) => ({ size, variant: variants[index] })), [variants]);

  function changeTitle(value: string) {
    setTitle(value);
    if (autoHandle) setHandle(slugify(value));
  }

  function toggleCollection(handleValue: string) {
    setCollectionHandles((current) => current.includes(handleValue) ? current.filter((handleItem) => handleItem !== handleValue) : [...current, handleValue]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice(""); setIsError(false);
    const form = new FormData(event.currentTarget);
    const price = Number(form.get("price"));
    const compareRaw = String(form.get("compare_at_price") ?? "");
    const payload = {
      ...(product ? { id: product.id } : {}),
      title: title.trim(), handle: slugify(handle), description: String(form.get("description") ?? ""), price,
      compare_at_price: compareRaw ? Number(compareRaw) : null,
      gender: String(form.get("gender") ?? "Unisex") as "Boys" | "Girls" | "Unisex",
      season: String(form.get("season") ?? "All Seasons") as "Winter" | "Summer" | "All Seasons",
      status: String(form.get("status") ?? "draft") as "draft" | "published",
      is_sold_out: form.get("is_sold_out") === "on",
      badges: String(form.get("badges") ?? "").split(",").map((badge) => badge.trim()).filter(Boolean),
      sort_order: Number(form.get("sort_order") ?? 0), fabric_care: String(form.get("fabric_care") ?? ""),
      images: images.map((image, position) => ({ ...image, position })),
      variants: ageOptions.map(({ size, variant }) => ({ size, stock: Number(variant?.stock ?? 0), sku: variant?.sku ?? null })),
      collection_handles: collectionHandles,
    };
    const checked = formCheck.safeParse({ title: payload.title, handle: payload.handle, price, variants: payload.variants });
    if (!checked.success) { setIsError(true); setNotice(checked.error.issues[0]?.message ?? "Check the product details."); return; }
    setBusy(true);
    const result = await saveProductAction(payload);
    setNotice(result.message); setIsError(!result.success);
    if (result.success) window.setTimeout(() => { router.replace("/admin/products"); router.refresh(); }, 700);
    else setBusy(false);
  }

  return <form onSubmit={submit}>
    {notice && <p className={`admin-notice${isError ? " admin-notice-error" : ""}`} role={isError ? "alert" : "status"}>{notice}</p>}
    <div className="admin-card"><div className="admin-form-grid">
      <label className="admin-field">Product title<input className="admin-input" value={title} onChange={(event) => changeTitle(event.target.value)} required maxLength={160} /></label>
      <label className="admin-field">Handle<input className="admin-input" value={handle} onChange={(event) => { setHandle(event.target.value); setAutoHandle(false); }} required maxLength={180} /><span className="admin-help">Generated from the title. Use lowercase letters, numbers and dashes.</span></label>
      <label className="admin-field admin-field-full">Description<textarea className="admin-textarea" name="description" defaultValue={product?.description ?? ""} maxLength={10000} /></label>
      <label className="admin-field">Price (Rs.)<input className="admin-input" name="price" type="number" min="0" step="0.01" defaultValue={product?.price ?? ""} required /></label>
      <label className="admin-field">Compare-at price (optional)<input className="admin-input" name="compare_at_price" type="number" min="0" step="0.01" defaultValue={product?.compare_at_price ?? ""} /></label>
      <label className="admin-field">Gender<select className="admin-select" name="gender" defaultValue={product?.gender ?? "Unisex"}><option>Boys</option><option>Girls</option><option>Unisex</option></select></label>
      <label className="admin-field">Season<select className="admin-select" name="season" defaultValue={product?.season ?? "All Seasons"}><option>Winter</option><option>Summer</option><option>All Seasons</option></select></label>
      <label className="admin-field">Status<select className="admin-select" name="status" defaultValue={product?.status ?? "draft"}><option value="draft">Draft</option><option value="published">Published</option></select></label>
      <label className="admin-field">Sort order<input className="admin-input" name="sort_order" type="number" step="1" defaultValue={product?.sort_order ?? 0} /></label>
      <label className="admin-field admin-field-full">Fabric &amp; care<textarea className="admin-textarea" name="fabric_care" defaultValue={product?.fabric_care ?? ""} maxLength={3000} /></label>
      <label className="admin-field admin-field-full">Badges <span className="admin-help">Separate badges with commas.</span><input className="admin-input" name="badges" defaultValue={product?.badges?.join(", ") ?? ""} placeholder="New, Gift" /></label>
      <fieldset className="admin-field admin-field-full" style={{ border: 0, padding: 0, margin: 0 }}><legend style={{ marginBottom: 10 }}>Collections</legend><div className="admin-checkbox-list">{collections.map((collection) => <label className="admin-check" key={collection.id}><input type="checkbox" checked={collectionHandles.includes(collection.handle)} onChange={() => toggleCollection(collection.handle)} />{collection.title}</label>)}</div></fieldset>
      <fieldset className="admin-field admin-field-full" style={{ border: 0, padding: 0, margin: 0 }}><legend style={{ marginBottom: 10 }}>Sizes and stock</legend><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Age</th><th>Stock count</th></tr></thead><tbody>{ageOptions.map(({ size, variant }, index) => <tr key={size}><td>{size}</td><td><input aria-label={`${size} stock`} className="admin-input" type="number" min="0" step="1" value={variant?.stock ?? 0} onChange={(event) => setVariants((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, stock: Math.max(0, Number(event.target.value)) } : item))} /></td></tr>)}</tbody></table></div></fieldset>
      <label className="admin-check admin-field-full"><input type="checkbox" name="is_sold_out" defaultChecked={product?.is_sold_out ?? false} />Mark as sold out</label>
      <div className="admin-field admin-field-full"><span>Product photos</span><ImageUploader initialImages={images} onChange={setImages} maxFiles={12} /></div>
    </div><div className="admin-form-actions"><a className="admin-button" href="/admin/products">Cancel</a><button className="admin-button admin-button-primary" type="submit" disabled={busy}>{busy ? "Saving…" : product ? "Save product" : "Add product"}</button></div></div>
  </form>;
}
