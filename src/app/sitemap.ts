import type { MetadataRoute } from "next";
import { getCollections, getProducts } from "@/lib/data";
import { SITE_ORIGIN } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["/", "/collections/all", "/pages/about-us", "/pages/contact", "/pages/faq", "/pages/size-guide", "/pages/shipping-returns", "/pages/refund-policy", "/pages/privacy-policy", "/pages/terms-and-conditions"];
  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({ url: new URL(path, SITE_ORIGIN).toString(), changeFrequency: path === "/" ? "weekly" : "monthly", priority: path === "/" ? 1 : 0.6 }));
  try {
    const [collections, products] = await Promise.all([getCollections(), getProducts()]);
    for (const collection of collections) entries.push({ url: new URL(`/collections/${collection.handle}`, SITE_ORIGIN).toString(), changeFrequency: "daily", priority: 0.7 });
    for (const product of products) entries.push({ url: new URL(`/products/${product.handle}`, SITE_ORIGIN).toString(), lastModified: new Date(product.updated_at), changeFrequency: "weekly", priority: 0.8 });
  } catch {
    // Keep the public sitemap buildable before the shop owner applies the SQL setup.
  }
  return entries;
}
