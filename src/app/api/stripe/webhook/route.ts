import { NextRequest, NextResponse } from "next/server";
import { getStripe, tierFromPriceId, type PaidTier } from "@/lib/stripe-server";
import {
  effectiveTier,
  findUserIdBySubscriptionId,
  mapSubscriptionStatus,
  recordWebhookEvent,
  resolveLivvUserId,
  tierFromSubscription,
  upsertEntitlement,
} from "@/lib/stripe-entitlements";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export const runtime = "nodejs";

/**
 * Stripe webhook — B1: signature-verified, idempotent subscription entitlement upsert.
 * Does not touch client localStorage, packs, or profiles.tier.
 */
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("[stripe/webhook] signature", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Fulfillment requires service role + tables. Still ack signature-valid events.
  if (!isSupabaseAdminConfigured()) {
    console.error(
      "[stripe/webhook] SUPABASE_SERVICE_ROLE_KEY missing — event accepted but not stored"
    );
    return NextResponse.json({ received: true, fulfilled: false });
  }

  try {
    const firstTime = await recordWebhookEvent(event.id, event.type);
    if (!firstTime) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(stripe, session);
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe/webhook] handler", err);
    // Return 500 so Stripe retries; event row may already exist — on retry duplicate short-circuits.
    // Prefer not leaving silent permanent skip on transient DB errors before insert succeeds.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session
) {
  // Packs / one-time payments are out of B1 scope.
  if (session.mode === "payment") {
    console.info("[stripe/webhook] skip pack/one-time", session.id);
    return;
  }

  const userId = resolveLivvUserId({
    metadata: session.metadata,
    clientReferenceId: session.client_reference_id,
  });
  if (!userId) {
    console.info("[stripe/webhook] checkout without livv_user_id — no grant", session.id);
    return;
  }

  let tier: PaidTier | null =
    (session.metadata?.livv_tier as PaidTier | undefined) || null;

  let subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id || null;

  let customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id || null;

  let status: ReturnType<typeof mapSubscriptionStatus> = "active";
  let periodEnd: string | null = null;

  if (subscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      status = mapSubscriptionStatus(sub.status);
      const mapped = tierFromSubscription(sub);
      if (mapped !== "spark") tier = mapped as PaidTier;
      else if (!tier) tier = tierFromPriceId(sub.items.data[0]?.price?.id);
      customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer?.id || customerId;
      periodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null;
      // Prefer subscription metadata UUID if present and valid (should match).
      const subUser = resolveLivvUserId({ metadata: sub.metadata });
      if (subUser && subUser !== userId) {
        console.info("[stripe/webhook] subscription metadata user mismatch", {
          session: userId,
          sub: subUser,
        });
      }
    } catch (e) {
      console.error("[stripe/webhook] retrieve subscription", e);
    }
  }

  if (!tier) {
    console.info("[stripe/webhook] checkout could not map tier", session.id);
    return;
  }

  const finalStatus = status;
  const finalTier = effectiveTier(finalStatus, tier);

  await upsertEntitlement({
    userId,
    tier: finalTier,
    status: finalStatus,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    currentPeriodEnd: periodEnd,
  });

  console.info("[stripe/webhook] entitlement upserted", {
    userId,
    tier: finalTier,
    status: finalStatus,
    subscriptionId,
  });
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  let userId = resolveLivvUserId({ metadata: sub.metadata });
  if (!userId) {
    userId = await findUserIdBySubscriptionId(sub.id);
  }
  if (!userId) {
    console.info("[stripe/webhook] subscription.updated without user", sub.id);
    return;
  }

  const status = mapSubscriptionStatus(sub.status);
  const mapped = tierFromSubscription(sub);
  const tier = effectiveTier(status, mapped);
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id || null;
  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null;

  await upsertEntitlement({
    userId,
    tier,
    status,
    stripeCustomerId: customerId,
    stripeSubscriptionId: sub.id,
    currentPeriodEnd: periodEnd,
  });
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  let userId = resolveLivvUserId({ metadata: sub.metadata });
  if (!userId) {
    userId = await findUserIdBySubscriptionId(sub.id);
  }
  if (!userId) {
    console.info("[stripe/webhook] subscription.deleted without user", sub.id);
    return;
  }

  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id || null;

  await upsertEntitlement({
    userId,
    tier: "spark",
    status: "canceled",
    stripeCustomerId: customerId,
    stripeSubscriptionId: sub.id,
    currentPeriodEnd: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
  });
}
