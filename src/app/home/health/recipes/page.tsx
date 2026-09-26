"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, Clock3, Search, Utensils, X } from "lucide-react";

type Recipe = {
  title: string;
  time: number;
  tag: string;
  servings: string;
  ingredients: string[];
  steps: string[];
  tip: string;
};

const RECIPES: Recipe[] = [
  {
    title: "LIVV Chicken Rice Bowl",
    time: 30,
    tag: "High protein",
    servings: "1 generous bowl",
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
    title: "Steak & Egg Plate",
    time: 20,
    tag: "Protein",
    servings: "1 plate",
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
    title: "Overnight Oats",
    time: 5,
    tag: "Breakfast",
    servings: "1 jar",
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
    title: "Salmon Green Bowl",
    time: 25,
    tag: "Omega-3",
    servings: "1 bowl",
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
    title: "Turkey Power Wrap",
    time: 10,
    tag: "Quick",
    servings: "1 wrap",
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
    title: "Recovery Smoothie",
    time: 5,
    tag: "Recovery",
    servings: "1 large smoothie",
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

export default function RecipesPage() {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Recipe | null>(null);
  const list = useMemo(
    () =>
      RECIPES.filter((r) =>
        (r.title + " " + r.tag + " " + r.ingredients.join(" ")).toLowerCase().includes(q.toLowerCase())
      ),
    [q]
  );

  useEffect(() => {
    if (!sel) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sel]);

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
            Recipes should get you from ingredients to a good meal without making the process feel complicated. Choose a
            meal, open the method, and actually cook it.
          </p>
        </header>

        <div className="relative mt-9 rounded-2xl border border-livv-border bg-[color-mix(in_srgb,rgb(var(--livv-ink))_3%,transparent)] px-3">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-livv-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search recipes, ingredients, or goals..."
            className="w-full bg-transparent py-3.5 pl-7 pr-2 text-[13px] outline-none placeholder:text-livv-muted"
            aria-label="Search recipes"
          />
        </div>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.19em] text-livv-muted">Collection</p>
              <h2 className="mt-1 text-[27px] font-semibold tracking-[-.045em]">Simple. Repeatable. Good.</h2>
            </div>
            <span className="text-[10px] uppercase tracking-[.14em] text-livv-muted">{list.length} recipes</span>
          </div>
          <div className="mt-5 divide-y divide-livv-border border-y border-livv-border">
            {list.map((r, i) => (
              <button
                key={r.title}
                type="button"
                onClick={() => setSel(r)}
                className="group flex w-full items-center gap-4 py-5 text-left"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-livv-border text-[10px] font-semibold text-livv-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold">{r.title}</span>
                  <span className="mt-1 flex items-center gap-2 text-[11px] text-livv-muted">
                    <span>{r.tag}</span>
                    <span>·</span>
                    <Clock3 size={12} />
                    <span>{r.time} min</span>
                    <span>·</span>
                    <span>{r.servings}</span>
                  </span>
                </span>
                <ArrowRight size={16} className="shrink-0 text-livv-muted" />
              </button>
            ))}
          </div>
          {!list.length && <p className="py-10 text-center text-[13px] text-livv-muted">Nothing matched that search.</p>}
        </section>
      </div>

      {sel && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 px-0 sm:items-center sm:px-4"
          role="dialog"
          aria-modal="true"
          aria-label={sel.title}
          onClick={() => setSel(null)}
        >
          <div
            className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-[28px] border border-livv-border bg-[var(--livv-bg)] shadow-2xl sm:max-h-[88dvh] sm:rounded-[28px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-livv-border px-5 pb-4 pt-5">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-accent">
                  {sel.tag} · {sel.time} min · {sel.servings}
                </p>
                <h2 className="mt-2 text-[26px] font-semibold tracking-[-.04em] sm:text-[29px]">{sel.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSel(null)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-livv-border text-livv-muted"
                aria-label="Close recipe"
              >
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto px-5 pb-10 pt-6">
              <div className="grid gap-8 sm:grid-cols-[.8fr_1.2fr]">
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">Ingredients</h3>
                  <ul className="mt-4 space-y-3 text-[13px] leading-5">
                    {sel.ingredients.map((x) => (
                      <li key={x}>• {x}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">Method</h3>
                  <ol className="mt-4 space-y-4">
                    {sel.steps.map((x, i) => (
                      <li key={x} className="flex gap-3 text-[13px] leading-6">
                        <span className="font-semibold text-livv-accent">{i + 1}.</span>
                        <span>{x}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-7 border-t border-livv-border pt-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-livv-muted">LIVV tip</p>
                    <p className="mt-2 text-[12px] leading-5 text-livv-muted">{sel.tip}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
