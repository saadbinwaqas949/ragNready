import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/account", "/checkout", "/cart", "/order", "/auth"] }],
    sitemap: new URL("/sitemap.xml", SITE_ORIGIN).toString(),
  };
}
