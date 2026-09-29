import type { Recipe } from "./types";
import { BREAKFAST_RECIPES } from "./breakfast";
import { LUNCH_RECIPES } from "./lunch";

export type { MealCategory, Recipe, CategoryFilter, DietFilter, RecipeMacros } from "./types";
export { CATEGORIES, DIET_FILTERS } from "./types";

/** 100 recipes live (50 Breakfast + 50 Lunch). Dinner / Quick / Snacks / Dessert uploading next. */
export const RECIPES: Recipe[] = [
  ...BREAKFAST_RECIPES,
  ...LUNCH_RECIPES,
];
