import { NextRequest, NextResponse } from "next/server";
import { appUrl, getStripe } from "@/lib/stripe-server";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getVerifiedSupabaseUser, isSupabaseServerConfigured } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";

function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init?.headers || {}),
    },
  });
}

/** Opens Stripe Customer Portal for the authenticated user's server-bound customer. */
export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return json({ error: "Stripe not configured" }, { status: 503 });
    }

    if (!isSupabaseServerConfigured() || !isSupabaseAdminConfigured()) {
      return json({ error: "Billing identity is not configured" }, { status: 503 });
    }

    const verified = await getVerifiedSupabaseUser(req);
    if (!verified) {
      return json({ error: "Authenticated session required" }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return json({ error: "Billing identity is not configured" }, { status: 503 });
    }

    const { data: entitlement, error } = await admin
      .from("entitlements")
      .select("stripe_customer_id")
      .eq("user_id", verified.id)
      .maybeSingle();

    if (error) {
      console.error("[stripe/portal] entitlement lookup", error.message);
      return json({ error: "Could not verify billing ownership" }, { status: 500 });
    }

    const customerId = entitlement?.stripe_customer_id;
    if (!customerId) {
      return json({ error: "No Stripe customer is linked to this account" }, { status: 404 });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl()}/home/profile`,
    });

    return json({ url: portal.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Portal failed";
    console.error("[stripe/portal]", message);
    return json({ error: message }, { status: 500 });
  }
}
