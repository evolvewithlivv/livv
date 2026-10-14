import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getVerifiedSupabaseUser } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";
const json = (data: unknown, status = 200) => NextResponse.json(data, {
  status, headers: { "Cache-Control": "private, no-store, max-age=0" },
});
const cleanText = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";

export async function GET(req: NextRequest) {
  try {
    const user = await getVerifiedSupabaseUser(req);
    if (!user || user.isAnonymous) return json({ error: "Sign in to view your Crews." }, 401);
    const db = getSupabaseAdmin();
    if (!db || !isSupabaseAdminConfigured()) return json({ error: "Crew service unavailable." }, 503);
    const { data, error } = await db.from("crew_members")
      .select("role,joined_at,crews!inner(id,name,description,created_by,status,created_at,updated_at)")
      .eq("user_id", user.id).eq("status", "active").eq("crews.status", "active")
      .order("joined_at", { ascending: false });
    if (error) throw error;
    const crews = (data || []).map((row: any) => ({
      ...row.crews, role: row.role, joined_at: row.joined_at,
    }));
    return json({ crews });
  } catch (error) {
    console.error("[crews] list failed", error);
    return json({ error: "Could not load Crews." }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getVerifiedSupabaseUser(req);
    if (!user || user.isAnonymous) return json({ error: "Sign in to create a Crew." }, 401);
    const body = await req.json().catch(() => null);
    const name = cleanText(body?.name, 40);
    const description = cleanText(body?.description, 240);
    if (name.length < 2) return json({ error: "Crew name must be at least 2 characters." }, 400);
    const db = getSupabaseAdmin();
    if (!db || !isSupabaseAdminConfigured()) return json({ error: "Crew service unavailable." }, 503);

    const { data: profile } = await db.from("profiles")
      .select("display_name,username").eq("id", user.id).maybeSingle();
    const displayName = cleanText(profile?.display_name || profile?.username || "Member", 60) || "Member";

    const { count, error: countError } = await db.from("crew_members")
      .select("crew_id", { count: "exact", head: true })
      .eq("user_id", user.id).eq("status", "active");
    if (countError) throw countError;
    if ((count || 0) >= 20) return json({ error: "You have reached the current Crew membership limit." }, 429);

    const { data: crew, error: crewError } = await db.from("crews")
      .insert({ name, description, created_by: user.id }).select("*").single();
    if (crewError) throw crewError;

    const { error: memberError } = await db.from("crew_members").insert({
      crew_id: crew.id, user_id: user.id, role: "owner", display_name: displayName, status: "active",
    });
    if (memberError) {
      await db.from("crews").delete().eq("id", crew.id);
      throw memberError;
    }
    await db.from("crew_audit_events").insert({
      crew_id: crew.id, actor_user_id: user.id, event_type: "crew.created", details: { name },
    });
    return json({ crew: { ...crew, role: "owner", joined_at: new Date().toISOString() } }, 201);
  } catch (error) {
    console.error("[crews] create failed", error);
    return json({ error: "Could not create Crew." }, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getVerifiedSupabaseUser(req);
    if (!user || user.isAnonymous) return json({ error: "Sign in to manage Crews." }, 401);
    const { crewId } = await req.json().catch(() => ({}));
    if (typeof crewId !== "string" || !/^[0-9a-f-]{36}$/i.test(crewId)) return json({ error: "Invalid Crew." }, 400);
    const db = getSupabaseAdmin();
    if (!db) return json({ error: "Crew service unavailable." }, 503);

    const { data: member, error } = await db.from("crew_members").select("role")
      .eq("crew_id", crewId).eq("user_id", user.id).eq("status", "active").maybeSingle();
    if (error) throw error;
    if (!member) return json({ error: "Crew not found." }, 404);

    if (member.role === "owner") {
      const { count, error: countError } = await db.from("crew_members")
        .select("user_id", { count: "exact", head: true })
        .eq("crew_id", crewId).eq("status", "active");
      if (countError) throw countError;
      if ((count || 0) > 1) {
        return json({
          error: "You are the owner. Ask another member to take over, or leave only when you are the last member.",
        }, 409);
      }
      // Sole owner: leave and archive the Crew so it no longer appears for anyone.
      const { error: leaveError } = await db.from("crew_members").update({
        status: "left", left_at: new Date().toISOString(),
      }).eq("crew_id", crewId).eq("user_id", user.id);
      if (leaveError) throw leaveError;
      await db.from("crews").update({
        status: "archived", updated_at: new Date().toISOString(),
      }).eq("id", crewId);
      await db.from("crew_audit_events").insert({
        crew_id: crewId, actor_user_id: user.id, event_type: "crew.archived_by_sole_owner",
      });
      return json({ ok: true, archived: true });
    }

    const { error: leaveError } = await db.from("crew_members").update({
      status: "left", left_at: new Date().toISOString(),
    }).eq("crew_id", crewId).eq("user_id", user.id);
    if (leaveError) throw leaveError;
    await db.from("crew_audit_events").insert({
      crew_id: crewId, actor_user_id: user.id, event_type: "crew.member_left",
    });
    return json({ ok: true });
  } catch (error) {
    console.error("[crews] leave failed", error);
    return json({ error: "Could not leave Crew." }, 500);
  }
}
