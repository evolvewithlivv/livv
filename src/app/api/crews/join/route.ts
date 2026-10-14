import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getVerifiedSupabaseUser } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";
const json = (data: unknown, status = 200) => NextResponse.json(data, {
  status, headers: { "Cache-Control": "private, no-store, max-age=0" },
});

export async function POST(req: NextRequest) {
  try {
    const user = await getVerifiedSupabaseUser(req);
    if (!user || user.isAnonymous) return json({ error: "Sign in to join a Crew." }, 401);
    const body = await req.json().catch(() => null);
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return json({ error: "Invalid invitation link." }, 400);
    const db = getSupabaseAdmin();
    if (!db) return json({ error: "Crew service unavailable." }, 503);
    const { data: profile } = await db.from("profiles").select("display_name,username")
      .eq("id", user.id).maybeSingle();
    const displayName = String(profile?.display_name || profile?.username || "Member").trim().slice(0,60) || "Member";
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const { data, error } = await db.rpc("crew_accept_invitation", {
      p_token_hash: tokenHash, p_user_id: user.id, p_display_name: displayName,
    });
    if (error) {
      const message = error.message || "";
      if (/invitation unavailable|crew unavailable|invalid invitation/i.test(message)) {
        return json({ error: "This invitation is invalid, expired, revoked, or full." }, 410);
      }
      if (/membership limit/i.test(message)) return json({ error: "You have reached the Crew membership limit." }, 429);
      throw error;
    }
    return json({ ok: true, crewId: data?.crew_id, alreadyMember: data?.already_member === true });
  } catch (error) {
    console.error("[crews] invitation redemption failed", error);
    return json({ error: "Could not join this Crew." }, 500);
  }
}
