import Stripe from "stripe";

let stripe: Stripe | null = null;

function clean(value: string | undefined) {
  return (value || "").trim().replace(/^['"]|['"]$/g, "");
}

/** Server-only Stripe client. Returns null if secret key is missing. */
export function getStripe(): Stripe | null {
  const key = clean(process.env.STRIPE_SECRET_KEY);
  if (!key) return null;
  if (!stripe) {
    stripe = new Stripe(key, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
      maxNetworkRetries: 3,
      timeout: 30000,
      // Vercel serverless + stripe@17 default fetch client can fail
      // with "connection to Stripe... retried 2 times".
      httpClient: Stripe.createNodeHttpClient(),
    });
  }
  return stripe;
}

export function appUrl() {
  const raw =
    clean(process.env.NEXT_PUBLIC_APP_URL) ||
    clean(process.env.VERCEL_URL) ||
    "http://localhost:3000";
  if (raw.startsWith("http")) return raw.replace(/\/$/, "");
  return `https://${raw.replace(/\/$/, "")}`;
}

export type PaidTier = "rise" | "apex" | "circle";

export function priceIdForTier(tier: PaidTier): string | null {
  const map: Record<PaidTier, string | undefined> = {
    rise: clean(process.env.STRIPE_PRICE_RISE) || undefined,
    apex: clean(process.env.STRIPE_PRICE_APEX) || undefined,
    circle: clean(process.env.STRIPE_PRICE_CIRCLE) || undefined,
  };
  return map[tier] || null;
}

export function tierFromPriceId(priceId: string | undefined | null): PaidTier | null {
  if (!priceId) return null;
  if (priceId === clean(process.env.STRIPE_PRICE_RISE)) return "rise";
  if (priceId === clean(process.env.STRIPE_PRICE_APEX)) return "apex";
  if (priceId === clean(process.env.STRIPE_PRICE_CIRCLE)) return "circle";
  return null;
}
