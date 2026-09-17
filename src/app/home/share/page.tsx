"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { loadIdentity, type Identity } from "@/lib/identity";
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
        <div className="share-card-grid" /><div className="share-card-orb" />
        <div className="relative z-10 flex h-full flex-col p-6 sm:p-8">
          <div className="flex items-center justify-between"><span className="share-brand">LIVV</span><span className="share-number">{mode === "profile" ? "01" : "02"} / 02</span></div>
          {mode === "profile" ? <>
            <div className="mt-auto"><p className="share-label">EVOLUTION</p><div className="share-level"><span>{stats.level}</span></div><p className="share-evolution">{evolutionTitle(stats.level).name}</p><p className="share-name">{me?.displayName || "LIVV member"}</p><p className="share-handle">@{me?.username || "livv"}</p></div><div className="share-rule" />
            <div className="grid grid-cols-3 gap-4"><ShareMetric label="STREAK" value={`${stats.streak}d`} /><ShareMetric label="SESSIONS" value={String(stats.sessions)} /><ShareMetric label="EMBERS" value={String(me?.embers || 0)} /></div>
            <div className="mt-6 flex items-center justify-between"><span className="share-tier" style={{ color: accent }}>{tier.name.toUpperCase()}</span><span className="share-footer">{badges.length ? `${badges.length} badges earned` : "Keep evolving"}</span></div>
          </> : <>
            <div className="mt-auto"><p className="share-label">SESSION COMPLETE</p><p className="share-workout">{workout?.name || "LIVV workout"}</p><p className="share-meta">{meta}</p></div><div className="share-rule" />
            <div className="grid grid-cols-3 gap-4"><ShareMetric label="MOVES" value={String(workout?.exercises || 0)} /><ShareMetric label="LEVEL" value={String(stats.level)} /><ShareMetric label="STREAK" value={`${stats.streak}d`} /></div>
            <div className="mt-6 flex items-center justify-between"><span className="share-tier" style={{ color: accent }}>LIVV TRAIN</span><span className="share-footer">{me?.displayName || "LIVV member"}</span></div>
          </>}
        </div>
      </div>
    </section>
    <div className="mt-5 flex gap-2"><button onClick={share} disabled={busy} className="share-primary flex-1">{busy ? "Creating…" : <><Share2 size={17} /> Share card</>}</button><button onClick={share} disabled={busy} aria-label="Save card" className="share-secondary"><Download size={17} /></button></div>
    {message && <p className="mt-3 text-center text-xs text-livv-muted">{message}</p>}
    <p className="mt-5 text-center text-[10px] leading-relaxed text-livv-muted">1080 × 1350 · optimized for social sharing</p>
    <style jsx>{`\n      .share-back{display:grid;place-items:center;width:40px;height:40px;border:1px solid var(--livv-pro-line);border-radius:999px;color:var(--livv-pro-muted)}\n      .share-eyebrow{font-size:10px;font-weight:700;letter-spacing:.22em;color:var(--livv-pro-accent);margin:0}\n      .share-title{font-size:15px;font-weight:650;letter-spacing:-.025em;margin:4px 0 0;color:var(--livv-pro-ink)}\n      .share-mode{min-height:42px;border-radius:10px;font-size:12px;font-weight:650;color:var(--livv-pro-muted)}\n      .share-mode.is-selected{background:var(--livv-pro-ink);color:var(--livv-pro-bg)}\n      .share-stage{display:flex;justify-content:center;padding:0 2px}\n      .share-card{position:relative;width:min(100%,390px);aspect-ratio:4/5;overflow:hidden;border-radius:24px;background:linear-gradient(145deg,#05070a,#0b1018 52%,#05070a);color:#fff;box-shadow:0 22px 55px rgba(0,0,0,.18);isolation:isolate}\n      .share-card-grid{position:absolute;inset:0;opacity:.08;background-image:linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px);background-size:34px 34px;mask-image:linear-gradient(to bottom,black,transparent 75%)}\n      .share-card-orb{position:absolute;width:70%;aspect-ratio:1;border-radius:999px;right:-28%;top:-12%;background:var(--share-accent);opacity:.28;filter:blur(35px)}\n      .share-brand{font-size:13px;font-weight:800;letter-spacing:-.06em}.share-number{font-size:9px;letter-spacing:.16em;color:rgba(255,255,255,.35)}\n      .share-label{font-size:9px;font-weight:750;letter-spacing:.2em;color:rgba(255,255,255,.48);margin:0}.share-level{height:70px;margin:4px 0 -2px;display:flex;align-items:center}.share-level span{font-size:92px;line-height:1;font-weight:800;letter-spacing:-.09em;color:#fff}.share-evolution{font-size:25px;line-height:1.08;font-weight:750;letter-spacing:-.05em;margin:4px 0 0}.share-name{font-size:14px;font-weight:650;margin:10px 0 0}.share-handle{font-size:10px;color:rgba(255,255,255,.45);margin:2px 0 0}.share-rule{height:1px;background:rgba(255,255,255,.14);margin:20px 0 15px}.share-metric-label{font-size:8px;letter-spacing:.16em;font-weight:650;color:rgba(255,255,255,.38);margin:0}.share-metric-value{font-size:24px;font-weight:750;letter-spacing:-.045em;margin:3px 0 0;color:#fff}.share-tier{font-size:9px;letter-spacing:.18em;font-weight:800}.share-footer{font-size:9px;color:rgba(255,255,255,.4)}.share-workout{font-size:31px;line-height:1.02;font-weight:780;letter-spacing:-.055em;max-width:13ch;margin:6px 0 0}.share-meta{font-size:11px;color:rgba(255,255,255,.48);margin:9px 0 0}\n      .share-primary{display:flex;align-items:center;justify-content:center;gap:8px;min-height:48px;border-radius:14px;background:var(--livv-pro-ink);color:var(--livv-pro-bg);font-size:13px;font-weight:700}.share-secondary{display:grid;place-items:center;width:48px;min-height:48px;border:1px solid var(--livv-pro-line);border-radius:14px;color:var(--livv-pro-ink);background:var(--livv-pro-surface)}\n    `}</style>
  </Container></main>;
}
function ShareMetric({ label, value }: { label: string; value: string }) { return <div><p className="share-metric-label">{label}</p><p className="share-metric-value">{value}</p></div>; }
