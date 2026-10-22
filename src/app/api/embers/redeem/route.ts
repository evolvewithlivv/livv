import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getVerifiedSupabaseUser } from "@/lib/supabase/server-auth";
import {
  EMBERS_PER_DOLLAR,
  MIN_REDEEM_EMBERS,
  MAX_CREDIT_DOLLARS,
  MAX_CREDIT_FRACTION,
  embersToDollars,
} from "@/lib/ember-economy";

export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

/**
 * POST /api/embers/redeem
 * Retired until a paid order created by this server can be loaded and checked.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Ember redemption is not available." },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}

/** GET — return current balance + quote helpers for the signed-in user */
export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseAdminConfigured()) return json({ error: "Ember service unavailable." }, 503);
    const verified = await getVerifiedSupabaseUser(req);
    if (!verified || verified.isAnonymous) return json({ error: "Sign in required." }, 401);

    const admin = getSupabaseAdmin();
    if (!admin) return json({ error: "Ember service unavailable." }, 503);

    const { data, error } = await admin
      .from("profiles")
      .select("embers")
      .eq("id", verified.id)
      .maybeSingle();

    if (error) return json({ error: "Could not load balance." }, 503);

    const balance = Number(data?.embers || 0);
    return json({
      balance,
      dollars: embersToDollars(balance),
      minRedeem: MIN_REDEEM_EMBERS,
      embersPerDollar: EMBERS_PER_DOLLAR,
      maxCreditDollars: MAX_CREDIT_DOLLARS,
      maxFraction: MAX_CREDIT_FRACTION,
      canRedeem: balance >= MIN_REDEEM_EMBERS,
    });
  } catch {
    return json({ error: "Could not load balance." }, 500);
  }
}
