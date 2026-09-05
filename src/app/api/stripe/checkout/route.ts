import { NextRequest, NextResponse } from "next/server";
import { appUrl, getStripe, priceIdForTier, type PaidTier } from "@/lib/stripe-server";

export const runtime = "nodejs";

const PAID: PaidTier[] = ["rise", "apex", "circle"];

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured. Add STRIPE_SECRET_KEY." },
        { status: 503 }
      );
    }

    const body = (await req.json()) as {
      tier?: string;
      email?: string;
      username?: string;
    };

    const tier = body.tier as PaidTier | undefined;
    if (!tier || !PAID.includes(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const priceId = priceIdForTier(tier);
    if (!priceId) {
      return NextResponse.json(
        { error: `Missing STRIPE_PRICE_${tier.toUpperCase()} env var` },
        { status: 503 }
      );
    }

    const base = appUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/home/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/home/profile?billing=cancel`,
      customer_email: body.email || undefined,
      client_reference_id: body.username || undefined,
      metadata: {
        livv_tier: tier,
        livv_username: body.username || "",
      },
      subscription_data: {
        metadata: {
          livv_tier: tier,
          livv_username: body.username || "",
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    console.error("[stripe/checkout]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
