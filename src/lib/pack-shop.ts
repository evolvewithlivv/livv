import { loadIdentity } from "./identity";
import { isStripeConfigured } from "./billing";
import { loadPacks, savePacks, type PackGrade, type PackState } from "./packs";

export const PACK_SHOP: Record<
  PackGrade,
  { priceCents: number; price: string; value: string }
> = {
  1: {
    priceCents: 249,
    price: "$2.49",
    value: "Optional. Vault seed. A small vote toward the first merch cut.",
  },
  2: {
    priceCents: 999,
    price: "$9.99",
    value: "Optional. Elevated floor. Helps a garment reach someone who already lives this.",
  },
  3: {
    priceCents: 4999,
    price: "$49.99",
    value: "Optional. Rare floor. This is how the physical drop finds the right bodies.",
  },
  4: {
    priceCents: 9900,
    price: "$99.00",
    value: "Optional. Apex-weighted. This is how LIVV leaves the phone.",
  },
};

export function grantPurchasedPack(grade: PackGrade, qty = 1): PackState {
  const state = loadPacks();
  const now = Date.now();
  const n = Math.max(1, Math.min(10, qty));
  for (let i = 0; i < n; i++) {
    state.pending.push({
      id: `buy_${grade}_${now}_${i}_${Math.random().toString(36).slice(2, 6)}`,
      grade,
      grantedAt: now,
    });
  }
  savePacks(state);
  return state;
}

export async function buyPack(grade: PackGrade): Promise<{ ok: boolean; error?: string; local?: boolean }> {
  if (typeof window === "undefined") return { ok: false, error: "client only" };
  const me = loadIdentity();

  if (isStripeConfigured()) {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "pack", grade, qty: 1, username: me.username }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) return { ok: false, error: data.error || "Checkout unavailable" };
      window.location.href = data.url;
      return { ok: true };
    } catch {
      return { ok: false, error: "Network error starting checkout" };
    }
  }

  grantPurchasedPack(grade);
  return { ok: true, local: true };
}
