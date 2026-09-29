import type { MealCategory, Recipe } from "./types";

const BASE = "https://www.themealdb.com/api/json/v1/1";

type MealDBMeal = {
  idMeal: string;
  strMeal: string;
  strCategory: string | null;
  strArea: string | null;
  strInstructions: string | null;
  strMealThumb: string | null;
  strTags: string | null;
  strYoutube: string | null;
  strSource: string | null;
  [key: string]: string | null;
};

function parseSteps(text: string): string[] {
  const raw = text.replace(/\r/g, "\n").trim();
  if (!raw) return [];
  let parts = raw.split(/\n+/).map((p) => p.replace(/^\s*\d+[\.\)]\s*/, "").trim());
  parts = parts.filter((p) => p.length > 10);
  if (parts.length <= 1) {
    parts = raw
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15);
  }
  return parts.slice(0, 24);
}

function ingredients(m: MealDBMeal): string[] {
  const out: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ing = (m[`strIngredient${i}`] || "").trim();
    const meas = (m[`strMeasure${i}`] || "").trim();
    if (!ing) continue;
    out.push(meas ? `${meas} ${ing}`.replace(/\s+/g, " ").trim() : ing);
  }
  return out;
}

function mapCategory(m: MealDBMeal): MealCategory {
  const c = (m.strCategory || "").toLowerCase();
  const n = (m.strMeal || "").toLowerCase();
  if (c === "breakfast") return "Breakfast";
  if (c === "dessert") return "Dessert";
  if (c === "side" || c === "starter") return "Snacks";
  if (c === "chicken" || c === "beef" || c === "lamb" || c === "pork" || c === "goat" || c === "seafood")
    return "Dinner";
  if (c === "pasta" || c === "vegan" || c === "vegetarian") return "Lunch";
  // Quick heuristic: short name patterns
  if (/salad|sandwich|wrap|toast|omelette|omelet/.test(n)) return "Quick";
  return "Lunch";
}

function toRecipe(m: MealDBMeal): Recipe | null {
  const steps = parseSteps(m.strInstructions || "");
  const ings = ingredients(m);
  if (steps.length < 1 || ings.length < 2) return null;
  const category = mapCategory(m);
  const time = Math.min(90, Math.max(12, 8 + steps.length * 4 + Math.floor(ings.length * 1.2)));
  const blurbSrc = (m.strInstructions || "").replace(/\s+/g, " ").trim();
  return {
    id: `tmdb-${m.idMeal}`,
    title: m.strMeal,
    time,
    tag: m.strArea || m.strCategory || "Recipe",
    category,
    servings: "2–4 servings",
    blurb: blurbSrc.length > 150 ? blurbSrc.slice(0, 147) + "…" : blurbSrc,
    ingredients: ings,
    steps,
    tip: [
      m.strArea ? `${m.strArea} cuisine` : null,
      m.strCategory ? `${m.strCategory}` : null,
      "Full method from TheMealDB",
    ]
      .filter(Boolean)
      .join(" · "),
    image: m.strMealThumb || undefined,
    source: "TheMealDB",
    sourceUrl: m.strSource || m.strYoutube || `https://www.themealdb.com/meal/${m.idMeal}`,
  };
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Fetch a broad set of real meals with unique photos + full instructions. */
export async function fetchRealRecipes(): Promise<Recipe[]> {
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  const results = await Promise.all(
    letters.map((l) => fetchJson<{ meals: MealDBMeal[] | null }>(`/search.php?f=${l}`))
  );

  const byId = new Map<string, Recipe>();
  for (const data of results) {
    for (const m of data?.meals || []) {
      const r = toRecipe(m);
      if (r) byId.set(r.id, r);
    }
  }

  // Boost Breakfast / Dessert / Side coverage
  for (const cat of ["Breakfast", "Dessert", "Side", "Starter"] as const) {
    const filtered = await fetchJson<{ meals: { idMeal: string }[] | null }>(`/filter.php?c=${cat}`);
    const ids = (filtered?.meals || []).slice(0, 30).map((x) => x.idMeal);
    await Promise.all(
      ids.map(async (id) => {
        if (byId.has(`tmdb-${id}`)) return;
        const full = await fetchJson<{ meals: MealDBMeal[] | null }>(`/lookup.php?i=${id}`);
        const m = full?.meals?.[0];
        if (!m) return;
        const r = toRecipe(m);
        if (r) {
          if (cat === "Breakfast") r.category = "Breakfast";
          if (cat === "Dessert") r.category = "Dessert";
          if (cat === "Side" || cat === "Starter") r.category = "Snacks";
          byId.set(r.id, r);
        }
      })
    );
  }

  return Array.from(byId.values()).sort((a, b) => a.title.localeCompare(b.title));
}
