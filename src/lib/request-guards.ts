/**
 * Small request guards shared by route handlers.
 * The rate limit is process-local. On serverless it slows a hot instance;
 * durable caps still belong in the database or an edge store.
 */

type RateLimitResult = { ok: true; retryAfterSec: 0 } | { ok: false; retryAfterSec: number };

const hits = new Map<string, number[]>();
const MAX_KEYS = 4000;

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export function takeRateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitResult {
  const start = now - windowMs;
  const recent = (hits.get(key) || []).filter((stamp) => stamp > start);
  if (recent.length >= limit) {
    hits.set(key, recent);
    const retryAfterSec = Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000));
    return { ok: false, retryAfterSec };
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > MAX_KEYS) {
    const oldest = hits.keys().next().value;
    if (oldest) hits.delete(oldest);
  }
  return { ok: true, retryAfterSec: 0 };
}

export function resetRateLimits() {
  hits.clear();
}

export function requestActor(headers: { get(name: string): string | null }, userId?: string | null) {
  if (userId) return `user:${userId}`;
  const forwarded = headers.get("x-forwarded-for");
  const first = forwarded ? forwarded.split(",")[0] : "";
  const ip = (first || headers.get("x-real-ip") || "unknown").trim() || "unknown";
  return `ip:${ip.slice(0, 80)}`;
}

type LimitedJson =
  | { ok: true; value: unknown }
  | { ok: false; status: 400 | 413 };

export async function readJsonLimited(
  request: { headers: { get(name: string): string | null }; text(): Promise<string> },
  maxBytes: number,
): Promise<LimitedJson> {
  const declared = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(declared) && declared > maxBytes) return { ok: false, status: 413 };
  const raw = await request.text();
  if (raw.length > maxBytes) return { ok: false, status: 413 };
  if (!raw) return { ok: true, value: null };
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false, status: 400 };
  }
}
