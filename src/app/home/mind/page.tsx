"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Brain, ChevronRight, Compass } from "lucide-react";

const PRACTICES = [
  {
    href: "/home/daily",
    number: "01",
    label: "Reflect",
    line: "Ask the question. Write the honest answer. Look at the pattern.",
    icon: Brain,
  },
  {
    href: "/home/health/dictionary",
    number: "02",
    label: "Learn",
    line: "Build the language and principles that make you more capable.",
    icon: BookOpen,
  },
  {
    href: "/home/vault/member-mind-series",
    number: "03",
    label: "Go deeper",
    line: "Longer reads and practical protocols built to leave the screen.",
    icon: Compass,
  },
] as const;

const LIBRARY = [
  {
    href: "/home/vault/focus-block-tool",
    label: "Focus Block Planner",
    detail: "Tool · Attention",
    body: "Protect one hour. Decide the outcome before it starts.",
  },
  {
    href: "/home/vault/discipline-stack-7",
    label: "7-Day Discipline Stack",
    detail: "Protocol · 7 days",
    body: "Three non-negotiables a day. Nothing heroic. Everything repeatable.",
  },
  {
    href: "/home/vault/member-mind-series",
    label: "Mind Series",
    detail: "Series · Mind",
    body: "Longer reads on attention, standards, and long-game habits.",
  },
] as const;

export default function MindPage() {
  return (
    <main className="livv-page min-h-full pb-24">
      <div className="mx-auto w-full max-w-xl px-5 pb-10 sm:px-6">
        <header className="pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">Mind</p>
          <h1 className="mt-2 max-w-[20ch] text-[30px] font-semibold leading-[1.1] tracking-[-0.045em] text-[rgb(var(--livv-ink))] sm:text-[34px]">
            Train the way you think.
          </h1>
          <p className="mt-3 max-w-[39ch] text-[13px] leading-6 text-livv-muted">
            Read, reflect, and build a mind that holds up in real life.
          </p>
        </header>

        <section className="mt-8 rounded-2xl border border-livv-border bg-[var(--livv-pro-surface-2)] p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">Featured</p>
          <h2 className="mt-2.5 max-w-[24ch] text-[22px] font-semibold leading-[1.12] tracking-[-0.035em] text-[rgb(var(--livv-ink))]">
            The point is not to know more.
          </h2>
          <p className="mt-2.5 max-w-[42ch] text-[13px] leading-6 text-livv-muted">
            Become harder to fool, harder to break, and more capable of choosing what happens next.
          </p>
          <Link
            href="/home/vault/member-mind-series"
            className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--livv-pro-ink)] px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--livv-pro-bg)]"
          >
            Explore Mind
            <ArrowRight size={14} />
          </Link>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">Practice</p>
              <h2 className="mt-1.5 text-[24px] font-semibold tracking-[-0.04em]">Make it useful.</h2>
            </div>
          </div>

          <div className="mt-4 divide-y divide-livv-border border-y border-livv-border">
            {PRACTICES.map(({ href, number, label, line, icon: Icon }) => (
              <Link key={href} href={href} className="group flex items-center gap-4 py-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-livv-border text-livv-muted">
                  <Icon size={16} strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold tracking-[-0.02em] text-[rgb(var(--livv-ink))]">{label}</span>
                    <span className="text-[9px] font-medium tabular-nums text-livv-muted">{number}</span>
                  </span>
                  <span className="mt-1 block max-w-[42ch] text-[12px] leading-5 text-livv-muted">{line}</span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-livv-muted opacity-60 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 pb-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-livv-muted">Library</p>
              <h2 className="mt-1.5 text-[24px] font-semibold tracking-[-0.04em]">Ideas you can use.</h2>
            </div>
            <Link href="/home/vault" className="text-[11px] font-semibold text-livv-muted">View all</Link>
          </div>

          <div className="mt-4 divide-y divide-livv-border border-t border-livv-border">
            {LIBRARY.map(({ href, label, detail, body }) => (
              <Link key={href} href={href} className="group block py-5">
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-livv-muted">{detail}</p>
                    <h3 className="mt-1.5 text-[17px] font-semibold tracking-[-0.025em] text-[rgb(var(--livv-ink))]">{label}</h3>
                    <p className="mt-1.5 max-w-[42ch] text-[12px] leading-5 text-livv-muted">{body}</p>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-livv-border text-livv-muted">
                    <ChevronRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
