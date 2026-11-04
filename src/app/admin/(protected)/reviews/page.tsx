import Image from "next/image";
import { notFound } from "next/navigation";
import { moderateReviewAction } from "@/app/admin/actions";
import { getAdminReviews } from "@/lib/data/reviews";
import { SHOW_REVIEWS } from "@/lib/site-config";

export default async function ReviewsPage() {
  if (!SHOW_REVIEWS) notFound();
  const reviews = await getAdminReviews();
  const ordered = [...reviews].sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending") || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return <><div className="admin-page-heading"><div><h1>Reviews</h1><p>Approve customer reviews before they appear in the shop.</p></div></div><div className="admin-review-list">{ordered.map((review) => <article className="admin-card admin-review-card" key={review.id}><div className="admin-review-meta"><span className="admin-badge">{review.status}</span><span>{review.orders?.order_number || "Order"}</span><span>{review.products?.title || "Product"}</span><span>{new Date(review.created_at).toLocaleDateString("en-PK", { dateStyle: "medium" })}</span></div><h2>{review.reviewer_name} · {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</h2><p>{review.comment}</p>{review.review_images?.length > 0 && <div className="admin-review-photos">{review.review_images.map((photo: { url: string; position: number }) => <a key={photo.position} href={photo.url} target="_blank" rel="noreferrer"><Image src={photo.url} alt="Review photo" width={120} height={120} quality={75} /></a>)}</div>}<div className="admin-inline-actions">{review.status !== "approved" && <form action={moderateReviewAction.bind(null, review.id, "approved")}><button className="admin-button admin-button-primary">Approve</button></form>}{review.status !== "rejected" && <form action={moderateReviewAction.bind(null, review.id, "rejected")}><button className="admin-button">Reject</button></form>}<form action={moderateReviewAction.bind(null, review.id, "deleted")}><button className="admin-button">Delete</button></form></div></article>)}{!ordered.length && <div className="admin-card">No customer reviews yet.</div>}</div></>;
}
