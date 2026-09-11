import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getVerifiedSupabaseUser } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";

/**
 * B2 · Server-authoritative membership read.
 *
 * The user id comes only from a verified Supabase access token. The client
 * cannot choose which entitlement row to read. A missing row means Spark.
 * This endpoint is intentionally read-only: it does not change local
 * entitlements, profiles.tier, Stripe state, or product gates.
 */
export async function GET(req: NextRequest) {
  const verified = await getVerifiedSupabaseUser(req);
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Entitlement service unavailable" }, { status: 503 });
  }

  try {
    const { data, error } = await admin
      .from("entitlements")
      .select(
        "tier,status,stripe_customer_id,stripe_subscription_id,current_period_end,source,updated_at"
      )
      .eq("user_id", verified.id)
      .maybeSingle();

    if (error) {
      console.error("[entitlements] read", error.message);
      return NextResponse.json({ error: "Entitlement lookup failed" }, { status: 500 });
    }

    return NextResponse.json({
      userId: verified.id,
      tier: data?.tier ?? "spark",
      status: data?.status ?? "none",
      stripeCustomerId: data?.stripe_customer_id ?? null,
      stripeSubscriptionId: data?.stripe_subscription_id ?? null,
      currentPeriodEnd: data?.current_period_end ?? null,
      source: data?.source ?? "spark",
      updatedAt: data?.updated_at ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Entitlement lookup failed";
    console.error("[entitlements]", message);
    return NextResponse.json({ error: "Entitlement lookup failed" }, { status: 500 });
  }
}
