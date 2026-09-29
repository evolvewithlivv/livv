"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  Clock3,
  Users,
  Utensils,
} from "lucide-react";
import { SearchField } from "@/components/ui/search-field";
import {
  CATEGORIES,
  RECIPES,
  type CategoryFilter,
  type MealCategory,
} from "@/lib/recipes-data";

const SAVED_KEY = "livv-recipes-saved-v1";

function loadSaved(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function persistSaved(ids: string[]) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
}

function categoryTone(category: MealCategory): string {
  switch (category) {
    case "Breakfast":
      return "from-[color-mix(in_srgb,rgb(var(--livv-ink))_8%,transparent)] to-[color-mix(in_srgb,rgb(var(--livv-ink))_2%,transparent)]";
    case "Lunch":
      return "from-[color-mix(in_srgb,#0F7FFF_14%,transparent)] to-[color-mix(in_srgb,rgb(var(--livv-ink))_3%,transparent)]";
    case "Dinner":
      return "from-[color-mix(in_srgb,#9A00FF_12%,transparent)] to-[color-mix(in_srgb,rgb(var(--livv-ink))_3%,transparent)]";
    case "Quick":
      return "from-[color-mix(in_srgb,#4DFF00_10%,transparent)] to-[color-mix(in_srgb,rgb(var(--livv-ink))_3%,transparent)]";
    case "Snacks":
      return "from-[color-mix(in_srgb,#FF9D23_12%,transparent)] to-[color-mix(in_srgb,rgb(var(--livv-ink))_3%,transparent)]";
    case "Dessert":
      return "from-[color-mix(in_srgb,#F61981_12%,transparent)] to-[color-mix(in_srgb,rgb(var(--livv-ink))_3%,transparent)]";
  }
}

export default function RecipesPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoryFilter>("All");
  const [selId, setSelId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    setSaved(loadSaved());
  }, []);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return RECIPES.filter((r) => {
      if (cat !== "All" && r.category !== cat) return false;
      if (!needle) return true;
      return (r.title + " " + r.tag + " " + r.category + " " + r.blurb + " " + r.ingredients.join(" "))
        .toLowerCase()
        .includes(needle);
    });
  }, [q, cat]);

  function toggleSave(id: string) {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      persistSaved(next);
      return next;
    });
  }

  return (
    <main className="livv-page min-h-full">
      <div className="mx-auto w-full max-w-xl px-5 pb-14 sm:px-6">
        <header className="pt-6 sm:pt-9">
          <Link
            href="/home/health"
            className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted"
          >
            <ChevronLeft size={13} /> Health
          </Link>
          <div className="mt-7 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-livv-accent">
            <Utensils size={13} /> Food
          </div>
          <h1 className="mt-2 text-[40px] font-semibold leading-[.96] tracking-[-.06em] sm:text-[48px]">
            Cook real food.
          </h1>
          <p className="mt-4 max-w-[42ch] text-[13px] leading-6 text-livv-muted">
            Real-food recipes across breakfast, meals, snacks, and dessert. Tap one to open the method right here.
          </p>
        </header>

        <SearchField
          value={q}
          onChange={setQ}
          placeholder="Search recipes or ingredients…"
          aria-label="Search recipes"
          className="mt-8"
        />

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((c) => {
            const on = cat === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={
                  "shrink-0 rounded-full border px-4 py-2 text-[11px] font-semibold tracking-[-.01em] transition " +
                  (on
                    ? "border-livv-accent bg-livv-accent-soft text-[rgb(var(--livv-ink))]"
                    : "border-livv-border text-livv-muted")
                }
                aria-pressed={on}
              >
                {c}
              </button>
            );
          })}
        </div>

        <section className="mt-9">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.19em] text-livv-muted">
                Collection
              </p>
              <h2 className="mt-1 text-[27px] font-semibold tracking-[-.045em]">
                Simple. Repeatable. Good.
              </h2>
            </div>
            <span className="text-[10px] uppercase tracking-[.14em] text-livv-muted">
              {list.length} {list.length === 1 ? "recipe" : "recipes"}
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            {list.map((r) => {
              const isSaved = saved.includes(r.id);
              const open = selId === r.id;
              return (
                <div
                  key={r.id}
                  className="overflow-hidden rounded-[22px] border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_2.5%,transparent)]"
                >
                  <button
                    type="button"
                    onClick={() => setSelId(open ? null : r.id)}
                    className="group w-full text-left"
                    aria-expanded={open}
                  >
                    <div
                      className={`relative flex h-[88px] items-end bg-gradient-to-br px-5 pb-4 ${categoryTone(r.category)}`}
                    >
                      <span className="rounded-full border border-livv-border bg-[color-mix(in_srgb,var(--livv-bg)_70%,transparent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.12em] text-livv-muted backdrop-blur-sm">
                        {r.category}
                      </span>
                    </div>
                    <div className="px-5 pb-5 pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-[17px] font-semibold leading-snug tracking-[-.03em]">
                          {r.title}
                        </h3>
                        <span className="mt-0.5 shrink-0 text-livv-muted" aria-hidden>
                          {isSaved ? (
                            <BookmarkCheck size={16} className="text-livv-accent" />
                          ) : (
                            <Bookmark size={16} />
                          )}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-livv-muted">{r.blurb}</p>
                      <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-livv-muted">
                        <span className="font-medium text-[rgb(var(--livv-ink)/0.75)]">{r.tag}</span>
                        <span className="flex items-center gap-1">
                          <Clock3 size={12} />
                          {r.time} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {r.servings}
                        </span>
                        <span className="ml-auto font-semibold">{open ? "Close" : "Open"}</span>
                      </div>
                    </div>
                  </button>

                  {open && (
                    <div className="border-t border-livv-border px-5 pb-6 pt-5">
                      <div className="grid gap-8 sm:grid-cols-[.85fr_1.15fr]">
                        <div>
                          <h3 className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">
                            Ingredients
                          </h3>
                          <ul className="mt-4 space-y-3 text-[13px] leading-5">
                            {r.ingredients.map((x) => (
                              <li key={x} className="flex gap-2.5">
                                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-livv-accent" />
                                <span>{x}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">Method</h3>
                          <ol className="mt-4 space-y-4">
                            {r.steps.map((x, i) => (
                              <li key={x} className="flex gap-3 text-[13px] leading-6">
                                <span className="font-semibold tabular-nums text-livv-accent">{i + 1}.</span>
                                <span>{x}</span>
                              </li>
                            ))}
                          </ol>
                          <div className="mt-7 border-t border-livv-border pt-5">
                            <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">
                              LIVV tip
                            </p>
                            <p className="mt-2 text-[12px] leading-5 text-livv-muted">{r.tip}</p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleSave(r.id)}
                        className={
                          "mt-6 flex w-full items-center justify-center gap-2 rounded-full border py-3.5 text-[12px] font-semibold uppercase tracking-[.14em] transition " +
                          (isSaved
                            ? "border-livv-accent bg-livv-accent-soft text-[rgb(var(--livv-ink))]"
                            : "border-livv-border text-livv-muted")
                        }
                      >
                        {isSaved ? (
                          <>
                            <BookmarkCheck size={15} /> Saved
                          </>
                        ) : (
                          <>
                            <Bookmark size={15} /> Save recipe
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!list.length && (
            <p className="py-14 text-center text-[13px] text-livv-muted">Nothing matched that search.</p>
          )}
        </section>
      </div>
    </main>
  );
}
