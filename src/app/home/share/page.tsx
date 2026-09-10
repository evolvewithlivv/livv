"use client";

import { useEffect, useMemo, useState } from "react";
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
  const color = me ? tierColor(me.tier).hex : "#8B93A7";
  const badges = rec ? liveAchievements(rec).filter((a) => a.unlocked).map((a) => ({ icon: a.icon, title: a.title })) : [];
  const workout = rec?.lastWorkout;
  const previewStats = useMemo(() => ({ level: rec?.level || 1, streak: rec?.streak || 0 }), [rec]);

  const share = async () => {
    if (!me || !rec || busy) return;
    setBusy(true); setMessage("");
    try {
      const blob = mode === "profile"
        ? await renderProfileShareCard({ displayName: me.displayName || "LIVV member", username: me.username || "livv", level: rec.level, evolutionName: evolutionTitle(rec.level).name, streak: rec.streak, tierLabel: tier.name, tierColor: color, embers: me.embers, badges, workoutsCompleted: rec.workoutsCompleted })
        : await renderWorkoutShareCard({ displayName: me.displayName || "LIVV member", workoutName: workout?.name || "LIVV workout", focus: workout?.focus || "Training", location: "LIVV", duration: workout?.duration || "Session", exerciseCount: workout?.exercises || 0, level: rec.level, streak: rec.streak });
      const result = await shareOrDownloadBlob(blob, mode === "profile" ? "livv-profile.png" : "livv-workout.png", mode === "profile" ? "My LIVV profile" : "My LIVV workout");
      setMessage(result === "shared" ? "Ready to post." : "Card saved to your device.");
    } catch { setMessage("Couldn’t create the card. Try again."); }
    finally { setBusy(false); }
  };

  return <main className="livv-page min-h-full pb-10 pt-5"><Container>
    <div className="flex items-center gap-4"><Avatar identity={me ?? DEFAULT_IDENTITY} size={56} /><div><p className="text-[10px] uppercase tracking-[0.25em] text-white/30">Share your evolution</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Make it postable.</h1></div></div>
    <div className="mt-7 grid grid-cols-2 gap-2.5">{(["profile", "workout"] as Mode[]).map((m) => <button key={m} onClick={() => setMode(m)} className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${mode === m ? "border-white/30 bg-white/10" : "border-white/10 bg-white/[0.035] text-white/45"}`}>{m === "profile" ? "Profile card" : "Workout card"}</button>)}</div>

    <div className="mt-5 overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-2xl">
      <div className="aspect-[4/5] overflow-hidden rounded-[24px] border border-white/10 bg-[#080a0f] p-5">
        {mode === "profile" ? <><p className="text-xs font-semibold text-white/50">LIVV</p><p className="mt-12 text-4xl font-bold">{me?.displayName || "LIVV member"}</p><p className="mt-1 text-sm text-white/35">@{me?.username || "livv"}</p><div className="mt-8 grid grid-cols-3 gap-2">{[["LEVEL", previewStats.level], ["STREAK", `${previewStats.streak}d`], ["SESSIONS", rec?.workoutsCompleted || 0]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3"><p className="text-[8px] text-white/30">{label}</p><p className="mt-2 text-xl font-bold">{value}</p></div>)}</div><p className="mt-8 text-[9px] uppercase tracking-[0.2em]" style={{ color }}> {tier.name} · {evolutionTitle(previewStats.level).name}</p><p className="mt-8 text-xs text-white/25">{badges.length ? `${badges.length} badge${badges.length === 1 ? "" : "s"} unlocked` : "Your next badge starts with your next action."}</p></> : <><p className="text-xs font-semibold text-white/50">LIVV · WORKOUT</p><p className="mt-12 text-4xl font-bold">{workout?.name || "Your next workout"}</p><div className="mt-6 flex flex-wrap gap-2">{[workout?.focus || "Training", workout?.duration || "Session", "Logged"].map((x) => <span key={x} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-[9px] uppercase tracking-[0.15em] text-white/45">{x}</span>)}</div><div className="mt-10 grid grid-cols-3 gap-2">{[["MOVES", workout?.exercises || 0], ["LEVEL", previewStats.level], ["STREAK", `${previewStats.streak}d`]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3"><p className="text-[8px] text-white/30">{label}</p><p className="mt-2 text-xl font-bold">{value}</p></div>)}</div><p className="mt-8 text-xs text-white/25">Turn the session into proof.</p></>}
      </div>
    </div>
    <button onClick={share} disabled={busy} className="mt-5 w-full rounded-full bg-white py-4 text-sm font-semibold text-black disabled:opacity-40">{busy ? "Creating card…" : mode === "profile" ? "Share profile card" : "Share workout card"}</button>
    {message && <p className="mt-3 text-center text-xs text-white/45">{message}</p>}
  </Container></main>;
}
