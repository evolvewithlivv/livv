"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DEFAULT_PROFILE,
  PROFILE_STATS,
  AVATAR_COLORS,
  type ProfileData,
} from "@/lib/profile-data";
import { ACHIEVEMENTS, PILLARS } from "@/lib/evolve-data";

type Tab = "posts" | "progress" | "achievements";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileData>(DEFAULT_PROFILE);
  const [tab, setTab] = useState<Tab>("progress");

  const xpPercent = Math.round(
    (PROFILE_STATS.currentXp / PROFILE_STATS.xpToNext) * 100
  );

  const openEdit = () => {
    setDraft({ ...profile });
    setEditing(true);
  };

  const saveEdit = () => {
    const cleaned: ProfileData = {
      ...draft,
      displayName: draft.displayName.trim() || profile.displayName,
      username: draft.username.trim().replace(/^@/, "") || profile.username,
      bio: draft.bio.trim(),
      avatarInitial: (draft.displayName.trim()[0] || "L").toUpperCase(),
    };
    setProfile(cleaned);
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft({ ...profile });
    setEditing(false);
  };

  // ─── EDIT MODE ────────────────────────────────────────────
  if (editing) {
    return (
      <main className="pt-8 pb-6">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold tracking-tight">Edit Identity</h1>
            <button
              onClick={cancelEdit}
              className="text-sm text-livv-muted hover:text-white"
            >
              Cancel
            </button>
          </div>

          {/* Avatar preview + color picker */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-white border-2 border-white/10"
              style={{ backgroundColor: draft.avatarColor }}
            >
              {(draft.displayName.trim()[0] || "L").toUpperCase()}
            </div>
            <p className="mt-4 text-xs text-livv-muted uppercase tracking-wider">
              Accent color
            </p>
            <div className="mt-2 flex gap-2">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setDraft((d) => ({ ...d, avatarColor: color }))}
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    draft.avatarColor === color
                      ? "ring-2 ring-white ring-offset-2 ring-offset-livv-black scale-110"
                      : "opacity-70 hover:opacity-100"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs text-livv-muted uppercase tracking-wider">
                Display name
              </label>
              <input
                type="text"
                value={draft.displayName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, displayName: e.target.value }))
                }
                maxLength={32}
                className="mt-2 w-full rounded-xl border border-livv-border bg-livv-surface px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-livv-accent/40"
              />
            </div>

            <div>
              <label className="text-xs text-livv-muted uppercase tracking-wider">
                Username
              </label>
              <div className="mt-2 flex items-center rounded-xl border border-livv-border bg-livv-surface overflow-hidden focus-within:ring-2 focus-within:ring-livv-accent/40">
                <span className="pl-4 text-livv-muted">@</span>
                <input
                  type="text"
                  value={draft.username}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      username: e.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
                    }))
                  }
                  maxLength={24}
                  className="w-full bg-transparent px-2 py-3 text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-livv-muted uppercase tracking-wider">
                Bio
              </label>
              <textarea
                value={draft.bio}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, bio: e.target.value }))
                }
                maxLength={160}
                rows={3}
                className="mt-2 w-full rounded-xl border border-livv-border bg-livv-surface px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-livv-accent/40 resize-none"
              />
              <p className="mt-1 text-right text-[11px] text-livv-muted">
                {draft.bio.length}/160
              </p>
            </div>
          </div>

          <div className="mt-10">
            <Button variant="accent" size="lg" className="w-full" onClick={saveEdit}>
              Save Identity
            </Button>
          </div>
        </Container>
      </main>
    );
  }

  // ─── PROFILE VIEW ─────────────────────────────────────────
  return (
    <main className="pt-8 pb-6">
      <Container>
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-white border-2 border-white/10 shadow-lg"
            style={{
              backgroundColor: profile.avatarColor,
              boxShadow: `0 0 40px ${profile.avatarColor}33`,
            }}
          >
            {profile.avatarInitial}
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            {profile.displayName}
          </h1>
          <p className="text-sm text-livv-muted">@{profile.username}</p>

          {profile.bio && (
            <p className="mt-3 max-w-xs text-sm text-white/70 leading-relaxed">
              {profile.bio}
            </p>
          )}

          <div className="mt-4 flex items-center gap-3 text-xs">
            <span className="rounded-full bg-livv-accent/15 text-livv-accent-soft px-3 py-1 font-medium">
              Level {PROFILE_STATS.level}
            </span>
            <span className="text-livv-muted">
              {PROFILE_STATS.currentXp} XP
            </span>
            <span className="text-livv-muted">
              {PROFILE_STATS.streak} day streak
            </span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="mt-5"
            onClick={openEdit}
          >
            Edit Profile
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {[
            { label: "Workouts", value: PROFILE_STATS.workoutsCompleted },
            { label: "Goals", value: PROFILE_STATS.goalsCompleted },
            { label: "Streak", value: PROFILE_STATS.streak },
            { label: "Level", value: PROFILE_STATS.level },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-livv-border bg-livv-surface py-3 text-center"
            >
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[10px] text-livv-muted mt-0.5 uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* XP bar */}
        <div className="rounded-xl border border-livv-border bg-livv-surface p-4 mb-8">
          <div className="flex justify-between text-xs text-livv-muted mb-1.5">
            <span>Evolution XP</span>
            <span>
              {PROFILE_STATS.currentXp} / {PROFILE_STATS.xpToNext}
            </span>
          </div>
          <div className="h-2 rounded-full bg-livv-black overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-livv-accent to-livv-energy transition-all"
              style={{ width: `${Math.min(xpPercent, 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-livv-muted">
            {PROFILE_STATS.xpToNext - PROFILE_STATS.currentXp} XP to Level{" "}
            {PROFILE_STATS.level + 1}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-livv-border mb-5">
          {(
            [
              { id: "progress", label: "Progress" },
              { id: "achievements", label: "Achievements" },
              { id: "posts", label: "Posts" },
            ] as { id: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 pb-3 text-sm font-medium transition-colors",
                tab === t.id
                  ? "text-white border-b-2 border-livv-accent"
                  : "text-livv-muted hover:text-white/80"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "progress" && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-xs text-livv-muted uppercase tracking-wider mb-1">
              Evolution Pillars
            </p>
            {PILLARS.map((pillar) => (
              <div
                key={pillar.id}
                className="rounded-xl border border-livv-border bg-livv-surface p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{pillar.name}</p>
                  <span className="text-xs text-livv-accent-soft">
                    Lv {pillar.level}
                  </span>
                </div>
                <div className="mt-2.5 h-1.5 rounded-full bg-livv-black overflow-hidden">
                  <div
                    className="h-full bg-livv-accent/80"
                    style={{ width: `${pillar.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "achievements" && (
          <div className="space-y-2 animate-fade-in">
            {ACHIEVEMENTS.map((ach) => (
              <div
                key={ach.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3.5",
                  ach.unlocked
                    ? "border-livv-border bg-livv-surface"
                    : "border-livv-border/40 bg-livv-black/50 opacity-55"
                )}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-livv-black text-lg">
                  {ach.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{ach.title}</p>
                  <p className="text-xs text-livv-muted">{ach.description}</p>
                </div>
                {ach.unlocked ? (
                  <span className="text-[10px] text-livv-accent-soft shrink-0">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] text-white/25 shrink-0">
                    Locked
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "posts" && (
          <div className="animate-fade-in rounded-2xl border border-livv-border bg-livv-surface p-10 text-center">
            <p className="text-sm text-livv-muted">No posts yet</p>
            <p className="mt-2 text-xs text-white/30">
              Sharing and identity posts will live here later.
            </p>
          </div>
        )}

        <p className="mt-10 text-center text-[11px] text-white/25">
          Identity is local for now. Nothing is permanently saved.
        </p>
      </Container>
    </main>
  );
}