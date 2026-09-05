import { NextRequest, NextResponse } from "next/server";
import { getStripe, tierFromPriceId } from "@/lib/stripe-server";
import type Stripe from "stripe";

export const runtime = "nodejs";

/**
 * Stripe webhook — keeps subscription lifecycle ready for when you add a real user DB.
 * For now we log events; client unlock still happens via /api/stripe/session on success page.
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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.info("[stripe] checkout complete", {
          id: session.id,
          tier: session.metadata?.livv_tier,
          username: session.metadata?.livv_username,
          customer: session.customer,
          subscription: session.subscription,
        });
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price?.id;
        const tier = tierFromPriceId(priceId);
        console.info(`[stripe] ${event.type}`, {
          id: sub.id,
          status: sub.status,
          tier,
          customer: sub.customer,
        });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe/webhook] handler", err);
  }

  return NextResponse.json({ received: true });
}
