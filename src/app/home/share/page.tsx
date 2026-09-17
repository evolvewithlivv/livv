"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Avatar } from "@/components/identity/avatar";
import { loadIdentity, DEFAULT_IDENTITY, type Identity } from "@/lib/identity";
import { getTier } from "@/lib/membership";
import { liveAchievements, loadRecord, type LivvRecord } from "@/lib/record";
import { evolutionTitle } from "@/lib/levels";
import { tierColor } from "@/lib/tier-style";
import { renderProfileShareCard, renderWorkoutShareCard, shareOrDownloadBlob } from "@/lib/share-card";

type Mode = "profile" | "workout";

export default function SharePage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [mode, setMode] = useState<Mode>("profile");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { setMe(loadIdentity()); setRec(loadRecord()); }, []);
  const tier = me ? getTier(me.tier) : getTier("spark");
  const accent = me ? tierColor(me.tier).hex : "#1769ff";
  const badges = rec ? liveAchievements(rec).filter((a) => a.unlocked).map((a) => ({ icon: a.icon, title: a.title })) : [];
  const workout = rec?.lastWorkout;
  const stats = useMemo(() => ({ level: rec?.level || 1, streak: rec?.streak || 0, sessions: rec?.workoutsCompleted || 0 }), [rec]);
  const share = async () => {
    if (!me || !rec || busy) return;
    setBusy(true); setMessage("");
    try {
      const blob = mode === "profile"
        ? await renderProfileShareCard({ displayName: me.displayName || "LIVV member", username: me.username || "livv", level: rec.level, evolutionName: evolutionTitle(rec.level).name, streak: rec.streak, tierLabel: tier.name, tierColor: accent, embers: me.embers, badges, workoutsCompleted: rec.workoutsCompleted })
        : await renderWorkoutShareCard({ displayName: me.displayName || "LIVV member", workoutName: workout?.name || "LIVV workout", focus: workout?.focus || "Training", location: "LIVV", duration: workout?.duration || "Session", exerciseCount: workout?.exercises || 0, level: rec.level, streak: rec.streak });
      const result = await shareOrDownloadBlob(blob, mode === "profile" ? "livv-profile.png" : "livv-workout.png", mode === "profile" ? "My LIVV evolution" : "My LIVV workout");
      setMessage(result === "shared" ? "Ready to post." : "Saved to your device.");
    } catch { setMessage("Couldn’t create the card. Try again."); }
    finally { setBusy(false); }
  };
  const meta = mode === "profile" ? `${stats.sessions} sessions · ${stats.streak} day streak` : `${workout?.focus || "Training"} · ${workout?.duration || "Session"}`;

  return <main className="livv-page min-h-full pb-28 pt-3"><Container>
    <div className="flex items-center justify-between gap-3 py-2"><Link href="/home/profile" aria-label="Back to profile" className="share-back"><ArrowLeft size={18} /></Link><div className="text-center"><p className="share-eyebrow">LIVV SHARE</p><h1 className="share-title">Your proof, made postable.</h1></div><span className="w-10" /></div>
    <div className="mt-6 grid grid-cols-2 rounded-[14px] border border-livv-border p-1 bg-livv-surface">{(["profile", "workout"] as Mode[]).map((m) => <button key={m} onClick={() => setMode(m)} className={`share-mode ${mode === m ? "is-selected" : ""}`}>{m === "profile" ? "Evolution" : "Workout"}</button>)}</div>

    <section className="share-stage mt-5" aria-label="Share card preview">
      <div className="share-card" style={{ "--share-accent": accent } as React.CSSProperties}>
        <div className="share-card-grid" />
        <div className="share-card-orb" />
        <div className="relative z-10 flex h-full flex-col p-6 sm:p-8">
          <div className="flex items-center justify-between"><span className="share-brand">LIVV</span><span className="share-number">{mode === "profile" ? "01" : "02"} / 02</span></div>
          {mode === "profile" ? <>
            <div className="mt-auto"><p className="share-label">EVOLUTION</p><div className="share-level"><span>{stats.level}</span></div><p className="share-evolution">{evolutionTitle(stats.level).name}</p><p className="share-name">{me?.displayName || "LIVV member"}</p><p className="share-handle">@{me?.username || "livv"}</p></div>
            <div className="share-rule" />
            <div className="grid grid-cols-3 gap-4"><ShareMetric label="STREAK" value={`${stats.streak}d`} /><ShareMetric label="SESSIONS" value={String(stats.sessions)} /><ShareMetric label="EMBERS" value={String(me?.embers || 0)} /></div>
            <div className="mt-6 flex items-center justify-between"><span className="share-tier" style={{ color: accent }}>{tier.name.toUpperCase()}</span><span className="share-footer">{badges.length ? `${badges.length} badges earned` : "Keep evolving"}</span></div>
          </> : <>
            <div className="mt-auto"><p className="share-label">SESSION COMPLETE</p><p className="share-workout">{workout?.name || "LIVV workout"}</p><p className="share-meta">{meta}</p></div>
            <div className="share-rule" />
            <div className="grid grid-cols-3 gap-4"><ShareMetric label="MOVES" value={String(workout?.exercises || 0)} /><ShareMetric label="LEVEL" value={String(stats.level)} /><ShareMetric label="STREAK" value={`${stats.streak}d`} /></div>
            <div className="mt-6 flex items-center justify-between"><span className="share-tier" style={{ color: accent }}>LIVV TRAIN</span><span className="share-footer">{me?.displayName || "LIVV member"}</span></div>
          </>}
        </div>
      </div>
    </section>

    <div className="mt-5 flex gap-2"><button onClick={share} disabled={busy} className="share-primary flex-1">{busy ? "Creating…" : <><Share2 size={17} /> Share card</>}</button><button onClick={share} disabled={busy} aria-label="Save card" className="share-secondary"><Download size={17} /></button></div>
    {message && <p className="mt-3 text-center text-xs text-livv-muted">{message}</p>}
    <p className="mt-5 text-center text-[10px] leading-relaxed text-livv-muted">1080 × 1350 · optimized for social sharing</p>
  </Container></main>;
}

function ShareMetric({ label, value }: { label: string; value: string }) { return <div><p className="share-metric-label">{label}</p><p className="share-metric-value">{value}</p></div>; }
