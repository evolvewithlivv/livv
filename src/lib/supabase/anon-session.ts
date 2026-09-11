/**
 * A3-2 · Supabase Anonymous Auth session foundation.
 *
 * Ensures a persistent anonymous Supabase user on this browser when configured.
 * Does not replace local LIVV accounts, progress, or RequireAuth.
 * Does not link email or change Stripe/entitlements.
 */

import { getSupabaseBrowserClient, isSupabaseConfigured } from "./client";

export type AnonSessionStatus =
  | "idle"
  | "pending"
  | "ready"
  | "unavailable"
  | "error";

export type AnonSessionState = {
  status: AnonSessionStatus;
  /** Supabase auth.users id when ready */
  userId: string | null;
  error?: string;
};

let state: AnonSessionState = { status: "idle", userId: null };
let inflight: Promise<AnonSessionState> | null = null;

export function getAnonSessionState(): AnonSessionState {
  return state;
}

/** True while a ensure call is in flight — not the same as signed-out. */
export function isAnonSessionPending(): boolean {
  return state.status === "pending" || inflight !== null;
}

/**
 * Ensure an anonymous Supabase session exists and is restored from storage.
 * Safe to call repeatedly. No-ops when Supabase env is missing.
 * Never throws to callers — failures are reflected in state.
 */
export async function ensureAnonymousSession(): Promise<AnonSessionState> {
  if (typeof window === "undefined") {
    return { status: "unavailable", userId: null };
  }

  if (!isSupabaseConfigured()) {
    state = { status: "unavailable", userId: null };
    return state;
  }

  if (state.status === "ready" && state.userId) {
    return state;
  }

  if (inflight) return inflight;

  inflight = (async () => {
    state = { status: "pending", userId: state.userId };
    try {
      const client = getSupabaseBrowserClient();
      if (!client) {
        state = { status: "unavailable", userId: null };
        return state;
      }

      const { data: existing, error: getErr } = await client.auth.getSession();
      if (getErr) {
        state = {
          status: "error",
          userId: null,
          error: getErr.message,
        };
        return state;
      }

      if (existing.session?.user?.id) {
        state = { status: "ready", userId: existing.session.user.id };
        return state;
      }

      const { data, error } = await client.auth.signInAnonymously();
      if (error) {
        state = {
          status: "error",
          userId: null,
          error: error.message,
        };
        return state;
      }

      const id = data.user?.id ?? data.session?.user?.id ?? null;
      if (!id) {
        state = {
          status: "error",
          userId: null,
          error: "Anonymous sign-in returned no user id",
        };
        return state;
      }

      state = { status: "ready", userId: id };
      return state;
    } catch (e) {
      state = {
        status: "error",
        userId: null,
        error: e instanceof Error ? e.message : "Anonymous session failed",
      };
      return state;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}
