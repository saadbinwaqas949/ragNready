import dynamic from "next/dynamic";
import { SimpleHomeSections } from "@/components/storefront/simple-home-sections";
import { getCollections, getProducts, getSiteSettings } from "@/lib/data";
import { SIMPLE_MODE } from "@/lib/site-config";

const FullHomeSections = dynamic(() => import("@/components/storefront/home-sections").then((module) => module.HomeSections));

export const revalidate = 3600;

export default async function HomePage() {
  const [products, collections, settings] = await Promise.all([getProducts(), getCollections(), getSiteSettings()]);
  return SIMPLE_MODE
    ? <SimpleHomeSections products={products} settings={settings} />
    : <FullHomeSections products={products} collections={collections} settings={settings} />;
}
