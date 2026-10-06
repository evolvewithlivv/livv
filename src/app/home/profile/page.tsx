"use client";

import Link from "next/link";
import { ChevronRight, Flame, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { loadIdentity, type Identity } from "@/lib/identity";
import { loadRecord } from "@/lib/record";
import { MIN_REDEEM_EMBERS, embersToDollars } from "@/lib/ember-economy";
import "./profile-signal.css";

export default function ProfilePage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [rec, setRec] = useState<ReturnType<typeof loadRecord> | null>(null);

  useEffect(() => {
    const sync = () => {
      setMe(loadIdentity());
      setRec(loadRecord());
    };
    sync();
    window.addEventListener("livv-identity", sync);
    window.addEventListener("livv-record", sync);
    return () => {
      window.removeEventListener("livv-identity", sync);
      window.removeEventListener("livv-record", sync);
    };
  }, []);

  if (!me || !rec) return <main className="you" aria-hidden />;

  const name = me.displayName || me.username || "LIVV";
  const handle = me.username ? "@" + me.username.replace(/^@/, "") : "@livv";
  const embers = me.embers || 0;
  const dollars = embersToDollars(embers);

  return (
    <main className="you" aria-label="Profile">
      <div className="you-inner">
        <header className="you-top">
          <p className="you-eyebrow">YOU</p>
          <Link href="/home/settings" aria-label="Settings" className="you-icon-btn"><Settings2 size={16} strokeWidth={1.7} /></Link>
        </header>

        <section className="you-hero">
          <div className="you-brand-mark" aria-hidden>
            <img src="/livv-logo.png" alt="" width="82" height="82" />
          </div>
          <p className="you-kicker">LIVV MEMBER</p>
          <h1 className="you-name">{name}</h1>
          <p className="you-handle">{handle}</p>
          {me.bio ? <p className="you-bio">{me.bio}</p> : null}
        </section>

        <section className="you-record" aria-label="Your record">
          <div className="you-record-head">
            <div>
              <p className="you-label">YOUR RECORD</p>
              <h2>Built over time.</h2>
            </div>
            <span>{rec.streak || 0} day streak</span>
          </div>
          <div className="you-stats">
            <div><strong>{rec.streak || 0}</strong><span>Streak</span></div>
            <div><strong>{rec.workoutsCompleted || 0}</strong><span>Sessions</span></div>
            <div><strong>{rec.goalsCompleted || 0}</strong><span>Objectives</span></div>
          </div>
        </section>

        <section className="you-embers">
          <div className="you-embers-icon"><Flame size={16} /></div>
          <div className="you-embers-body">
            <p className="you-label">EMBER BALANCE</p>
            <strong>{embers.toLocaleString()}</strong>
            <span>{dollars > 0 ? "≈ $" + dollars.toFixed(2) + " toward Collection 001" : MIN_REDEEM_EMBERS.toLocaleString() + " to unlock redemption"}</span>
          </div>
          <Link href="/home/shop" className="you-embers-go" aria-label="Open Shop"><ChevronRight size={17} /></Link>
        </section>

        <section className="you-status">
          <p className="you-label">LIVV STATUS</p>
          <p>Keep the standard practical. Build the evidence. Then keep going.</p>
        </section>
      </div>
    </main>
  );
}