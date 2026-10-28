"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProductAction, setProductStatusAction, setSoldOutAction } from "@/app/admin/actions";

export function ProductQuickToggles({ id, status, isSoldOut }: { id: string; status: "draft" | "published"; isSoldOut: boolean }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  async function run(action: () => Promise<{ success: boolean; message: string }>) {
    setPending(true); setMessage("");
    const result = await action();
    setMessage(result.message); setPending(false);
    if (result.success) router.refresh();
  }
  return <div className="admin-inline-actions">
    <label className="admin-switch"><input disabled={pending} type="checkbox" checked={status === "published"} onChange={() => void run(() => setProductStatusAction(id, status === "published" ? "draft" : "published"))} />Published</label>
    <label className="admin-switch"><input disabled={pending} type="checkbox" checked={isSoldOut} onChange={() => void run(() => setSoldOutAction(id, !isSoldOut))} />Sold out</label>
    {message && <span className="admin-help" role="status">{message}</span>}
  </div>;
}

export function DeleteProductButton({ id }: { id: string }) {
  const [pending, setPending] = useState(false);
  const router = useRouter();
  async function remove() {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    setPending(true);
    const result = await deleteProductAction(id);
    if (!result.success) { window.alert(result.message); setPending(false); return; }
    router.refresh();
  }
  return <button className="admin-button admin-button-danger" type="button" disabled={pending} onClick={() => void remove()}>{pending ? "Deleting…" : "Delete"}</button>;
}
