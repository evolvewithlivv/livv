"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Flame,
  Settings2,
  Share2,
} from "lucide-react";
import { Avatar } from "@/components/identity/avatar";
import { fileToPhoto, loadIdentity, patchIdentity, type Identity } from "@/lib/identity";
import { loadRecord } from "@/lib/record";
import { evolutionTitle } from "@/lib/levels";
import { feedback, haptic } from "@/lib/sensory";
import { syncIdentityToCloud } from "@/lib/auth";
import { MIN_REDEEM_EMBERS, embersToDollars } from "@/lib/ember-economy";
import { LIVV_SHARE_BACKGROUNDS } from "@/lib/share-backgrounds";
import {
  renderLIVVShareCard,
  shareOrDownloadBlob,
  type ShareCardData,
} from "@/lib/share-card";
import "./profile-signal.css";

export default function ProfilePage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [rec, setRec] = useState<ReturnType<typeof loadRecord> | null>(null);
  const [status, setStatus] = useState("");
  const [sharing, setSharing] = useState(false);
  const [awake, setAwake] = useState(false);
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
    const t = window.setTimeout(() => setAwake(true), 80);
    return () => {
      for (const event of ["livv-identity", "livv-record"]) {
        window.removeEventListener(event, sync);
      }
      window.clearTimeout(t);
    };
  }, []);

  if (!me || !rec) return <main className="you min-h-[70dvh]" aria-hidden />;

  const evo = evolutionTitle(rec.level);
  const xpToNext = Math.max(1, rec.xpToNext || 1);
  const pct = Math.min(100, Math.round((rec.currentXp / xpToNext) * 100));
  const embers = me.embers || 0;
  const emberDollars = embersToDollars(embers);
  const name = me.displayName || me.username || "Member";
  const handle = me.username ? `@${me.username.replace(/^@/, "")}` : "@livv";

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
        LIVV_SHARE_BACKGROUNDS[0]?.src || "/share-backgrounds/IMG_1400.jpeg";
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
        "My LIVV profile"
      );
      feedback("tick");
      setStatus(
        result === "shared"
          ? "Share sheet open — Save Image to add to Photos."
          : "Profile card saved to your device."
      );
    } catch {
      setStatus("Could not create the profile card.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <main className={"you" + (awake ? " awake" : "")} aria-label="Profile">
      <div className="you-void" aria-hidden />

      <div className="you-inner">
        <header className="you-top">
          <p className="you-eyebrow">You</p>
          <div className="you-actions">
            <button
              type="button"
              onClick={() => void shareProfileCard()}
              disabled={sharing}
              aria-label="Share profile card"
              className="you-icon-btn"
            >
              <Share2 size={16} strokeWidth={1.9} />
            </button>
            <Link href="/home/settings" aria-label="Settings" className="you-icon-btn">
              <Settings2 size={16} strokeWidth={1.9} />
            </Link>
          </div>
        </header>

        <section className="you-hero">
          <div className="you-identity">
            <div className="you-avatar-wrap">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="you-avatar-btn"
                aria-label="Change profile photo"
              >
                <Avatar identity={me} size={118} fit="contain" className="you-avatar" showTierRing />
              </button>
              <p className="you-photo-hint">Tap to edit</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void photo(e.target.files?.[0])}
              />
            </div>

            <div className="you-identity-text">
              <h1 className="you-name">{name}</h1>
              <p className="you-handle">{handle}</p>
              {me.bio ? <p className="you-bio">{me.bio}</p> : null}
              {status ? (
                <p className={"you-status" + (status.startsWith("Could") ? " is-err" : "")}>
                  {status}
                </p>
              ) : null}
            </div>
          </div>

          <div className="you-evo">
            <p className="you-evo-label">Evolution</p>
            <p className="you-evo-name">{evo.name}</p>
            <p className="you-evo-meta">
              Level {rec.level} · {rec.currentXp} / {xpToNext} XP
            </p>
            <div
              className="you-xp-bar"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${pct} percent toward next level`}
            >
              <div className="you-xp-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </section>

        <section className="you-stats" aria-label="Stats">
          <div className="you-stat">
            <p className="you-stat-v">{rec.streak || 0}</p>
            <p className="you-stat-l">Streak</p>
          </div>
          <div className="you-stat">
            <p className="you-stat-v">{rec.workoutsCompleted || 0}</p>
            <p className="you-stat-l">Sessions</p>
          </div>
          <div className="you-stat">
            <p className="you-stat-v">{rec.goalsCompleted || 0}</p>
            <p className="you-stat-l">Objectives</p>
          </div>
        </section>

        <section className="you-embers">
          <div className="you-embers-icon" aria-hidden>
            <Flame size={18} />
          </div>
          <div className="you-embers-body">
            <p className="you-embers-label">Embers</p>
            <p className="you-embers-value">{embers.toLocaleString()}</p>
            <p className="you-embers-note">
              {emberDollars >= 1
                ? `≈ $${emberDollars.toFixed(2)} toward Collection · min ${MIN_REDEEM_EMBERS.toLocaleString()}`
                : `${MIN_REDEEM_EMBERS.toLocaleString()} Embers unlock redeem`}
            </p>
          </div>
          <Link
            href="/home/shop"
            className="you-embers-go"
            aria-label="Open shop"
            onClick={() => haptic("light")}
          >
            <ChevronRight size={18} />
          </Link>
        </section>

        <Link
          href="/home/progress"
          className="you-link"
          onClick={() => haptic("light")}
        >
          <div>
            <p className="you-link-label">Record</p>
            <p className="you-link-title">How you are moving</p>
            <p className="you-link-sub">Actions, streaks, pillars, evidence.</p>
          </div>
          <span className="you-link-chev" aria-hidden>
            <ChevronRight size={18} />
          </span>
        </Link>
      </div>
    </main>
  );
}
