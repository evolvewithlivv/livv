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
          Sourced pages for people inside LIVV. Not a feed. Not a book log. Read it, do the move at the bottom, keep evolving.
        </p>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          <DeskChip active={desk === "all"} onClick={() => setDesk("all")} label="All" />
          {DESKS.map((d) => (
            <DeskChip key={d.id} active={desk === d.id} onClick={() => setDesk(d.id)} label={d.label} />
          ))}
        </div>

        <section className="mt-8 rounded-[28px] border border-livv-accent/20 bg-livv-accent/[0.06] p-5">
          <p className="text-[10px] uppercase tracking-[0.24em] text-livv-accent-soft">Start here</p>
          <Link href="/home/mind/how-livv-wants-to-be-used" className="block">
            <p className="font-display mt-2 text-[24px] leading-tight">How LIVV wants to be used</p>
            <p className="mt-2 text-[13px] text-white/45">The wiki, Daily, Train, Embers — what is actually the point.</p>
          </Link>
        </section>

        <section className="mt-8 space-y-3">
          {list.map((a) => (
            <Link key={a.slug} href={`/home/mind/${a.slug}`} className="block rounded-[24px] border border-white/8 bg-white/[0.03] p-4 transition active:scale-[0.99]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">{a.desk}</p>
                <p className="text-[9px] uppercase tracking-[0.16em] text-white/20">{a.readMins} min</p>
              </div>
              <p className="mt-2 text-[17px] font-semibold leading-snug">{a.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-white/40">{a.hook}</p>
            </Link>
          ))}
        </section>

        <p className="mt-10 text-center text-[11px] leading-relaxed text-white/25">
          Every page names its sources. If a claim cannot be linked, it does not belong here.
        </p>
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
