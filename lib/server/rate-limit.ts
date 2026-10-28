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
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
