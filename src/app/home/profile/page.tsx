"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/identity/avatar";
import { ActivityCard } from "@/components/activity/activity-card";
import { cn } from "@/lib/utils";
import {
  ACCENTS,
  fileToPhoto,
  loadIdentity,
  patchIdentity,
  type Identity,
  type LivvTheme,
  type LivvTier,
} from "@/lib/identity";
import { TIERS, getTier, hasTier } from "@/lib/membership";
import { ACHIEVEMENTS, PILLARS } from "@/lib/evolve-data";
import { loadActivities, type Activity } from "@/lib/activity";

type Tab = "activity" | "progress" | "vault";

export default function ProfilePage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Identity | null>(null);
  const [tab, setTab] = useState<Tab>("activity");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [picked, setPicked] = useState<LivvTier | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => setMe(loadIdentity());
    sync();
    setActivities(loadActivities());
    window.addEventListener("livv-identity", sync);
    return () => window.removeEventListener("livv-identity", sync);
  }, [tab]);

  if (!me) return null;

  const tier = getTier(me.tier);

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
      accent: draft.accent,
      photo: draft.photo,
    });
    setMe(next);
    setEditing(false);
  };

  const claimTier = (id: LivvTier) => {
    const next = patchIdentity({ tier: id });
    setMe(next);
    setPicked(null);
  };

  if (editing && draft) {
    return (
      <main className="pt-8 pb-8">
        <Container>
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-[22px] font-semibold tracking-tight">Edit identity</h1>
            <button onClick={() => setEditing(false)} className="text-sm text-white/45">
              Cancel
            </button>
          </div>

          <div className="mb-8 flex flex-col items-center">
            <button type="button" onClick={() => fileRef.current?.click()} className="relative">
              <Avatar identity={draft} size={112} />
              <span className="absolute inset-x-0 -bottom-3 mx-auto w-max rounded-full bg-white px-3 py-1 text-[11px] font-medium text-black">
                Camera roll
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onPickPhoto(e.target.files?.[0])}
            />
          </div>

          <div className="space-y-5">
            <Field label="Display name">
              <input
                value={draft.displayName}
                onChange={(e) => setDraft({ ...draft, displayName: e.target.value })}
                maxLength={32}
                className="field"
              />
            </Field>
            <Field label="Username">
              <div className="flex items-center overflow-hidden rounded-2xl border border-livv-border bg-livv-surface">
                <span className="pl-4 text-white/35">@</span>
                <input
                  value={draft.username}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      username: e.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
                    })
                  }
                  maxLength={24}
                  className="w-full bg-transparent px-2 py-3.5 text-white outline-none"
                />
              </div>
            </Field>
            <Field label="Bio">
              <textarea
                value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                maxLength={160}
                rows={3}
                className="field resize-none"
              />
            </Field>
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-white/35">Accent</p>
              <div className="flex gap-2">
                {ACCENTS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setDraft({ ...draft, accent: color })}
                    className={cn(
                      "h-8 w-8 rounded-full",
                      draft.accent === color && "ring-2 ring-white ring-offset-2 ring-offset-black"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <Button variant="accent" size="lg" className="mt-10 w-full" onClick={saveEdit}>
            Save identity
          </Button>
          <style jsx>{`
            .field {
              margin-top: 8px;
              width: 100%;
              border-radius: 16px;
              border: 1px solid #222226;
              background: #121214;
              padding: 14px 16px;
              color: white;
              outline: none;
            }
          `}</style>
        </Container>
      </main>
    );
  }

  return (
    <main className="pt-8 pb-10">
      <Container>
        <div className="mb-8 flex flex-col items-center text-center">
          <button type="button" onClick={() => fileRef.current?.click()} className="relative">
            <Avatar identity={me} size={108} />
            <span className="absolute -bottom-1 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] text-black">
              +
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPickPhoto(e.target.files?.[0])}
          />

          <h1 className="mt-5 text-[28px] font-semibold tracking-tight">{me.displayName}</h1>
          <p className="text-sm text-white/40">@{me.username}</p>
          {me.bio && <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">{me.bio}</p>}

          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="rounded-full bg-livv-accent/15 px-3 py-1 font-medium text-livv-accent-soft">
              {tier.name}
            </span>
            <span className="text-white/40">{me.embers} Embers</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="mt-5"
            onClick={() => {
              setDraft(me);
              setEditing(true);
            }}
          >
            Edit identity
          </Button>
        </div>

        <section id="membership" className="mb-8 scroll-mt-6">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
                Membership
              </p>
              <p className="mt-1 text-[20px] font-semibold tracking-tight">Pick the altitude</p>
            </div>
          </div>

          <div className="space-y-3">
            {TIERS.map((t) => {
              const active = me.tier === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setPicked(t.id)}
                  className={cn(
                    "w-full rounded-[22px] border p-5 text-left",
                    t.featured && !active
                      ? "border-livv-accent/40 bg-livv-accent/[0.07]"
                      : "border-livv-border bg-livv-surface",
                    active && "border-livv-accent bg-livv-accent/10"
                  )}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[18px] font-semibold tracking-tight">{t.name}</p>
                    <p className="text-sm text-white/55">
                      {t.price}
                      <span className="text-white/30">{t.cadence}</span>
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-white/45">{t.blurb}</p>
                  <ul className="mt-3 space-y-1.5">
                    {t.perks.map((perk) => (
                      <li key={perk} className="text-[13px] leading-snug text-white/70">
                        {perk}
                      </li>
                    ))}
                  </ul>
                  {t.featured && !active && (
                    <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-livv-accent-soft">
                      Most people who stay pick this
                    </p>
                  )}
                  {active && (
                    <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-livv-accent-soft">
                      Current
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {hasTier(me.tier, "apex") && (
          <section className="mb-8">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
              App skin
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["ember", "Ember"],
                  ["midnight", "Midnight"],
                  ["bone", "Bone"],
                ] as [LivvTheme, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setMe(patchIdentity({ theme: id }))}
                  className={cn(
                    "rounded-2xl border py-3 text-sm",
                    me.theme === id
                      ? "border-livv-accent bg-livv-accent/10"
                      : "border-livv-border bg-livv-surface"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="mb-5 flex border-b border-livv-border">
          {(
            [
              ["activity", "Activity"],
              ["progress", "Progress"],
              ["vault", "Vault"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex-1 pb-3 text-sm font-medium",
                tab === id ? "border-b-2 border-livv-accent text-white" : "text-white/40"
              )}
            >
              {label}
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
              activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))
            )}
          </div>
        )}

        {tab === "progress" && (
          <div className="space-y-3">
            {PILLARS.map((pillar) => (
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
            <div className="space-y-2 pt-2">
              {ACHIEVEMENTS.map((ach) => (
                <div
                  key={ach.id}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-3.5",
                    ach.unlocked ? "border-livv-border bg-livv-surface" : "opacity-50 border-livv-border"
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 text-lg">
                    {ach.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{ach.title}</p>
                    <p className="text-xs text-white/40">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "vault" && (
          <div className="space-y-3">
            <VaultRow
              title="This week’s training planner"
              meta="PDF · Rise"
              locked={!hasTier(me.tier, "rise")}
            />
            <VaultRow
              title="Meal architecture"
              meta="Personalized · Apex"
              locked={!hasTier(me.tier, "apex")}
            />
            <VaultRow
              title="Monthly review pack"
              meta="Printable · Apex"
              locked={!hasTier(me.tier, "apex")}
            />
            <VaultRow
              title="Gear allotment"
              meta={`${me.embers} Embers banked · Inner Circle`}
              locked={!hasTier(me.tier, "circle")}
            />
          </div>
        )}
      </Container>

      {picked && (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/70 p-4 pb-8">
          <div className="w-full rounded-[28px] border border-livv-border bg-[#0c0c0e] p-6">
            <p className="text-[13px] uppercase tracking-[0.2em] text-white/35">Hold this rate</p>
            <h2 className="mt-2 text-[26px] font-semibold tracking-tight">
              {getTier(picked).name}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/50">
              Billing is not live yet. Claiming it now locks the preview inside the app so you can
              feel the altitude before money moves.
            </p>
            <div className="mt-6 flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setPicked(null)}>
                Not now
              </Button>
              <Button variant="accent" className="flex-1" onClick={() => claimTier(picked)}>
                Claim {getTier(picked).name}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.2em] text-white/35">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function VaultRow({
  title,
  meta,
  locked,
}: {
  title: string;
  meta: string;
  locked: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-livv-border bg-livv-surface px-4 py-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-white/35">{meta}</p>
      </div>
      <span className="text-[11px] uppercase tracking-wider text-white/35">
        {locked ? "Locked" : "Ready"}
      </span>
    </div>
  );
}
