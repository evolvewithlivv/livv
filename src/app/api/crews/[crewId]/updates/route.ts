import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getVerifiedSupabaseUser } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";

const json = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });

const cleanText = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";

const KINDS = new Set(["growth", "goal", "support"]);

async function requireMembership(crewId: string, userId: string) {
  const db = getSupabaseAdmin();
  if (!db) return { db: null as ReturnType<typeof getSupabaseAdmin>, member: null };
  const { data: member, error } = await db
    .from("crew_members")
    .select("role,display_name")
    .eq("crew_id", crewId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  return { db, member };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ crewId: string }> },
) {
  try {
    const user = await getVerifiedSupabaseUser(req);
    if (!user || user.isAnonymous) return json({ error: "Sign in to view Crew activity." }, 401);
    const { crewId } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(crewId)) return json({ error: "Invalid Crew." }, 400);

    const { db, member } = await requireMembership(crewId, user.id);
    if (!db) return json({ error: "Crew service unavailable." }, 503);
    if (!member) return json({ error: "Crew not found." }, 404);

    const { data: updates, error } = await db
      .from("crew_updates")
      .select("id,crew_id,author_user_id,kind,body,created_at")
      .eq("crew_id", crewId)
      .order("created_at", { ascending: false })
      .limit(40);
    if (error) throw error;

    const rows = updates || [];
    if (rows.length === 0) return json({ updates: [] });

    const authorIds = [...new Set(rows.map((r) => r.author_user_id))];
    const updateIds = rows.map((r) => r.id);

    const [{ data: members }, { data: encouragements }] = await Promise.all([
      db
        .from("crew_members")
        .select("user_id,display_name")
        .eq("crew_id", crewId)
        .eq("status", "active")
        .in("user_id", authorIds),
      db
        .from("crew_encouragements")
        .select("update_id,user_id")
        .in("update_id", updateIds),
    ]);

    const nameByUser = new Map(
      (members || []).map((m) => [m.user_id, m.display_name || "Member"]),
    );
    const countByUpdate = new Map<string, number>();
    const mine = new Set<string>();
    for (const e of encouragements || []) {
      countByUpdate.set(e.update_id, (countByUpdate.get(e.update_id) || 0) + 1);
      if (e.user_id === user.id) mine.add(e.update_id);
    }

    const payload = rows.map((r) => ({
      id: r.id,
      crew_id: r.crew_id,
      author_user_id: r.author_user_id,
      author_display_name: nameByUser.get(r.author_user_id) || "Member",
      kind: r.kind,
      body: r.body,
      created_at: r.created_at,
      encouragement_count: countByUpdate.get(r.id) || 0,
      encouraged_by_me: mine.has(r.id),
    }));

    return json({ updates: payload });
  } catch (error) {
    console.error("[crews] updates list failed", error);
    return json({ error: "Could not load activity." }, 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ crewId: string }> },
) {
  try {
    const user = await getVerifiedSupabaseUser(req);
    if (!user || user.isAnonymous) return json({ error: "Sign in to share with your Crew." }, 401);
    const { crewId } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(crewId)) return json({ error: "Invalid Crew." }, 400);

    const body = await req.json().catch(() => null);
    const text = cleanText(body?.body, 800);
    const kindRaw = typeof body?.kind === "string" ? body.kind.trim().toLowerCase() : "growth";
    const kind = KINDS.has(kindRaw) ? kindRaw : "growth";
    if (text.length < 1) return json({ error: "Write something to share." }, 400);

    const { db, member } = await requireMembership(crewId, user.id);
    if (!db) return json({ error: "Crew service unavailable." }, 503);
    if (!member) return json({ error: "Crew not found." }, 404);

    // Soft rate limit: max 12 posts per hour per member.
    const hourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count, error: countError } = await db
      .from("crew_updates")
      .select("id", { count: "exact", head: true })
      .eq("crew_id", crewId)
      .eq("author_user_id", user.id)
      .gte("created_at", hourAgo);
    if (countError) throw countError;
    if ((count || 0) >= 12) {
      return json({ error: "Take a breath. You can share again shortly." }, 429);
    }

    const { data: update, error } = await db
      .from("crew_updates")
      .insert({
        crew_id: crewId,
        author_user_id: user.id,
        kind,
        body: text,
      })
      .select("id,crew_id,author_user_id,kind,body,created_at")
      .single();
    if (error) throw error;

    await db.from("crew_audit_events").insert({
      crew_id: crewId,
      actor_user_id: user.id,
      event_type: "crew.update_created",
      details: { update_id: update.id, kind },
    });

    return json(
      {
        update: {
          ...update,
          author_display_name: member.display_name || "Member",
          encouragement_count: 0,
          encouraged_by_me: false,
        },
      },
      201,
    );
  } catch (error) {
    console.error("[crews] update create failed", error);
    return json({ error: "Could not share that update." }, 500);
  }
}
