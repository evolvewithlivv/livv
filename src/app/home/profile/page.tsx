"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Flame,
  Pencil,
  Settings2,
  Share2,
  Trophy,
  Zap,
} from "lucide-react";
import { Avatar } from "@/components/identity/avatar";
import { PageHero } from "@/components/layout/page-hero";
import { fileToPhoto, loadIdentity, patchIdentity, type Identity } from "@/lib/identity";
import { loadRecord } from "@/lib/record";
import { evolutionTitle } from "@/lib/levels";
import { feedback } from "@/lib/sensory";
import { syncIdentityToCloud } from "@/lib/auth";
import {
  MIN_REDEEM_EMBERS,
  embersToDollars,
} from "@/lib/ember-economy";
import { LIVV_SHARE_BACKGROUNDS } from "@/lib/share-backgrounds";
import {
  renderLIVVShareCard,
  shareOrDownloadBlob,
  type ShareCardData,
} from "@/lib/share-card";

export default function ProfilePage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [rec, setRec] = useState<ReturnType<typeof loadRecord> | null>(null);
  const [status, setStatus] = useState("");
  const [sharing, setSharing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => {
      try {
        setMe(loadIdentity());
        setRec(loadRecord());
      } catch {
        /* keep last good state */
      }
    };
    sync();
    for (const event of ["livv-identity", "livv-record"]) {
      window.addEventListener(event, sync);
    }
    return () => {
      for (const event of ["livv-identity", "livv-record"]) {
        window.removeEventListener(event, sync);
      }
    };
  }, []);

  if (!me || !rec) return <main className="min-h-dvh" />;

  const evo = evolutionTitle(rec.level);
  const xpToNext = Math.max(1, rec.xpToNext || 1);
  const pct = Math.min(100, Math.round((rec.currentXp / xpToNext) * 100));
  const embers = me.embers || 0;
  const emberDollars = embersToDollars(embers);

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

  const shareProfileCard = async () => {
    if (sharing) return;
    setSharing(true);
    setStatus("");
    try {
      const bg =
        LIVV_SHARE_BACKGROUNDS[0]?.src ||
        "/share-backgrounds/IMG_1400.jpeg";
      const data: ShareCardData = {
        displayName: me.displayName || me.username || "LIVV member",
        username: me.username || "livv",
        level: rec.level || 1,
        evolutionName: evo.name,
        streak: rec.streak || 0,
        tierLabel: "LIVV",
        tierColor: "#FFFFFF",
        embers: me.embers || 0,
        workoutsCompleted: rec.workoutsCompleted || 0,
        dailyScore: pct,
        bodyScore: pct,
        weeklyActive: 0,
        weeklyWorkouts: 0,
        mindSessions: rec.mindObjectives || 0,
        customPhoto: me.photo || null,
        backgroundSrc: bg,
        workoutName: "",
        focus: "",
        duration: "",
        exerciseCount: 0,
        font: "sans",
        textColor: "#FFFFFF",
        logo: "white",
      };
      const blob = await renderLIVVShareCard("identity", data);
      const result = await shareOrDownloadBlob(
        blob,
        `livv-profile-${me.username || "card"}.png`,
        "My LIVV profile",
      );
      feedback("tick");
      setStatus(
        result === "shared"
          ? "Share sheet open — Save Image to add to Photos."
          : "Profile card saved to your device.",
      );
    } catch {
      setStatus("Could not create the profile card.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <main className="livv-page min-h-full text-livv-ink">
      <div className="livv-stagger mx-auto w-full max-w-2xl px-5 pb-12 pt-6 sm:px-6">
        <PageHero
          eyebrow="You"
          title="You."
          subtitle="Identity, Embers, and the work behind your level."
          right={
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => void shareProfileCard()}
                disabled={sharing}
                aria-label="Save profile card"
                className="livv-press grid h-10 w-10 place-items-center rounded-full border border-livv-border text-livv-muted transition hover:text-livv-ink disabled:opacity-50"
              >
                <Share2 size={16} strokeWidth={1.8} />
              </button>
              <Link
                href="/home/settings"
                aria-label="Settings"
                className="livv-press grid h-10 w-10 place-items-center rounded-full border border-livv-border text-livv-muted transition hover:text-livv-ink"
              >
                <Settings2 size={16} strokeWidth={1.8} />
              </Link>
            </div>
          }
        />

        <section className="mt-8 overflow-hidden rounded-[22px] border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_2.5%,transparent)]">
          <div className="px-5 pb-6 pt-7 text-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="livv-press relative mx-auto block rounded-full"
              aria-label="Change profile photo"
            >
              <Avatar
                identity={me}
                size={128}
                fit="contain"
                className="profile-avatar"
              />
              <span
                className="absolute bottom-0.5 right-0.5 grid h-8 w-8 place-items-center rounded-full border-2 border-[var(--livv-pro-surface)] bg-[var(--livv-pro-ink)] text-[var(--livv-pro-bg)] shadow-[0_2px_8px_rgba(0,0,0,.28)]"
                aria-hidden
              >
                <Pencil size={13} strokeWidth={2.2} />
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void photo(e.target.files?.[0])}
            />

            <h2 className="mt-5 text-[26px] font-semibold tracking-[-.04em]">
              {me.displayName || me.username || "Member"}
            </h2>
            <p className="mt-1 text-[13px] text-livv-muted">
              @{me.username || "livv"}
            </p>

            {me.bio ? (
              <p className="mx-auto mt-3 max-w-[36ch] text-[13px] leading-relaxed text-livv-muted">
                {me.bio}
              </p>
            ) : null}
            {status ? (
              <p
                className={
                  status.startsWith("Could")
                    ? "mt-2 text-[12px] text-red-500"
                    : "mt-2 text-[12px] text-livv-muted"
                }
              >
                {status}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-livv-border px-3 py-4">
            <Stat value={String(rec.level)} label="Level" icon={<Zap size={13} />} />
            <Stat value={String(rec.streak)} label="Streak" icon={<Flame size={13} />} />
            <Stat value={`${pct}%`} label="XP" icon={<Trophy size={13} />} />
          </div>

          <div className="border-t border-livv-border px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-livv-muted">
                {evo.name}
              </p>
              <p className="text-[11px] tabular-nums text-livv-muted">
                {rec.currentXp} / {xpToNext} XP
              </p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-livv-border">
              <div
                className="h-full rounded-full bg-livv-accent transition-[width] duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[22px] border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_2.5%,transparent)] px-5 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">
                Embers
              </p>
              <p className="mt-1.5 text-[24px] font-semibold tabular-nums tracking-[-.03em]">
                {embers.toLocaleString()}
              </p>
              <p className="mt-1 max-w-[34ch] text-[12px] leading-relaxed text-livv-muted">
                {emberDollars >= 1
                  ? `≈ $${emberDollars} toward Collection · min ${MIN_REDEEM_EMBERS.toLocaleString()}`
                  : `Earn ${MIN_REDEEM_EMBERS.toLocaleString()} Embers to unlock $10+ off Collection`}
              </p>
            </div>
            <Link
              href="/home/shop"
              className="livv-press grid h-10 w-10 shrink-0 place-items-center rounded-full border border-livv-border text-livv-muted transition hover:text-livv-ink"
              aria-label="Open shop"
            >
              <ChevronRight size={16} />
            </Link>
          </div>
        </section>

        <section className="mt-3">
          <Link
            href="/home/vault"
            className="livv-press flex items-center justify-between gap-4 rounded-[22px] border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_2.5%,transparent)] px-5 py-5 transition hover:border-[color-mix(in_srgb,rgb(var(--livv-ink))_18%,transparent)]"
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">
                Vault
              </p>
              <p className="mt-1.5 text-[17px] font-semibold tracking-[-.02em]">
                Protocols, tools, downloads
              </p>
              <p className="mt-1 text-[12px] text-livv-muted">
                Protocols, tools, and downloads. Free to every LIVV user.
              </p>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-livv-border text-livv-muted">
              <ChevronRight size={16} />
            </span>
          </Link>
        </section>

        <section className="mt-3">
          <Link
            href="/home/progress"
            className="livv-press flex items-center justify-between gap-4 rounded-[22px] border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_2.5%,transparent)] px-5 py-5 transition hover:border-[color-mix(in_srgb,rgb(var(--livv-ink))_18%,transparent)]"
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">
                The record
              </p>
              <p className="mt-1.5 text-[17px] font-semibold tracking-[-.02em]">
                How you are moving
              </p>
              <p className="mt-1 text-[12px] text-livv-muted">
                Actions, streaks, and the areas you touch.
              </p>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-livv-border text-livv-muted">
              <ChevronRight size={16} />
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}

function Stat({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-livv-muted">
      {icon}
      <span className="text-[17px] font-semibold tabular-nums text-livv-ink">
        {value}
      </span>
      <span className="text-[9px] uppercase tracking-[.16em]">{label}</span>
    </div>
  );
}
