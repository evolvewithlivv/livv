import { NextRequest, NextResponse } from "next/server";
import { appUrl, getStripe } from "@/lib/stripe-server";

export const runtime = "nodejs";

/** Opens Stripe Customer Portal so users can cancel / update payment method. */
export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const body = (await req.json()) as { customerId?: string };
    if (!body.customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: body.customerId,
      return_url: `${appUrl()}/home/profile`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Portal failed";
    console.error("[stripe/portal]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
