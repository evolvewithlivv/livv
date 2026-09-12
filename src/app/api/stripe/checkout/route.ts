import { NextRequest, NextResponse } from "next/server";
import { appUrl, getStripe, priceIdForTier, type PaidTier } from "@/lib/stripe-server";
import { GRADE_META, type PackGrade } from "@/lib/packs";
import { PACK_SHOP } from "@/lib/pack-shop";
import {
  getVerifiedSupabaseUser,
  isSupabaseServerConfigured,
} from "@/lib/supabase/server-auth";

export const runtime = "nodejs";

const PAID: PaidTier[] = ["rise", "apex", "circle"];
const GRADES: PackGrade[] = [1, 2, 3, 4];
const MAX_BODY_BYTES = 16 * 1024;

function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init?.headers || {}),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return json(
        { error: "Stripe is not configured. Add STRIPE_SECRET_KEY." },
        { status: 503 }
      );
    }

    // B0: when Supabase is configured, require a verified Auth JWT (anon or linked).
    let livvUserId: string | null = null;
    let verifiedEmail: string | null = null;
    const supabaseConfigured = isSupabaseServerConfigured();

    if (supabaseConfigured) {
      const verified = await getVerifiedSupabaseUser(req);
      if (!verified) {
        return json(
          {
            error:
              "Sign-in required for checkout. Open LIVV so your identity session can attach, then try again.",
          },
          { status: 401 }
        );
      }
      livvUserId = verified.id;
      verifiedEmail = verified.email;
    }

    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return json({ error: "Checkout request too large" }, { status: 413 });
    }

    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return json({ error: "Checkout request too large" }, { status: 413 });
    }

    let body: {
      kind?: string;
      grade?: number;
      qty?: number;
      tier?: string;
      email?: string;
      username?: string;
    };
    try {
      body = JSON.parse(rawBody) as typeof body;
    } catch {
      return json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Username is display-only metadata — never treated as proof of identity.
    const usernameMeta = (body.username || "").slice(0, 64);

    // When Supabase is active, only the verified Auth email may populate Stripe.
    // Anonymous users intentionally produce no customer_email until they link an email.
    // The body email fallback exists only for legacy/no-Supabase deployments.
    const customerEmail = supabaseConfigured
      ? verifiedEmail || undefined
      : typeof body.email === "string" && body.email.includes("@")
        ? body.email.trim().toLowerCase()
        : undefined;

    const base = appUrl();

    if (body.kind === "pack") {
      const grade = body.grade as PackGrade;
      if (!GRADES.includes(grade)) {
        return json({ error: "Invalid pack" }, { status: 400 });
      }
      const qty = Math.max(1, Math.min(10, Number(body.qty) || 1));
      const shop = PACK_SHOP[grade];
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            quantity: qty,
            price_data: {
              currency: "usd",
              unit_amount: shop.priceCents,
              product_data: {
                name: GRADE_META[grade].name,
                description: shop.value,
              },
            },
          },
        ],
        success_url: `${base}/home/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/home/shop?billing=cancel`,
        customer_email: customerEmail,
        client_reference_id: livvUserId || usernameMeta || undefined,
        metadata: {
          livv_kind: "pack",
          livv_grade: String(grade),
          livv_qty: String(qty),
          livv_username: usernameMeta,
          ...(livvUserId ? { livv_user_id: livvUserId } : {}),
        },
        allow_promotion_codes: true,
      });
      return json({ url: session.url, sessionId: session.id });
    }

    const tier = body.tier as PaidTier | undefined;
    if (!tier || !PAID.includes(tier)) {
      return json({ error: "Invalid tier" }, { status: 400 });
    }

    const priceId = priceIdForTier(tier);
    if (!priceId) {
      return json(
        { error: `Missing STRIPE_PRICE_${tier.toUpperCase()} env var` },
        { status: 503 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/home/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/home/profile?billing=cancel`,
      customer_email: customerEmail,
      client_reference_id: livvUserId || usernameMeta || undefined,
      metadata: {
        livv_kind: "tier",
        livv_tier: tier,
        livv_username: usernameMeta,
        ...(livvUserId ? { livv_user_id: livvUserId } : {}),
      },
      subscription_data: {
        metadata: {
          livv_tier: tier,
          livv_username: usernameMeta,
          ...(livvUserId ? { livv_user_id: livvUserId } : {}),
        },
      },
      allow_promotion_codes: true,
    });

    return json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    console.error("[stripe/checkout]", message);
    return json({ error: message }, { status: 500 });
  }
}
