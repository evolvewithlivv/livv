"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  Clock3,
  Search,
  Users,
  Utensils,
} from "lucide-react";

type MealCategory = "Breakfast" | "Lunch" | "Dinner" | "Quick";

type Recipe = {
  id: string;
  title: string;
  time: number;
  tag: string;
  category: MealCategory;
  servings: string;
  blurb: string;
  ingredients: string[];
  steps: string[];
  tip: string;
};

const RECIPES: Recipe[] = [
  {
    id: "chicken-rice-bowl",
    title: "LIVV Chicken Rice Bowl",
    time: 30,
    tag: "High protein",
    category: "Dinner",
    servings: "1 generous bowl",
    blurb: "Clean protein, rice, and greens — the weekday default that actually sticks.",
    ingredients: [
      "8 oz boneless chicken breast",
      "1 cup cooked rice",
      "1 cup broccoli",
      "1 tsp olive oil",
      "1 garlic clove, minced",
      "Salt and black pepper",
      "Optional: lemon, chili flakes",
    ],
    steps: [
      "Pat the chicken dry. Season both sides with salt, pepper, and garlic.",
      "Heat a skillet over medium-high. Add oil, cook chicken 5–7 min per side until 165°F.",
      "Rest 3–5 minutes. Slice against the grain.",
      "Steam broccoli until bright green. Season lightly.",
      "Build the bowl: rice, broccoli, sliced chicken. Finish with lemon if you want.",
    ],
    tip: "Cook two or three portions at once and refrigerate extras for the next day.",
  },
  {
    id: "steak-egg-plate",
    title: "Steak & Egg Plate",
    time: 20,
    tag: "Protein",
    category: "Lunch",
    servings: "1 plate",
    blurb: "Steak, eggs, and potatoes — simple fuel without the noise.",
    ingredients: [
      "5–6 oz lean steak",
      "2 eggs",
      "1 cup diced potatoes",
      "1 tsp olive oil",
      "Salt and black pepper",
      "Optional: spinach or greens",
    ],
    steps: [
      "Dice potatoes small. Toss with half the oil, salt, and pepper.",
      "Cook potatoes 10–14 min until browned and tender.",
      "Sear steak to preferred doneness. Rest before slicing.",
      "Cook eggs. Add greens if using. Plate everything together.",
    ],
    tip: "Resting the steak before slicing keeps more moisture in the meat.",
  },
  {
    id: "overnight-oats",
    title: "Overnight Oats",
    time: 5,
    tag: "Breakfast",
    category: "Breakfast",
    servings: "1 jar",
    blurb: "Prep once, eat for days. No morning decision fatigue.",
    ingredients: [
      "1/2 cup rolled oats",
      "3/4 cup milk",
      "1/3 cup Greek yogurt",
      "1/2 banana",
      "1/2 cup berries",
      "1 tsp chia seeds",
      "Cinnamon",
    ],
    steps: [
      "Add oats, milk, yogurt, chia, and cinnamon to a jar.",
      "Stir well. Refrigerate at least 4 hours or overnight.",
      "Top with banana and berries in the morning.",
    ],
    tip: "Prep three jars at once for a simple weekday breakfast.",
  },
  {
    id: "salmon-green-bowl",
    title: "Salmon Green Bowl",
    time: 25,
    tag: "Omega-3",
    category: "Dinner",
    servings: "1 bowl",
    blurb: "Salmon, greens, and lemon — recovery food that still tastes like a meal.",
    ingredients: [
      "6 oz salmon fillet",
      "1 cup cooked rice or quinoa",
      "2 cups spinach",
      "1/2 cucumber",
      "1/2 lemon",
      "1 tsp olive oil",
      "Salt, pepper, garlic powder",
    ],
    steps: [
      "Season salmon with salt, pepper, and garlic powder.",
      "Cook in oil over medium heat until center reaches 145°F.",
      "Build bowl with rice, spinach, cucumber, and salmon. Lemon on top.",
    ],
    tip: "Keep components separate in the fridge if meal-prepping.",
  },
  {
    id: "turkey-power-wrap",
    title: "Turkey Power Wrap",
    time: 10,
    tag: "Quick",
    category: "Quick",
    servings: "1 wrap",
    blurb: "Ten minutes, real protein, zero excuse to skip a meal.",
    ingredients: [
      "1 whole-grain wrap",
      "4 oz sliced turkey",
      "1/2 cup spinach",
      "1/2 tomato",
      "1/4 cucumber",
      "2 tbsp Greek yogurt or hummus",
      "Black pepper",
    ],
    steps: [
      "Spread yogurt or hummus on the wrap.",
      "Layer turkey, spinach, tomato, cucumber. Season.",
      "Fold sides in, roll tightly, slice in half.",
    ],
    tip: "Keep wet ingredients away from the outer edge so the wrap stays tight.",
  },
  {
    id: "recovery-smoothie",
    title: "Recovery Smoothie",
    time: 5,
    tag: "Recovery",
    category: "Quick",
    servings: "1 large smoothie",
    blurb: "Post-training fuel you can drink standing up.",
    ingredients: [
      "1 banana",
      "3/4 cup Greek yogurt",
      "3/4 cup milk",
      "1 cup frozen berries",
      "1/4 cup oats",
      "Ice if needed",
    ],
    steps: [
      "Add milk first, then yogurt, banana, berries, and oats.",
      "Blend 30–60 seconds until smooth. Adjust thickness with milk.",
    ],
    tip: "Use frozen fruit for a cold, thick smoothie without much ice.",
  },
];

const CATEGORIES = ["All", "Breakfast", "Lunch", "Dinner", "Quick"] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

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
            Simple meals you can actually make. Tap a recipe to open the method right here.
          </p>
        </header>

        <label className="relative mt-8 flex items-center gap-3 rounded-full border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_4%,transparent)] px-4 py-3.5 focus-within:border-[color-mix(in_srgb,rgb(var(--livv-ink))_28%,transparent)]">
          <Search size={16} strokeWidth={1.8} className="shrink-0 text-livv-muted" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search recipes or ingredients…"
            className="min-w-0 flex-1 bg-transparent text-[14px] leading-none text-[rgb(var(--livv-ink))] outline-none placeholder:text-livv-muted"
            aria-label="Search recipes"
          />
        </label>

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
                      <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-livv-muted">
                        {r.blurb}
                      </p>
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
                          <h3 className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">
                            Method
                          </h3>
                          <ol className="mt-4 space-y-4">
                            {r.steps.map((x, i) => (
                              <li key={x} className="flex gap-3 text-[13px] leading-6">
                                <span className="font-semibold tabular-nums text-livv-accent">
                                  {i + 1}.
                                </span>
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
            <p className="py-14 text-center text-[13px] text-livv-muted">
              Nothing matched that search.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
