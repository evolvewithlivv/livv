"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Crown,
  Flame,
  Settings2,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { Avatar } from "@/components/identity/avatar";
import { AmbientField } from "@/components/layout/ambient-field";
import {
  fileToPhoto,
  loadIdentity,
  patchIdentity,
  type Identity,
  type LivvTier,
} from "@/lib/identity";
import { TIERS, getTier } from "@/lib/membership";
import { liveAchievements, loadRecord, type LivvRecord } from "@/lib/record";
import { evolutionTitle } from "@/lib/levels";
import { EMBERS_BLURB } from "@/lib/embers";
import { collectionStats } from "@/lib/packs";
import { tierColor } from "@/lib/tier-style";
import { feedback } from "@/lib/sensory";
import {
  paidTierMessage,
  requestTierChange,
  isDemoUnlock,
  enableDemoUnlock,
  isStripeConfigured,
  startCheckout,
  openBillingPortal,
  loadEntitlements,
} from "@/lib/billing";

function EmberIcon({ size = 16 }: { size?: number }) {
  return (
    <Flame
      size={size}
      strokeWidth={2.2}
      style={{ color: "#ff8a2a", flexShrink: 0 }}
    />
  );
}

export default function ProfilePage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [picked, setPicked] = useState<LivvTier | null>(null);
  const [billingNote, setBillingNote] = useState<string | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [vault, setVault] = useState({
    uniqueCount: 0,
    catalogSize: 16,
    pending: 0,
    totalOpened: 0,
  });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => {
      setMe(loadIdentity());
      setRec(loadRecord());
      setVault(collectionStats());
    };
    sync();
    window.addEventListener("livv-identity", sync);
    window.addEventListener("livv-record", sync);
    window.addEventListener("livv-packs", sync);
    window.addEventListener("livv-billing", sync);
    return () => {
      window.removeEventListener("livv-identity", sync);
      window.removeEventListener("livv-record", sync);
      window.removeEventListener("livv-packs", sync);
      window.removeEventListener("livv-billing", sync);
    };
  }, []);

  if (!me || !rec) return <main className="min-h-dvh bg-[#050505]" />;

  const evo = evolutionTitle(rec.level);
  const xpPct = Math.min(100, Math.round((rec.currentXp / rec.xpToNext) * 100));
  const achievements = liveAchievements(rec).filter((a) => a.unlocked);
  const tc = tierColor(me.tier);
  const entitlements = loadEntitlements();
  const stripeLive = isStripeConfigured();

  const onPickPhoto = async (file?: File) => {
    if (!file) return;
    feedback("tick");
    setMe(patchIdentity({ photo: await fileToPhoto(file) }));
  };

  const tryClaim = async (id: LivvTier) => {
    if (id === me.tier) return;
    const result = requestTierChange(id);
    if (result.ok) {
      feedback("unlock");
      setMe(loadIdentity());
      setPicked(null);
      setBillingNote(null);
      return;
    }
    if (id !== "spark" && stripeLive) {
      setCheckoutBusy(true);
      setBillingNote("Opening secure checkout…");
      feedback("tick");
      const out = await startCheckout(id);
      if (!out.ok) {
        setCheckoutBusy(false);
        setBillingNote(out.error || paidTierMessage(id));
      }
      return;
    }
    setBillingNote(paidTierMessage(id));
    feedback("tick");
  };

  const manageBilling = async () => {
    setBillingNote(null);
    const out = await openBillingPortal();
    if (!out.ok) setBillingNote(out.error || "Could not open billing portal.");
  };

  const ctaLabel = (id: LivvTier) => {
    if (me.tier === id) return "Current tier";
    if (id === "spark") return "Switch to Spark";
    if (isDemoUnlock()) return "Unlock this tier";
    if (stripeLive) return checkoutBusy ? "Redirecting…" : "Continue to checkout";
    return "Billing not connected yet";
  };

  return (
    <main className="relative min-h-full overflow-hidden pb-28">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute left-1/2 top-[-90px] h-[480px] w-[480px] -translate-x-1/2 rounded-full" style={{ background: `radial-gradient(circle, ${tc.glow}, transparent 68%)` }} />
        <AmbientField />
      </div>
      <div className="relative z-10 mx-auto max-w-lg px-5 pt-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-white/30">Identity</p>
            <p className="mt-1 text-[13px] text-white/45">Your place in LIVV.</p>
          </div>
          <Link href="/home/settings" aria-label="Settings" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/55 backdrop-blur-xl">
            <Settings2 size={17} />
          </Link>
        </header>
        <section className="relative mt-8 overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035] px-6 pb-6 pt-7 text-center shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-x-10 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${tc.hex}, transparent)` }} />
          <button type="button" onClick={() => fileRef.current?.click()} className="relative mx-auto block rounded-full">
            <Avatar identity={me} size={112} showTierRing />
            <span className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full border-4 border-[#08090b] bg-white text-black shadow-xl">
              <Sparkles size={13} />
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPickPhoto(e.target.files?.[0])} />
          <h1 className="font-display mt-5 text-[31px] font-semibold tracking-tight">{me.displayName}</h1>
          <p className="mt-0.5 text-[14px] text-white/35">@{me.username}</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: tc.hex, borderColor: `${tc.hex}44`, background: `${tc.hex}12` }}>
            <Crown size={12} /> {tc.label}
          </div>
          {me.bio && <p className="mx-auto mt-4 max-w-[30ch] text-[14px] leading-relaxed text-white/50">{me.bio}</p>}
          <div className="mt-7 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/8 bg-black/20 py-4">
            <Stat value={`${rec.streak}d`} label="streak" icon={<Flame size={13} />} />
            <Stat value={String(rec.level)} label="level" icon={<Zap size={13} />} />
            <Stat value={String(me.embers)} label="embers" icon={<EmberIcon size={13} />} />
          </div>
        </section>
        <section className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/30">Current evolution</p>
              <p className="font-display mt-1 text-[27px] font-semibold">{evo.name}</p>
            </div>
            <p className="text-[12px] text-white/35">{rec.currentXp} / {rec.xpToNext} XP</p>
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-white/40">{evo.line}</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
            <div className="h-full rounded-full bg-livv-accent shadow-[0_0_18px_rgb(var(--livv-accent)/0.65)] transition-all" style={{ width: `${xpPct}%` }} />
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] text-white/30">
            <span>{xpPct}% to next level</span>
            <Link href="/home/progress" className="font-medium text-livv-accent-soft">Open evolution <ArrowRight size={12} className="ml-1 inline" /></Link>
          </div>
        </section>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link href="/home/progress" className="group rounded-[24px] border border-white/8 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]">
            <Trophy size={18} className="text-livv-accent-soft" />
            <p className="mt-7 text-[15px] font-semibold">Progress</p>
            <p className="mt-1 text-[11px] text-white/35">Chapters & milestones</p>
            <ChevronRight size={15} className="mt-3 text-white/25 transition group-hover:translate-x-1" />
          </Link>
          <Link href="/home/vault" className="group rounded-[24px] border border-white/8 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]">
            <Sparkles size={18} className="text-livv-accent-soft" />
            <p className="mt-7 text-[15px] font-semibold">Vault</p>
            <p className="mt-1 text-[11px] text-white/35">{vault.uniqueCount}/{vault.catalogSize} collected</p>
            <ChevronRight size={15} className="mt-3 text-white/25 transition group-hover:translate-x-1" />
          </Link>
        </div>
        <section className="mt-12">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Membership</p>
              <h2 className="font-display mt-1 text-[27px] font-semibold">Choose your room.</h2>
            </div>
            <span className="text-[11px] text-white/25">{TIERS.length} tiers</span>
          </div>
          <p className="mt-2 max-w-[34ch] text-[13px] leading-relaxed text-white/38">More access. More compounding. Pick the level that matches where you're going.</p>
          <div className="mt-5 space-y-3">
            {TIERS.map((t) => {
              const active = me.tier === t.id;
              const color = tierColor(t.id);
              return (
                <button key={t.id} type="button" onClick={() => { feedback("tick"); setBillingNote(null); setPicked(t.id); }} className="block w-full text-left">
                  <div className="relative overflow-hidden rounded-[26px] border p-5 transition active:scale-[0.99]" style={{ borderColor: `${color.hex}99`, background: active ? `linear-gradient(135deg, ${color.hex}22, rgba(255,255,255,0.04))` : `linear-gradient(135deg, ${color.hex}14, rgba(255,255,255,0.03))`, boxShadow: `0 0 28px ${color.glow}` }}>
                    {t.featured && (
                      <div className="absolute right-4 top-4 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: color.hex, background: `${color.hex}16` }}>Most chosen</div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl" style={{ background: `${color.hex}16`, color: color.hex }}>
                        {t.id === "spark" ? <Sparkles size={19} /> : t.id === "rise" ? <Zap size={19} /> : t.id === "apex" ? <Crown size={19} /> : <Flame size={19} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 pr-20">
                          <p className="text-[18px] font-semibold" style={{ color: color.hex }}>{t.name}</p>
                          {active && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-white/55">Current</span>}
                        </div>
                        <div className="mt-0.5 flex items-baseline gap-1">
                          <span className="text-[15px] font-medium text-white/75">{t.price}</span>
                          <span className="text-[11px] text-white/30">{t.cadence !== "forever" ? t.cadence : ""}</span>
                          <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-medium" style={{ color: color.hex }}>
                            <EmberIcon size={12} /> {t.multiplier}x
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-[13px] leading-relaxed text-white/42">{t.blurb}</p>
                    <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
                      {t.perks.slice(0, 4).map((perk) => (
                        <p key={perk} className="flex gap-2 text-[11px] leading-relaxed text-white/48">
                          <Check size={12} className="mt-0.5 shrink-0" style={{ color: color.hex }} />
                          {perk}
                        </p>
                      ))}
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-white/25">Tap to explore</span>
                      <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/50"><ArrowRight size={14} /></span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {entitlements.stripeCustomerId && (
            <button type="button" onClick={manageBilling} className="mt-4 w-full rounded-full border border-white/10 py-3 text-[13px] text-white/50">Manage subscription</button>
          )}
          <p className="mt-4 text-center text-[11px] leading-relaxed text-white/25">
            {stripeLive ? "Paid tiers go through Stripe Checkout. You can cancel anytime in Manage subscription." : "Add Stripe keys in Vercel to enable real checkout. Demo unlock remains for testing."}
          </p>
        </section>
        <section className="mt-10 rounded-[26px] border border-white/8 bg-white/[0.025] p-5">
          <div className="flex items-center gap-3">
            <EmberIcon size={22} />
            <div>
              <p className="text-[14px] font-semibold">Embers</p>
              <p className="text-[11px] text-white/30">Your compounding currency</p>
            </div>
            <p className="ml-auto text-[24px] font-semibold">{me.embers}</p>
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-white/35">{EMBERS_BLURB}</p>
        </section>
        {achievements.length > 0 && (
          <section className="mt-10">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">Unlocked</p>
            <div className="mt-3 space-y-2">
              {achievements.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-2xl border border-white/7 bg-white/[0.025] px-4 py-3">
                  <span className="text-lg">{a.icon}</span>
                  <span className="text-[13px] text-white/65">{a.title}</span>
                  <span className="ml-auto text-[10px] text-white/25">earned</span>
                </div>
              ))}
            </div>
          </section>
        )}
        <div className="mt-10 flex items-center justify-between border-t border-white/8 pt-6">
          <Link href="/home/messages" className="text-[13px] text-livv-accent-soft">Messages →</Link>
          <Link href="/home/evala" className="text-[13px] text-white/35">Ask Evala →</Link>
        </div>
      </div>
      {picked && (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/80 backdrop-blur-md" onClick={() => { setPicked(null); setBillingNote(null); }}>
          <div className="w-full rounded-t-[32px] border-t border-white/10 bg-[#0b0d11] p-6 pb-10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/15" />
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl" style={{ color: tierColor(picked).hex, background: `${tierColor(picked).hex}16` }}>
                <Crown size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">Membership</p>
                <h2 className="font-display text-[28px] font-semibold">{getTier(picked).name}</h2>
              </div>
              <p className="ml-auto text-lg font-semibold">
                {getTier(picked).price}
                <span className="text-xs text-white/30">{getTier(picked).cadence !== "forever" ? getTier(picked).cadence : ""}</span>
              </p>
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-white/45">{getTier(picked).blurb}</p>
            <div className="mt-5 space-y-2">
              {getTier(picked).perks.map((p) => (
                <div key={p} className="flex gap-2 text-[13px] text-white/60">
                  <Check size={14} className="mt-0.5 shrink-0 text-livv-accent-soft" />
                  {p}
                </div>
              ))}
            </div>
            {billingNote && (
              <p className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-300/5 p-3 text-[12px] leading-relaxed text-amber-200/80">{billingNote}</p>
            )}
            <div className="mt-7 flex flex-col gap-2">
              <button type="button" disabled={checkoutBusy || me.tier === picked} onClick={() => tryClaim(picked)} className="w-full rounded-full bg-white py-3.5 text-sm font-semibold text-black disabled:opacity-40">
                {ctaLabel(picked)}
              </button>
              {!isDemoUnlock() && picked !== "spark" && !stripeLive && (
                <button type="button" onClick={() => { enableDemoUnlock(); tryClaim(picked); }} className="py-2 text-[11px] text-white/20">Internal: enable demo unlock</button>
              )}
              <button type="button" onClick={() => { setPicked(null); setBillingNote(null); }} className="py-2 text-sm text-white/35">Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.13em] text-white/25">{icon}{label}</span>
      <span className="text-[17px] font-semibold text-white/75">{value}</span>
    </div>
  );
}
