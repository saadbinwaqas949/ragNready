"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setOrderStatusAction } from "@/app/admin/actions";

const orderStatuses = ["new", "confirmed", "shipped", "delivered", "cancelled"] as const;

export function OrderStatusControl({ id, status }: { id: string; status: string }) {
  const [value, setValue] = useState(status);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function save() {
    setBusy(true); const result = await setOrderStatusAction(id, value); setMessage(result.message); setBusy(false);
    if (result.success) router.refresh();
  }
  return <div className="admin-inline-actions"><select className="admin-select" value={value} onChange={(event) => setValue(event.target.value)} aria-label="Order status">{orderStatuses.map((item) => <option key={item}>{item}</option>)}</select><button className="admin-button" disabled={busy || value === status} onClick={() => void save()}>{busy ? "Saving…" : "Update"}</button>{message && <span role="status" className="admin-help">{message}</span>}</div>;
}
