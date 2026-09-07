import { NextRequest, NextResponse } from "next/server";
import { getStripe, tierFromPriceId, type PaidTier } from "@/lib/stripe-server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "line_items"],
    });

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json(
        { error: "Payment not complete", status: session.status },
        { status: 402 }
      );
    }

    if (session.metadata?.livv_kind === "pack") {
      return NextResponse.json({
        kind: "pack",
        grade: Number(session.metadata.livv_grade || 1),
        qty: Number(session.metadata.livv_qty || 1),
        customerId:
          typeof session.customer === "string" ? session.customer : session.customer?.id,
        email: session.customer_details?.email || session.customer_email,
      });
    }

    let tier = (session.metadata?.livv_tier as PaidTier | undefined) || null;

    if (!tier && session.subscription && typeof session.subscription !== "string") {
      const priceId = session.subscription.items.data[0]?.price?.id;
      tier = tierFromPriceId(priceId);
    }

    if (!tier) {
      const linePrice = session.line_items?.data?.[0]?.price?.id;
      tier = tierFromPriceId(linePrice || null);
    }

    if (!tier) {
      return NextResponse.json({ error: "Could not resolve purchase" }, { status: 422 });
    }

    return NextResponse.json({
      kind: "tier",
      tier,
      customerId:
        typeof session.customer === "string" ? session.customer : session.customer?.id,
      subscriptionId:
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id,
      email: session.customer_details?.email || session.customer_email,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Session lookup failed";
    console.error("[stripe/session]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
