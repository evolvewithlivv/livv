import type { LivvTier } from "./identity";
import { patchIdentity } from "./identity";
import { getSupabaseBrowserClient } from "./supabase/client";

export type Entitlements = { tier: LivvTier; source: "stripe" | "spark"; expiresAt: string | null; stripeCustomerId?: string; stripeSubscriptionId?: string };
export type ServerEntitlement = { tier: LivvTier; status: string; stripe_customer_id: string | null; stripe_subscription_id: string | null; current_period_end: string | null };
const FREE: Entitlements = { tier: "spark", source: "spark", expiresAt: null };
const PAID = ["rise", "apex", "circle"] as const;
type Paid = (typeof PAID)[number];

export function isStripeConfigured() { return Boolean(getSupabaseBrowserClient()); }
export function loadEntitlements(): Entitlements {
  if (typeof window === "undefined") return FREE;
  try {
    const v = JSON.parse(localStorage.getItem("livv-entitlements-v1") || "null");
    return v && PAID.includes(v.tier) && v.source === "stripe" ? v : FREE;
  } catch { return FREE; }
}
export function applyStripeEntitlement(input: { tier: LivvTier; customerId?: string | null; subscriptionId?: string | null }) {
  if (!PAID.includes(input.tier as Paid)) { invalidateServerEntitlementCache(); patchIdentity({ tier: "spark" }); return FREE; }
  const next: Entitlements = { tier: input.tier, source: "stripe", expiresAt: null, ...(input.customerId ? { stripeCustomerId: input.customerId } : {}), ...(input.subscriptionId ? { stripeSubscriptionId: input.subscriptionId } : {}) };
  if (typeof window !== "undefined") localStorage.setItem("livv-entitlements-v1", JSON.stringify(next));
  patchIdentity({ tier: input.tier }); return next;
}
export function resolveEffectiveEntitlement() { return loadEntitlements(); }
export function getEffectiveTier() { return loadEntitlements().tier; }
export function canAccessTier(tier: LivvTier) {
  const rank: Record<LivvTier, number> = { spark: 0, rise: 1, apex: 2, circle: 3 };
  return rank[getEffectiveTier()] >= rank[tier];
}
export async function hydrateServerEntitlement(): Promise<void> {
  if (typeof window === "undefined") return;
  const client = getSupabaseBrowserClient(); if (!client) return;
  const { data } = await client.auth.getSession(); const token = data.session?.access_token; if (!token) return;
  try {
    const res = await fetch("/api/stripe/entitlement", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!res.ok) return;
    const v = await res.json();
    if (PAID.includes(v.tier) && ["active", "trialing"].includes(v.status)) {
      const next: Entitlements = { tier: v.tier, source: "stripe", expiresAt: v.current_period_end || null, stripeCustomerId: v.stripe_customer_id || undefined, stripeSubscriptionId: v.stripe_subscription_id || undefined };
      localStorage.setItem("livv-entitlements-v1", JSON.stringify(next)); patchIdentity({ tier: v.tier });
    } else { invalidateServerEntitlementCache(); patchIdentity({ tier: "spark" }); }
  } catch { /* retain last verified state during transient network errors */ }
}
export function invalidateServerEntitlementCache() { if (typeof window !== "undefined") localStorage.removeItem("livv-entitlements-v1"); }
export type UpgradeResult = { ok: boolean; tier?: LivvTier; reason?: string };
export function requestTierChange(tier: LivvTier): UpgradeResult {
  if (tier === "spark") { invalidateServerEntitlementCache(); patchIdentity({ tier: "spark" }); return { ok: true, tier }; }
  return { ok: false, reason: "checkout_required" };
}
async function billingPost(path: string, body?: unknown): Promise<{ ok: boolean; error?: string; url?: string }> {
  const client = getSupabaseBrowserClient(); if (!client) return { ok: false, error: "Sign in to continue." };
  const { data, error } = await client.auth.getSession(); const token = data.session?.access_token;
  if (error || !token) return { ok: false, error: "Sign in to continue." };
  try {
    const res = await fetch(path, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body || {}), cache: "no-store" });
    const payload = await res.json().catch(() => ({}));
    return res.ok ? { ok: true, url: payload.url } : { ok: false, error: payload.error || "Billing request failed." };
  } catch { return { ok: false, error: "Could not connect to billing. Try again." }; }
}
export async function startCheckout(tier: Exclude<LivvTier, "spark">): Promise<{ ok: boolean; error?: string }> {
  const r = await billingPost("/api/stripe/checkout", { tier });
  if (!r.ok || !r.url) return { ok: false, error: r.error || "Checkout could not be started." };
  window.location.assign(r.url); return { ok: true };
}
export async function openBillingPortal(): Promise<{ ok: boolean; error?: string }> {
  const r = await billingPost("/api/stripe/portal");
  if (!r.ok || !r.url) return { ok: false, error: r.error || "Billing portal could not be opened." };
  window.location.assign(r.url); return { ok: true };
}
export function paidTierMessage(_tier: LivvTier) { return "Choose a paid membership to continue to secure checkout."; }
