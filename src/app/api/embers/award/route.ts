import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getVerifiedSupabaseUser } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseAdminConfigured()) return json({ error: "Ember service unavailable." }, 503);

    const verified = await getVerifiedSupabaseUser(req);
    if (!verified || verified.isAnonymous) return json({ error: "Sign in to earn Embers." }, 401);

    const body = await req.json().catch(() => null) as { eventKey?: unknown; baseAmount?: unknown } | null;
    const eventKey = typeof body?.eventKey === "string" ? body.eventKey.trim() : "";
    const baseAmount = typeof body?.baseAmount === "number" ? Math.trunc(body.baseAmount) : 0;

    if (!eventKey.startsWith("ember-") || eventKey.length < 12 || eventKey.length > 120) {
      return json({ error: "Invalid Ember event." }, 400);
    }
    if (baseAmount < 1 || baseAmount > 150) {
      return json({ error: "Invalid Ember award." }, 400);
    }

    const admin = getSupabaseAdmin();
    if (!admin) return json({ error: "Ember service unavailable." }, 503);

    const { data, error } = await admin.rpc("grant_embers", {
      p_user_id: verified.id,
      p_event_key: eventKey,
      p_base_amount: baseAmount,
    });

    if (error) {
      console.error("[embers] grant failed", error.message);
      return json({ error: "Ember award could not be recorded." }, 503);
    }

    const row = Array.isArray(data) ? data[0] : data;
    return json({
      awarded: Number(row?.awarded || 0),
      total: Number(row?.total || 0),
      tier: String(row?.tier || "spark"),
      multiplier: Number(row?.multiplier || 1),
    });
  } catch (error) {
    console.error("[embers] request failed", error);
    return json({ error: "Ember award could not be recorded." }, 500);
  }
}
