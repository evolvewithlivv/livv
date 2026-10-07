/**
 * V1 billing boundary.
 * LIVV V1 is free-core. Legacy paid entitlement data may remain for continuity,
 * but the product must not initiate or advertise paid subscription checkout.
 */
import type { LivvTier } from "./identity";
import { patchIdentity } from "./identity";

export type Entitlements = {
  tier: LivvTier;
  source: "stripe" | "spark";
  expiresAt: string | null;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
};

export type ServerEntitlement = {
  tier: LivvTier;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
};

const FREE: Entitlements = { tier: "spark", source: "spark", expiresAt: null };

export function isStripeConfigured() {
  return false;
}

export function loadEntitlements(): Entitlements {
  if (typeof window === "undefined") return FREE;
  try {
    const raw = window.localStorage.getItem("livv-entitlements-v1");
    if (!raw) return FREE;
    const parsed = JSON.parse(raw) as Partial<Entitlements>;
    return {
      tier: parsed.tier === "spark" ? "spark" : "spark",
      source: "spark",
      expiresAt: null,
    };
  } catch {
    return FREE;
  }
}

export function applyStripeEntitlement(_input: {
  tier: LivvTier;
  customerId?: string | null;
  subscriptionId?: string | null;
}) {
  patchIdentity({ tier: "spark" });
  return FREE;
}

export function resolveEffectiveEntitlement(): Entitlements {
  return FREE;
}

export function getEffectiveTier() {
  return "spark" as LivvTier;
}

export function canAccessTier(tier: LivvTier) {
  return tier === "spark";
}

export async function hydrateServerEntitlement(): Promise<void> {
  if (typeof window !== "undefined") patchIdentity({ tier: "spark" });
}

export function invalidateServerEntitlementCache() {}

export type UpgradeResult = { ok: boolean; tier?: LivvTier; reason?: string };

export function requestTierChange(tier: LivvTier): UpgradeResult {
  if (tier === "spark") return { ok: true, tier: "spark" };
  return { ok: false, reason: "paid_memberships_disabled_v1" };
}

export async function startCheckout(
  _tier: Exclude<LivvTier, "spark">,
): Promise<{ ok: boolean; error?: string }> {
  return { ok: false, error: "Paid LIVV memberships are not offered in V1." };
}

export async function openBillingPortal(): Promise<{ ok: boolean; error?: string }> {
  return { ok: false, error: "Paid LIVV memberships are not offered in V1." };
}

export function paidTierMessage(_tier: LivvTier) {
  return "Paid LIVV memberships are not offered in V1.";
}
