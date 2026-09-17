"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Bookmark, Search } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { DESKS, WIKI, type WikiDesk } from "@/lib/wiki";

const PALETTE = ["#0F7FFF", "#FCF927", "#F93827", "#F61981", "#9A00FF", "#4DFF00", "#FF9D23"];
const SAVED_KEY = "livv-mind-saved-v1";

function colorFor(slug: string) {
  let n = 0;
  for (const ch of slug) n = (n * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[n % PALETTE.length];
}

function readSaved() {
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) as string[] : [];
  } catch {
    return [];
  }
}

export default function MindPage() {
  const [desk, setDesk] = useState<WikiDesk | "all">("all");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);

  useEffect(() => setSaved(readSaved()), []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WIKI.filter((article) =>
      (desk === "all" || article.desk === desk) &&
      (!savedOnly || saved.includes(article.slug)) &&
      (!q || article.title.toLowerCase().includes(q) || article.hook.toLowerCase().includes(q))
    );
  }, [desk, query, saved, savedOnly]);

  const featured = list[0] || null;

  const save = (slug: string) => setSaved((current) => {
    const next = current.includes(slug) ? current.filter((x) => x !== slug) : [slug, ...current];
    try { window.localStorage.setItem(SAVED_KEY, JSON.stringify(next)); } catch {}
    return next;
  });

  return (
    <main className="livv-page min-h-full overflow-hidden pb-16 text-white">
      <div className="mx-auto max-w-xl px-5 pt-5">
        <PageHero eyebrow="Mind" title="The Field" subtitle="Original LIVV reads for clearer thinking, better habits, and a life you can actually use." accent="#F61981" right={<BookOpen size={20} className="text-[#F61981]" />} />

        <section className="mt-6 border-y border-white/[0.08] py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#F61981]/25 bg-[#F61981]/[0.06] text-[#F61981]"><BookOpen size={17} /></div>
            <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F61981]">LIVV Reading Room</p><p className="mt-1 text-[12px] text-white/55">Read one idea. Sit with it. Then use it.</p></div>
          </div>
          <div className="relative mt-4"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search LIVV articles" aria-label="Search LIVV articles" className="w-full rounded-xl border border-white/10 bg-white/[0.025] py-3 pl-10 pr-4 text-[13px] text-white outline-none placeholder:text-white/30 focus:border-[#F61981]/45" /></div>
        </section>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Mind categories">
          <button type="button" onClick={() => setDesk("all")} role="tab" aria-selected={desk === "all"} className={`min-h-10 shrink-0 rounded-full px-4 text-[11px] font-semibold ${desk === "all" ? "bg-white text-black" : "border border-white/10 text-white/55"}`}>All</button>
          {DESKS.map((d, i) => <button key={d.id} type="button" onClick={() => setDesk(d.id)} role="tab" aria-selected={desk === d.id} className="min-h-10 shrink-0 rounded-full border px-4 text-[11px] font-semibold" style={desk === d.id ? { background: PALETTE[(i + 1) % PALETTE.length], color: "#000", borderColor: PALETTE[(i + 1) % PALETTE.length] } : { borderColor: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.55)" }}>{d.label}</button>)}
        </div>

        <button type="button" onClick={() => setSavedOnly((v) => !v)} aria-pressed={savedOnly} className="mt-4 flex w-full items-center justify-between border-b border-white/[0.08] py-4 text-left">
          <span className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl border border-[#F61981]/20 bg-[#F61981]/[0.06] text-[#F61981]"><Bookmark size={16} fill={savedOnly ? "currentColor" : "none"} /></span><span><span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F61981]">Bookmarks</span><span className="mt-1 block text-[12px] text-white/50">Saved reads you can return to</span></span></span><span className="text-[11px] font-semibold text-white/50">{saved.length}</span>
        </button>

        {featured ? <Link href={`/home/mind/${featured.slug}`} className="group mt-7 block border-b border-white/[0.08] pb-7">
          <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: colorFor(featured.slug) }}>{saved.includes(featured.slug) ? "Saved for you" : "Featured read"}</span><span className="text-[10px] uppercase tracking-[0.16em] text-white/40">{featured.readMins} min</span></div>
          <h2 className="font-display mt-4 max-w-[15ch] text-[31px] font-semibold leading-[1.02]">{featured.title}</h2>
          <p className="mt-3 max-w-[36ch] text-[14px] leading-relaxed text-white/60">{featured.hook}</p>
          <div className="mt-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-white text-black transition group-hover:translate-x-1">→</span><span className="text-[11px] font-semibold text-white/55">Open the article</span></div>
        </Link> : <div className="mt-7 py-12 text-center"><p className="font-display text-[20px]">No reads found.</p><p className="mt-2 text-[12px] text-white/40">Try another search or clear the saved filter.</p></div>}

        <section className="mt-8">
          <div className="flex items-end justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">For you</p><h2 className="font-display mt-1 text-[25px] font-semibold">Keep going.</h2></div><span className="text-[10px] text-white/40">{list.length} reads</span></div>
          <div className="mt-3 divide-y divide-white/[0.08]">{list.slice(1).map((article, i) => { const c = colorFor(article.slug); const isSaved = saved.includes(article.slug); return <article key={article.slug} className="py-4"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: `${c}12`, color: c }}><span className="text-[9px] font-bold">{String(i + 2).padStart(2, "0")}</span></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-[9px] font-semibold uppercase tracking-[0.16em]" style={{ color: c }}>{article.desk}</span><span className="text-[9px] text-white/35">{article.readMins} min</span></div><Link href={`/home/mind/${article.slug}`} className="mt-1 block py-1 text-[16px] font-semibold leading-snug">{article.title}</Link><p className="mt-1 text-[11px] leading-relaxed text-white/50">{article.hook}</p></div><button type="button" onClick={() => save(article.slug)} aria-label={isSaved ? "Remove bookmark" : "Save article"} aria-pressed={isSaved} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 text-white/45"><Bookmark size={15} fill={isSaved ? "currentColor" : "none"} /></button></div></article>; })}</div>
        </section>

        <section className="mt-8 border-t border-white/[0.08] pt-5"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F61981]">Use the Field</p><p className="mt-2 text-[13px] leading-relaxed text-white/55">Read for a better decision, not a bigger reading count. Take one useful idea and put it into motion.</p></section>
      </div>
    </main>
  );
}
