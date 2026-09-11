import { NextRequest, NextResponse } from "next/server";
import { appUrl, getStripe } from "@/lib/stripe-server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getVerifiedSupabaseUser } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";

/** Opens Stripe Customer Portal for the authenticated user's own customer. */
export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const user = await getVerifiedSupabaseUser(req);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Billing identity unavailable" }, { status: 503 });
    }

    const { data: entitlement, error } = await admin
      .from("entitlements")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[stripe/portal] entitlement lookup failed", error.message);
      return NextResponse.json({ error: "Billing identity unavailable" }, { status: 503 });
    }

    if (!entitlement?.stripe_customer_id) {
      return NextResponse.json({ error: "No Stripe customer on this account" }, { status: 404 });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: entitlement.stripe_customer_id,
      return_url: `${appUrl()}/home/profile`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Portal failed";
    console.error("[stripe/portal]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
