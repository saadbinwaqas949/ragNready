import "server-only";

const hits = new Map<string, number[]>();

/** Small per-process guard for public form endpoints; deploy behind a shared edge limiter at scale. */
export function allowRequest(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) { hits.set(key, recent); return false; }
  recent.push(now); hits.set(key, recent);
  if (hits.size > 5000) for (const [entry, times] of hits) if (!times.length || now - times[times.length - 1] > windowMs) hits.delete(entry);
  return true;
}

export function requestAddress(request: Request) {
  const header = (name: string) => request.headers.get(name)?.trim();
  // Visitors can forge x-forwarded-for; prefer the header the hosting platform sets itself.
  if (process.env.VERCEL) return header("x-real-ip") || "unknown";
  if (process.env.NETLIFY) return header("x-nf-client-connection-ip") || "unknown";
  return header("cf-connecting-ip") || header("x-real-ip") || header("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
