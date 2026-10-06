"use client";

import Link from "next/link";
import { ChevronRight, Settings2 } from "lucide-react";
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

  const name = (me.displayName || "").trim() || "LIVV";
  const handle = me.username
    ? "@" + me.username.replace(/^@/, "")
    : null;
  const embers = me.embers || 0;
  const dollars = embersToDollars(embers);
  const initial = (name[0] || "L").toUpperCase();

  return (
    <main className="you" aria-label="You">
      <div className="you-inner">
        <header className="you-top">
          <p className="you-top-k">You</p>
          <Link href="/home/settings" className="you-icon" aria-label="Settings">
            <Settings2 size={18} strokeWidth={1.7} />
          </Link>
        </header>

        <section className="you-id">
          <div className="you-photo-wrap" aria-hidden>
            {me.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={me.photo} alt="" />
            ) : (
              <div className="you-photo-fallback">{initial}</div>
            )}
          </div>
          <h1 className="you-name">{name}</h1>
          {handle ? <p className="you-handle">{handle}</p> : null}
          {me.bio ? (
            <p className="you-bio">{me.bio}</p>
          ) : (
            <p className="you-bio">Add a short line about who you are becoming.</p>
          )}
          <Link href="/home/profile/edit" className="you-edit">
            Edit profile
          </Link>
        </section>

        <section className="you-section" aria-label="Your record">
          <p className="you-section-k">Your record</p>
          <div className="you-record">
            <div>
              <strong>{rec.streak || 0}</strong>
              <span>Day streak</span>
            </div>
            <div>
              <strong>{rec.workoutsCompleted || 0}</strong>
              <span>Sessions</span>
            </div>
            <div>
              <strong>{rec.goalsCompleted || 0}</strong>
              <span>Objectives</span>
            </div>
          </div>
        </section>

        <section className="you-section" aria-label="Account">
          <p className="you-section-k">Account</p>
          <Link href="/home/profile/embers" className="you-link">
            <div>
              <p className="you-link-t">Embers</p>
              <p className="you-link-s">
                {dollars > 0
                  ? `≈ $${dollars.toFixed(2)} toward Collection 001`
                  : `${MIN_REDEEM_EMBERS.toLocaleString()} to unlock redemption`}
              </p>
            </div>
            <span className="you-link-v">{embers.toLocaleString()}</span>
          </Link>
          <Link href="/home/settings" className="you-link">
            <div>
              <p className="you-link-t">Settings</p>
              <p className="you-link-s">Appearance, data, sign out</p>
            </div>
            <ChevronRight size={18} className="you-chev" />
          </Link>
        </section>
      </div>
    </main>
  );
}
