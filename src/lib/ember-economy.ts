/**
 * LIVV Ember economy — earn slowly, redeem only on Collection, never cash out.
 *
 * Design goals:
 * - Not free money: high Embers-per-dollar and min redeem floor
 * - Same burn rate for every tier (fair); paid tiers only earn faster
 * - Server is authoritative for burns; client only displays quotes
 */

/** Embers required for $1 of Collection credit */
export const EMBERS_PER_DOLLAR = 250;

/** Minimum Embers to redeem in one checkout ($10 at current rate) */
export const MIN_REDEEM_EMBERS = 2500;

/** Hard cap on dollar credit per order */
export const MAX_CREDIT_DOLLARS = 10;

/** Max share of product subtotal that Embers can cover */
export const MAX_CREDIT_FRACTION = 0.1;

export const EMBERS_PER_DOLLAR_LABEL = `${EMBERS_PER_DOLLAR} Embers = $1`;

export function embersToDollars(embers: number): number {
  return Math.floor(Math.max(0, embers) / EMBERS_PER_DOLLAR);
}

export function dollarsToEmbers(dollars: number): number {
  return Math.floor(Math.max(0, dollars) * EMBERS_PER_DOLLAR);
}

export function formatEmberValue(embers: number): string {
  const dollars = embersToDollars(embers);
  if (dollars < 1) return `${embers.toLocaleString()} Embers`;
  return `${embers.toLocaleString()} Embers · ≈ $${dollars}`;
}

export type RedeemQuote = {
  balance: number;
  requested: number;
  applied: number;
  creditCents: number;
  creditDollars: number;
  remaining: number;
  blockedReason?: string;
};

/**
 * Pure quote for checkout UI. Does not mutate balance.
 * @param balance current Ember balance
 * @param subtotalCents product subtotal in cents (before tax/shipping)
 * @param requestedEmbers user-requested amount (or balance if omitted)
 */
export function quoteRedeem(
  balance: number,
  subtotalCents: number,
  requestedEmbers?: number,
): RedeemQuote {
  const bal = Math.max(0, Math.floor(balance));
  const sub = Math.max(0, Math.floor(subtotalCents));
  const want = Math.max(0, Math.floor(requestedEmbers ?? bal));

  if (bal < MIN_REDEEM_EMBERS) {
    return {
      balance: bal,
      requested: want,
      applied: 0,
      creditCents: 0,
      creditDollars: 0,
      remaining: bal,
      blockedReason: `Need at least ${MIN_REDEEM_EMBERS.toLocaleString()} Embers to redeem (min $10 off).`,
    };
  }

  if (sub <= 0) {
    return {
      balance: bal,
      requested: want,
      applied: 0,
      creditCents: 0,
      creditDollars: 0,
      remaining: bal,
      blockedReason: "No product total to apply Embers against.",
    };
  }

  const maxByFraction = Math.floor(sub * MAX_CREDIT_FRACTION);
  const maxByHardCap = MAX_CREDIT_DOLLARS * 100;
  const maxCreditCents = Math.min(maxByFraction, maxByHardCap, sub);
  const maxEmbersByCredit = dollarsToEmbers(maxCreditCents / 100);
  const applied = Math.min(bal, want, maxEmbersByCredit);
  // Only whole-dollar credits
  const creditDollars = embersToDollars(applied);
  const appliedWhole = dollarsToEmbers(creditDollars);
  const creditCents = creditDollars * 100;

  if (appliedWhole < MIN_REDEEM_EMBERS && want > 0) {
    return {
      balance: bal,
      requested: want,
      applied: 0,
      creditCents: 0,
      creditDollars: 0,
      remaining: bal,
      blockedReason: `This order can take at most $${(maxCreditCents / 100).toFixed(0)} in Ember credit (10% of item, max $${MAX_CREDIT_DOLLARS}).`,
    };
  }

  return {
    balance: bal,
    requested: want,
    applied: appliedWhole,
    creditCents,
    creditDollars,
    remaining: bal - appliedWhole,
  };
}

export const REDEEM_RULES_COPY = [
  `${EMBERS_PER_DOLLAR} Embers = $1 off Collection`,
  `Minimum redeem: ${MIN_REDEEM_EMBERS.toLocaleString()} Embers ($10)`,
  `Max per order: 10% of item price or $${MAX_CREDIT_DOLLARS}, whichever is lower`,
  "Same redemption rate for every tier — higher tiers only earn faster",
  "Embers are not cash and cannot be withdrawn",
] as const;
