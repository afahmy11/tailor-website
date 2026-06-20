// Simple in-memory token-bucket limiter. Suitable for a single long-running
// Node instance (our standalone server). For multi-instance, back this with Redis.
type Bucket = { tokens: number; updated: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const refill = limit / windowMs;
  const b = buckets.get(key) ?? { tokens: limit, updated: now };
  b.tokens = Math.min(limit, b.tokens + (now - b.updated) * refill);
  b.updated = now;
  if (b.tokens < 1) {
    buckets.set(key, b);
    return false;
  }
  b.tokens -= 1;
  buckets.set(key, b);
  return true;
}

export function clientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}
