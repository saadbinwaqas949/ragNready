import type { NextConfig } from "next";

const imageRemotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const parsed = new URL(supabaseUrl);
    imageRemotePatterns.push({ protocol: parsed.protocol.replace(":", "") as "http" | "https", hostname: parsed.hostname, ...(parsed.port ? { port: parsed.port } : {}), pathname: "/storage/v1/object/public/product-images/**" });
  } catch { /* An invalid Supabase URL is reported by the server data client. */ }
}

const nextConfig: NextConfig = {
  images: { remotePatterns: imageRemotePatterns, formats: ["image/avif", "image/webp"], minimumCacheTTL: 86_400 },
  poweredByHeader: false,
};

export default nextConfig;
