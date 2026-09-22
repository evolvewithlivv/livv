import { NextRequest, NextResponse } from "next/server";
import { appUrl, getStripe, priceIdForTier, type PaidTier } from "@/lib/stripe-server";
import { getVerifiedSupabaseUser, isSupabaseServerConfigured } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";
const PAID: PaidTier[] = ["rise", "apex", "circle"];
const MAX_BODY_BYTES = 16 * 1024;

function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, { ...init, headers: { "Cache-Control": "no-store", ...(init?.headers || {}) } });
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) return json({ error: "Stripe is not configured." }, { status: 503 });
    let livvUserId: string | null = null;
    let verifiedEmail: string | null = null;
    if (isSupabaseServerConfigured()) {
      const verified = await getVerifiedSupabaseUser(req);
      if (!verified) return json({ error: "Sign-in required for checkout." }, { status: 401 });
      if (verified.isAnonymous) return json({ error: "Verify your email before checkout." }, { status: 403 });
      livvUserId = verified.id;
      verifiedEmail = verified.email;
    }
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) return json({ error: "Checkout request too large" }, { status: 413 });
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) return json({ error: "Checkout request too large" }, { status: 413 });
    let body: { tier?: string; username?: string };
    try { body = JSON.parse(rawBody); } catch { return json({ error: "Invalid JSON" }, { status: 400 }); }
    const usernameMeta = (body.username || "").slice(0, 64);
    const customerEmail = verifiedEmail || undefined;
    const base = appUrl();
    const tier = body.tier as PaidTier | undefined;
    if (!tier || !PAID.includes(tier)) return json({ error: "Invalid tier" }, { status: 400 });
    const priceId = priceIdForTier(tier);
    if (!priceId) return json({ error: "Billing is not fully configured for this plan." }, { status: 503 });
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/home/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/home/profile?billing=cancel`,
      customer_email: customerEmail,
      client_reference_id: livvUserId || undefined,
      metadata: { livv_kind: "tier", livv_tier: tier, livv_username: usernameMeta, livv_user_id: livvUserId || "" },
      subscription_data: { metadata: { livv_tier: tier, livv_username: usernameMeta, livv_user_id: livvUserId || "" } },
      allow_promotion_codes: true,
    });
    return json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("[stripe/checkout]", err instanceof Error ? err.message : err);
    return json({ error: "Checkout could not be started. Try again in a moment." }, { status: 500 });
  }
}
