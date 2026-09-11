import { loadIdentity } from "./identity";
import { ensureAnonymousSession } from "./supabase/anon-session";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./supabase/client";
import { GRADE_META, type PackGrade, loadPacks, savePacks, type OwnedPack } from "./packs";

export const PACK_SHOP: Record<
  PackGrade,
  { price: string; priceCents: number; value: string }
> = {
  1: { price: "$4", priceCents: 400, value: "Spark pull" },
  2: { price: "$9", priceCents: 900, value: "Rise pull" },
  3: { price: "$19", priceCents: 1900, value: "Signal pull" },
  4: { price: "$39", priceCents: 3900, value: "Apex pull" },
};

async function checkoutAuthHeader(): Promise<Record<string, string>> {
  if (!isSupabaseConfigured()) return {};
  try {
    await ensureAnonymousSession();
    const client = getSupabaseBrowserClient();
    if (!client) return {};
    const { data } = await client.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

export function grantPurchasedPack(grade: PackGrade, qty = 1) {
  const state = loadPacks();
  const now = Date.now();
  const added: OwnedPack[] = [];
  for (let i = 0; i < qty; i++) {
    added.push({
      id: `pack_${now}_${grade}_${i}_${Math.random().toString(36).slice(2, 7)}`,
      grade,
      acquiredAt: now,
      opened: false,
      source: "purchase",
    });
  }
  state.pending = [...added, ...state.pending];
  savePacks(state);
  return added;
}

/** Start Stripe Checkout for a pack grade, or grant locally if Stripe is offline. */
export async function buyPack(
  grade: PackGrade
): Promise<{ ok: boolean; error?: string; local?: boolean }> {
  const me = loadIdentity();
  const publishable = Boolean(
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
  if (publishable) {
    try {
      const authHeader = await checkoutAuthHeader();
      if (isSupabaseConfigured() && !authHeader.Authorization) {
        return {
          ok: false,
          error: "Identity session missing. Reload LIVV and try again.",
        };
      }
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
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

export function packShopLabel(grade: PackGrade) {
  return GRADE_META[grade].name;
}
