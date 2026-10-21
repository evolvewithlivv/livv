import type { LivvTier } from "./identity";
import { patchIdentity } from "./identity";
import { getSupabaseBrowserClient } from "./supabase/client";

export type Entitlements = { tier: LivvTier; source: "spark"; expiresAt: null };
export type ServerEntitlement = { tier: LivvTier; status: string; stripe_customer_id: string | null; stripe_subscription_id: string | null; current_period_end: string | null };
const FREE: Entitlements = { tier: "spark", source: "spark", expiresAt: null };

export function isStripeConfigured() { return Boolean(getSupabaseBrowserClient()); }
export function loadEntitlements(): Entitlements {
  if (typeof window !== "undefined") {
    try { localStorage.removeItem("livv-entitlements-v1"); } catch {}
  }
  return FREE;
}
export function applyStripeEntitlement(_input: { tier: LivvTier; customerId?: string | null; subscriptionId?: string | null }) {
  if (typeof window !== "undefined") localStorage.removeItem("livv-entitlements-v1");
  patchIdentity({ tier: "spark" });
  return FREE;
}
export function resolveEffectiveEntitlement() { return FREE; }
export function getEffectiveTier(): LivvTier { return "spark"; }
/** LIVV core functionality is free, so no feature should be gated by a legacy tier. */
export function canAccessTier(_tier: LivvTier) { return true; }
export async function hydrateServerEntitlement(): Promise<void> {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem("livv-entitlements-v1"); } catch {}
  patchIdentity({ tier: "spark" });
}
export function invalidateServerEntitlementCache() {
  if (typeof window !== "undefined") localStorage.removeItem("livv-entitlements-v1");
}
export type UpgradeResult = { ok: boolean; tier?: LivvTier; reason?: string };
export function requestTierChange(_tier: LivvTier): UpgradeResult {
  invalidateServerEntitlementCache();
  patchIdentity({ tier: "spark" });
  return { ok: true, tier: "spark" };
}
async function billingPost(path: string): Promise<{ ok: boolean; error?: string; url?: string }> {
  const client = getSupabaseBrowserClient();
  if (!client) return { ok: false, error: "Sign in to continue." };
  const { data, error } = await client.auth.getSession();
  const token = data.session?.access_token;
  if (error || !token) return { ok: false, error: "Sign in to continue." };
  try {
    const res = await fetch(path, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: "{}", cache: "no-store" });
    const payload = await res.json().catch(() => ({}));
    return res.ok ? { ok: true, url: payload.url } : { ok: false, error: payload.error || "Billing request failed." };
  } catch { return { ok: false, error: "Could not connect to billing. Try again." }; }
}
/** New paid memberships are intentionally disabled. */
export async function startCheckout(_tier: Exclude<LivvTier, "spark">): Promise<{ ok: boolean; error?: string }> {
  return { ok: false, error: "LIVV no longer offers paid tiers. Core access is free." };
}
export async function openBillingPortal(): Promise<{ ok: boolean; error?: string }> {
  const r = await billingPost("/api/stripe/portal");
  if (!r.ok || !r.url) return { ok: false, error: r.error || "Billing portal could not be opened." };
  window.location.assign(r.url);
  return { ok: true };
}
export function paidTierMessage(_tier: LivvTier) { return "LIVV core access is free. Paid tiers are no longer offered."; }
