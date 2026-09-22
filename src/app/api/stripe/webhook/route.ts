import { NextRequest, NextResponse } from "next/server";
import { getStripe, tierFromPriceId, type PaidTier } from "@/lib/stripe-server";
import {
  claimWebhookEvent,
  effectiveTier,
  findUserIdByCustomerId,
  findUserIdBySubscriptionId,
  mapSubscriptionStatus,
  markWebhookEventProcessed,
  resolveLivvUserId,
  tierFromSubscription,
  upsertEntitlement,
} from "@/lib/stripe-entitlements";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 1024 * 1024;

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

  const length = Number(req.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Webhook payload too large" }, { status: 413 });
  }

  const rawBody = await req.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Webhook payload too large" }, { status: 413 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Webhook fulfillment storage is not configured" },
      { status: 503 },
    );
  }

  try {
    const claim = await claimWebhookEvent(event.id, event.type);

    if (claim === "processed") {
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (claim === "busy") {
      return NextResponse.json(
        { error: "Webhook event is already being processed" },
        { status: 409 },
      );
    }

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(stripe, event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
    }

    await markWebhookEventProcessed(event.id);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe/webhook] handler", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
) {
  if (session.mode !== "subscription") return;

  const userId = resolveLivvUserId({
    metadata: session.metadata,
    clientReferenceId: session.client_reference_id,
  });
  if (!userId) return;

  let tier: PaidTier | null =
    (session.metadata?.livv_tier as PaidTier | undefined) || null;

  const subscriptionId =
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
      if (mapped !== "spark") {
        tier = mapped as PaidTier;
      } else if (!tier) {
        tier = tierFromPriceId(sub.items.data[0]?.price?.id);
      }

      customerId =
        typeof sub.customer === "string"
          ? sub.customer
          : sub.customer?.id || customerId;

      periodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null;
    } catch (err) {
      console.error("[stripe/webhook] retrieve subscription", err);
    }
  }

  if (!tier) return;

  await upsertEntitlement({
    userId,
    tier: effectiveTier(status, tier),
    status,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    currentPeriodEnd: periodEnd,
  });
}

async function resolveSubscriptionUserId(sub: Stripe.Subscription) {
  let userId = resolveLivvUserId({ metadata: sub.metadata });

  const customerId =
    typeof sub.customer === "string"
      ? sub.customer
      : sub.customer?.id || null;

  if (!userId) userId = await findUserIdBySubscriptionId(sub.id);
  if (!userId && customerId) {
    userId = await findUserIdByCustomerId(customerId);
  }

  return userId;
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const userId = await resolveSubscriptionUserId(sub);
  if (!userId) return;

  const status = mapSubscriptionStatus(sub.status);
  const mapped = tierFromSubscription(sub);
  const tier = effectiveTier(status, mapped);

  const customerId =
    typeof sub.customer === "string"
      ? sub.customer
      : sub.customer?.id || null;

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
  const userId = await resolveSubscriptionUserId(sub);
  if (!userId) return;

  const customerId =
    typeof sub.customer === "string"
      ? sub.customer
      : sub.customer?.id || null;

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

