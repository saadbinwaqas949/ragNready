import type { Metadata } from "next";
import { CartPage } from "@/components/storefront/cart-page";

export const metadata: Metadata = { title: "Your cart", robots: { index: false, follow: false } };

export default function CartRoute() { return <CartPage />; }
