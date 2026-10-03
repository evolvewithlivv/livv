import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getVerifiedSupabaseUser } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";

/**
 * Server-authoritative Ember awards.
 * Client may declare an *action type* and optional detail id.
 * Client may NOT choose the award amount or invent unbounded event keys.
 *
 * The database independently derives the award amount from the validated action/size.
 *
 * Event keys are derived as:
 *   ember:{userId}:{action}:{UTC-YYYY-MM-DD}:{detail}
 * so the same action+detail same day is idempotent.
 */

const ACTIONS = ["checkin", "workout", "objective", "custom"] as const;
type AwardAction = (typeof ACTIONS)[number];

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

function utcDayKey() {
  return new Date().toISOString().slice(0, 10);
}

function sanitizeDetail(raw: unknown): string {
  if (typeof raw !== "string") return "default";
  const cleaned = raw.trim().toLowerCase().replace(/[^a-z0-9:_-]/g, "").slice(0, 40);
  return cleaned.length >= 1 ? cleaned : "default";
}

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseAdminConfigured()) return json({ error: "Ember service unavailable." }, 503);

    const verified = await getVerifiedSupabaseUser(req);
    if (!verified || verified.isAnonymous) return json({ error: "Sign in to earn Embers." }, 401);

    const body = (await req.json().catch(() => null)) as {
      action?: unknown;
      detail?: unknown;
      size?: unknown;
      /** @deprecated ignored — amount is server-authoritative */
      baseAmount?: unknown;
      /** @deprecated ignored — key is server-derived */
      eventKey?: unknown;
    } | null;

    const actionRaw = typeof body?.action === "string" ? body.action.trim().toLowerCase() : "";
    if (!(ACTIONS as readonly string[]).includes(actionRaw)) {
      return json({ error: "Invalid Ember action." }, 400);
    }
    const action = actionRaw as AwardAction;

    const size = action === "custom"
      ? (typeof body?.size === "string" ? body.size.trim().toLowerCase() : "standard")
      : null;
    if (action === "custom" && size !== "small" && size !== "standard" && size !== "major") {
      return json({ error: "Invalid Ember size." }, 400);
    }

    const detail = sanitizeDetail(body?.detail);
    const day = utcDayKey();
    const eventKey = `ember-${verified.id}-${action}-${day}-${size || "base"}-${detail}`.slice(0, 120);

    const admin = getSupabaseAdmin();
    if (!admin) return json({ error: "Ember service unavailable." }, 503);

    const { data, error } = await admin.rpc("grant_embers", {
      p_user_id: verified.id,
      p_event_key: eventKey,
      p_action: action,
      p_size: action === "custom" ? (typeof body?.size === "string" ? body.size.trim().toLowerCase() : "standard") : null,
    });

    if (error) {
      const msg = error.message || "";
      if (msg.includes("daily ember award limit")) {
        return json({ error: "Daily Ember limit reached.", awarded: 0 }, 429);
      }
      if (msg.includes("invalid event key") || msg.includes("invalid ember action") || msg.includes("invalid ember size")) {
        return json({ error: "Invalid Ember award." }, 400);
      }
      console.error("[embers] grant failed", msg);
      return json({ error: "Ember award could not be recorded." }, 503);
    }

    const row = Array.isArray(data) ? data[0] : data;
    return json({
      awarded: Number(row?.awarded || 0),
      total: Number(row?.total || 0),
      multiplier: 1,
      action,
    });
  } catch (error) {
    console.error("[embers] award route error", error);
    return json({ error: "Ember award failed." }, 500);
  }
}
