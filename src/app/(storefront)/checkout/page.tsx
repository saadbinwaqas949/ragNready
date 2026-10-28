import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/storefront/checkout-form";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default function CheckoutPage() {
  return <main className="section checkout-page"><p className="eyebrow">one last little step</p><h1 className="section-heading section-heading-left">Checkout</h1><p className="checkout-intro">Share your delivery details and pay for your order when it arrives.</p><CheckoutForm /><Link className="continue-link" href="/cart">Return to your cart</Link></main>;
}
