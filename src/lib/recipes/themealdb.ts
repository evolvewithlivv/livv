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

/** Titles must read clean in English — basic Latin only. */
function isCleanEnglishTitle(title: string): boolean {
  const t = title.trim();
  if (t.length < 3 || t.length > 70) return false;
  // Allow letters, numbers, spaces, and common punctuation only
  if (!/^[A-Za-z0-9][A-Za-z0-9 ,.'&()\/-]*$/.test(t)) return false;
  // Reject odd remnants / non-words
  if (/[æøåÆØÅßðÐþÞüöäßñç]/i.test(t)) return false;
  return true;
}

/**
 * Health gate: keep protein-forward, veg-forward, grilled/baked/steamed meals.
 * Drop deep-fried, pastry-heavy, candy, and classic junk.
 */
function isHealthyEnough(m: MealDBMeal, ings: string[]): boolean {
  const title = (m.strMeal || "").toLowerCase();
  const cat = (m.strCategory || "").toLowerCase();
  const tags = (m.strTags || "").toLowerCase();
  const ingText = ings.join(" ").toLowerCase();
  const blob = `${title} ${cat} ${tags} ${ingText}`;

  // Hard excludes — junk / dessert candy / deep fry
  const exclude =
    /\b(deep[- ]?fried|deep fry|donut|doughnut|brownie|cookie|biscuit|pastry|pie\b|tart\b|cheesecake|ice\s*cream|sundae|candy|fudge|caramel|buttercream|frosting|cupcake|muffin|pancake|waffle|french\s*toast|pizza|burger|hot\s*dog|hotdog|fries|chips|nacho|loaded|macaroni\s*cheese|mac\s*and\s*cheese|lasagne|lasagna|carbonara|alfredo|cream\s*sauce|fried\s*chicken|fried\s*rice|tempura|battered|breaded\s*and\s*fried|cornbread|scone|croissant|brioche)\b/i;
  if (exclude.test(blob)) return false;

  // Category-level: allow dessert only if fruit-forward
  if (cat === "dessert") {
    return /\b(fruit|berry|berries|apple|pear|peach|mango|citrus|yogurt|baked\s*apple)\b/i.test(blob);
  }

  // Prefer signals of real food
  const protein =
    /\b(chicken|turkey|salmon|tuna|cod|fish|shrimp|prawn|egg|eggs|tofu|lentil|lentils|chickpea|bean|beans|yogurt|greek\s*yogurt|cottage)\b/i.test(
      blob
    );
  const plants =
    /\b(salad|spinach|kale|broccoli|vegetable|vegetables|avocado|quinoa|oat|oats|tomato|cucumber|pepper|zucchini|asparagus|greens)\b/i.test(
      blob
    );
  const method =
    /\b(grill|grilled|bake|baked|roast|roasted|steam|steamed|poach|poached|saute|sauté|simmer|braise|sheet[- ]?pan)\b/i.test(
      blob
    );
  const whole =
    /\b(soup|stew|chili|curry|bowl|fillet|breast|thigh|legume|hummus|olive\s*oil)\b/i.test(blob);

  // Vegan/vegetarian from API are usually fine if not already excluded
  if (cat === "vegan" || cat === "vegetarian") return protein || plants || whole;

  // Seafood / chicken / etc. generally OK if not excluded
  if (["chicken", "seafood", "vegetarian", "vegan"].includes(cat)) return true;
  if (cat === "beef" || cat === "lamb" || cat === "pork") {
    // Keep leaner preparations only
    return method || plants || /\b(stir[- ]?fry|stew|soup|skewers?|kebab|grill)\b/i.test(blob);
  }

  return protein || plants || method || whole;
}

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
    // Skip empty / garbage measures
    if (!/^[A-Za-z0-9]/.test(ing)) continue;
    out.push(meas ? `${meas} ${ing}`.replace(/\s+/g, " ").trim() : ing);
  }
  return out;
}

function mapCategory(m: MealDBMeal): MealCategory {
  const c = (m.strCategory || "").toLowerCase();
  const n = (m.strMeal || "").toLowerCase();
  if (c === "breakfast" || /\b(oatmeal|oats|egg|omelet|omelette|scramble|yogurt)\b/.test(n))
    return "Breakfast";
  if (c === "dessert" || /\b(fruit|berry|baked apple)\b/.test(n)) return "Dessert";
  if (c === "side" || c === "starter" || /\b(hummus|dip|snack)\b/.test(n)) return "Snacks";
  if (/\b(salad|wrap|sandwich|bowl|toast)\b/.test(n) || (m.strInstructions || "").length < 400)
    return "Quick";
  if (c === "chicken" || c === "beef" || c === "lamb" || c === "pork" || c === "goat" || c === "seafood")
    return "Dinner";
  if (c === "pasta" || c === "vegan" || c === "vegetarian") return "Lunch";
  return "Lunch";
}

function toRecipe(m: MealDBMeal): Recipe | null {
  const title = (m.strMeal || "").trim();
  if (!isCleanEnglishTitle(title)) return null;

  const steps = parseSteps(m.strInstructions || "");
  const ings = ingredients(m);
  if (steps.length < 2 || ings.length < 3) return null;
  if (!isHealthyEnough(m, ings)) return null;

  // Instructions should be mostly English too (basic check)
  const instr = m.strInstructions || "";
  if (/[æøåÆØÅß]/.test(instr.slice(0, 200))) return null;

  const category = mapCategory(m);
  const time = Math.min(75, Math.max(12, 8 + steps.length * 3 + Math.floor(ings.length)));
  const blurbSrc = instr.replace(/\s+/g, " ").trim();

  return {
    id: `tmdb-${m.idMeal}`,
    title,
    time,
    tag: m.strArea || m.strCategory || "Recipe",
    category,
    servings: "2–4 servings",
    blurb: blurbSrc.length > 150 ? blurbSrc.slice(0, 147) + "…" : blurbSrc,
    ingredients: ings,
    steps,
    tip: [m.strArea ? `${m.strArea} cuisine` : null, m.strCategory || null].filter(Boolean).join(" · "),
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

/** Real meals only: clean English titles + health-forward filter. */
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

  // Boost Breakfast / lighter sides
  for (const cat of ["Breakfast", "Side", "Starter", "Seafood", "Chicken", "Vegetarian", "Vegan"] as const) {
    const filtered = await fetchJson<{ meals: { idMeal: string }[] | null }>(`/filter.php?c=${cat}`);
    const ids = (filtered?.meals || []).slice(0, 40).map((x) => x.idMeal);
    await Promise.all(
      ids.map(async (id) => {
        if (byId.has(`tmdb-${id}`)) return;
        const full = await fetchJson<{ meals: MealDBMeal[] | null }>(`/lookup.php?i=${id}`);
        const m = full?.meals?.[0];
        if (!m) return;
        const r = toRecipe(m);
        if (!r) return;
        if (cat === "Breakfast") r.category = "Breakfast";
        if (cat === "Side" || cat === "Starter") r.category = "Snacks";
        byId.set(r.id, r);
      })
    );
  }

  return Array.from(byId.values()).sort((a, b) => a.title.localeCompare(b.title));
}
