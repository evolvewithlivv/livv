import { loadPacks, savePacks, type PackGrade, type PackState } from "./packs";

export const PACK_SHOP: Record<
  PackGrade,
  { priceCents: number; price: string; value: string }
> = {
  1: {
    priceCents: 249,
    price: "$2.49",
    value: "Entry foil. Commons plus a shot at Elevated. Vault seed.",
  },
  2: {
    priceCents: 599,
    price: "$5.99",
    value: "Elevated floor. Better odds at Rare. The pack most people should buy.",
  },
  3: {
    priceCents: 1199,
    price: "$11.99",
    value: "Rare floor. Apex can show. This is the status pack.",
  },
  4: {
    priceCents: 2499,
    price: "$24.99",
    value: "Apex-weighted. Purchase only. Future cosmetics and trades start here.",
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
