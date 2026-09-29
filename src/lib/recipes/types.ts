export type MealCategory =
  | "Breakfast"
  | "Lunch"
  | "Dinner"
  | "Quick"
  | "Snacks"
  | "Dessert";

export type RecipeMacros = {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
};

export type Recipe = {
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
  /** Unique photo for this specific recipe (from source) */
  image?: string;
  source?: string;
  sourceUrl?: string;
  macros?: RecipeMacros;
  diet?: string[];
};

export const CATEGORIES = [
  "All",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Quick",
  "Snacks",
  "Dessert",
] as const;

export const DIET_FILTERS = [
  "All",
  "High protein",
  "Mediterranean",
  "Meal prep",
  "Quick",
  "Plant-forward",
] as const;

export type CategoryFilter = (typeof CATEGORIES)[number];
export type DietFilter = (typeof DIET_FILTERS)[number];
