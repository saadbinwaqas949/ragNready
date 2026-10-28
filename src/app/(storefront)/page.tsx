import { HomeSections } from "@/components/storefront/home-sections";
import { getCollections, getProducts, getSiteSettings } from "@/lib/data";

export const revalidate = 3600;

export default async function HomePage() {
  const [products, collections, settings] = await Promise.all([getProducts(), getCollections(), getSiteSettings()]);
  return <HomeSections products={products} collections={collections} settings={settings} />;
}
