import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getVerifiedSupabaseUser } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";
const json = (data: unknown, status = 200) => NextResponse.json(data, {
  status, headers: { "Cache-Control": "private, no-store, max-age=0" },
});
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TYPES = ["daily_action_days", "workout_sessions", "learning_sessions", "custom_checkin"];

export async function GET(req: NextRequest, { params }: { params: Promise<{ crewId: string }> }) {
  try {
    const user = await getVerifiedSupabaseUser(req);
    if (!user || user.isAnonymous) return json({ error: "Sign in to view Crew challenges." }, 401);
    const { crewId } = await params;
    if (!UUID.test(crewId)) return json({ error: "Invalid Crew." }, 400);
    const db = getSupabaseAdmin();
    if (!db) return json({ error: "Crew service unavailable." }, 503);
    const { data: member, error: memberError } = await db.from("crew_members").select("role")
      .eq("crew_id", crewId).eq("user_id", user.id).eq("status", "active").maybeSingle();
    if (memberError) throw memberError;
    if (!member) return json({ error: "Crew not found." }, 404);
    const { data: challenges, error } = await db.from("crew_challenges")
      .select("id,crew_id,title,description,challenge_type,rules_version,target_count,starts_at,ends_at,visibility,status,created_at")
      .eq("crew_id", crewId).order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    const ids = (challenges || []).map(c => c.id);
    const [enrollments, completions] = ids.length ? await Promise.all([
      db.from("crew_challenge_members").select("challenge_id,target_count,status").eq("user_id", user.id).in("challenge_id", ids),
      db.from("crew_completions").select("challenge_id,activity_key,occurred_at").eq("user_id", user.id).in("challenge_id", ids),
    ]) : [{ data: [], error: null }, { data: [], error: null }];
    if (enrollments.error) throw enrollments.error;
    if (completions.error) throw completions.error;
    const progress = (challenges || []).map(c => {
      const enrollment = (enrollments.data || []).find(e => e.challenge_id === c.id);
      const events = (completions.data || []).filter(e => e.challenge_id === c.id);
      const acceptedCount = c.challenge_type === "daily_action_days"
        ? new Set(events.map(e => new Date(e.occurred_at).toISOString().slice(0, 10))).size
        : events.length;
      return { challenge_id: c.id, enrolled: !!enrollment && enrollment.status === "active",
        accepted_count: acceptedCount, target_count: enrollment?.target_count ?? c.target_count,
        completed: acceptedCount >= (enrollment?.target_count ?? c.target_count) };
    });
    return json({ challenges: challenges || [], progress });
  } catch (error) {
    console.error("[crews] challenge listing failed", error);
    return json({ error: "Could not load Crew challenges." }, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ crewId: string }> }) {
  try {
    const user = await getVerifiedSupabaseUser(req);
    if (!user || user.isAnonymous) return json({ error: "Sign in to create a challenge." }, 401);
    const { crewId } = await params;
    if (!UUID.test(crewId)) return json({ error: "Invalid Crew." }, 400);
    const body = await req.json().catch(() => null);
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const description = typeof body?.description === "string" ? body.description.trim() : "";
    const type = body?.challengeType;
    const target = Number(body?.targetCount);
    const start = Date.parse(body?.startsAt);
    const end = Date.parse(body?.endsAt);
    if (title.length < 3 || title.length > 80 || description.length > 500 ||
      !TYPES.includes(type) || !Number.isInteger(target) || target < 1 || target > 100 ||
      !Number.isFinite(start) || !Number.isFinite(end) || end <= start ||
      end - start > 90 * 24 * 60 * 60 * 1000) {
      return json({ error: "Check the title, challenge type, target (1–100), and dates (maximum 90 days)." }, 400);
    }
    const now = Date.now();
    if (start < now - 60_000 || end <= now) return json({ error: "Challenges must end in the future and cannot start in the past." }, 400);
    const db = getSupabaseAdmin();
    if (!db) return json({ error: "Crew service unavailable." }, 503);
    const { data: member, error: memberError } = await db.from("crew_members").select("role")
      .eq("crew_id", crewId).eq("user_id", user.id).eq("status", "active").maybeSingle();
    if (memberError) throw memberError;
    if (!member || !["owner", "admin"].includes(member.role)) return json({ error: "Only Crew owners and admins can create challenges." }, 403);
    const { data, error } = await db.from("crew_challenges").insert({
      crew_id: crewId, title, description, challenge_type: type, target_count: target,
      starts_at: new Date(start).toISOString(), ends_at: new Date(end).toISOString(),
      created_by: user.id, status: "draft", visibility: "crew", rules_version: 1,
    }).select("id,crew_id,title,description,challenge_type,rules_version,target_count,starts_at,ends_at,visibility,status,created_at").single();
    if (error) throw error;
    await db.from("crew_audit_events").insert({ crew_id: crewId, actor_user_id: user.id,
      event_type: "crew.challenge_created", details: { challenge_id: data.id, challenge_type: type } });
    return json({ challenge: data }, 201);
  } catch (error) {
    console.error("[crews] challenge creation failed", error);
    return json({ error: "Could not create challenge." }, 500);
  }
}


export async function PATCH(req: NextRequest, { params }: { params: Promise<{ crewId: string }> }) {
  try {
    const user = await getVerifiedSupabaseUser(req);
    if (!user || user.isAnonymous) return json({ error: "Sign in to manage challenges." }, 401);
    const { crewId } = await params;
    if (!UUID.test(crewId)) return json({ error: "Invalid Crew." }, 400);
    const body = await req.json().catch(() => null);
    const challengeId = typeof body?.challengeId === "string" ? body.challengeId : "";
    const action = body?.action;
    if (!UUID.test(challengeId) || !["activate", "cancel"].includes(action)) return json({ error: "Invalid challenge action." }, 400);
    const db = getSupabaseAdmin();
    if (!db) return json({ error: "Crew service unavailable." }, 503);
    const { data: member, error: memberError } = await db.from("crew_members").select("role")
      .eq("crew_id", crewId).eq("user_id", user.id).eq("status", "active").maybeSingle();
    if (memberError) throw memberError;
    if (!member || !["owner", "admin"].includes(member.role)) return json({ error: "Only Crew owners and admins can manage challenges." }, 403);
    const { data: challenge, error: challengeError } = await db.from("crew_challenges")
      .select("id,status,starts_at,ends_at").eq("id", challengeId).eq("crew_id", crewId).maybeSingle();
    if (challengeError) throw challengeError;
    if (!challenge) return json({ error: "Challenge not found." }, 404);
    const now = Date.now();
    if (action === "activate" && (challenge.status !== "draft" || Date.parse(challenge.ends_at) <= now)) {
      return json({ error: "Only an upcoming or current draft challenge can be activated." }, 409);
    }
    if (action === "cancel" && !["draft", "active"].includes(challenge.status)) {
      return json({ error: "This challenge can no longer be cancelled." }, 409);
    }
    const status = action === "activate" ? "active" : "cancelled";
    const { data, error } = await db.from("crew_challenges").update({ status })
      .eq("id", challengeId).eq("crew_id", crewId).select("id,status").single();
    if (error) throw error;
    await db.from("crew_audit_events").insert({ crew_id: crewId, actor_user_id: user.id,
      event_type: action === "activate" ? "crew.challenge_activated" : "crew.challenge_cancelled",
      details: { challenge_id: challengeId } });
    return json({ challenge: data });
  } catch (error) {
    console.error("[crews] challenge update failed", error);
    return json({ error: "Could not update challenge." }, 500);
  }
}
