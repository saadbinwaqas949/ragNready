import { getAdminSubscribers } from "@/lib/data/admin";
import { setSubscriberStatusAction } from "@/app/admin/actions";

export default async function SubscribersPage() {
  const subscribers = await getAdminSubscribers();
  return <><div className="admin-page-heading"><div><h1>Newsletter subscribers</h1><p>People who asked to hear from ragNready.</p></div></div>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Email</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead><tbody>
      {subscribers.map((subscriber) => <tr key={subscriber.id}><td><a href={`mailto:${subscriber.email}`}>{subscriber.email}</a></td><td>{new Date(subscriber.created_at).toLocaleDateString("en-PK", { dateStyle: "medium" })}</td><td><span className="admin-badge">{subscriber.status}</span></td><td><form action={async (formData) => { "use server"; await setSubscriberStatusAction(String(formData.get("id")), String(formData.get("status"))); }}><input type="hidden" name="id" value={subscriber.id} /><input type="hidden" name="status" value={subscriber.status === "active" ? "unsubscribed" : "active"} /><button className="admin-button" type="submit">{subscriber.status === "active" ? "Unsubscribe" : "Reactivate"}</button></form></td></tr>)}
      {subscribers.length === 0 && <tr><td className="admin-empty" colSpan={4}>No subscribers yet.</td></tr>}
    </tbody></table></div>
  </>;
}
