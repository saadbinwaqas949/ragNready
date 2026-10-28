"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { z } from "zod";
import type { Collection, ProductImageInput } from "@/lib/data/types";
import { deleteCollectionAction, saveCollectionAction } from "@/app/admin/actions";
import { ImageUploader } from "./image-uploader";

function toHandle(value: string) { return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

function CollectionForm({ collection, onCancel }: { collection?: Collection; onCancel: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState(collection?.title ?? "");
  const [handle, setHandle] = useState(collection?.handle ?? "");
  const [autoHandle, setAutoHandle] = useState(!collection);
  const [photos, setPhotos] = useState<ProductImageInput[]>(collection?.image ? [{ url: collection.image, alt: collection.title, position: 0 }] : []);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice("");
    const form = new FormData(event.currentTarget);
    const payload = { ...(collection ? { id: collection.id } : {}), title: title.trim(), handle: toHandle(handle), description: String(form.get("description") ?? ""), image: photos[0]?.url ?? null, sort_order: Number(form.get("sort_order") ?? 0) };
    const check = z.object({ title: z.string().min(2), handle: z.string().min(2), sort_order: z.number().int() }).safeParse(payload);
    if (!check.success) { setNotice("Enter a collection name and a valid handle."); setError(true); setBusy(false); return; }
    const result = await saveCollectionAction(payload);
    setNotice(result.message); setError(!result.success); setBusy(false);
    if (result.success) router.refresh();
  }

  return <form className="admin-card" onSubmit={submit}>
    <h2 style={{ marginTop: 0 }}>{collection ? "Edit collection" : "Add collection"}</h2>
    {notice && <p className={`admin-notice${error ? " admin-notice-error" : ""}`} role={error ? "alert" : "status"}>{notice}</p>}
    <div className="admin-form-grid">
      <label className="admin-field">Collection name<input className="admin-input" value={title} onChange={(event) => { setTitle(event.target.value); if (autoHandle) setHandle(toHandle(event.target.value)); }} required /></label>
      <label className="admin-field">Handle<input className="admin-input" value={handle} onChange={(event) => { setHandle(event.target.value); setAutoHandle(false); }} required /><span className="admin-help">Generated from the name. Lowercase letters, numbers and dashes.</span></label>
      <label className="admin-field admin-field-full">Description<textarea className="admin-textarea" name="description" defaultValue={collection?.description ?? ""} /></label>
      <label className="admin-field">Sort order<input className="admin-input" type="number" name="sort_order" step="1" defaultValue={collection?.sort_order ?? 0} /></label>
      <div className="admin-field admin-field-full"><span>Cover image</span><ImageUploader initialImages={photos} onChange={setPhotos} maxFiles={1} folder="collections" /></div>
    </div>
    <div className="admin-form-actions"><button className="admin-button" type="button" onClick={onCancel}>Cancel</button><button className="admin-button admin-button-primary" disabled={busy}>{busy ? "Saving…" : "Save collection"}</button></div>
  </form>;
}

export function CollectionManager({ collections }: { collections: Collection[] }) {
  const [editing, setEditing] = useState<Collection | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= collections.length) return;
    const ordered = [...collections];
    [ordered[index], ordered[nextIndex]] = [ordered[nextIndex], ordered[index]];
    setBusyId(collections[index].id); setMessage("");
    for (const [sort_order, item] of ordered.entries()) {
      const result = await saveCollectionAction({ ...item, sort_order });
      if (!result.success) { setMessage(result.message); setBusyId(""); return; }
    }
    setBusyId(""); setMessage("Collection order saved."); router.refresh();
  }

  async function remove(collection: Collection) {
    if (!window.confirm(`Delete “${collection.title}”? Products will remain in the catalog.`)) return;
    setBusyId(collection.id);
    const result = await deleteCollectionAction(collection.id);
    setMessage(result.message); setBusyId("");
    if (result.success) router.refresh();
  }

  return <div className="admin-form-grid" style={{ alignItems: "start" }}>
    <section className="admin-card admin-field-full"><div className="admin-page-heading"><div><h2 style={{ margin: 0, fontSize: 19 }}>Collections</h2><p>Add, edit, sort and set cover photos.</p></div><button className="admin-button admin-button-primary" onClick={() => { setEditing(null); setShowForm(true); }}>Add collection</button></div>
      {message && <p className="admin-notice" role="status">{message}</p>}
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Collection</th><th>Handle</th><th>Order</th><th>Actions</th></tr></thead><tbody>{collections.map((collection, index) => <tr key={collection.id}>
        <td><div className="admin-product-cell"><div className="admin-thumb">{collection.image ? <Image src={collection.image} alt="" width={46} height={52} /> : "Cover"}</div><strong>{collection.title}</strong></div></td><td>/{collection.handle}</td><td>{collection.sort_order}</td>
        <td><div className="admin-inline-actions"><button className="admin-button" disabled={index === 0 || Boolean(busyId)} onClick={() => void move(index, -1)} aria-label={`Move ${collection.title} up`}>↑</button><button className="admin-button" disabled={index === collections.length - 1 || Boolean(busyId)} onClick={() => void move(index, 1)} aria-label={`Move ${collection.title} down`}>↓</button><button className="admin-button" onClick={() => { setEditing(collection); setShowForm(true); }}>Edit</button><button className="admin-button admin-button-danger" disabled={busyId === collection.id} onClick={() => void remove(collection)}>{busyId === collection.id ? "Working…" : "Delete"}</button></div></td>
      </tr>)}</tbody></table></div>
    </section>
    {showForm && <div className="admin-field-full"><CollectionForm key={editing?.id ?? "new"} collection={editing ?? undefined} onCancel={() => setShowForm(false)} /></div>}
  </div>;
}
