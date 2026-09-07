"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag, Sparkles } from "lucide-react";
import { PackFoil } from "@/components/packs/pack-foil";
import { PackOpenModal } from "@/components/packs/pack-open";
import { loadPacks, GRADE_META, collectionStats, formatCountdown, msUntilNextPack, canClaimPacks, claimPacksIfDue, type PackGrade, type PendingPack } from "@/lib/packs";
import { buyPack, PACK_SHOP } from "@/lib/pack-shop";
import { isStripeConfigured } from "@/lib/billing";
import { loadIdentity, type Identity } from "@/lib/identity";
import { feedback } from "@/lib/sensory";

const SHOP_URL = "https://n8tv6p-pu.myshopify.com";

const PRODUCTS = [
  { name: "Essential Long Sleeve Tee", subtitle: "Black / White Logo", price: "$44.99", image: "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/unisex-long-sleeve-tee-black-heather-front-6a9eead841a4c.png?v=1788799728", href: `${SHOP_URL}/products/livv-essential-long-sleeve-tee-1` },
  { name: "Essential Long Sleeve Tee", subtitle: "White / Black Logo", price: "$44.99", image: "https://cdn.shopify.com/s/files/1/1091/3644/5726/files/unisex-long-sleeve-tee-white-front-6a9ee93df3eae.png?v=1788799311", href: `${SHOP_URL}/products/livv-essential-long-sleeve-tee` },
];

export default function ShopPage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [pending, setPending] = useState<PendingPack[]>([]);
  const [msLeft, setMsLeft] = useState(0);
  const [opening, setOpening] = useState<PendingPack | null>(null);
  const [stats, setStats] = useState({ uniqueCount: 0, catalogSize: 16 });
  const [buying, setBuying] = useState<PackGrade | null>(null);

  const sync = () => {
    const id = loadIdentity(); setMe(id);
    if (canClaimPacks(id.tier)) claimPacksIfDue();
    const state = loadPacks(); setPending(state.pending); setStats(collectionStats()); setMsLeft(msUntilNextPack(id.tier));
  };

  useEffect(() => {
    sync();
    const timer = window.setInterval(() => {
      const id = loadIdentity(); const left = msUntilNextPack(id.tier); setMsLeft(left);
      if (left <= 0 && canClaimPacks(id.tier)) { claimPacksIfDue(); sync(); }
    }, 1000);
    window.addEventListener("livv-packs", sync); window.addEventListener("livv-identity", sync);
    return () => { window.clearInterval(timer); window.removeEventListener("livv-packs", sync); window.removeEventListener("livv-identity", sync); };
  }, []);

  const collectionPct = Math.round((stats.uniqueCount / Math.max(1, stats.catalogSize)) * 100);
  const ready = pending.length > 0;

  async function handlePackBuy(grade: PackGrade) {
    feedback("tick"); setBuying(grade);
    try { const out = await buyPack(grade); if (out.local) { feedback("unlock"); sync(); } }
    finally { setBuying(null); }
  }

  return (
    <main className="livv-page relative min-h-full overflow-hidden text-white">
      <div className="relative z-10 mx-auto max-w-xl px-5 pt-7">
        <header>
          <p className="text-[9px] font-semibold uppercase tracking-[0.34em] text-[#ff9f43]">LIVV Shop</p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-[38px] font-semibold leading-none tracking-[-0.055em]">The physical layer.</h1>
              <p className="mt-3 max-w-[34ch] text-[13px] leading-relaxed text-white/45">Wear the standard. Collect the system. Everything physical lives here.</p>
            </div>
            <ShoppingBag className="mb-1 shrink-0 text-[#ff9f43]" size={25} strokeWidth={1.7} />
          </div>
        </header>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between px-1">
            <div><p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-white/30">Essentials</p><h2 className="font-display mt-1 text-[22px] font-semibold">Wear the evolution.</h2></div>
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#ff9f43]">{PRODUCTS.length} pieces</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {PRODUCTS.map((product) => (
              <a key={product.href} href={product.href} className="livv-glass group overflow-hidden rounded-[28px] transition active:scale-[0.98]">
                <div className="relative aspect-[4/5] overflow-hidden bg-white/[0.025]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image} alt={`${product.name} — ${product.subtitle}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#030405] to-transparent" />
                </div>
                <div className="p-4"><p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#ff9f43]">Essential</p><h3 className="mt-1 text-[14px] font-semibold leading-tight">{product.name}</h3><p className="mt-1 text-[11px] text-white/40">{product.subtitle}</p><div className="mt-4 flex items-center justify-between"><span className="text-[13px] font-semibold">{product.price}</span><span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/60 group-hover:border-[#ff9f43]/35 group-hover:text-[#ff9f43]"><ArrowUpRight size={15} /></span></div></div>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="livv-glass overflow-hidden rounded-[32px] p-5">
            <div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#ff9f43]">Evolution packs</p><h2 className="font-display mt-2 text-[27px] font-semibold tracking-[-0.04em]">Collect the signal.</h2><p className="mt-2 max-w-[34ch] text-[12px] leading-relaxed text-white/40">Packs now live inside Shop. Membership can grant packs automatically; paid pulls are optional.</p></div><Sparkles className="mt-1 shrink-0 text-[#ff9f43]" size={22} strokeWidth={1.6} /></div>
            <div className="mt-5 rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-4">
              <div className="flex items-center justify-between gap-3"><div><p className="text-[9px] uppercase tracking-[0.25em] text-white/25">Your next drop</p><p className="font-display mt-1 text-2xl font-semibold">{ready ? `${pending.length} ready` : formatCountdown(msLeft)}</p></div><div className="text-right"><p className="text-[9px] uppercase tracking-[0.2em] text-white/25">Archive</p><p className="mt-1 text-sm font-semibold">{stats.uniqueCount}<span className="text-white/25">/{stats.catalogSize}</span></p></div></div>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-[#ff9f43] transition-all duration-700" style={{ width: `${collectionPct}%` }} /></div>
              {ready && <div className="mt-5 flex gap-4 overflow-x-auto pb-1 scrollbar-none">{pending.map((pack) => <button key={pack.id} type="button" onClick={() => { feedback("tick"); setOpening(pack); }} className="shrink-0 text-center"><PackFoil grade={pack.grade} size="sm" pulse /><p className="mt-2 text-[9px] uppercase tracking-[0.16em] text-white/40">{GRADE_META[pack.grade].name.replace(" Pack", "")}</p></button>)}</div>}
            </div>
            <div className="mt-5 space-y-2.5">
              {([1, 2, 3, 4] as PackGrade[]).map((grade) => { const meta = GRADE_META[grade]; const shop = PACK_SHOP[grade]; return <div key={grade} className="rounded-[24px] border border-white/[0.07] bg-white/[0.02] p-4"><div className="flex items-center gap-3"><PackFoil grade={grade} size="sm" /><div className="min-w-0 flex-1"><div className="flex items-baseline justify-between gap-3"><p className="text-[15px] font-semibold">{meta.name}</p><p className="text-[15px] font-semibold">{shop.price}</p></div><p className="mt-1 text-[11px] leading-relaxed text-white/35">{meta.subtitle} · {shop.value}</p></div></div><button type="button" disabled={buying !== null} onClick={() => handlePackBuy(grade)} className="mt-3 w-full rounded-full bg-white py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-black disabled:opacity-50">{buying === grade ? "Opening checkout…" : isStripeConfigured() ? `Buy ${shop.price}` : `Add ${shop.price} pack`}</button></div>; })}
            </div>
          </div>
        </section>

        <Link href="/home/vault" className="livv-glass mt-4 flex items-center justify-between rounded-[28px] px-5 py-4 transition active:scale-[0.99]"><div><p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#ff9f43]">Your archive</p><p className="mt-1 text-[13px] font-medium text-white/75">Open the vault</p></div><ArrowUpRight size={18} className="text-[#ff9f43]" /></Link>
        <a href={SHOP_URL} className="mt-3 flex items-center justify-center rounded-full border border-[#ff9f43]/20 bg-[#ff9f43]/[0.06] py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ff9f43]">Open full storefront</a>
        <p className="mt-6 pb-4 text-center text-[9px] uppercase tracking-[0.22em] text-white/20">Built to evolve with you</p>
      </div>
      {opening && <PackOpenModal packId={opening.id} grade={opening.grade} onClose={() => { setOpening(null); sync(); }} />}
    </main>
  );
}
