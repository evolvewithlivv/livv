import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getVerifiedSupabaseUser } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";

const json = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });

/** Author may delete their own update; owner/admin may moderate. */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ updateId: string }> },
) {
  try {
    const user = await getVerifiedSupabaseUser(req);
    if (!user || user.isAnonymous) return json({ error: "Sign in to manage updates." }, 401);
    const { updateId } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(updateId)) return json({ error: "Invalid update." }, 400);

    const db = getSupabaseAdmin();
    if (!db) return json({ error: "Crew service unavailable." }, 503);

    const { data: update, error: updateError } = await db
      .from("crew_updates")
      .select("id,crew_id,author_user_id")
      .eq("id", updateId)
      .maybeSingle();
    if (updateError) throw updateError;
    if (!update) return json({ error: "Update not found." }, 404);

    const { data: member, error: memberError } = await db
      .from("crew_members")
      .select("role")
      .eq("crew_id", update.crew_id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    if (memberError) throw memberError;
    if (!member) return json({ error: "Crew not found." }, 404);

    const isAuthor = update.author_user_id === user.id;
    const isModerator = member.role === "owner" || member.role === "admin";
    if (!isAuthor && !isModerator) {
      return json({ error: "You can only remove your own updates." }, 403);
    }

    const { error: delError } = await db.from("crew_updates").delete().eq("id", updateId);
    if (delError) throw delError;

    await db.from("crew_audit_events").insert({
      crew_id: update.crew_id,
      actor_user_id: user.id,
      event_type: "crew.update_deleted",
      details: { update_id: updateId, author_user_id: update.author_user_id },
    });

    return json({ ok: true });
  } catch (error) {
    console.error("[crews] update delete failed", error);
    return json({ error: "Could not remove that update." }, 500);
  }
}
