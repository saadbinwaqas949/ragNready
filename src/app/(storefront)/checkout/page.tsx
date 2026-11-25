import type { Metadata } from "next";
import { CheckoutForm, type CheckoutDefaults } from "@/components/storefront/checkout-form";
import { googleSignInEnabled } from "@/lib/supabase/auth-providers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Signed-in customers get their last delivery details filled in; guests start blank. */
async function loadDefaults(): Promise<{ signedIn: boolean; defaults: CheckoutDefaults }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { signedIn: false, defaults: {} };
    const { data: last } = await supabase.from("orders").select("customer_name,phone,address,city").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
    return { signedIn: true, defaults: { name: last?.customer_name ?? user.user_metadata?.full_name ?? "", phone: last?.phone ?? "", email: user.email ?? "", address: last?.address ?? "", city: last?.city ?? "" } };
  } catch { return { signedIn: false, defaults: {} }; }
}

export default async function CheckoutPage() {
  const [{ signedIn, defaults }, googleEnabled] = await Promise.all([loadDefaults(), googleSignInEnabled()]);
  return <main className="section page-wide"><h1 className="page-title">Checkout</h1><CheckoutForm googleEnabled={googleEnabled} signedIn={signedIn} defaults={defaults} /></main>;
}
