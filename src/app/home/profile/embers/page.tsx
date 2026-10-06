"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadIdentity } from "@/lib/identity";
import {
  EMBERS_PER_DOLLAR,
  MIN_REDEEM_EMBERS,
  embersToDollars,
} from "@/lib/ember-economy";
import "./embers.css";

export default function EmbersPage() {
  const [embers, setEmbers] = useState(0);

  useEffect(() => {
    const sync = () => setEmbers(loadIdentity().embers || 0);
    sync();
    window.addEventListener("livv-identity", sync);
    return () => window.removeEventListener("livv-identity", sync);
  }, []);

  const dollars = embersToDollars(embers);
  const remaining = Math.max(0, MIN_REDEEM_EMBERS - embers);
  const progress = Math.min(100, Math.round((embers / MIN_REDEEM_EMBERS) * 100));
  const canRedeem = embers >= MIN_REDEEM_EMBERS;

  return (
    <main className="em" aria-label="Embers">
      <div className="em-inner">
        <header className="em-top">
          <Link href="/home/profile" className="em-back">
            You
          </Link>
        </header>

        <section className="em-hero">
          <p className="em-k">Balance</p>
          <h1 className="em-balance">{embers.toLocaleString()}</h1>
          <p className="em-value">
            {dollars > 0
              ? `≈ $${dollars.toFixed(2)} toward Collection 001`
              : "No credit yet"}
          </p>
        </section>

        <section className="em-progress" aria-label="Redemption progress">
          <div className="em-progress-meta">
            <span>{canRedeem ? "Ready to redeem" : `${remaining.toLocaleString()} to redeem`}</span>
            <span>{progress}%</span>
          </div>
          <div className="em-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="em-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="em-progress-note">
            {MIN_REDEEM_EMBERS.toLocaleString()} Embers unlocks credit in the Shop
          </p>
        </section>

        <section className="em-rules">
          <p className="em-k">How it works</p>
          <div className="em-rule">
            <p className="em-rule-t">Show up</p>
            <p className="em-rule-s">
              Check-in, train, finish Daily objectives. Awards are server-side.
            </p>
          </div>
          <div className="em-rule">
            <p className="em-rule-t">Rate</p>
            <p className="em-rule-s">
              {EMBERS_PER_DOLLAR} Embers = $1 off Collection 001. Same rate for everyone.
            </p>
          </div>
          <div className="em-rule">
            <p className="em-rule-t">Redeem</p>
            <p className="em-rule-s">
              Minimum {MIN_REDEEM_EMBERS.toLocaleString()} Embers. Not cash. Not transferable.
            </p>
          </div>
        </section>

        <Link href="/home/shop" className="em-cta">
          {canRedeem ? "Redeem in Shop" : "View Collection 001"}
        </Link>
      </div>
    </main>
  );
}
