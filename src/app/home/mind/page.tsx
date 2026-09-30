"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Bookmark, Search, X } from "lucide-react";
import { SearchField } from "@/components/ui/search-field";
import { DESKS, WIKI, deskMeta, type WikiArticle, type WikiDesk } from "@/lib/wiki";

const SAVED_KEY = "livv-mind-saved-v1";

function readSaved(): string[] {
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function persistSaved(slugs: string[]) {
  try {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(slugs));
  } catch {
    /* ignore */
  }
}

function deskTint(desk: WikiDesk): string {
  const map: Record<WikiDesk, string> = {
    body: "from-[#1a3a2a] to-[#0d1f16]",
    mind: "from-[#2a1a3a] to-[#140d1f]",
    career: "from-[#1a2a3a] to-[#0d1520]",
    finance: "from-[#2a2a14] to-[#1a1a0a]",
    social: "from-[#3a1a24] to-[#1f0d14]",
    system: "from-[#1a2a2a] to-[#0d1818]",
  };
  return map[desk] || "from-[#1a1a1a] to-[#0a0a0a]";
}

function deskAccent(desk: WikiDesk): string {
  const map: Record<WikiDesk, string> = {
    body: "#3ecf8e",
    mind: "#b794f6",
    career: "#63b3ed",
    finance: "#f6e05e",
    social: "#fc8181",
    system: "#4fd1c5",
  };
  return map[desk] || "#a0aec0";
}

export default function MindPage() {
  const searchParams = useSearchParams();
  const [desk, setDesk] = useState<WikiDesk | "all">("all");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => setSaved(readSaved()), []);

  useEffect(() => {
    const raw = (searchParams.get("desk") || "").toLowerCase();
    const valid = DESKS.some((d) => d.id === raw);
    if (valid) {
      setDesk(raw as WikiDesk);
      setSavedOnly(false);
    }
  }, [searchParams]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WIKI.filter(
      (a) =>
        (desk === "all" || a.desk === desk) &&
        (!savedOnly || saved.includes(a.slug)) &&
        (!q ||
          a.title.toLowerCase().includes(q) ||
          a.hook.toLowerCase().includes(q) ||
          a.desk.includes(q)),
    );
  }, [desk, query, saved, savedOnly]);

  const featured = list[0] ?? null;
  const secondary = list.slice(1, 5);
  const rest = list.slice(5);

  const byDesk = useMemo(() => {
    if (desk !== "all" || query || savedOnly) return [];
    return DESKS.map((d) => ({
      desk: d,
      articles: WIKI.filter((a) => a.desk === d.id),
    })).filter((g) => g.articles.length > 0);
  }, [desk, query, savedOnly]);

  const savedArticles = useMemo(
    () => WIKI.filter((a) => saved.includes(a.slug)),
    [saved],
  );

  const toggleSave = (slug: string) => {
    setSaved((current) => {
      const next = current.includes(slug)
        ? current.filter((x) => x !== slug)
        : [slug, ...current];
      persistSaved(next);
      return next;
    });
  };

  return (
    <main className="livv-page min-h-full pb-24">
      <div className="mx-auto w-full max-w-[42rem] px-4 pt-4 sm:px-6">
        <header className="flex items-center justify-between gap-3 pb-3">
          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.04em] text-[rgb(var(--livv-ink))] sm:text-[32px]">
              Mind
            </h1>
            <p className="mt-0.5 text-[13px] text-livv-muted">Ideas worth carrying.</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setSavedOnly((v) => !v);
                if (!savedOnly) setDesk("all");
              }}
              aria-pressed={savedOnly}
              aria-label={savedOnly ? "Show all articles" : "Show saved articles"}
              className={`grid h-9 w-9 place-items-center rounded-full transition ${
                savedOnly
                  ? "bg-[rgb(var(--livv-ink))] text-[rgb(var(--livv-bg))]"
                  : "bg-[color-mix(in_srgb,rgb(var(--livv-ink))_6%,transparent)] text-livv-muted"
              }`}
            >
              <Bookmark size={15} fill={savedOnly ? "currentColor" : "none"} />
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-expanded={searchOpen}
              aria-label={searchOpen ? "Close search" : "Search articles"}
              className={`grid h-9 w-9 place-items-center rounded-full transition ${
                searchOpen
                  ? "bg-[rgb(var(--livv-ink))] text-[rgb(var(--livv-bg))]"
                  : "bg-[color-mix(in_srgb,rgb(var(--livv-ink))_6%,transparent)] text-livv-muted"
              }`}
            >
              {searchOpen ? <X size={15} /> : <Search size={15} />}
            </button>
          </div>
        </header>

        {searchOpen ? (
          <div className="mb-4">
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="Search titles and ideas"
              aria-label="Search articles"
            />
          </div>
        ) : null}

        <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-4 scrollbar-none">
          <DeskChip
            active={desk === "all" && !savedOnly}
            onClick={() => {
              setDesk("all");
              setSavedOnly(false);
            }}
          >
            Top Stories
          </DeskChip>
          {DESKS.map((d) => (
            <DeskChip
              key={d.id}
              active={desk === d.id && !savedOnly}
              onClick={() => {
                setDesk(d.id);
                setSavedOnly(false);
              }}
            >
              {d.label}
            </DeskChip>
          ))}
        </nav>

        {savedOnly && savedArticles.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            body="Bookmark an article while reading and it will show up here."
          />
        ) : list.length === 0 ? (
          <EmptyState title="No matches" body="Try another search or clear the section filter." />
        ) : (
          <>
            {!savedOnly && !query ? (
              <h2 className="mb-3 text-[22px] font-bold tracking-[-0.03em] text-[#ff2d55] sm:text-[24px]">
                {desk === "all" ? "Top Stories" : deskMeta(desk).label}
              </h2>
            ) : null}

            {featured ? (
              <FeaturedStory
                article={featured}
                saved={saved.includes(featured.slug)}
                onToggleSave={() => toggleSave(featured.slug)}
              />
            ) : null}

            {secondary.length > 0 ? (
              <section className="mt-2 divide-y divide-livv-border">
                {secondary.map((article) => (
                  <StoryRow
                    key={article.slug}
                    article={article}
                    saved={saved.includes(article.slug)}
                    onToggleSave={() => toggleSave(article.slug)}
                  />
                ))}
              </section>
            ) : null}

            {rest.length > 0 ? (
              <section className="mt-1 divide-y divide-livv-border border-t border-livv-border">
                {rest.map((article) => (
                  <StoryRow
                    key={article.slug}
                    article={article}
                    saved={saved.includes(article.slug)}
                    onToggleSave={() => toggleSave(article.slug)}
                    compact
                  />
                ))}
              </section>
            ) : null}

            {!savedOnly && !query && desk === "all" && byDesk.length > 0 ? (
              <section className="mt-10 space-y-8">
                {byDesk.map(({ desk: d, articles }) => (
                  <div key={d.id}>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-[18px] font-bold tracking-[-0.02em] text-[rgb(var(--livv-ink))]">
                        {d.label}
                      </h2>
                      <Link
                        href={`/home/mind?desk=${d.id}`}
                        className="text-[12px] font-semibold text-livv-muted"
                      >
                        See all
                      </Link>
                    </div>
                    <div className="divide-y divide-livv-border overflow-hidden rounded-2xl border border-livv-border">
                      {articles.slice(0, 3).map((article) => (
                        <StoryRow
                          key={article.slug}
                          article={article}
                          saved={saved.includes(article.slug)}
                          onToggleSave={() => toggleSave(article.slug)}
                          compact
                          inCard
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            ) : null}

            {!savedOnly && !query && desk === "all" && savedArticles.length > 0 ? (
              <section className="mt-10">
                <h2 className="mb-3 text-[18px] font-bold tracking-[-0.02em] text-[rgb(var(--livv-ink))]">
                  Saved
                </h2>
                <div className="divide-y divide-livv-border">
                  {savedArticles.slice(0, 5).map((article) => (
                    <StoryRow
                      key={article.slug}
                      article={article}
                      saved
                      onToggleSave={() => toggleSave(article.slug)}
                      compact
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}

function DeskChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
        active
          ? "bg-[rgb(var(--livv-ink))] text-[rgb(var(--livv-bg))]"
          : "bg-[color-mix(in_srgb,rgb(var(--livv-ink))_8%,transparent)] text-[rgb(var(--livv-ink))]"
      }`}
    >
      {children}
    </button>
  );
}

function FeaturedStory({
  article,
  saved,
  onToggleSave,
}: {
  article: WikiArticle;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const meta = deskMeta(article.desk);
  const tint = deskTint(article.desk);
  const accent = deskAccent(article.desk);

  return (
    <article className="overflow-hidden rounded-[20px] border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_3%,transparent)]">
      <Link href={`/home/mind/${article.slug}`} className="block">
        <div className={`relative aspect-[16/10] bg-gradient-to-br ${tint} px-5 pb-5 pt-6`}>
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ background: `${accent}22`, color: accent }}
          >
            {meta.label}
          </span>
          <h3 className="mt-4 max-w-[20ch] text-[26px] font-bold leading-[1.15] tracking-[-0.035em] text-white sm:text-[30px]">
            {article.title}
          </h3>
        </div>
        <div className="px-4 py-3.5">
          <p className="line-clamp-2 text-[14px] leading-snug text-livv-muted">{article.hook}</p>
          <p className="mt-2 text-[11px] text-livv-muted">
            {meta.label} · {article.readMins} min read
          </p>
        </div>
      </Link>
      <div className="flex justify-end border-t border-livv-border px-2 py-1">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onToggleSave();
          }}
          aria-label={saved ? "Remove bookmark" : "Save article"}
          aria-pressed={saved}
          className="grid h-9 w-9 place-items-center rounded-full text-livv-muted"
        >
          <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
    </article>
  );
}

function StoryRow({
  article,
  saved,
  onToggleSave,
  compact = false,
  inCard = false,
}: {
  article: WikiArticle;
  saved: boolean;
  onToggleSave: () => void;
  compact?: boolean;
  inCard?: boolean;
}) {
  const meta = deskMeta(article.desk);
  const tint = deskTint(article.desk);
  const accent = deskAccent(article.desk);

  return (
    <article className={`flex gap-3 ${inCard ? "px-3.5 py-3.5" : "py-4"}`}>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-livv-muted">
          <span style={{ color: accent }}>{meta.label}</span>
          <span className="text-livv-muted"> · {article.readMins} min</span>
        </p>
        <Link href={`/home/mind/${article.slug}`} className="mt-1 block">
          <h3
            className={`font-bold leading-snug tracking-[-0.025em] text-[rgb(var(--livv-ink))] ${
              compact ? "text-[15px]" : "text-[16px] sm:text-[17px]"
            }`}
          >
            {article.title}
          </h3>
          {!compact ? (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-livv-muted">
              {article.hook}
            </p>
          ) : null}
        </Link>
      </div>
      <Link
        href={`/home/mind/${article.slug}`}
        className={`relative shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${tint} ${
          compact ? "h-[64px] w-[64px]" : "h-[72px] w-[72px] sm:h-[80px] sm:w-[80px]"
        }`}
        aria-hidden
      >
        <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wider text-white/70">
          {meta.label.slice(0, 4)}
        </span>
      </Link>
      <button
        type="button"
        onClick={onToggleSave}
        aria-label={saved ? "Remove bookmark" : "Save article"}
        aria-pressed={saved}
        className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center self-start rounded-full text-livv-muted"
      >
        <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
      </button>
    </article>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-16 px-2 text-center">
      <p className="text-[20px] font-semibold tracking-[-0.03em] text-[rgb(var(--livv-ink))]">{title}</p>
      <p className="mx-auto mt-2 max-w-[18rem] text-[13px] leading-relaxed text-livv-muted">{body}</p>
    </div>
  );
}
