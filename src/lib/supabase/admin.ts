/**
 * B1 · Server-only Supabase client (service role).
 * Never import from client components. Never put the key in NEXT_PUBLIC_*.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function clean(value: string | undefined) {
  return (value || "").trim().replace(/^['"]|['"]$/g, "");
}

let admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !key) return null;

  if (!admin) {
    admin = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  return admin;
}

export function isSupabaseAdminConfigured() {
  return Boolean(
    clean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      clean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}
