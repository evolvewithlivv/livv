"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Flame, Pencil, Share2, Trophy, Zap } from "lucide-react";
import { Avatar } from "@/components/identity/avatar";
import { PageHero } from "@/components/layout/page-hero";
import { fileToPhoto, loadIdentity, patchIdentity, type Identity } from "@/lib/identity";
import { loadRecord } from "@/lib/record";
import { evolutionTitle } from "@/lib/levels";
import { feedback } from "@/lib/sensory";
import { getEffectiveTier } from "@/lib/billing";
import { getTier } from "@/lib/membership";
import { tierColor } from "@/lib/tier-style";
import { syncIdentityToCloud } from "@/lib/auth";

const PROFILE_ACCENT = "#1769ff";

export default function ProfilePage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [rec, setRec] = useState<ReturnType<typeof loadRecord> | null>(null);
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => {
      try {
        setMe(loadIdentity());
        setRec(loadRecord());
      } catch {
        /* keep last good state — never blank the tab on a grant/sync glitch */
      }
    };
    sync();
    for (const event of ["livv-identity", "livv-record", "livv-billing"]) {
      window.addEventListener(event, sync);
    }
    return () => {
      for (const event of ["livv-identity", "livv-record", "livv-billing"]) {
        window.removeEventListener(event, sync);
      }
    };
  }, []);

  if (!me || !rec) return <main className="min-h-dvh" />;
  const effectiveTier = getEffectiveTier();
  const tierDef = getTier(effectiveTier);
  const tierStyle = tierColor(effectiveTier);
  const evo = evolutionTitle(rec.level);
  const xpToNext = Math.max(1, rec.xpToNext || 1);
  const pct = Math.min(100, Math.round((rec.currentXp / xpToNext) * 100));
  const photo = async (file?: File) => {
    if (!file) return;
    try {
      const next = patchIdentity({ photo: await fileToPhoto(file) });
      setMe(next);
      void syncIdentityToCloud(next);
      setStatus("");
      feedback("tick");
    } catch {
      setStatus("Could not update photo.");
    }
  };

  return (
    <main className="livv-account-page livv-page min-h-full pb-28">
      <div className="account-inner mx-auto max-w-xl px-5 pt-5">
        <PageHero
          eyebrow="Profile"
          title="Profile"
          subtitle="Your identity, goals, progress, and account in one place."
          accent={PROFILE_ACCENT}
          right={
            <div className="flex items-center gap-2">
              <Link href="/home/share" aria-label="Share profile" className="profile-share-action">
                <Share2 size={17} />
              </Link>
              <Link href="/home/settings" aria-label="Settings" className="profile-edit-action">
                <Pencil size={16} />
              </Link>
            </div>
          }
        />
        <section className="profile-identity mt-6 overflow-hidden rounded-[28px] border border-[var(--livv-pro-line)] bg-[var(--livv-pro-surface)] text-center">
          <div className="profile-identity-visual px-5 pb-7 pt-8">
            <button type="button" onClick={() => fileRef.current?.click()} className="relative mx-auto block rounded-full" aria-label="Change profile photo">
              <Avatar identity={{...me,tier:effectiveTier}} size={144} fit="contain" className="profile-avatar" showTierRing />
              <span className="absolute bottom-1 right-1 grid h-9 w-9 place-items-center rounded-full border-4 border-[var(--livv-pro-surface)] bg-[var(--livv-pro-ink)] text-[var(--livv-pro-bg)]">
                <Pencil size={14} />
              </span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void photo(e.target.files?.[0])} />
            <h1 className="mt-5 text-[28px] font-semibold tracking-tight">{me.displayName || me.username || "Member"}</h1>
            <p className="mt-1 text-[13px] account-muted">@{me.username || "livv"}</p>
            <div className="mt-3 flex justify-center"><span className="rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[.16em]" style={{ color: tierStyle.hex, background: `color-mix(in srgb, ${tierStyle.hex} 16%, transparent)`, border: `1px solid color-mix(in srgb, ${tierStyle.hex} 42%, transparent)` }}>{tierDef.name}</span></div>
            {me.bio ? <p className="mx-auto mt-3 max-w-[34ch] text-[13px] leading-relaxed account-muted">{me.bio}</p> : null}
            {status ? <p className="mt-2 text-[12px] text-red-500">{status}</p> : null}
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-[var(--livv-pro-line)] px-3 py-5">
            <Stat value={String(rec.level)} label="Level" icon={<Zap size={14} />} />
            <Stat value={String(rec.streak)} label="Streak" icon={<Flame size={14} />} />
            <Stat value={`${pct}%`} label="XP" icon={<Trophy size={14} />} />
          </div>
          <div className="border-t border-[var(--livv-pro-line)] px-5 py-4 text-left">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] account-muted">{evo.name}</p>
              <p className="text-[11px] tabular-nums account-muted">
                {rec.currentXp} / {xpToNext} XP
              </p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--livv-pro-surface-2)]">
              <div className="h-full rounded-full bg-[var(--livv-pro-accent)]" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </section>

        <section className="profile-section border-t account-divider py-7">
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] account-accent">Membership</p>
          <div className="mt-2 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[24px] font-semibold">
                {tierDef.name}
              </h2>
              <p className="mt-1 max-w-[33ch] text-[11px] leading-relaxed account-muted">
                Access to the parts of LIVV you have earned or purchased.
              </p>
            </div>
            <Link href="/home/tiers" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border account-divider account-muted" aria-label="View membership tiers">
              <ChevronRight size={16} />
            </Link>
          </div>
        </section>
      </div>
      <footer className="livv-brand-footer" aria-label="LIVV">
        {/* Official LIVV Pillars logo — intentionally exclusive to Profile. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/share-backgrounds/LIVV%20Pillars%20Logo%20-%20BLACK.PNG" alt="LIVV pillars" className="livv-footer-logo livv-footer-logo-light" draggable={false} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/share-backgrounds/LIVV%20Pillars%20Logo%20-%20WHITE.PNG" alt="" aria-hidden="true" className="livv-footer-logo livv-footer-logo-dark" draggable={false} />
      </footer>
    </main>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 account-muted">
      {icon}
      <span className="text-[18px] font-semibold account-ink">{value}</span>
      <span className="text-[9px] uppercase tracking-[.16em]">{label}</span>
    </div>
  );
}
