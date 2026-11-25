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
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=63072000" },
      ],
    }];
  },
};

export default nextConfig;
