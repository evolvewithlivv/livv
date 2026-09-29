export type { MealCategory, Recipe, CategoryFilter, DietFilter, RecipeMacros } from "./types";
export { CATEGORIES, DIET_FILTERS } from "./types";
export { fetchRealRecipes } from "./themealdb";

/** Local static catalog retired in favor of TheMealDB. */
export const RECIPES: import("./types").Recipe[] = [];
