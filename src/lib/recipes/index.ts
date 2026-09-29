import type { Recipe } from "./types";
import { BREAKFAST_RECIPES } from "./breakfast";
import { LUNCH_RECIPES } from "./lunch";

export type { MealCategory, Recipe, CategoryFilter, DietFilter, RecipeMacros } from "./types";
export { CATEGORIES, DIET_FILTERS } from "./types";

// Rolling upload: Breakfast (50) live; Lunch parts 0–2 live (30); remaining catalogs next.
export const RECIPES: Recipe[] = [
  ...BREAKFAST_RECIPES,
  ...LUNCH_RECIPES,
];
