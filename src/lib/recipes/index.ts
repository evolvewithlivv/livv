import type { Recipe } from "./types";
import { BREAKFAST_RECIPES } from "./breakfast";
import { SNACKS_RECIPES } from "./snacks";

export type { MealCategory, Recipe, CategoryFilter } from "./types";
export { CATEGORIES } from "./types";

// Lunch, Dinner, Quick, Dessert catalogs ship next — structure already supports all 6.
export const RECIPES: Recipe[] = [
  ...BREAKFAST_RECIPES,
  ...SNACKS_RECIPES,
];
