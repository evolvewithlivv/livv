"use client";

import type { ReactNode } from "react";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, Search, X } from "lucide-react";
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

export default function MindPage() {
  const [desk, setDesk] = useState<WikiDesk | "all">("all");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => setSaved(readSaved()), []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WIKI.filter(
      (a) =>
        (desk === "all" || a.desk === desk) &&
        (!savedOnly || saved.includes(a.slug)) &&
        (!q || a.title.toLowerCase().includes(q) || a.hook.toLowerCase().includes(q) || a.desk.includes(q))
    );
  }, [desk, query, saved, savedOnly]);

  const featured = list[0] ?? null;
  const secondary = list.slice(1, 4);
  const rest = list.slice(4);

  const byDesk = useMemo(() => {
    if (desk !== "all" || query || savedOnly) return [];
    return DESKS.map((d) => ({
      desk: d,
      articles: WIKI.filter((a) => a.desk === d.id),
    })).filter((g) => g.articles.length > 0);
  }, [desk, query, savedOnly]);

  const savedArticles = useMemo(
    () => WIKI.filter((a) => saved.includes(a.slug)),
    [saved]
  );

  const toggleSave = (slug: string) => {
    setSaved((current) => {
      const next = current.includes(slug) ? current.filter((x) => x !== slug) : [slug, ...current];
      persistSaved(next);
      return next;
    });
  };

  return (
    <main className="livv-page min-h-full pb-24">
      <div className="mx-auto w-full max-w-[42rem] px-5 pt-5 sm:px-6">
        <header className="flex items-end justify-between gap-4 border-b border-[var(--livv-pro-line)] pb-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--livv-pro-muted)]">
              Mind
            </p>
            <h1 className="mt-1.5 text-[32px] font-semibold leading-none tracking-[-0.045em] text-[var(--livv-pro-ink)] sm:text-[36px]">
              The Field
            </h1>
            <p className="mt-2 max-w-[22rem] text-[13px] leading-relaxed text-[var(--livv-pro-muted)]">
              Ideas worth carrying with you.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 pb-0.5">
            <button
              type="button"
              onClick={() => {
                setSavedOnly((v) => !v);
                if (!savedOnly) setDesk("all");
              }}
              aria-pressed={savedOnly}
              aria-label={savedOnly ? "Show all articles" : "Show saved articles"}
              className={`grid h-10 w-10 place-items-center rounded-full border transition ${
                savedOnly
                  ? "border-[var(--livv-pro-ink)] bg-[var(--livv-pro-ink)] text-[var(--livv-pro-bg)]"
                  : "border-[var(--livv-pro-line)] text-[var(--livv-pro-muted)]"
              }`}
            >
              <Bookmark size={16} fill={savedOnly ? "currentColor" : "none"} />
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-expanded={searchOpen}
              aria-label={searchOpen ? "Close search" : "Search articles"}
              className={`grid h-10 w-10 place-items-center rounded-full border transition ${
                searchOpen
                  ? "border-[var(--livv-pro-ink)] bg-[var(--livv-pro-ink)] text-[var(--livv-pro-bg)]"
                  : "border-[var(--livv-pro-line)] text-[var(--livv-pro-muted)]"
              }`}
            >
              {searchOpen ? <X size={16} /> : <Search size={16} />}
            </button>
          </div>
        </header>

        {searchOpen ? (
          <div className="mt-4">
            <label className="sr-only" htmlFor="mind-search">
              Search articles
            </label>
            <input
              id="mind-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles and ideas"
              autoFocus
              className="w-full border-b border-[var(--livv-pro-line)] bg-transparent py-3 text-[16px] text-[var(--livv-pro-ink)] outline-none placeholder:text-[var(--livv-pro-muted)] focus:border-[var(--livv-pro-ink)]"
            />
          </div>
        ) : null}

        <nav
          className="mt-5 -mx-5 flex gap-1 overflow-x-auto px-5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Article sections"
        >
          <DeskChip active={desk === "all" && !savedOnly} onClick={() => { setDesk("all"); setSavedOnly(false); }}>
            All
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
            {featured ? (
              <FeaturedStory
                article={featured}
                saved={saved.includes(featured.slug)}
                onToggleSave={() => toggleSave(featured.slug)}
              />
            ) : null}

            {secondary.length > 0 ? (
              <section className="mt-10 border-t border-[var(--livv-pro-line)] pt-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--livv-pro-muted)]">
                  More to read
                </p>
                <div className="mt-5 divide-y divide-[var(--livv-pro-line)]">
                  {secondary.map((article, i) => (
                    <SecondaryStory
                      key={article.slug}
                      article={article}
                      index={i}
                      saved={saved.includes(article.slug)}
                      onToggleSave={() => toggleSave(article.slug)}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {rest.length > 0 ? (
              <section className="mt-4 divide-y divide-[var(--livv-pro-line)] border-t border-[var(--livv-pro-line)]">
                {rest.map((article) => (
                  <TextStory key={article.slug} article={article} />
                ))}
              </section>
            ) : null}

            {!savedOnly && !query && desk === "all" && savedArticles.length > 0 ? (
              <section className="mt-12 border-t border-[var(--livv-pro-line)] pt-8">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--livv-pro-muted)]">
                      Saved
                    </p>
                    <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.03em] text-[var(--livv-pro-ink)]">
                      For later.
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSavedOnly(true)}
                    className="text-[12px] font-medium text-[var(--livv-pro-muted)] underline-offset-2 hover:underline"
                  >
                    View all
                  </button>
                </div>
                <div className="mt-5 divide-y divide-[var(--livv-pro-line)] border-y border-[var(--livv-pro-line)]">
                  {savedArticles.slice(0, 4).map((article) => (
                    <TextStory key={article.slug} article={article} />
                  ))}
                </div>
              </section>
            ) : null}

            {byDesk.length > 0 ? (
              <div className="mt-12 space-y-12">
                {byDesk.map(({ desk: d, articles }) => (
                  <section key={d.id} className="border-t border-[var(--livv-pro-line)] pt-8">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--livv-pro-muted)]">
                          {d.label}
                        </p>
                        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.03em] text-[var(--livv-pro-ink)]">
                          {d.line}
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDesk(d.id)}
                        className="shrink-0 text-[12px] font-medium text-[var(--livv-pro-muted)] underline-offset-2 hover:underline"
                      >
                        See all
                      </button>
                    </div>
                    <div className="mt-5 divide-y divide-[var(--livv-pro-line)] border-y border-[var(--livv-pro-line)]">
                      {articles.slice(0, 3).map((article) => (
                        <TextStory key={article.slug} article={article} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
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
      className={`shrink-0 rounded-full px-3.5 py-2 text-[12px] font-medium transition ${
        active
          ? "bg-[var(--livv-pro-ink)] text-[var(--livv-pro-bg)]"
          : "text-[var(--livv-pro-muted)] hover:text-[var(--livv-pro-ink)]"
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
  return (
    <article className="mt-8">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--livv-pro-line)] bg-[var(--livv-pro-surface-2)]">
        <div
          className="relative flex min-h-[11.5rem] flex-col justify-end px-5 pb-5 pt-10 sm:min-h-[13rem] sm:px-6"
          style={{
            background: `linear-gradient(165deg, color-mix(in srgb, ${meta.hex} 22%, var(--livv-pro-surface-2)) 0%, var(--livv-pro-surface-2) 72%)`,
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--livv-pro-muted)]">
            Cover · {meta.label}
          </p>
          <Link href={`/home/mind/${article.slug}`} className="mt-3 block">
            <h2 className="max-w-[20rem] text-[28px] font-semibold leading-[1.08] tracking-[-0.04em] text-[var(--livv-pro-ink)] sm:text-[32px]">
              {article.title}
            </h2>
          </Link>
        </div>
        <div className="border-t border-[var(--livv-pro-line)] px-5 py-5 sm:px-6">
          <p className="text-[15px] leading-relaxed text-[var(--livv-pro-muted)]">{article.hook}</p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <Link
              href={`/home/mind/${article.slug}`}
              className="text-[13px] font-semibold text-[var(--livv-pro-ink)] underline-offset-4 hover:underline"
            >
              Read · {article.readMins} min
            </Link>
            <button
              type="button"
              onClick={onToggleSave}
              aria-label={saved ? "Remove bookmark" : "Save article"}
              aria-pressed={saved}
              className="grid h-10 w-10 place-items-center rounded-full border border-[var(--livv-pro-line)] text-[var(--livv-pro-muted)]"
            >
              <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function SecondaryStory({
  article,
  index,
  saved,
  onToggleSave,
}: {
  article: WikiArticle;
  index: number;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const meta = deskMeta(article.desk);
  const large = index === 0;
  return (
    <article className={`py-6 ${large ? "sm:py-7" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--livv-pro-muted)]">
            {meta.label} · {article.readMins} min
          </p>
          <Link href={`/home/mind/${article.slug}`} className="mt-2 block">
            <h3
              className={`font-semibold leading-snug tracking-[-0.03em] text-[var(--livv-pro-ink)] ${
                large ? "text-[22px] sm:text-[24px]" : "text-[17px]"
              }`}
            >
              {article.title}
            </h3>
          </Link>
          <p className={`mt-2 leading-relaxed text-[var(--livv-pro-muted)] ${large ? "text-[14px]" : "text-[13px]"}`}>
            {article.hook}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleSave}
          aria-label={saved ? "Remove bookmark" : "Save article"}
          aria-pressed={saved}
          className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--livv-pro-line)] text-[var(--livv-pro-muted)]"
        >
          <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
    </article>
  );
}

function TextStory({ article }: { article: WikiArticle }) {
  const meta = deskMeta(article.desk);
  return (
    <article className="py-4">
      <Link href={`/home/mind/${article.slug}`} className="block">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--livv-pro-muted)]">
          {meta.label} · {article.readMins} min
        </p>
        <h3 className="mt-1.5 text-[16px] font-semibold leading-snug tracking-[-0.02em] text-[var(--livv-pro-ink)]">
          {article.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[var(--livv-pro-muted)]">
          {article.hook}
        </p>
      </Link>
    </article>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-16 px-2 text-center">
      <p className="text-[20px] font-semibold tracking-[-0.03em] text-[var(--livv-pro-ink)]">{title}</p>
      <p className="mx-auto mt-2 max-w-[18rem] text-[13px] leading-relaxed text-[var(--livv-pro-muted)]">{body}</p>
    </div>
  );
}
