export type {
  MealCategory,
  Recipe,
  CategoryFilter,
  DietFilter,
  RecipeMacros,
} from "./recipes/types";
export { CATEGORIES, DIET_FILTERS } from "./recipes/types";

/** @deprecated Local catalog retired — page loads real recipes from /api/recipes */
export const RECIPES: import("./recipes/types").Recipe[] = [];
