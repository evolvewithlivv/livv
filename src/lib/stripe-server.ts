import Stripe from "stripe";

let stripe: Stripe | null = null;

/** Server-only Stripe client. Returns null if secret key is missing. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripe) {
    stripe = new Stripe(key, {
      apiVersion: "2024-11-20.acacia",
      typescript: true,
    });
  }
  return stripe;
}

export function appUrl() {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";
  if (raw.startsWith("http")) return raw.replace(/\/$/, "");
  return `https://${raw.replace(/\/$/, "")}`;
}

export type PaidTier = "rise" | "apex" | "circle";

export function priceIdForTier(tier: PaidTier): string | null {
  const map: Record<PaidTier, string | undefined> = {
    rise: process.env.STRIPE_PRICE_RISE,
    apex: process.env.STRIPE_PRICE_APEX,
    circle: process.env.STRIPE_PRICE_CIRCLE,
  };
  return map[tier] || null;
}

export function tierFromPriceId(priceId: string | undefined | null): PaidTier | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_RISE) return "rise";
  if (priceId === process.env.STRIPE_PRICE_APEX) return "apex";
  if (priceId === process.env.STRIPE_PRICE_CIRCLE) return "circle";
  return null;
}
