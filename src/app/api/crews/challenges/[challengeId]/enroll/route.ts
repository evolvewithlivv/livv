import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getVerifiedSupabaseUser } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";
const json = (data: unknown, status = 200) => NextResponse.json(data, {
  status, headers: { "Cache-Control": "private, no-store, max-age=0" },
});
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest, { params }: { params: Promise<{ challengeId: string }> }) {
  try {
    const user = await getVerifiedSupabaseUser(req);
    if (!user || user.isAnonymous) return json({ error: "Sign in to join a challenge." }, 401);
    const { challengeId } = await params;
    if (!UUID.test(challengeId)) return json({ error: "Invalid challenge." }, 400);
    const db = getSupabaseAdmin();
    if (!db) return json({ error: "Crew service unavailable." }, 503);
    const { data: challenge, error } = await db.from("crew_challenges")
      .select("id,crew_id,status,starts_at,ends_at,target_count,visibility").eq("id", challengeId).maybeSingle();
    if (error) throw error;
    if (!challenge || !challenge.crew_id || challenge.visibility !== "crew") return json({ error: "Challenge not found." }, 404);
    const { data: member, error: memberError } = await db.from("crew_members").select("user_id")
      .eq("crew_id", challenge.crew_id).eq("user_id", user.id).eq("status", "active").maybeSingle();
    if (memberError) throw memberError;
    if (!member) return json({ error: "Join this Crew before enrolling." }, 403);
    const now = Date.now();
    if (challenge.status !== "active" || now < Date.parse(challenge.starts_at) || now >= Date.parse(challenge.ends_at)) {
      return json({ error: "This challenge is not currently open for enrollment." }, 409);
    }
    const { data, error: enrollError } = await db.from("crew_challenge_members").upsert({
      challenge_id: challengeId, user_id: user.id, target_count: challenge.target_count, status: "active",
    }, { onConflict: "challenge_id,user_id", ignoreDuplicates: true })
      .select("challenge_id,user_id,target_count,enrolled_at,status").maybeSingle();
    if (enrollError) throw enrollError;
    const { data: enrollment, error: readError } = data ? { data, error: null } : await db.from("crew_challenge_members")
      .select("challenge_id,user_id,target_count,enrolled_at,status").eq("challenge_id", challengeId).eq("user_id", user.id).single();
    if (readError) throw readError;
    return json({ enrollment }, 201);
  } catch (error) {
    console.error("[crews] challenge enrollment failed", error);
    return json({ error: "Could not enroll in challenge." }, 500);
  }
}
