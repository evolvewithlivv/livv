"use client";

import { useEffect, useState } from "react";
import { loadIdentity, type Identity } from "@/lib/identity";
import { loadRecord, type LivvRecord } from "@/lib/record";
import { quoteForSession, type Quote } from "@/lib/quotes";

/**
 * Home is an introduction.
 * Not a checklist. Not a second tab bar. Not a stats dashboard.
 * You open the door. The tabs are where the work lives.
 */
export default function HomePage() {
  const [me, setMe] = useState<Identity | null>(null);
  const [rec, setRec] = useState<LivvRecord | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    const pull = () => {
      setMe(loadIdentity());
      setRec(loadRecord());
    };
    pull();
    setQuote(quoteForSession());
    const events = ["livv-identity", "livv-record"];
    events.forEach((e) => window.addEventListener(e, pull));
    return () => events.forEach((e) => window.removeEventListener(e, pull));
  }, []);

  if (!me || !rec) return <main className="min-h-dvh" />;

  const raw = me.displayName?.trim() || "";
  const brandish =
    !raw || raw.toLowerCase() === "livv" || raw.toLowerCase() === "there";
  const first = brandish
    ? me.username?.trim() || "friend"
    : raw.split(/\s+/)[0];

  return (
    <main className="livv-page min-h-full pb-28">
      <div className="mx-auto flex min-h-[calc(100dvh-7rem)] w-full max-w-[40rem] flex-col px-5 sm:px-6">
        <div className="flex flex-1 flex-col justify-center py-10">
          <p className="text-[12px] font-medium tracking-[0.04em] text-livv-muted">
            Welcome in, {first}
          </p>

          <h1 className="mt-6 max-w-[12ch] text-[40px] font-bold leading-[0.95] tracking-[-0.055em] text-[rgb(var(--livv-ink))] sm:text-[46px]">
            This is LIVV.
          </h1>

          <p className="mt-8 max-w-[32ch] text-[17px] leading-[1.55] text-[rgb(var(--livv-ink))]">
            A place to become more capable — in body, mind, work, and how you
            meet the world.
          </p>

          <div className="mt-10 space-y-4 border-t border-livv-border pt-8">
            <p className="text-[14px] leading-relaxed text-livv-muted">
              <span className="font-semibold text-[rgb(var(--livv-ink))]">
                Longevity
              </span>
              {" — "}years you can still use.
            </p>
            <p className="text-[14px] leading-relaxed text-livv-muted">
              <span className="font-semibold text-[rgb(var(--livv-ink))]">
                Integrity
              </span>
              {" — "}standards you keep when no one is watching.
            </p>
            <p className="text-[14px] leading-relaxed text-livv-muted">
              <span className="font-semibold text-[rgb(var(--livv-ink))]">
                Vitality
              </span>
              {" — "}energy to carry the life you want.
            </p>
            <p className="text-[14px] leading-relaxed text-livv-muted">
              <span className="font-semibold text-[rgb(var(--livv-ink))]">
                Vigilance
              </span>
              {" — "}attention before force. Skill before panic.
            </p>
          </div>

          {quote ? (
            <div className="mt-12 border-t border-livv-border pt-8">
              <p className="max-w-[28ch] text-[18px] font-medium leading-[1.35] tracking-[-0.02em] text-[rgb(var(--livv-ink))]">
                “{quote.text}”
              </p>
              <p className="mt-4 text-[12px] text-livv-muted">
                {quote.author}
                {quote.source ? ` · ${quote.source}` : ""}
              </p>
            </div>
          ) : null}

          <p className="mt-14 max-w-[30ch] text-[14px] leading-relaxed text-livv-muted">
            The work lives below — Daily, Train, Health.
            Open one when you are ready. Leave the rest alone.
          </p>

          <p className="mt-8 text-[13px] font-medium tracking-[-0.01em] text-[rgb(var(--livv-ink))]">
            Evolve with purpose.
          </p>
        </div>
      </div>
    </main>
  );
}
