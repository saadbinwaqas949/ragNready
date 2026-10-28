import { StorefrontShell, SiteFooter } from "@/components/storefront-shell";
import { getSiteSettings } from "@/lib/data";
import { MotionRuntime } from "@/components/storefront/motion-runtime";
import { MotionConfig } from "framer-motion";
import { NewsletterPopup } from "@/components/storefront/newsletter-popup";
import { BrandedPreloader } from "@/components/storefront/branded-preloader";

export default async function StorefrontLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();
  return <MotionConfig reducedMotion="user"><a className="skip-link" href="#main-content">Skip to main content</a><BrandedPreloader /><MotionRuntime /><StorefrontShell settings={settings} /><div id="main-content" tabIndex={-1}>{children}</div><SiteFooter settings={settings} /><NewsletterPopup discountCode={settings?.popup_discount_code || "CODE20OFF"} /></MotionConfig>;
}
