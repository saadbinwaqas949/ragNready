"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resendOrderAlertAction } from "@/app/admin/actions";

type Alerts = { at: string; results: { channel: string; sent: boolean; message: string }[] } | null;
const labels: Record<string, string> = { email: "Email to you", whatsapp: "WhatsApp to you", "customer-email": "Email to customer" };

/** Shows whether each alert for this order was delivered, and sends yours again. */
export function OrderAlerts({ id, alerts }: { id: string; alerts: Alerts }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function resend() {
    setBusy(true); setMessage("");
    const result = await resendOrderAlertAction(id);
    setMessage(result.success ? "Alerts sent." : "Some alerts were not delivered. See the reasons above.");
    setBusy(false); router.refresh();
  }
  return <section className="admin-card admin-alerts"><h2>Order alerts</h2>
    {alerts?.results?.length ? <ul>{alerts.results.map((result) => <li key={result.channel}><span className={`admin-badge${result.sent ? "" : " admin-badge-soldout"}`}>{result.sent ? "Sent" : "Not sent"}</span><div><strong>{labels[result.channel] ?? result.channel}</strong>{!result.sent && <p>{result.message}</p>}</div></li>)}</ul> : <p className="admin-help">No alert result was recorded for this order.</p>}
    <div className="admin-inline-actions"><button type="button" className="admin-button" disabled={busy} onClick={() => void resend()}>{busy ? "Sending…" : "Send alerts to me again"}</button>{message && <span className="admin-help" role="status">{message}</span>}</div>
  </section>;
}
