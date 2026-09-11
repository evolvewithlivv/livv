import { NextRequest, NextResponse } from "next/server";
import { getStripe, tierFromPriceId, type PaidTier } from "@/lib/stripe-server";
import { getVerifiedSupabaseUser } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";

function isUuid(value: string | null | undefined): value is string {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function sessionBelongsToUser(
  session: { client_reference_id: string | null; metadata?: Record<string, string> | null },
  userId: string
) {
  const metadataUserId = session.metadata?.livv_user_id || null;
  const clientReferenceId = session.client_reference_id || null;
  const boundIds = [metadataUserId, clientReferenceId].filter(isUuid);

  // B0-bound sessions must identify the same auth.users row. If both bindings
  // exist they must agree; unbound historical sessions are not authoritative.
  if (boundIds.length === 0) return false;
  return boundIds.every((id) => id === userId);
}

export async function GET(req: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const user = await getVerifiedSupabaseUser(req);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "line_items"],
    });

    if (!sessionBelongsToUser(session, user.id)) {
      return NextResponse.json({ error: "Checkout session does not belong to this account" }, { status: 403 });
    }

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
