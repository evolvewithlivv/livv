"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AmbientField } from "@/components/layout/ambient-field";
import { DESKS, WIKI, type WikiDesk } from "@/lib/wiki";

const ARTICLE_COLORS = ["#60a5fa", "#c084fc", "#34d399", "#fbbf24", "#fb7185", "#22d3ee", "#f472b6", "#a3e635"];

function articleColor(slug: string) {
  let n = 0;
  for (let i = 0; i < slug.length; i++) n = (n * 31 + slug.charCodeAt(i)) >>> 0;
  return ARTICLE_COLORS[n % ARTICLE_COLORS.length];
}

export default function MindWikiPage() {
  const [desk, setDesk] = useState<WikiDesk | "all">("all");
  const list = useMemo(() => (desk === "all" ? WIKI : WIKI.filter((a) => a.desk === desk)), [desk]);
  const featured = list[0];
  const quick = list.slice(1, 4);

  return (
    <main className="relative min-h-full overflow-hidden pb-16">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute left-1/2 top-[-140px] h-[560px] w-[560px] -translate-x-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgb(var(--livv-accent) / 0.13), transparent 68%)" }} />
        <AmbientField intensity="strong" />
      </div>

      <div className="relative z-10 mx-auto max-w-lg px-5 pt-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-white/30">Field notes</p>
            <h1 className="font-display mt-2 text-[38px] font-semibold tracking-tight">Feed your mind.</h1>
          </div>
          <span className="mb-1 text-[9px] uppercase tracking-[0.22em] text-white/20">{list.length} notes</span>
        </div>
        <p className="mt-3 max-w-[36ch] text-[14px] leading-relaxed text-white/40">Ideas worth carrying. Explore by field, save what changes how you see things, then put one idea into motion.</p>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          <DeskChip active={desk === "all"} onClick={() => setDesk("all")} label="All" />
          {DESKS.map((d) => <DeskChip key={d.id} active={desk === d.id} onClick={() => setDesk(d.id)} label={d.label} />)}
        </div>

        {featured && (
          <Link href={`/home/mind/${featured.slug}`} className="group relative mt-7 block overflow-hidden rounded-[30px] border p-5 active:scale-[0.985]" style={{ borderColor: `${articleColor(featured.slug)}55`, background: `linear-gradient(135deg, ${articleColor(featured.slug)}18, rgba(255,255,255,.035) 60%)`, boxShadow: `0 18px 55px ${articleColor(featured.slug)}0b` }}>
            <div className="absolute right-[-45px] top-[-55px] h-40 w-40 rounded-full blur-3xl" style={{ background: articleColor(featured.slug), opacity: .16 }} />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.28em]" style={{ color: articleColor(featured.slug) }}>Featured field note</p>
                <p className="font-display mt-3 text-[27px] font-semibold leading-[1.02] tracking-tight">{featured.title}</p>
                <p className="mt-3 max-w-[31ch] text-[13px] leading-relaxed text-white/45">{featured.hook}</p>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-lg font-semibold text-black transition-transform group-hover:translate-x-0.5">↗</span>
            </div>
            <div className="relative mt-6 flex items-center justify-between border-t border-white/[.07] pt-3">
              <span className="text-[9px] uppercase tracking-[.2em] text-white/30">{featured.desk} · {featured.readMins} min</span>
              <span className="text-[9px] font-semibold uppercase tracking-[.18em]" style={{ color: articleColor(featured.slug) }}>Open note</span>
            </div>
          </Link>
        )}

        {quick.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[.28em] text-white/30">Quick reads</p><span className="text-[9px] uppercase tracking-[.18em] text-white/15">2–5 min</span></div>
            <div className="mt-3 grid grid-cols-3 gap-2.5">
              {quick.map((a) => {
                const c = articleColor(a.slug);
                return <Link key={a.slug} href={`/home/mind/${a.slug}`} className="min-h-[142px] rounded-[22px] border bg-white/[.025] p-3.5 active:scale-[.97]" style={{ borderColor: `${c}42` }}>
                  <span className="block h-1.5 w-8 rounded-full" style={{ background: c, boxShadow: `0 0 12px ${c}88` }} />
                  <p className="mt-5 line-clamp-4 text-[13px] font-semibold leading-snug">{a.title}</p>
                  <p className="mt-3 text-[9px] uppercase tracking-[.15em] text-white/25">{a.readMins} min →</p>
                </Link>;
              })}
            </div>
          </section>
        )}

        <section className="mt-9">
          <div className="flex items-end justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.28em] text-white/30">Explore the field</p><p className="mt-1 text-[12px] text-white/35">Tap any note to go deeper.</p></div><span className="text-[9px] uppercase tracking-[.18em] text-white/15">{list.length} available</span></div>
          <div className="mt-4 space-y-2.5">
            {list.slice(0, 10).map((a, index) => {
              const c = articleColor(a.slug);
              return <Link key={a.slug} href={`/home/mind/${a.slug}`} className="group flex items-center gap-3 rounded-[22px] border bg-white/[.025] p-3.5 active:scale-[.985]" style={{ borderColor: `${c}30` }}>
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl" style={{ background: `${c}12`, color: c }}><span className="text-[10px] font-bold tabular-nums">{String(index + 1).padStart(2, "0")}</span></div>
                <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-[9px] font-semibold uppercase tracking-[.16em]" style={{ color: c }}>{a.desk}</span><span className="text-[9px] uppercase tracking-[.14em] text-white/20">{a.readMins} min</span></div><p className="mt-1 text-[15px] font-semibold leading-snug">{a.title}</p></div>
                <span className="text-lg text-white/20 transition group-hover:translate-x-0.5" style={{ color: `${c}bb` }}>→</span>
              </Link>;
            })}
          </div>
        </section>

        <Link href="/home/evala" className="mt-9 flex items-center justify-between rounded-[24px] border border-white/[.08] bg-white/[.025] p-4 active:scale-[.985]">
          <div><p className="text-[9px] uppercase tracking-[.24em] text-white/25">Go beyond reading</p><p className="mt-1 text-[16px] font-semibold">Take an idea into Evala.</p></div><span className="grid h-10 w-10 place-items-center rounded-full bg-white text-black">→</span>
        </Link>
      </div>
    </main>
  );
}

function DeskChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={active ? "shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-black" : "shrink-0 rounded-full border border-white/10 bg-white/[.02] px-3 py-1.5 text-[11px] text-white/45"}>{label}</button>;
}
