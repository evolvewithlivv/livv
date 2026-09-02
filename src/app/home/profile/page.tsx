"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/identity/avatar";
import { ActivityCard } from "@/components/activity/activity-card";
import { cn } from "@/lib/utils";
import {
  fileToPhoto,
  loadIdentity,
  patchIdentity,
  type Identity,
  type LivvTheme,
  type LivvTier,
} from "@/lib/identity";
import { TIERS, getTier, hasTier } from "@/lib/membership";
import { loadActivities, type Activity } from "@/lib/activity";
import { liveAchievements, livePillars, loadRecord } from "@/lib/record";

type Tab = "activity" | "progress" | "vault";

export default function ProfilePage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Identity | null>(null);
  const [tab, setTab] = useState<Tab>("activity");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [picked, setPicked] = useState<LivvTier | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const rec = typeof window === "undefined" ? null : loadRecord();

  useEffect(() => {
    const sync = () => setMe(loadIdentity());
    sync();
    setActivities(loadActivities());
    window.addEventListener("livv-identity", sync);
    window.addEventListener("livv-record", sync);
    return () => {
      window.removeEventListener("livv-identity", sync);
      window.removeEventListener("livv-record", sync);
    };
  }, [tab]);

  if (!me) return null;

  const tier = getTier(me.tier);
  const pillars = livePillars(rec || loadRecord());
  const achievements = liveAchievements(rec || loadRecord());
  const stats = rec || loadRecord();

  const onPickPhoto = async (file?: File) => {
    if (!file) return;
    const photo = await fileToPhoto(file);
    const next = patchIdentity({ photo });
    setMe(next);
    if (draft) setDraft({ ...draft, photo });
  };

  const saveEdit = () => {
    if (!draft) return;
    const next = patchIdentity({
      displayName: draft.displayName.trim() || me.displayName,
      username: draft.username.trim().replace(/^@/, "") || me.username,
      bio: draft.bio.trim(),
      photo: draft.photo,
    });
    setMe(next);
    setEditing(false);
  };

  const claimTier = (id: LivvTier) => {
    setMe(patchIdentity({ tier: id }));
    setPicked(null);
  };

  if (editing && draft) {
    return (
      <main className="pt-8 pb-8">
        <Container>
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-[22px] font-semibold tracking-tight">Edit identity</h1>
            <button onClick={() => setEditing(false)} className="text-sm text-white/45">Cancel</button>
          </div>
          <div className="mb-8 flex flex-col items-center">
            <button type="button" onClick={() => fileRef.current?.click()} className="relative">
              <Avatar identity={draft} size={112} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPickPhoto(e.target.files?.[0])} />
          </div>
          <Button variant="accent" size="lg" className="w-full" onClick={saveEdit}>Save identity</Button>
        </Container>
      </main>
    );
  }

  return (
    <main className="pt-8 pb-10">
      <Container>
        <div className="mb-2 flex justify-end">
          <Link href="/home/settings" className="text-sm text-white/45">Settings</Link>
        </div>
        <div className="mb-8 flex flex-col items-center text-center">
          <button type="button" onClick={() => fileRef.current?.click()} className="relative">
            <Avatar identity={me} size={108} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPickPhoto(e.target.files?.[0])} />
          <h1 className="mt-5 text-[28px] font-semibold tracking-tight">{me.displayName}</h1>
          <p className="text-sm text-white/40">@{me.username}</p>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="rounded-full bg-livv-accent/15 px-3 py-1 font-medium text-livv-accent-soft">
              Lv {stats.level}
            </span>
            <span className="text-white/40">{stats.streak}d streak</span>
            <span className="text-white/40">{me.embers} Embers</span>
          </div>
          <Button variant="secondary" size="sm" className="mt-5" onClick={() => { setDraft(me); setEditing(true); }}>
            Edit identity
          </Button>
        </div>

        <section id="membership" className="mb-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">Membership</p>
          <div className="mt-3 space-y-3">
            {TIERS.map((t) => (
              <button
                key={t.id}
                onClick={() => setPicked(t.id)}
                className={cn(
                  "w-full rounded-[22px] border p-5 text-left",
                  me.tier === t.id ? "border-livv-accent bg-livv-accent/10" : "border-livv-border bg-livv-surface"
                )}
              >
                <div className="flex items-baseline justify-between">
                  <p className="text-[18px] font-semibold">{t.name}</p>
                  <p className="text-sm text-white/55">{t.price}{t.cadence}</p>
                </div>
                <p className="mt-1 text-sm text-white/45">{t.blurb}</p>
              </button>
            ))}
          </div>
        </section>

        {hasTier(me.tier, "apex") && (
          <section className="mb-8 grid grid-cols-3 gap-2">
            {(["ember", "midnight", "bone"] as LivvTheme[]).map((id) => (
              <button key={id} onClick={() => setMe(patchIdentity({ theme: id }))} className={cn("rounded-2xl border py-3 text-sm capitalize", me.theme === id ? "border-livv-accent" : "border-livv-border")}>
                {id}
              </button>
            ))}
          </section>
        )}

        <div className="mb-5 flex border-b border-livv-border">
          {(["activity", "progress", "vault"] as Tab[]).map((id) => (
            <button key={id} onClick={() => setTab(id)} className={cn("flex-1 pb-3 text-sm font-medium capitalize", tab === id ? "border-b-2 border-livv-accent text-white" : "text-white/40")}>
              {id}
            </button>
          ))}
        </div>

        {tab === "activity" && (
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="rounded-[22px] border border-livv-border bg-livv-surface px-5 py-10 text-center text-sm text-white/40">
                Train or finish an objective. It shows here.
              </p>
            ) : (
              activities.map((activity) => <ActivityCard key={activity.id} activity={activity} />)
            )}
          </div>
        )}

        {tab === "progress" && (
          <div className="space-y-3">
            {pillars.map((pillar) => (
              <div key={pillar.id} className="rounded-2xl border border-livv-border bg-livv-surface p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{pillar.name}</p>
                  <span className="text-xs text-livv-accent-soft">Lv {pillar.level}</span>
                </div>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-black/50">
                  <div className="h-full bg-livv-accent" style={{ width: `${pillar.progress}%` }} />
                </div>
              </div>
            ))}
            {achievements.map((ach) => (
              <div key={ach.id} className={cn("flex items-center gap-3 rounded-2xl border p-3.5", ach.unlocked ? "border-livv-border bg-livv-surface" : "opacity-50 border-livv-border")}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 text-lg">{ach.icon}</div>
                <div>
                  <p className="text-sm font-medium">{ach.title}</p>
                  <p className="text-xs text-white/40">{ach.description}</p>
                </div>
                <span className="ml-auto text-[10px] uppercase text-white/35">{ach.unlocked ? "Unlocked" : "Locked"}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "vault" && (
          <div className="space-y-3">
            <p className="text-sm text-white/40">Planners and meal architecture stay locked until the matching tier.</p>
          </div>
        )}

        {picked && (
          <div className="fixed inset-0 z-[60] flex items-end bg-black/70 p-4 pb-8">
            <div className="w-full rounded-[28px] border border-livv-border bg-[#0c0c0e] p-6">
              <h2 className="text-[26px] font-semibold">{getTier(picked).name}</h2>
              <div className="mt-6 flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setPicked(null)}>Not now</Button>
                <Button variant="accent" className="flex-1" onClick={() => claimTier(picked)}>Claim</Button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
