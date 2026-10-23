/**
 * B0 · Server-side verification of a Supabase access token.
 * Used by Stripe Checkout to bind sessions to auth.users.id.
 * Never trusts client-supplied user ids.
 */

import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

function clean(value: string | undefined) {
  return (value || "").trim().replace(/^['"]|['"]$/g, "");
}

export function isSupabaseServerConfigured() {
  return Boolean(
    clean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

export type VerifiedSupabaseUser = {
  id: string;
  email: string | null;
  isAnonymous: boolean;
  createdAt: string | null;
  emailConfirmedAt: string | null;
  userMetadata: Record<string, unknown>;
  appMetadata: Record<string, unknown>;
};

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

/**
 * Verify the Bearer access token with Supabase Auth.
 * Works for anonymous and email-linked users alike.
 */
export async function getVerifiedSupabaseUser(
  req: NextRequest
): Promise<VerifiedSupabaseUser | null> {
  if (!isSupabaseServerConfigured()) return null;

  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header || !header.toLowerCase().startsWith("bearer ")) return null;

  const token = header.slice(7).trim();
  if (!token) return null;

  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // Ephemeral client: JWT verification only; no cookie/session persistence.
  const supabase = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.id) return null;

  return {
    id: data.user.id,
    email: data.user.email ?? null,
    isAnonymous: data.user.is_anonymous === true,
    createdAt: data.user.created_at ?? null,
    emailConfirmedAt: data.user.email_confirmed_at ?? null,
    userMetadata: asRecord(data.user.user_metadata),
    appMetadata: asRecord(data.user.app_metadata),
  };
}
