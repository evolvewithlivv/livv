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
  X,
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
      "Pat the chicken dry. Season both sides generously with salt, pepper, and garlic.",
      "Heat a skillet over medium-high. Add the oil, then cook the chicken for about 5–7 minutes per side, depending on thickness, until the center reaches 165°F.",
      "Move the chicken to a plate and rest for 3–5 minutes. Slice against the grain.",
      "Steam or pan-cook the broccoli until bright green and just tender. Season lightly.",
      "Warm the cooked rice. Build the bowl with rice first, broccoli on one side, and sliced chicken on top.",
      "Finish with lemon juice and chili flakes if you want more brightness and heat.",
    ],
    tip: "Cook two or three portions at once and refrigerate the extras for an easy next-day meal.",
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
      "Cut potatoes into small cubes so they cook quickly. Toss with half the oil, salt, and pepper.",
      "Heat a skillet over medium heat. Cook potatoes for 10–14 minutes, turning occasionally, until browned and tender.",
      "Season the steak. Heat another skillet over medium-high and sear until the center reaches your preferred doneness. Rest before slicing.",
      "Lower the heat and cook the eggs to your preference. Season at the end.",
      "Add greens if using, then plate the potatoes, sliced steak, and eggs together.",
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
      "Add oats, milk, yogurt, chia seeds, and cinnamon to a jar or container.",
      "Stir thoroughly so the oats and seeds are evenly hydrated.",
      "Cover and refrigerate for at least 4 hours, ideally overnight.",
      "In the morning, loosen with a splash of milk if needed.",
      "Top with sliced banana and berries.",
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
      "Pat the salmon dry and season with salt, pepper, and garlic powder.",
      "Heat oil in a skillet over medium heat. Cook salmon skin-side down if it has skin, then turn once. Cook until the center reaches 145°F.",
      "Rest the salmon for a few minutes while you prepare the bowl.",
      "Add rice or quinoa, spinach, sliced cucumber, and the salmon.",
      "Squeeze fresh lemon over the top and season to taste.",
    ],
    tip: "Keep the bowl components separate in the fridge if you are meal-prepping.",
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
      "Lay the wrap flat and spread the yogurt or hummus across the center.",
      "Layer turkey, spinach, tomato, and cucumber down the middle.",
      "Season with black pepper.",
      "Fold the sides inward, then roll tightly from the bottom.",
      "Slice in half and eat immediately.",
    ],
    tip: "The key is keeping wet ingredients away from the outer edge so the wrap stays tight.",
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
      "Add milk first, then yogurt, banana, berries, and oats to the blender.",
      "Blend for 30–60 seconds until smooth.",
      "Add a splash of milk if it is too thick.",
      "Taste and adjust the texture before serving.",
    ],
    tip: "Use frozen fruit for a cold, thick smoothie without needing much ice.",
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

/** Soft category accent for card headers — theme-aware, no stock photos. */
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
  const [sel, setSel] = useState<Recipe | null>(null);
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    setSaved(loadSaved());
  }, []);

  useEffect(() => {
    if (!sel) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sel]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return RECIPES.filter((r) => {
      if (cat !== "All" && r.category !== cat) return false;
      if (!needle) return true;
      return (
        r.title +
        " " +
        r.tag +
        " " +
        r.category +
        " " +
        r.blurb +
        " " +
        r.ingredients.join(" ")
      )
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
            Simple meals you can actually make. Pick one, open the method, and cook it.
          </p>
        </header>

        {/* Search */}
        <div className="relative mt-8 rounded-2xl border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_3%,transparent)] px-3">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-livv-muted"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search recipes or ingredients…"
            className="w-full bg-transparent py-3.5 pl-8 pr-2 text-[13px] outline-none placeholder:text-livv-muted"
            aria-label="Search recipes"
          />
        </div>

        {/* Category chips */}
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

        {/* Collection */}
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
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSel(r)}
                  className="group w-full overflow-hidden rounded-[22px] border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_2.5%,transparent)] text-left transition hover:border-[color-mix(in_srgb,rgb(var(--livv-ink))_22%,transparent)]"
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
                      <span
                        className="mt-0.5 shrink-0 text-livv-muted"
                        aria-hidden
                      >
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
                    </div>
                  </div>
                </button>
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

      {/* Detail sheet */}
      {sel && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 px-0 sm:items-center sm:px-4"
          role="dialog"
          aria-modal="true"
          aria-label={sel.title}
          onClick={() => setSel(null)}
        >
          <div
            className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-[28px] border border-livv-border bg-[var(--livv-bg)] shadow-2xl sm:max-h-[88dvh] sm:rounded-[28px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`shrink-0 bg-gradient-to-br px-5 pb-5 pt-6 ${categoryTone(sel.category)}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-accent">
                    {sel.category} · {sel.tag}
                  </p>
                  <h2 className="mt-2 text-[26px] font-semibold tracking-[-.04em] sm:text-[30px]">
                    {sel.title}
                  </h2>
                  <p className="mt-2 max-w-[40ch] text-[13px] leading-5 text-livv-muted">
                    {sel.blurb}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSel(null)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-livv-border bg-[color-mix(in_srgb,var(--livv-bg)_65%,transparent)] text-livv-muted backdrop-blur-sm"
                  aria-label="Close recipe"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-[12px] text-livv-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={14} />
                  {sel.time} min
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users size={14} />
                  {sel.servings}
                </span>
              </div>
            </div>

            <div className="overflow-y-auto px-5 pb-10 pt-6">
              <div className="grid gap-8 sm:grid-cols-[.85fr_1.15fr]">
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">
                    Ingredients
                  </h3>
                  <ul className="mt-4 space-y-3 text-[13px] leading-5">
                    {sel.ingredients.map((x) => (
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
                    {sel.steps.map((x, i) => (
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
                    <p className="mt-2 text-[12px] leading-5 text-livv-muted">{sel.tip}</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleSave(sel.id)}
                className={
                  "mt-8 flex w-full items-center justify-center gap-2 rounded-full border py-3.5 text-[12px] font-semibold uppercase tracking-[.14em] transition " +
                  (saved.includes(sel.id)
                    ? "border-livv-accent bg-livv-accent-soft text-[rgb(var(--livv-ink))]"
                    : "border-livv-border text-livv-muted")
                }
              >
                {saved.includes(sel.id) ? (
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
          </div>
        </div>
      )}
    </main>
  );
}
