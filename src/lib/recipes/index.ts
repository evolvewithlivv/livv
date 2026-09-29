import type { Recipe } from "./types";
import { EVERYDAY_RECIPES } from "./everyday";

export type { MealCategory, Recipe, CategoryFilter, DietFilter, RecipeMacros } from "./types";
export { CATEGORIES, DIET_FILTERS } from "./types";

/** Everyday American healthy meals with clear methods. */
export const RECIPES: Recipe[] = EVERYDAY_RECIPES;
