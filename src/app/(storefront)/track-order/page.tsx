import type { Metadata } from "next";
import { TrackOrderForm } from "@/components/storefront/track-order-form";

export const metadata: Metadata = { title: "Track your order", description: "Check the status of your ragNready order with your order number and WhatsApp number.", alternates: { canonical: "/track-order" } };

export default function TrackOrderPage() {
  return <main className="section page-narrow"><h1 className="page-title">Track your order</h1><p className="page-intro">Enter your order number and the WhatsApp number you used at checkout.</p><TrackOrderForm /></main>;
}
