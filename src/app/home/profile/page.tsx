"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck, ChevronRight, Flame, Pencil, Sparkles, Trophy, Zap } from "lucide-react";
import { Avatar } from "@/components/identity/avatar";
import { PageHero } from "@/components/layout/page-hero";
import { fileToPhoto, loadIdentity, patchIdentity, type Identity } from "@/lib/identity";
import { loadRecord } from "@/lib/record";
import { evolutionTitle } from "@/lib/levels";
import { collectionStats } from "@/lib/packs";
import { getTier } from "@/lib/membership";
import { getEffectiveTier } from "@/lib/billing";
import { feedback } from "@/lib/sensory";

const PROFILE_ACCENT = "#FF9D23";

export default function ProfilePage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [rec, setRec] = useState<ReturnType<typeof loadRecord> | null>(null);
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => { setMe(loadIdentity()); setRec(loadRecord()); };
    sync();
    for (const event of ["livv-identity", "livv-record", "livv-packs", "livv-billing"]) window.addEventListener(event, sync);
    return () => { for (const event of ["livv-identity", "livv-record", "livv-packs", "livv-billing"]) window.removeEventListener(event, sync); };
  }, []);

  if (!me || !rec) return <main className="min-h-dvh" />;

  const evo = evolutionTitle(rec.level);
  const pct = Math.min(100, Math.round((rec.currentXp / rec.xpToNext) * 100));
  const vault = collectionStats();

  const photo = async (file?: File) => {
    if (!file) return;
    try { setMe(patchIdentity({ photo: await fileToPhoto(file) })); setStatus(""); feedback("tick"); }
    catch { setStatus("Could not update photo."); }
  };

  return (
    <main className="livv-page relative min-h-full overflow-hidden pb-28 text-white">
      <div className="relative z-10 mx-auto max-w-xl px-5 pt-5">
        <PageHero eyebrow="Profile" title="Profile" subtitle="Your identity, goals, progress, and account in one place." accent={PROFILE_ACCENT} right={<Link href="/home/settings" aria-label="Settings" className="grid h-10 w-10 place-items-center text-white/60"><Pencil size={16} /></Link>} />

        <section className="mt-7 border-b border-white/[0.08] pb-7 text-center">
          <button type="button" onClick={() => fileRef.current?.click()} className="relative mx-auto block rounded-full" aria-label="Change profile photo">
            <Avatar identity={me} size={112} />
            <span className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full border-4 border-[#08090b] bg-white text-black"><Sparkles size={13} /></span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void photo(e.target.files?.[0])} />
          <h1 className="font-display mt-5 text-[31px] font-semibold">{me.displayName || "Member"}</h1>
          <p className="mt-1 text-[14px] text-white/55">@{me.username || "member"}</p>
          {me.goal && <p className="mx-auto mt-4 max-w-[32ch] text-[13px] leading-relaxed text-white/70">Goal: {me.goal}</p>}
          <div className="mt-6 grid grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-4">
            <Stat value={`${rec.streak}d`} label="streak" icon={<CalendarCheck size={13} />} />
            <Stat value={String(rec.level)} label="level" icon={<Zap size={13} />} />
            <Stat value={String(me.embers)} label="embers" icon={<Flame size={13} />} />
          </div>
          {status && <p className="mt-3 text-[11px]" style={{ color: PROFILE_ACCENT }}>{status}</p>}
        </section>

        <section className="mt-7 border-b border-white/[0.08] pb-6">
          <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Current evolution</p><h2 className="font-display mt-1 text-[27px] font-semibold">{evo.name}</h2></div><span className="text-[11px] text-white/55">{rec.currentXp} / {rec.xpToNext} XP</span></div>
          <p className="mt-2 max-w-[38ch] text-[12px] leading-relaxed text-white/60">{evo.line}</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-livv-accent" style={{ width: `${pct}%` }} /></div>
          <div className="mt-3 flex justify-between text-[10px] text-white/50"><span>{pct}% to next level</span><Link href="/home/progress" className="text-livv-accent">View progress <ArrowRight size={12} className="inline" /></Link></div>
        </section>

        <section className="mt-7 border-b border-white/[0.08] pb-2">
          <div className="mb-2"><p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Your system</p><h2 className="font-display mt-1 text-[26px] font-semibold">Keep the record moving.</h2></div>
          <Link href="/home/progress" className="flex items-center gap-4 border-t border-white/[0.08] py-5"><span className="grid h-10 w-10 place-items-center rounded-xl border border-[#FCF927]/20 bg-[#FCF927]/[0.06] text-[#FCF927]"><Trophy size={17} /></span><span className="min-w-0 flex-1"><b className="block text-[14px]">Progress</b><span className="mt-1 block text-[11px] text-white/45">Chapters, milestones, and recent evidence</span></span><ChevronRight size={16} className="text-white/35" /></Link>
          <Link href="/home/vault" className="flex items-center gap-4 border-t border-white/[0.08] py-5"><span className="grid h-10 w-10 place-items-center rounded-xl border border-[#9A00FF]/20 bg-[#9A00FF]/[0.06] text-[#9A00FF]"><Sparkles size={17} /></span><span className="min-w-0 flex-1"><b className="block text-[14px]">Vault</b><span className="mt-1 block text-[11px] text-white/45">{vault.uniqueCount} of {vault.catalogSize} collected</span></span><ChevronRight size={16} className="text-white/35" /></Link>
        </section>

        <section className="mt-7 border-b border-white/[0.08] pb-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: PROFILE_ACCENT }}>Membership</p>
          <div className="mt-2 flex items-center justify-between gap-4"><div><h2 className="font-display text-[24px] font-semibold">{getTier(getEffectiveTier()).name}</h2><p className="mt-1 max-w-[33ch] text-[11px] leading-relaxed text-white/50">Access to the parts of LIVV you have earned or purchased.</p></div><Link href="/home/settings" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 text-white/55"><ChevronRight size={16} /></Link></div>
        </section>
      </div>
    </main>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon: ReactNode }) {
  return <div className="flex flex-col items-center gap-1 text-white/70">{icon}<span className="text-[18px] font-semibold">{value}</span><span className="text-[9px] uppercase tracking-[0.16em] text-white/45">{label}</span></div>;
}
