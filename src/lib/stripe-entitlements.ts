/**
 * B1 · Server entitlement upsert helpers for Stripe webhooks.
 * Does not touch client localStorage or profiles.tier.
 */

import type Stripe from "stripe";
import { tierFromPriceId, type PaidTier } from "@/lib/stripe-server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type EntitlementTier = "spark" | PaidTier;

export type EntitlementStatus =
  | "none"
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete";

export function isUuid(value: string | null | undefined): value is string {
  return Boolean(value && UUID_RE.test(value));
}

/** Authoritative user id from B0 Checkout metadata / client_reference_id. */
export function resolveLivvUserId(input: {
  metadata?: Stripe.Metadata | null;
  clientReferenceId?: string | null;
}): string | null {
  const fromMeta = input.metadata?.livv_user_id;
  if (isUuid(fromMeta)) return fromMeta;
  if (isUuid(input.clientReferenceId)) return input.clientReferenceId;
  return null;
}

export function mapSubscriptionStatus(status: Stripe.Subscription.Status): EntitlementStatus {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "unpaid":
      return "unpaid";
    case "incomplete":
    case "incomplete_expired":
      return "incomplete";
    case "paused":
      // A fully paused subscription stops service delivery. Do not treat it
      // like a payment-retry window such as past_due.
      return "unpaid";
    default:
      return "none";
  }
}

export function tierFromSubscription(sub: Stripe.Subscription): EntitlementTier {
  const fromMeta = sub.metadata?.livv_tier as PaidTier | undefined;
  if (fromMeta === "rise" || fromMeta === "apex" || fromMeta === "circle") {
    return fromMeta;
  }
  const priceId = sub.items.data[0]?.price?.id;
  return tierFromPriceId(priceId) || "spark";
}

export function effectiveTier(
  status: EntitlementStatus,
  mappedTier: EntitlementTier
): EntitlementTier {
  if (status === "active" || status === "trialing") return mappedTier;
  if (status === "past_due") return mappedTier; // keep access until deleted/canceled policy
  return "spark";
}

export async function recordWebhookEvent(eventId: string, eventType: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (!admin) return false;

  const { error } = await admin.from("stripe_webhook_events").insert({
    event_id: eventId,
    event_type: eventType,
  });

  if (error) {
    // Unique violation → already processed
    if (error.code === "23505") return false;
    console.error("[stripe-entitlements] record event", error.message);
    throw error;
  }
  return true;
}

export async function upsertEntitlement(row: {
  userId: string;
  tier: EntitlementTier;
  status: EntitlementStatus;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  currentPeriodEnd?: string | null;
}) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    console.error("[stripe-entitlements] admin client missing");
    return;
  }

  const { error } = await admin.from("entitlements").upsert(
    {
      user_id: row.userId,
      tier: row.tier,
      status: row.status,
      stripe_customer_id: row.stripeCustomerId || null,
      stripe_subscription_id: row.stripeSubscriptionId || null,
      current_period_end: row.currentPeriodEnd || null,
      source: "stripe",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("[stripe-entitlements] upsert", error.message);
    throw error;
  }
}

export async function findUserIdBySubscriptionId(
  subscriptionId: string
): Promise<string | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data, error } = await admin
    .from("entitlements")
    .select("user_id")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();
  if (error) {
    console.error("[stripe-entitlements] lookup sub", error.message);
    return null;
  }
  return data?.user_id ?? null;
}
