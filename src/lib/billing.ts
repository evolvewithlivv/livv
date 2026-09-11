/**
 * Entitlements & payments boundary.
 * Spark is free. Paid tiers go through Stripe Checkout when configured.
 * Demo unlock remains for non-production QA only.
 *
 * B0: Checkout binds Stripe to verified Supabase auth.users.id.
 * B1: Webhook writes public.entitlements (server authority).
 * B2: Client dual-reads server entitlements with localStorage fallback.
 *      Network/no-row never strips local paid access.
 *      Explicit server canceled/unpaid may revoke paid access.
 */

import type { LivvTier } from "./identity";
import { loadIdentity, patchIdentity } from "./identity";
import { ensureAnonymousSession } from "./supabase/anon-session";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./supabase/client";

const ENTITLEMENTS_KEY = "livv-entitlements-v1";

export type Entitlements = {
  tier: LivvTier;
  source: "stripe" | "demo" | "spark";
  expiresAt: string | null;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
};

/** Server row shape from public.entitlements (B1). */
export type ServerEntitlement = {
  tier: LivvTier;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
};

let serverCache: ServerEntitlement | null | undefined = undefined;
let hydrateInflight: Promise<void> | null = null;

export function isStripeConfigured() {
  return Boolean(
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
}

/** Internal QA only. Production builds never honor the local demo flag. */
export function isDemoUnlock() {
  if (typeof window === "undefined") return false;
  if (process.env.NODE_ENV === "production") return false;
  return (
    process.env.NEXT_PUBLIC_LIVV_DEMO_UNLOCK === "1" &&
    window.localStorage.getItem("livv-demo-unlock") === "1"
  );
}

export function loadEntitlements(): Entitlements {
  if (typeof window === "undefined") {
    return { tier: "spark", source: "spark", expiresAt: null };
  }
  try {
    const raw = window.localStorage.getItem(ENTITLEMENTS_KEY);
    if (!raw) {
      const id = loadIdentity();
      const tier = id.tier !== "spark" && !isDemoUnlock() ? "spark" : id.tier;
      if (tier !== id.tier) patchIdentity({ tier: "spark" });
      const e: Entitlements = {
        tier,
        source: tier === "spark" ? "spark" : "demo",
        expiresAt: null,
      };
      window.localStorage.setItem(ENTITLEMENTS_KEY, JSON.stringify(e));
      return e;
    }
    return JSON.parse(raw) as Entitlements;
  } catch {
    return { tier: "spark", source: "spark", expiresAt: null };
  }
}

function saveEntitlements(e: Entitlements) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ENTITLEMENTS_KEY, JSON.stringify(e));
  window.dispatchEvent(new Event("livv-billing"));
}

export function applyStripeEntitlement(input: {
  tier: LivvTier;
  customerId?: string | null;
  subscriptionId?: string | null;
}) {
  const e: Entitlements = {
    tier: input.tier,
    source: "stripe",
    expiresAt: null,
    stripeCustomerId: input.customerId || undefined,
    stripeSubscriptionId: input.subscriptionId || undefined,
  };
  saveEntitlements(e);
  patchIdentity({ tier: input.tier });
  return e;
}

function rank(t: LivvTier) {
  return { spark: 0, rise: 1, apex: 2, circle: 3 }[t] ?? 0;
}

function isLivvTier(v: string): v is LivvTier {
  return v === "spark" || v === "rise" || v === "apex" || v === "circle";
}

export function resolveEffectiveEntitlement(): Entitlements {
  const local = loadEntitlements();

  if (isDemoUnlock()) {
    return local.source === "demo" || local.tier !== "spark"
      ? local
      : { ...local, source: "demo" };
  }

  if (serverCache === undefined || serverCache === null) return local;

  const status = (serverCache.status || "").toLowerCase();
  const tier = isLivvTier(serverCache.tier) ? serverCache.tier : "spark";

  if (status === "canceled" || status === "unpaid") {
    return {
      tier: "spark",
      source: "stripe",
      expiresAt: serverCache.current_period_end,
      stripeCustomerId: serverCache.stripe_customer_id || undefined,
      stripeSubscriptionId: serverCache.stripe_subscription_id || undefined,
    };
  }

  if (status === "active" || status === "trialing" || status === "past_due") {
    if (rank(tier) > 0) {
      return {
        tier,
        source: "stripe",
        expiresAt: serverCache.current_period_end,
        stripeCustomerId: serverCache.stripe_customer_id || undefined,
        stripeSubscriptionId: serverCache.stripe_subscription_id || undefined,
      };
    }
  }

  return local;
}

export function getEffectiveTier(): LivvTier {
  return resolveEffectiveEntitlement().tier;
}

export function canAccessTier(tier: LivvTier): boolean {
  if (tier === "spark") return true;
  if (isDemoUnlock()) return true;
  const e = resolveEffectiveEntitlement();
  if (rank(e.tier) >= rank(tier)) {
    if (e.expiresAt && new Date(e.expiresAt) < new Date() && e.source !== "stripe") {
      return false;
    }
    return true;
  }
  return false;
}

export async function hydrateServerEntitlement(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!isSupabaseConfigured()) {
    serverCache = null;
    return;
  }
  if (hydrateInflight) return hydrateInflight;

  hydrateInflight = (async () => {
    try {
      await ensureAnonymousSession();
      const client = getSupabaseBrowserClient();
      if (!client) return;

      const { data: sessionData } = await client.auth.getSession();
      const uid = sessionData.session?.user?.id;
      if (!uid) return;

      const { data, error } = await client
        .from("entitlements")
        .select(
          "tier, status, stripe_customer_id, stripe_subscription_id, current_period_end"
        )
        .eq("user_id", uid)
        .maybeSingle();

      if (error) {
        console.info("[billing] server entitlement read failed — using local", error.message);
        return;
      }

      if (!data) {
        serverCache = null;
        window.dispatchEvent(new Event("livv-billing"));
        return;
      }

      const tier = isLivvTier(String(data.tier)) ? (data.tier as LivvTier) : "spark";
      serverCache = {
        tier,
        status: String(data.status || "none"),
        stripe_customer_id: data.stripe_customer_id ?? null,
        stripe_subscription_id: data.stripe_subscription_id ?? null,
        current_period_end: data.current_period_end ?? null,
      };

      const effective = resolveEffectiveEntitlement();
      if (rank(effective.tier) > rank(loadEntitlements().tier)) {
        saveEntitlements(effective);
        patchIdentity({ tier: effective.tier });
      } else if (
        (serverCache.status === "canceled" || serverCache.status === "unpaid") &&
        loadEntitlements().source === "stripe"
      ) {
        saveEntitlements(effective);
        patchIdentity({ tier: effective.tier });
      }

      window.dispatchEvent(new Event("livv-billing"));
    } catch (err) {
      console.info("[billing] hydrate failed — using local", err);
    } finally {
      hydrateInflight = null;
    }
  })();

  return hydrateInflight;
}

export function invalidateServerEntitlementCache() {
  serverCache = undefined;
}

export type UpgradeResult =
  | { ok: true; tier: LivvTier }
  | { ok: false; reason: "payments_required" | "stripe_not_configured" | "already" | "redirecting" };

export function requestTierChange(tier: LivvTier): UpgradeResult {
  const current = getEffectiveTier();
  if (tier === current && canAccessTier(tier)) {
    return { ok: true, tier };
  }
  if (tier === "spark") {
    saveEntitlements({ tier: "spark", source: "spark", expiresAt: null });
    patchIdentity({ tier: "spark" });
    serverCache = undefined;
    return { ok: true, tier: "spark" };
  }
  if (isDemoUnlock()) {
    saveEntitlements({ tier, source: "demo", expiresAt: null });
    patchIdentity({ tier });
    return { ok: true, tier };
  }
  if (!isStripeConfigured()) {
    return { ok: false, reason: "stripe_not_configured" };
  }
  return { ok: false, reason: "payments_required" };
}

async function getCheckoutAuthHeader(): Promise<Record<string, string>> {
  if (!isSupabaseConfigured()) return {};
  try {
    await ensureAnonymousSession();
    const client = getSupabaseBrowserClient();
    if (!client) return {};
    const { data } = await client.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

export async function startCheckout(tier: Exclude<LivvTier, "spark">): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (typeof window === "undefined") return { ok: false, error: "client only" };

  const me = loadIdentity();
  try {
    const authHeader = await getCheckoutAuthHeader();
    if (isSupabaseConfigured() && !authHeader.Authorization) {
      return {
        ok: false,
        error: "Identity session missing. Reload LIVV and try checkout again.",
      };
    }
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({ tier, username: me.username }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) return { ok: false, error: data.error || "Checkout unavailable" };
    window.location.href = data.url;
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error starting checkout" };
  }
}

async function getAuthHeader(): Promise<Record<string, string>> {
  if (!isSupabaseConfigured()) return {};
  try {
    await ensureAnonymousSession();
    const client = getSupabaseBrowserClient();
    if (!client) return {};
    const { data } = await client.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

export async function openBillingPortal(): Promise<{ ok: boolean; error?: string }> {
  if (typeof window === "undefined") return { ok: false, error: "client only" };
  const e = resolveEffectiveEntitlement();
  if (!e.stripeCustomerId) {
    return { ok: false, error: "No Stripe customer on this device yet." };
  }
  try {
    const authHeader = await getAuthHeader();
    if (isSupabaseConfigured() && !authHeader.Authorization) {
      return { ok: false, error: "Identity session missing. Reload LIVV and try again." };
    }
    const res = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) return { ok: false, error: data.error || "Portal unavailable" };
    window.location.href = data.url;
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error opening portal" };
  }
}

export function enableDemoUnlock() {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV === "production") return;
  if (process.env.NEXT_PUBLIC_LIVV_DEMO_UNLOCK !== "1") return;
  window.localStorage.setItem("livv-demo-unlock", "1");
}

export function paidTierMessage(tier: LivvTier) {
  const names: Record<LivvTier, string> = {
    spark: "Spark",
    rise: "Rise",
    apex: "Apex",
    circle: "Inner Circle",
  };
  if (isStripeConfigured()) return `Continue to secure checkout to unlock ${names[tier]}.`;
  return `${names[tier]} unlocks when billing goes live. You’re on Spark until then.`;
}
