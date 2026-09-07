"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AmbientField } from "@/components/layout/ambient-field";
import { DESKS, WIKI, type WikiDesk } from "@/lib/wiki";

export default function MindWikiPage() {
  const [desk, setDesk] = useState<WikiDesk | "all">("all");
  const list = useMemo(
    () => (desk === "all" ? WIKI : WIKI.filter((a) => a.desk === desk)),
    [desk],
  );

  return (
    <main className="relative min-h-full overflow-hidden pb-16">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <div
          className="absolute left-1/2 top-[-140px] h-[560px] w-[560px] -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgb(var(--livv-accent) / 0.16), transparent 68%)" }}
        />
        <AmbientField intensity="strong" />
      </div>
      <div className="relative z-10 mx-auto max-w-lg px-5 pt-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-white/30">Field wiki</p>
        <h1 className="font-display mt-2 text-[38px] font-semibold tracking-tight">What we stand on.</h1>
        <p className="mt-3 max-w-[36ch] text-[14px] leading-relaxed text-white/40">
          Tap a card. Each one is a full sourced page with a move at the bottom.
        </p>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          <DeskChip active={desk === "all"} onClick={() => setDesk("all")} label="All" />
          {DESKS.map((d) => (
            <DeskChip key={d.id} active={desk === d.id} onClick={() => setDesk(d.id)} label={d.label} />
          ))}
        </div>

        <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/30">
          {list.length} articles · tap to open
        </p>

        <Link
          href="/home/mind/how-livv-wants-to-be-used"
          className="mt-3 flex items-center gap-4 rounded-[26px] border border-livv-accent/35 bg-livv-accent/[0.12] p-4 active:scale-[0.98]"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.22em] text-livv-accent-soft">Start here · open page</p>
            <p className="font-display mt-1 text-[22px] leading-tight">How LIVV wants to be used</p>
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-lg font-semibold text-black">
            →
          </span>
        </Link>

        <section className="mt-4 space-y-3">
          {list.map((a) => (
            <Link
              key={a.slug}
              href={`/home/mind/${a.slug}`}
              className="flex items-stretch gap-3 rounded-[24px] border border-white/12 bg-white/[0.05] p-3.5 active:scale-[0.98]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55">
                    {a.desk}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.14em] text-white/30">{a.readMins} min read</span>
                </div>
                <p className="mt-2 text-[16px] font-semibold leading-snug">{a.title}</p>
                <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-white/38">{a.hook}</p>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-livv-accent-soft">
                  Open article
                </p>
              </div>
              <span className="grid h-11 w-11 shrink-0 self-center place-items-center rounded-full border border-white/15 bg-white/[0.08] text-white/80">
                →
              </span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

function DeskChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? "shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-black" : "shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-white/45"}
    >
      {label}
    </button>
  );
}
