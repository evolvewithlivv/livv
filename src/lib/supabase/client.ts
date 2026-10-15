/**
 * Supabase client foundation (A3-0).
 *
 * - Installs a real browser client via @supabase/supabase-js when env is set.
 * - Does not sign in, link accounts, or touch product flows.
 * - Without URL + anon key, isSupabaseConfigured() is false and helpers no-op.
 *
 * Email authentication uses the PKCE flow so Supabase confirmation/magic-link
 * emails redirect back with a one-time `code` that /auth/callback exchanges.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function clean(value: string | undefined) {
  return (value || "").trim().replace(/^['"]|['"]$/g, "");
}

export function isSupabaseConfigured() {
  return Boolean(
    clean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

let browserClient: SupabaseClient | null = null;

const AUTH_USER_TTL_MS = 10_000;

type CachedAuthUser = {
  status: number;
  statusText: string;
  headers: [string, string][];
  body: ArrayBuffer;
};

const authUserCache = new Map<string, { value: CachedAuthUser; expires: number }>();
const authUserInflight = new Map<string, Promise<CachedAuthUser>>();

/** Drop a cached /auth/v1/user response after sign-out or a token change. */
export function invalidateAuthUserCache() {
  authUserCache.clear();
  authUserInflight.clear();
}

function requestUrl(input: RequestInfo | URL) {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function isAuthUserGet(url: string, method: string) {
  if (method !== "GET") return false;
  try {
    return new URL(url, "http://localhost").pathname === "/auth/v1/user";
  } catch {
    return false;
  }
}

function authCacheKey(url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  return `${url} ${headers.get("authorization") || ""}`;
}

function cachedAuthUserResponse(cached: CachedAuthUser) {
  return new Response(cached.body.slice(0), {
    status: cached.status,
    statusText: cached.statusText,
    headers: cached.headers,
  });
}

/**
 * Collapse identical signed-in GET /auth/v1/user calls.
 * Parallel mounts and short navigations share one 200 instead of repeating it.
 */
function dedupedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = requestUrl(input);
  const method = (init?.method || "GET").toUpperCase();
  if (!isAuthUserGet(url, method)) {
    if (method !== "GET" && url.includes("/auth/v1/")) invalidateAuthUserCache();
    return fetch(input, init);
  }
  const key = authCacheKey(url, init);
  const hit = authUserCache.get(key);
  if (hit && hit.expires > Date.now()) return Promise.resolve(cachedAuthUserResponse(hit.value));
  let pending = authUserInflight.get(key);
  if (!pending) {
    pending = fetch(input, init)
      .then(async (response) => {
        const cached: CachedAuthUser = {
          status: response.status,
          statusText: response.statusText,
          headers: [...response.headers.entries()],
          body: await response.arrayBuffer(),
        };
        if (response.ok) authUserCache.set(key, { value: cached, expires: Date.now() + AUTH_USER_TTL_MS });
        return cached;
      })
      .finally(() => {
        authUserInflight.delete(key);
      });
    authUserInflight.set(key, pending);
  }
  return pending.then(cachedAuthUserResponse);
}

/**
 * Browser Supabase client (singleton). Returns null when env is missing.
 * Safe to call from client components; no auth calls are made here.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;

  if (!browserClient) {
    const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    browserClient = createClient(url, anonKey, {
      global: { fetch: dedupedFetch },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        flowType: "pkce",
        // /auth/callback explicitly exchanges the PKCE code. Automatic URL
        // detection here would race that exchange and can consume the code first.
        detectSessionInUrl: false,
        storageKey: "livv-supabase-auth",
      },
    });
  }

  return browserClient;
}

export type SyncPayload = {
  userId: string;
  identity: unknown;
  record: unknown;
  packs: unknown;
  updatedAt: string;
};

/** Placeholder — cloud profile sync is a later batch. */
export async function syncProfileToCloud(
  _payload: SyncPayload
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "supabase_not_configured" };
  }
  // Client exists; table sync not implemented in A3-0
  return { ok: false, error: "supabase_sync_not_implemented" };
}

/** Placeholder — cloud profile pull is a later batch. */
export async function pullProfileFromCloud(
  _userId: string
): Promise<SyncPayload | null> {
  if (!isSupabaseConfigured()) return null;
  return null;
}
