"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Download,
  FlaskConical,
  Lock,
  Sparkles,
  Wrench,
} from "lucide-react";
import { getEffectiveTier, hydrateServerEntitlement } from "@/lib/billing";
import { hasTier, type TierDef } from "@/lib/membership";
import { getTier } from "@/lib/membership";
import {
  lockedModules,
  modulesForTier,
  type VaultModule,
} from "@/lib/vault";
import type { LivvTier } from "@/lib/identity";

const KIND_ICON = {
  protocol: BookOpen,
  tool: Wrench,
  program: Sparkles,
  series: BookOpen,
  lab: FlaskConical,
} as const;

export default function VaultPage() {
  const [tier, setTier] = useState<LivvTier>("spark");

  useEffect(() => {
    const sync = () => setTier(getEffectiveTier());
    sync();
    void hydrateServerEntitlement().then(sync);
    for (const ev of ["livv-billing", "livv-identity"]) {
      window.addEventListener(ev, sync);
    }
    return () => {
      for (const ev of ["livv-billing", "livv-identity"]) {
        window.removeEventListener(ev, sync);
      }
    };
  }, []);

  const unlocked = useMemo(() => modulesForTier(tier), [tier]);
  const locked = useMemo(() => lockedModules(tier), [tier]);
  const tierDef = getTier(tier);
  const isMember = hasTier(tier, "rise");

  return (
    <main className="livv-page min-h-full pb-24">
      <div className="mx-auto w-full max-w-xl px-5 pt-6 sm:px-6">
        <header>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">
            Member Vault
          </p>
          <h1 className="mt-2 text-[32px] font-semibold leading-[0.96] tracking-[-0.05em] sm:text-[36px]">
            The other half of LIVV.
          </h1>
          <p className="mt-3 max-w-[36ch] text-[14px] leading-6 text-livv-muted">
            Protocols, tools, programs, and downloads. Built for people who want
            the system to go further.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-livv-border px-3 py-1 text-[11px] font-semibold text-[rgb(var(--livv-ink))]">
              {tierDef.name}
            </span>
            {isMember ? (
              <span className="rounded-full bg-livv-accent-soft px-3 py-1 text-[11px] font-semibold text-livv-accent">
                {unlocked.length} unlocked
              </span>
            ) : (
              <Link
                href="/home/tiers"
                className="rounded-full bg-[rgb(var(--livv-ink))] px-3 py-1 text-[11px] font-semibold text-[rgb(var(--livv-bg))]"
              >
                Unlock with Rise
              </Link>
            )}
          </div>
        </header>

        {!isMember ? (
          <section className="mt-8 rounded-[22px] border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_3%,transparent)] px-5 py-6">
            <p className="text-[15px] font-semibold tracking-[-0.02em] text-[rgb(var(--livv-ink))]">
              Vault is included with Rise and above.
            </p>
            <p className="mt-2 text-[13px] leading-6 text-livv-muted">
              Spark keeps the full core app free. Rise opens protocols, printable
              plans, advanced tools, and member series. Apex adds multi-week
              programs and Progress Lab.
            </p>
            <Link
              href="/home/tiers"
              className="mt-5 flex w-full items-center justify-center rounded-full bg-[rgb(var(--livv-ink))] py-3.5 text-[13px] font-semibold text-[rgb(var(--livv-bg))]"
            >
              See membership tiers
            </Link>
          </section>
        ) : null}

        {unlocked.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-livv-muted">
              Your tools
            </h2>
            <div className="mt-4 space-y-3">
              {unlocked.map((mod) => (
                <ModuleCard key={mod.id} mod={mod} locked={false} />
              ))}
            </div>
          </section>
        ) : null}

        {locked.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-livv-muted">
              {isMember ? "Higher tier" : "Inside the Vault"}
            </h2>
            <div className="mt-4 space-y-3">
              {locked.map((mod) => (
                <ModuleCard key={mod.id} mod={mod} locked />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function ModuleCard({ mod, locked }: { mod: VaultModule; locked: boolean }) {
  const Icon = KIND_ICON[mod.kind];
  const inner = (
    <>
      <div className="flex items-start gap-3">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl border ${
            locked
              ? "border-livv-border text-livv-muted"
              : "border-livv-accent/30 bg-livv-accent-soft text-livv-accent"
          }`}
        >
          {locked ? <Lock size={16} /> : <Icon size={16} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[rgb(var(--livv-ink))]">
              {mod.title}
            </h3>
            {mod.downloadable && !locked ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-livv-muted">
                <Download size={10} /> PDF
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[12px] leading-5 text-livv-muted">{mod.blurb}</p>
          <p className="mt-1.5 text-[11px] text-livv-muted">
            {mod.meta}
            {locked ? ` · Requires ${labelTier(mod.minTier)}` : ""}
          </p>
        </div>
      </div>
    </>
  );

  if (locked) {
    return (
      <div className="rounded-[18px] border border-livv-border px-4 py-4 opacity-70">
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={`/home/vault/${mod.id}`}
      className="block rounded-[18px] border border-livv-border px-4 py-4 transition active:scale-[0.99]"
    >
      {inner}
    </Link>
  );
}

function labelTier(t: LivvTier) {
  return { spark: "Spark", rise: "Rise", apex: "Apex", circle: "Inner Circle" }[t];
}

// silence unused type import if tree-shaken oddly
void (null as unknown as TierDef);
