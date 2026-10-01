"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * Articles removed from the product surface for now.
 * Mind stays as a calm doorway — not a broken feed.
 */
const DOORS = [
  {
    href: "/home/daily",
    label: "Daily",
    line: "A few concrete actions. No second dashboard.",
  },
  {
    href: "/home/train",
    label: "Train",
    line: "Strength, breath, and a body you can rely on.",
  },
  {
    href: "/home/health",
    label: "Health",
    line: "Sleep, food, recovery — the baseline.",
  },
  {
    href: "/home/vault",
    label: "Vault",
    line: "Protocols when you want depth, not more reading.",
  },
] as const;

export default function MindPage() {
  return (
    <main className="livv-page min-h-full pb-28">
      <div className="mx-auto w-full max-w-[40rem] px-5 pt-8 sm:px-6">
        <p className="text-[11px] font-medium tracking-[0.04em] text-livv-muted">Mind</p>
        <h1 className="mt-3 max-w-[14ch] text-[36px] font-bold leading-[1.02] tracking-[-0.05em] text-[rgb(var(--livv-ink))] sm:text-[40px]">
          Clarity over content.
        </h1>
        <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-livv-muted">
          The reading desk is offline while we rebuild it properly. Use the rooms that
          already change how you live.
        </p>

        <section className="mt-14 border-t border-livv-border pt-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">
            Go do something real
          </p>
          <div className="mt-6 divide-y divide-livv-border border-t border-livv-border">
            {DOORS.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className="group flex items-start justify-between gap-4 py-5 transition active:opacity-80"
              >
                <span className="min-w-0">
                  <span className="block text-[17px] font-semibold tracking-[-0.03em] text-[rgb(var(--livv-ink))]">
                    {d.label}
                  </span>
                  <span className="mt-1 block max-w-[30ch] text-[13px] leading-relaxed text-livv-muted">
                    {d.line}
                  </span>
                </span>
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-livv-border text-livv-muted">
                  <ArrowUpRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <p className="mt-14 text-[13px] text-livv-muted">
          <Link href="/home" className="font-semibold text-[rgb(var(--livv-ink))] underline-offset-4 hover:underline">
            Back to Home
          </Link>
        </p>
      </div>
    </main>
  );
}
