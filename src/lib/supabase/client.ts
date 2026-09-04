/**
 * Supabase client scaffold.
 * When NEXT_PUBLIC_SUPABASE_URL + ANON_KEY are set, wire @supabase/supabase-js.
 * Until then, all calls no-op and the app stays on localStorage.
 */

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export type SyncPayload = {
  userId: string;
  identity: unknown;
  record: unknown;
  packs: unknown;
  updatedAt: string;
};

/** Placeholder — replace with supabase.from('profiles').upsert(...) */
export async function syncProfileToCloud(_payload: SyncPayload): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "supabase_not_configured" };
  }
  // Real client lands when dependency + keys exist
  return { ok: false, error: "supabase_client_not_installed" };
}

export async function pullProfileFromCloud(_userId: string): Promise<SyncPayload | null> {
  if (!isSupabaseConfigured()) return null;
  return null;
}
