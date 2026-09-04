/**
 * Entitlements & payments boundary.
 * Local demo stays free on Spark only. Paid tiers require Stripe (when configured)
 * or explicit DEMO_UNLOCK for internal testing.
 */

import type { LivvTier } from "./identity";
import { loadIdentity, patchIdentity } from "./identity";

const ENTITLEMENTS_KEY = "livv-entitlements-v1";

export type Entitlements = {
  tier: LivvTier;
  /** ISO source: stripe | demo | spark */
  source: "stripe" | "demo" | "spark";
  /** When set, access expires (ISO string) */
  expiresAt: string | null;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
};

export function isStripeConfigured() {
  return Boolean(
    typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
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
      // Migrate: if they had claimed a paid tier in old builds, demote unless demo unlock
      const tier =
        id.tier !== "spark" && !isDemoUnlock() ? "spark" : id.tier;
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
  window.localStorage.setItem(ENTITLEMENTS_KEY, JSON.stringify(e));
  window.dispatchEvent(new Event("livv-billing"));
}

export function canAccessTier(tier: LivvTier): boolean {
  if (tier === "spark") return true;
  if (isDemoUnlock()) return true;
  const e = loadEntitlements();
  if (e.tier === tier || rank(e.tier) >= rank(tier)) {
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
  | { ok: false; reason: "payments_required" | "stripe_not_configured" | "already" };

/**
 * Attempt to set membership tier.
 * Paid tiers blocked until Stripe is live (or demo unlock).
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
  return `${names[tier]} unlocks when billing goes live. You’re on Spark until then.`;
}
