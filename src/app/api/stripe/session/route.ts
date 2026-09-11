import { NextRequest, NextResponse } from "next/server";
import { getStripe, tierFromPriceId, type PaidTier } from "@/lib/stripe-server";
import { getVerifiedSupabaseUser, isSupabaseServerConfigured } from "@/lib/supabase/server-auth";
import { isUuid } from "@/lib/stripe-entitlements";

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

    // B3-1: when Supabase is configured, the Checkout session must belong to
    // the currently authenticated LIVV user. Never let session_id alone grant access.
    let verifiedUserId: string | null = null;
    if (isSupabaseServerConfigured()) {
      const verified = await getVerifiedSupabaseUser(req);
      if (!verified) {
        return NextResponse.json({ error: "Authenticated session required" }, { status: 401 });
      }
      verifiedUserId = verified.id;
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

    if (verifiedUserId) {
      const boundId = session.metadata?.livv_user_id || session.client_reference_id;
      if (!isUuid(boundId) || boundId !== verifiedUserId) {
        return NextResponse.json({ error: "Checkout session does not belong to this account" }, { status: 403 });
      }
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
