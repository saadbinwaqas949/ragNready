import { getAdminMessages } from "@/lib/data/admin";
import { setMessageStatusAction } from "@/app/admin/actions";

export default async function MessagesPage() {
  const messages = await getAdminMessages();
  return <><div className="admin-page-heading"><div><h1>Contact messages</h1><p>Notes sent through the storefront contact form.</p></div></div>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>From</th><th>Message</th><th>Received</th><th>Status</th><th>Update</th></tr></thead><tbody>
      {messages.map((message) => <tr key={message.id}><td><strong>{message.name}</strong><div className="admin-product-handle"><a href={`mailto:${message.email}`}>{message.email}</a></div>{message.phone && <div className="admin-product-handle"><a href={`tel:${message.phone}`}>{message.phone}</a></div>}</td><td className="admin-message-cell">{message.message}</td><td>{new Date(message.created_at).toLocaleDateString("en-PK", { dateStyle: "medium" })}</td><td><span className="admin-badge">{message.status}</span></td><td><form action={async (formData) => { "use server"; await setMessageStatusAction(String(formData.get("id")), String(formData.get("status"))); }}><input type="hidden" name="id" value={message.id} /><select className="admin-select" name="status" defaultValue={message.status}><option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option></select><button className="admin-button" type="submit">Save</button></form></td></tr>)}
      {messages.length === 0 && <tr><td className="admin-empty" colSpan={5}>No contact messages yet.</td></tr>}
    </tbody></table></div>
  </>;
}
