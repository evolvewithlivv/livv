"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { loadIdentity } from "@/lib/identity";
import { MIN_REDEEM_EMBERS, embersToDollars } from "@/lib/ember-economy";
import "../profile-signal.css";

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

  return (
    <main className="you" aria-label="Embers">
      <div className="you-inner">
        <Link
          href="/home/profile"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            fontWeight: 650,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgb(var(--livv-muted))",
            textDecoration: "none",
          }}
        >
          <ChevronLeft size={16} /> You
        </Link>

        <p className="you-section-k" style={{ marginTop: "1.5rem" }}>
          Ember balance
        </p>
        <h1 className="you-name" style={{ marginTop: "0.35rem" }}>
          {embers.toLocaleString()}
        </h1>
        <p className="you-bio">
          {dollars > 0
            ? `≈ $${dollars.toFixed(2)} toward Collection 001`
            : `${remaining.toLocaleString()} more to unlock redemption`}
        </p>

        <section className="you-section">
          <p className="you-section-k">How they work</p>
          <div className="you-link" style={{ pointerEvents: "none" }}>
            <div>
              <p className="you-link-t">Earned by showing up</p>
              <p className="you-link-s">
                Check-ins, training, and real objectives award Embers. Server-side
                rules prevent abuse.
              </p>
            </div>
          </div>
          <div className="you-link" style={{ pointerEvents: "none" }}>
            <div>
              <p className="you-link-t">Redemption</p>
              <p className="you-link-s">
                At {MIN_REDEEM_EMBERS.toLocaleString()} Embers you can apply value
                toward Collection 001 in the Shop.
              </p>
            </div>
          </div>
          <Link href="/home/shop" className="you-link">
            <div>
              <p className="you-link-t">Open Shop</p>
              <p className="you-link-s">Collection 001</p>
            </div>
            <span className="you-link-v">→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
