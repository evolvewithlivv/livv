import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSupabaseUser, isSupabaseServerConfigured } from "@/lib/supabase/server-auth";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  if (!isSupabaseServerConfigured() || !isSupabaseAdminConfigured()) return NextResponse.json({ error: "Billing unavailable" }, { status: 503 });
  const user = await getVerifiedSupabaseUser(req);
  if (!user || user.isAnonymous) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Billing unavailable" }, { status: 503 });
  const { data, error } = await admin.from("entitlements").select("tier,status,stripe_customer_id,stripe_subscription_id,current_period_end").eq("user_id", user.id).maybeSingle();
  if (error) {
    console.error("[stripe/entitlement]", error.message);
    return NextResponse.json({ error: "Could not load membership" }, { status: 500 });
  }
  const active = data && ["active", "trialing"].includes(data.status) && ["rise", "apex", "circle"].includes(data.tier);
  return NextResponse.json(active ? data : { tier: "spark", status: data?.status || "inactive", stripe_customer_id: null, stripe_subscription_id: null, current_period_end: null }, { headers: { "Cache-Control": "no-store" } });
}
