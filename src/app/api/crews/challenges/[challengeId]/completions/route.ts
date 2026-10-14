import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getVerifiedSupabaseUser } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";
const json = (data: unknown, status = 200) => NextResponse.json(data, {
  status, headers: { "Cache-Control": "private, no-store, max-age=0" },
});
const UUID = /^[0-9a-f]{8}-[0-9a-f]{3}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_KEYS: Record<string, string[]> = {
  daily_action_days: ["mind", "body", "life", "daily_action"],
  workout_sessions: ["workout"],
  learning_sessions: ["learning"],
  custom_checkin: ["checkin"],
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ challengeId: string }> }) {
  try {
    const user = await getVerifiedSupabaseUser(req);
    if (!user || user.isAnonymous) return json({ error: "Sign in to record progress." }, 401);
    const { challengeId } = await params;
    if (!UUID.test(challengeId)) return json({ error: "Invalid challenge." }, 400);
    const body = await req.json().catch(() => null);
    const key = typeof body?.activityKey === "string" ? body.activityKey : "";
    const idempotencyKey = typeof body?.idempotencyKey === "string" ? body.idempotencyKey : "";
    if (!UUID.test(idempotencyKey)) return json({ error: "A valid idempotency key is required." }, 400);
    const db = getSupabaseAdmin();
    if (!db) return json({ error: "Crew service unavailable." }, 503);
    const { data: challenge, error } = await db.from("crew_challenges")
      .select("id,crew_id,challenge_type,status,starts_at,ends_at").eq("id", challengeId).maybeSingle();
    if (error) throw error;
    if (!challenge || !challenge.crew_id) return json({ error: "Challenge not found." }, 404);
    if (!ALLOWED_KEYS[challenge.challenge_type]?.includes(key)) return json({ error: "Activity type is not allowed for this challenge." }, 400);
    const now = new Date();
    if (challenge.status !== "active" || now.getTime() < Date.parse(challenge.starts_at) || now.getTime() >= Date.parse(challenge.ends_at)) {
      return json({ error: "Progress can only be recorded during an active challenge." }, 409);
    }
    const { data: member, error: memberError } = await db.from("crew_members").select("user_id")
      .eq("crew_id", challenge.crew_id).eq("user_id", user.id).eq("status", "active").maybeSingle();
    if (memberError) throw memberError;
    if (!member) return json({ error: "You are not an active member of this Crew." }, 403);
    const { data: enrollment, error: enrollmentError } = await db.from("crew_challenge_members")
      .select("status,target_count").eq("challenge_id", challengeId).eq("user_id", user.id).maybeSingle();
    if (enrollmentError) throw enrollmentError;
    if (!enrollment || enrollment.status !== "active") return json({ error: "Enroll before recording progress." }, 403);
    const dayStart = new Date(now); dayStart.setUTCHours(0, 0, 0, 0);
    const { count, error: countError } = await db.from("crew_completions")
      .select("id", { count: "exact", head: true }).eq("challenge_id", challengeId).eq("user_id", user.id)
      .gte("accepted_at", dayStart.toISOString());
    if (countError) throw countError;
    if ((count || 0) >= 10) return json({ error: "Daily submission limit reached." }, 429);
    const { data: inserted, error: insertError } = await db.from("crew_completions").insert({
      challenge_id: challengeId, user_id: user.id, activity_key: key,
      occurred_at: now.toISOString(), source: "self_reported", idempotency_key: idempotencyKey,
      metadata: {},
    }).select("id,activity_key,occurred_at,accepted_at,source").single();
    if (insertError?.code === "23505") return json({ error: "This submission was already recorded." }, 409);
    if (insertError) throw insertError;
    const { data: events, error: eventsError } = await db.from("crew_completions")
      .select("activity_key,occurred_at").eq("challenge_id", challengeId).eq("user_id", user.id);
    if (eventsError) throw eventsError;
    const acceptedCount = challenge.challenge_type === "daily_action_days"
      ? new Set((events || []).map(e => new Date(e.occurred_at).toISOString().slice(0, 10))).size
      : (events || []).length;
    return json({ completion: inserted, progress: { accepted_count: acceptedCount,
      target_count: enrollment.target_count, completed: acceptedCount >= enrollment.target_count,
      trust_level: "self_reported" } }, 201);
  } catch (error) {
    console.error("[crews] completion submission failed", error);
    return json({ error: "Could not record progress." }, 500);
  }
}
