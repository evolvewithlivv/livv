import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getVerifiedSupabaseUser } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";
const json = (data: unknown, status = 200) => NextResponse.json(data, {
  status, headers: { "Cache-Control": "private, no-store, max-age=0" },
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ crewId: string }> }) {
  try {
    const user = await getVerifiedSupabaseUser(req);
    if (!user || user.isAnonymous) return json({ error: "Sign in to invite someone." }, 401);
    const { crewId } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(crewId)) return json({ error: "Invalid Crew." }, 400);
    const body = await req.json().catch(() => ({}));
    const requestedUses = Number(body?.maxUses ?? 10);
    const maxUses = Number.isInteger(requestedUses) ? Math.max(1, Math.min(50, requestedUses)) : 10;
    const requestedHours = Number(body?.expiresInHours ?? 168);
    const expiresInHours = Number.isFinite(requestedHours) ? Math.max(1, Math.min(720, requestedHours)) : 168;
    const db = getSupabaseAdmin();
    if (!db) return json({ error: "Crew service unavailable." }, 503);

    const { data: member, error: memberError } = await db.from("crew_members")
      .select("role").eq("crew_id", crewId).eq("user_id", user.id).eq("status", "active").maybeSingle();
    if (memberError) throw memberError;
    if (!member || !["owner", "admin"].includes(member.role)) return json({ error: "Only Crew owners and admins can create invitations." }, 403);

    const { count, error: countError } = await db.from("crew_invitations")
      .select("id", { count: "exact", head: true }).eq("crew_id", crewId)
      .is("revoked_at", null).gt("expires_at", new Date().toISOString());
    if (countError) throw countError;
    if ((count || 0) >= 20) return json({ error: "This Crew has too many active invitations. Revoke an old link first." }, 429);

    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + expiresInHours * 3600000).toISOString();
    const { data: invitation, error } = await db.from("crew_invitations").insert({
      crew_id: crewId, token_hash: tokenHash, created_by: user.id,
      expires_at: expiresAt, max_uses: maxUses,
    }).select("id,crew_id,expires_at,max_uses,created_at").single();
    if (error) throw error;
    await db.from("crew_audit_events").insert({
      crew_id: crewId, actor_user_id: user.id, event_type: "crew.invitation_created",
      details: { invitation_id: invitation.id, expires_at: expiresAt, max_uses: maxUses },
    });
    const origin = new URL(req.url).origin;
    return json({ invitation, token, inviteUrl: origin + "/home/crew/join?token=" + encodeURIComponent(token) }, 201);
  } catch (error) {
    console.error("[crews] invitation creation failed", error);
    return json({ error: "Could not create invitation." }, 500);
  }
}
