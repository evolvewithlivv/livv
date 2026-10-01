"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, Brain, Compass, Sparkles } from "lucide-react";

const ROOMS = [
  { href: "/home/daily", label: "Daily", line: "A few concrete actions to turn thought into movement.", icon: Compass },
  { href: "/home/health/dictionary", label: "Learn", line: "Definitions and principles that make you more capable.", icon: BookOpen },
  { href: "/home/progress", label: "Reflect", line: "Look at the pattern. Decide what changes next.", icon: Brain },
] as const;

const FEATURES = [
  { label: "PERSPECTIVE", title: "Clarity is a capability.", body: "You do not need more information. You need to know what matters, what does not, and what to do with the difference." },
  { label: "ATTENTION", title: "Protect the thing you are trying to become.", body: "Your attention is one of the few resources you spend every day without getting back. Spend it deliberately." },
] as const;

export default function MindPage() {
  return (
    <main className="livv-page min-h-full pb-28">
      <div className="mx-auto w-full max-w-[42rem] px-5 pb-12 pt-8 sm:px-6">
        <header>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-livv-muted">Mind</p>
          <h1 className="mt-4 max-w-[12ch] text-[44px] font-bold leading-[0.96] tracking-[-0.065em] text-[rgb(var(--livv-ink))] sm:text-[52px]">Train the way you think.</h1>
          <p className="mt-5 max-w-[34ch] text-[15px] leading-7 text-livv-muted">Ideas worth carrying into real life. Read less. Notice more. Act on what matters.</p>
        </header>

        <section className="mt-12 overflow-hidden border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_2.5%,transparent)]">
          <div className="aspect-[1.55] bg-[radial-gradient(circle_at_75%_25%,color-mix(in_srgb,rgb(var(--livv-accent))_28%,transparent),transparent_48%),linear-gradient(145deg,color-mix(in_srgb,rgb(var(--livv-ink))_9%,transparent),transparent)]" />
          <div className="px-5 pb-6 pt-6 sm:px-7 sm:pb-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-accent">Featured</p>
            <h2 className="mt-3 max-w-[18ch] text-[27px] font-semibold leading-[1.05] tracking-[-0.045em]">The point is not to know more.</h2>
            <p className="mt-3 max-w-[42ch] text-[13px] leading-6 text-livv-muted">The point is to become harder to fool, harder to break, and more capable of choosing what happens next.</p>
            <p className="mt-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgb(var(--livv-ink))]">A LIVV perspective <ArrowUpRight size={14} /></p>
          </div>
        </section>

        <section className="mt-14">
          {FEATURES.map((item) => (
            <article key={item.label} className="border-t border-livv-border py-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">{item.label}</p>
              <h2 className="mt-3 max-w-[24ch] text-[24px] font-semibold leading-[1.08] tracking-[-0.04em]">{item.title}</h2>
              <p className="mt-3 max-w-[42ch] text-[14px] leading-6 text-livv-muted">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 border-t border-livv-border pt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">Go deeper</p>
              <h2 className="mt-2 text-[23px] font-semibold tracking-[-0.04em]">Rooms for real life.</h2>
            </div>
            <Sparkles size={18} className="text-livv-muted" />
          </div>
          <div className="mt-5 divide-y divide-livv-border border-y border-livv-border">
            {ROOMS.map(({ href, label, line, icon: Icon }) => (
              <Link key={href} href={href} className="group flex items-center gap-4 py-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center border border-livv-border text-livv-muted"><Icon size={17} strokeWidth={1.7} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold tracking-[-0.02em]">{label}</span>
                  <span className="mt-1 block text-[12px] leading-5 text-livv-muted">{line}</span>
                </span>
                <ArrowUpRight size={17} className="shrink-0 text-livv-muted" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
