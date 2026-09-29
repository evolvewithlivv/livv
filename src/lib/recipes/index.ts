import type { Recipe } from "./types";
import { BREAKFAST_RECIPES } from "./breakfast";
import { LUNCH_RECIPES } from "./lunch";
import { DINNER_RECIPES } from "./dinner";
import { QUICK_RECIPES } from "./quick";
import { SNACKS_RECIPES } from "./snacks";
import { DESSERT_RECIPES } from "./dessert";

export type { MealCategory, Recipe, CategoryFilter } from "./types";
export { CATEGORIES } from "./types";

export const RECIPES: Recipe[] = [
  ...BREAKFAST_RECIPES,
  ...LUNCH_RECIPES,
  ...DINNER_RECIPES,
  ...QUICK_RECIPES,
  ...SNACKS_RECIPES,
  ...DESSERT_RECIPES,
];
