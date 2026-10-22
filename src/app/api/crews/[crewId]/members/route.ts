import { NextRequest, NextResponse } from "next/server";
import { isUuid } from "@/lib/request-guards";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getVerifiedSupabaseUser } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";
const json = (data: unknown, status = 200) => NextResponse.json(data, {
  status, headers: { "Cache-Control": "private, no-store, max-age=0" },
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ crewId: string }> }) {
  try {
    const user = await getVerifiedSupabaseUser(req);
    if (!user || user.isAnonymous) return json({ error: "Sign in to view Crew members." }, 401);
    const { crewId } = await params;
    if (!isUuid(crewId)) return json({ error: "Invalid Crew." }, 400);
    const db = getSupabaseAdmin();
    if (!db) return json({ error: "Crew service unavailable." }, 503);
    const { data: access, error: accessError } = await db.from("crew_members").select("role")
      .eq("crew_id", crewId).eq("user_id", user.id).eq("status", "active").maybeSingle();
    if (accessError) throw accessError;
    if (!access) return json({ error: "Crew not found." }, 404);
    const { data, error } = await db.from("crew_members")
      .select("crew_id,user_id,role,status,display_name,joined_at")
      .eq("crew_id", crewId).eq("status", "active").order("joined_at", { ascending: true });
    if (error) throw error;
    return json({ members: data || [] });
  } catch (error) {
    console.error("[crews] roster failed", error);
    return json({ error: "Could not load Crew members." }, 500);
  }
}
