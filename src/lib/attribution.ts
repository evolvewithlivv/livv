/** First-touch traffic source for /go/001 → /auth. Session-only; not analytics. */

export const DEFAULT_GO_001_SOURCE = "go-001";
const TRAFFIC_SOURCE_KEY = "livv-src";
const SOURCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

export function sanitizeTrafficSource(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!SOURCE_PATTERN.test(value)) return null;
  return value;
}

export function resolveGo001Source(raw: string | null | undefined): string {
  return sanitizeTrafficSource(raw) ?? DEFAULT_GO_001_SOURCE;
}

/** Enter on /go/001 always opens create-account and keeps the traffic source. */
export function go001AuthHref(raw: string | null | undefined): string {
  const src = resolveGo001Source(raw);
  return `/auth?mode=create&src=${encodeURIComponent(src)}`;
}

export function authModeFromParam(mode: string | null | undefined): "signin" | "signup" {
  return mode === "create" ? "signup" : "signin";
}

export function persistTrafficSource(raw: string | null | undefined): string | null {
  const value = sanitizeTrafficSource(raw);
  if (!value || typeof window === "undefined") return value;
  try {
    window.sessionStorage.setItem(TRAFFIC_SOURCE_KEY, value);
  } catch {
    /* private mode */
  }
  return value;
}

export function readTrafficSource(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sanitizeTrafficSource(window.sessionStorage.getItem(TRAFFIC_SOURCE_KEY));
  } catch {
    return null;
  }
}
