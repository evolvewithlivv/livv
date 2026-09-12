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
