"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { DESKS, WIKI, type WikiDesk } from "@/lib/wiki";

const ARTICLE_COLORS = ["#60a5fa", "#c084fc", "#34d399", "#fbbf24", "#fb7185", "#22d3ee", "#f472b6", "#a3e635"];

function articleColor(slug: string) {
  let n = 0;
  for (let i = 0; i < slug.length; i++) n = (n * 31 + slug.charCodeAt(i)) >>> 0;
  return ARTICLE_COLORS[n % ARTICLE_COLORS.length];
}

export default function MindWikiPage() {
  const [desk, setDesk] = useState<WikiDesk | "all">("all");
  const [showAll, setShowAll] = useState(false);
  const list = useMemo(() => (desk === "all" ? WIKI : WIKI.filter((a) => a.desk === desk)), [desk]);
  const featured = list[0];
  const quick = list.slice(1, 4);
  const explore = showAll ? list : list.slice(0, 6);

  return (
    <main className="livv-page relative min-h-full overflow-hidden pb-16">
      <div className="relative z-10 mx-auto max-w-lg px-5 pt-5">
        <PageHero
          eyebrow="Read"
          title="Ideas"
          subtitle="Short reads. Save what sticks."
          accent="#b28cff"
          right={<span className="text-[9px] uppercase tracking-[0.22em] text-white/20">{list.length} notes</span>}
        />

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <DeskChip active={desk === "all"} onClick={() => { setDesk("all"); setShowAll(false); }} label="All" />
          {DESKS.map((d) => <DeskChip key={d.id} active={desk === d.id} onClick={() => { setDesk(d.id); setShowAll(false); }} label={d.label} />)}
        </div>

        {featured && (
          <Link href={`/home/mind/${featured.slug}`} className="group relative mt-7 block overflow-hidden rounded-[30px] border p-5 active:scale-[0.985]" style={{ borderColor: `${articleColor(featured.slug)}55`, background: `linear-gradient(135deg, ${articleColor(featured.slug)}18, rgba(255,255,255,.035) 60%)`, boxShadow: `0 18px 55px ${articleColor(featured.slug)}0b` }}>
            <div className="absolute right-[-45px] top-[-55px] h-40 w-40 rounded-full blur-3xl" style={{ background: articleColor(featured.slug), opacity: .16 }} />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.28em]" style={{ color: articleColor(featured.slug) }}>Featured</p>
                <p className="font-display mt-3 max-w-[18ch] text-[28px] font-semibold leading-[0.98] tracking-tight">{featured.title}</p>
                <p className="mt-3 max-w-[34ch] text-[13px] leading-relaxed text-white/45">{featured.summary}</p>
                <p className="mt-4 text-[11px] text-white/30">{featured.desk} · {featured.readMins} min</p>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-black">→</span>
            </div>
          </Link>
        )}

        {quick.length > 0 && (
          <section className="mt-8">
            <p className="text-[9px] uppercase tracking-[0.28em] text-white/25">Quick picks</p>
            <div className="mt-3 space-y-2">
              {quick.map((a) => {
                const c = articleColor(a.slug);
                return (
                  <Link key={a.slug} href={`/home/mind/${a.slug}`} className="flex items-center gap-3 rounded-[20px] border border-white/[0.07] bg-white/[0.025] p-3.5 active:scale-[0.99]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: c, boxShadow: `0 0 12px ${c}` }} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold">{a.title}</span>
                      <span className="text-[11px] text-white/35">{a.desk} · {a.readMins} min</span>
                    </span>
                    <span className="text-white/25">→</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-9">
          <div className="flex items-end justify-between">
            <p className="text-[9px] uppercase tracking-[0.28em] text-white/25">All notes</p>
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/15">{list.length} available</span>
          </div>
          <div className="mt-4 space-y-2.5">
            {explore.map((a, index) => {
              const c = articleColor(a.slug);
              return (
                <Link key={a.slug} href={`/home/mind/${a.slug}`} className="group flex items-center gap-3 rounded-[22px] border bg-white/[.025] p-3.5 active:scale-[.985]" style={{ borderColor: `${c}30`, boxShadow: `inset 0 0 28px ${c}06` }}>
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl" style={{ background: `${c}12`, color: c }}>
                    <span className="text-[10px] font-bold tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-semibold uppercase tracking-[.16em]" style={{ color: c }}>{a.desk}</span>
                      <span className="text-[9px] uppercase tracking-[.14em] text-white/20">{a.readMins} min</span>
                    </div>
                    <p className="mt-1 text-[15px] font-semibold leading-snug">{a.title}</p>
                  </div>
                  <span className="text-lg text-white/20 transition group-hover:translate-x-0.5" style={{ color: `${c}bb` }}>→</span>
                </Link>
              );
            })}
          </div>
          {list.length > 6 && (
            <button type="button" onClick={() => setShowAll((v) => !v)} className="mt-4 w-full rounded-full border border-white/10 bg-white/[.025] py-3 text-[10px] font-semibold uppercase tracking-[.2em] text-white/45 active:scale-[.99]">
              {showAll ? "Show less" : `Show all ${list.length} notes`}
            </button>
          )}
        </section>

        <Link href="/home/evala" className="mt-9 flex items-center justify-between rounded-[24px] border border-white/[.08] bg-white/[.025] p-4 active:scale-[.985]">
          <div>
            <p className="text-[9px] uppercase tracking-[.24em] text-white/25">Next step</p>
            <p className="mt-1 text-[16px] font-semibold">Ask Evala about an idea.</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-black">→</span>
        </Link>
      </div>
    </main>
  );
}

function DeskChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? "shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-black" : "shrink-0 rounded-full border border-white/10 bg-white/[.02] px-3 py-1.5 text-[11px] text-white/45"}
    >
      {label}
    </button>
  );
}
