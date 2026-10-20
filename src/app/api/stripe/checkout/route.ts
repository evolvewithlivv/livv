import { NextRequest, NextResponse } from "next/server";
import { appUrl, getStripe, priceIdForTier, type PaidTier } from "@/lib/stripe-server";
import { getVerifiedSupabaseUser, isSupabaseServerConfigured } from "@/lib/supabase/server-auth";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const EXPECTED: Record<PaidTier, number> = { rise: 899, apex: 2499, circle: 3999 };

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) return json({ error: "Billing is temporarily unavailable." }, 503);
    if (!isSupabaseServerConfigured() || !isSupabaseAdminConfigured()) {
      return json({ error: "Billing identity is not configured." }, 503);
    }

    const user = await getVerifiedSupabaseUser(req);
    if (!user) return json({ error: "Sign in to continue." }, 401);
    if (user.isAnonymous || !user.email) return json({ error: "Verify your email before subscribing." }, 403);

    let body: { tier?: unknown };
    try { body = await req.json(); } catch { return json({ error: "Choose a valid membership." }, 400); }
    const tier = body.tier;
    if (tier !== "rise" && tier !== "apex" && tier !== "circle") {
      return json({ error: "Choose a valid membership." }, 400);
    }

    const priceId = priceIdForTier(tier);
    if (!priceId) return json({ error: "This membership is not configured yet." }, 503);

    const price = await stripe.prices.retrieve(priceId, { expand: ["product"] });
    if (!price.active || !price.recurring || price.currency !== "usd" ||
        price.recurring.interval !== "month" || price.recurring.interval_count !== 1 ||
        price.unit_amount !== EXPECTED[tier] || price.livemode !== true) {
      console.error("[stripe/checkout] configured price failed validation", { tier, priceId });
      return json({ error: "This membership's price is being verified. Please try again later." }, 503);
    }

    const product = price.product;
    if (typeof product === "string" || !("active" in product) || !product.active) {
      return json({ error: "This membership is temporarily unavailable." }, 503);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: { livv_user_id: user.id, livv_tier: tier },
      subscription_data: { metadata: { livv_user_id: user.id, livv_tier: tier } },
      success_url: `${appUrl()}/home/profile?billing=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl()}/home/profile?billing=cancelled`,
      allow_promotion_codes: true,
    });

    if (!session.url) return json({ error: "Checkout could not be started. Please try again." }, 502);
    return json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err instanceof Error ? err.message : err);
    return json({ error: "Checkout could not be started. Please try again." }, 500);
  }
}
