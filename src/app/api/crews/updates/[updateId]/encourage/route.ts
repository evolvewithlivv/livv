import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getVerifiedSupabaseUser } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";

const json = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ updateId: string }> },
) {
  try {
    const user = await getVerifiedSupabaseUser(req);
    if (!user || user.isAnonymous) return json({ error: "Sign in to encourage someone." }, 401);
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

    // Toggle: if already encouraged, remove; otherwise add.
    const { data: existing } = await db
      .from("crew_encouragements")
      .select("update_id")
      .eq("update_id", updateId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      const { error: delError } = await db
        .from("crew_encouragements")
        .delete()
        .eq("update_id", updateId)
        .eq("user_id", user.id);
      if (delError) throw delError;
      const { count } = await db
        .from("crew_encouragements")
        .select("update_id", { count: "exact", head: true })
        .eq("update_id", updateId);
      return json({ encouraged: false, encouragement_count: count || 0 });
    }

    const { error: insertError } = await db.from("crew_encouragements").insert({
      update_id: updateId,
      user_id: user.id,
    });
    if (insertError) throw insertError;

    const { count } = await db
      .from("crew_encouragements")
      .select("update_id", { count: "exact", head: true })
      .eq("update_id", updateId);

    return json({ encouraged: true, encouragement_count: count || 0 }, 201);
  } catch (error) {
    console.error("[crews] encourage failed", error);
    return json({ error: "Could not record encouragement." }, 500);
  }
}
