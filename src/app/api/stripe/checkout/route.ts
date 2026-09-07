import { NextRequest, NextResponse } from "next/server";
import { appUrl, getStripe, priceIdForTier, type PaidTier } from "@/lib/stripe-server";
import { GRADE_META, type PackGrade } from "@/lib/packs";
import { PACK_SHOP } from "@/lib/pack-shop";

export const runtime = "nodejs";

const PAID: PaidTier[] = ["rise", "apex", "circle"];
const GRADES: PackGrade[] = [1, 2, 3, 4];

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured. Add STRIPE_SECRET_KEY." },
        { status: 503 }
      );
    }

    const body = (await req.json()) as {
      kind?: string;
      grade?: number;
      qty?: number;
      tier?: string;
      email?: string;
      username?: string;
    };

    const base = appUrl();

    if (body.kind === "pack") {
      const grade = body.grade as PackGrade;
      if (!GRADES.includes(grade)) {
        return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
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
        cancel_url: `${base}/home/packs?billing=cancel`,
        customer_email: body.email || undefined,
        client_reference_id: body.username || undefined,
        metadata: {
          livv_kind: "pack",
          livv_grade: String(grade),
          livv_qty: String(qty),
          livv_username: body.username || "",
        },
        allow_promotion_codes: true,
      });
      return NextResponse.json({ url: session.url, sessionId: session.id });
    }

    const tier = body.tier as PaidTier | undefined;
    if (!tier || !PAID.includes(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const priceId = priceIdForTier(tier);
    if (!priceId) {
      return NextResponse.json(
        { error: `Missing STRIPE_PRICE_${tier.toUpperCase()} env var` },
        { status: 503 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/home/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/home/profile?billing=cancel`,
      customer_email: body.email || undefined,
      client_reference_id: body.username || undefined,
      metadata: {
        livv_kind: "tier",
        livv_tier: tier,
        livv_username: body.username || "",
      },
      subscription_data: {
        metadata: {
          livv_tier: tier,
          livv_username: body.username || "",
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    console.error("[stripe/checkout]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
