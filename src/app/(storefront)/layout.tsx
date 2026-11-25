import { StorefrontShell } from "@/components/storefront-shell";
import { SiteFooter } from "@/components/storefront/site-footer";
import { StorefrontRuntime } from "@/components/storefront/storefront-runtime";
import { getCollections, getProducts, getSiteSettings } from "@/lib/data";
import { SITE_CONTACT_FALLBACKS } from "@/lib/site";

export default async function StorefrontLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [settings, collections, products] = await Promise.all([getSiteSettings(), getCollections(), getProducts()]);
  // Menus only list collections that have something to buy.
  const stocked = new Set(products.flatMap((product) => product.collection_handles));
  const menuCollections = collections.filter((collection) => stocked.has(collection.handle)).map(({ title, handle }) => ({ title, handle }));
  return <>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <StorefrontRuntime />
    <StorefrontShell announcements={settings?.announcement_messages ?? []} whatsapp={settings?.whatsapp_number || SITE_CONTACT_FALLBACKS.whatsapp_number} collections={menuCollections} />
    <div id="main-content" tabIndex={-1}>{children}</div>
    <SiteFooter settings={settings} collections={menuCollections} />
  </>;
}
