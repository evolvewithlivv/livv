/**
 * Entitlements & payments boundary.
 * Spark is free. Paid tiers go through Stripe Checkout when configured.
 * Demo unlock remains for internal QA only.
 */

import type { LivvTier } from "./identity";
import { loadIdentity, patchIdentity } from "./identity";

const ENTITLEMENTS_KEY = "livv-entitlements-v1";

export type Entitlements = {
  tier: LivvTier;
  source: "stripe" | "demo" | "spark";
  expiresAt: string | null;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
};

export function isStripeConfigured() {
  return Boolean(
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
}

/** Internal QA only — set localStorage livv-demo-unlock = "1" */
export function isDemoUnlock() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("livv-demo-unlock") === "1";
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

export function canAccessTier(tier: LivvTier): boolean {
  if (tier === "spark") return true;
  if (isDemoUnlock()) return true;
  const e = loadEntitlements();
  if (rank(e.tier) >= rank(tier)) {
    if (e.expiresAt && new Date(e.expiresAt) < new Date()) return false;
    return true;
  }
  return false;
}

function rank(t: LivvTier) {
  return { spark: 0, rise: 1, apex: 2, circle: 3 }[t] ?? 0;
}

export type UpgradeResult =
  | { ok: true; tier: LivvTier }
  | { ok: false; reason: "payments_required" | "stripe_not_configured" | "already" | "redirecting" };

/**
 * Attempt local tier change (Spark / demo only).
 * For paid tiers without demo unlock, call startCheckout instead.
 */
export function requestTierChange(tier: LivvTier): UpgradeResult {
  const current = loadIdentity().tier;
  if (tier === current && canAccessTier(tier)) {
    return { ok: true, tier };
  }
  if (tier === "spark") {
    saveEntitlements({ tier: "spark", source: "spark", expiresAt: null });
    patchIdentity({ tier: "spark" });
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

/** Redirects the browser to Stripe Checkout for Rise / Apex / Circle. */
export async function startCheckout(tier: Exclude<LivvTier, "spark">): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (typeof window === "undefined") return { ok: false, error: "client only" };

  const me = loadIdentity();
  try {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tier,
        username: me.username,
        email: undefined,
      }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      return { ok: false, error: data.error || "Checkout unavailable" };
    }
    window.location.href = data.url;
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error starting checkout" };
  }
}

/** Opens Stripe Customer Portal when we have a customer id on file. */
export async function openBillingPortal(): Promise<{ ok: boolean; error?: string }> {
  if (typeof window === "undefined") return { ok: false, error: "client only" };
  const e = loadEntitlements();
  if (!e.stripeCustomerId) {
    return { ok: false, error: "No Stripe customer on this device yet" };
  }
  try {
    const res = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: e.stripeCustomerId }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      return { ok: false, error: data.error || "Portal unavailable" };
    }
    window.location.href = data.url;
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error opening portal" };
  }
}

export function enableDemoUnlock() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("livv-demo-unlock", "1");
}

export function paidTierMessage(tier: LivvTier) {
  const names: Record<LivvTier, string> = {
    spark: "Spark",
    rise: "Rise",
    apex: "Apex",
    circle: "Inner Circle",
  };
  if (isStripeConfigured()) {
    return `Continue to secure checkout to unlock ${names[tier]}.`;
  }
  return `${names[tier]} unlocks when billing goes live. You’re on Spark until then.`;
}
