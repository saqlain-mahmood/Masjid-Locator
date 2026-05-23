// Simple in-memory rate limiter — sufficient for single-instance dev/demo.
// For multi-instance production, swap with Redis / Upstash.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit = 5, windowMs = 60_000): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { ok: true, retryAfter: 0 };
}

export function clientKey(req: Request, prefix = ""): string {
  const xf = req.headers.get("x-forwarded-for");
  const ip = xf ? xf.split(",")[0]!.trim() : "unknown";
  return `${prefix}:${ip}`;
}
