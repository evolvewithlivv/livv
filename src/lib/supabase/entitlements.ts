import { ensureAnonymousSession } from "@/lib/supabase/anon-session";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { LivvTier } from "@/lib/identity";

export type ServerEntitlement = {
  userId: string;
  tier: LivvTier;
  status: "none" | "active" | "trialing" | "past_due" | "canceled" | "unpaid" | "incomplete";
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  source: string;
  updatedAt: string | null;
};

/**
 * B2 · Read the membership entitlement bound to the current Supabase user.
 *
 * This is a read-only bridge to the server-authoritative entitlement store.
 * It deliberately does not mutate localStorage or replace the existing
 * client gate yet; that migration belongs to the later dual-read/gate slice.
 */
export async function fetchServerEntitlement(): Promise<
  | { ok: true; entitlement: ServerEntitlement }
  | { ok: false; reason: "unavailable" | "unauthorized" | "error" }
> {
  if (typeof window === "undefined" || !isSupabaseConfigured()) {
    return { ok: false, reason: "unavailable" };
  }

  try {
    await ensureAnonymousSession();
    const client = getSupabaseBrowserClient();
    if (!client) return { ok: false, reason: "unavailable" };

    const { data } = await client.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return { ok: false, reason: "unauthorized" };

    const res = await fetch("/api/entitlements", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.status === 401) return { ok: false, reason: "unauthorized" };
    if (!res.ok) return { ok: false, reason: "error" };

    const entitlement = (await res.json()) as ServerEntitlement;
    return { ok: true, entitlement };
  } catch {
    return { ok: false, reason: "error" };
  }
}
