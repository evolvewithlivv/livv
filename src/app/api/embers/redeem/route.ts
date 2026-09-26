import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getVerifiedSupabaseUser } from "@/lib/supabase/server-auth";
import {
  EMBERS_PER_DOLLAR,
  MIN_REDEEM_EMBERS,
  MAX_CREDIT_DOLLARS,
  MAX_CREDIT_FRACTION,
  dollarsToEmbers,
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
 * Body: { orderId: string, subtotalCents: number, embersRequested?: number }
 * Burns Embers server-side after validating caps. Call only when a real paid order succeeds.
 */
export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseAdminConfigured()) return json({ error: "Ember service unavailable." }, 503);

    const verified = await getVerifiedSupabaseUser(req);
    if (!verified || verified.isAnonymous) return json({ error: "Sign in to redeem Embers." }, 401);

    const body = (await req.json().catch(() => null)) as {
      orderId?: unknown;
      subtotalCents?: unknown;
      embersRequested?: unknown;
    } | null;

    const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";
    const subtotalCents =
      typeof body?.subtotalCents === "number" ? Math.trunc(body.subtotalCents) : -1;
    const embersRequested =
      typeof body?.embersRequested === "number" ? Math.trunc(body.embersRequested) : undefined;

    if (!orderId || orderId.length < 8 || orderId.length > 120) {
      return json({ error: "Invalid order reference." }, 400);
    }
    if (subtotalCents < 100) {
      return json({ error: "Order total too low for Ember redemption." }, 400);
    }

    const admin = getSupabaseAdmin();
    if (!admin) return json({ error: "Ember service unavailable." }, 503);

    const { data, error } = await admin.rpc("redeem_embers", {
      p_user_id: verified.id,
      p_order_id: orderId,
      p_subtotal_cents: subtotalCents,
      p_embers_requested: embersRequested ?? null,
      p_embers_per_dollar: EMBERS_PER_DOLLAR,
      p_min_redeem: MIN_REDEEM_EMBERS,
      p_max_credit_dollars: MAX_CREDIT_DOLLARS,
      p_max_fraction: MAX_CREDIT_FRACTION,
    });

    if (error) {
      console.error("[embers] redeem failed", error.message);
      const msg = error.message || "";
      if (msg.includes("insufficient")) return json({ error: "Not enough Embers." }, 400);
      if (msg.includes("minimum")) return json({ error: "Below minimum redeem amount." }, 400);
      if (msg.includes("already")) return json({ error: "Embers already applied to this order." }, 409);
      return json({ error: "Ember redemption could not be recorded." }, 503);
    }

    const row = Array.isArray(data) ? data[0] : data;
    const applied = Number(row?.applied || 0);
    const total = Number(row?.total || 0);
    const creditDollars = embersToDollars(applied);

    return json({
      applied,
      creditCents: creditDollars * 100,
      creditDollars,
      total,
      rate: EMBERS_PER_DOLLAR,
    });
  } catch (error) {
    console.error("[embers] redeem request failed", error);
    return json({ error: "Ember redemption could not be recorded." }, 500);
  }
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

// silence unused if tree-shaken
void dollarsToEmbers;
