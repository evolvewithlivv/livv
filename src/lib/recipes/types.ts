export type MealCategory =
  | "Breakfast"
  | "Lunch"
  | "Dinner"
  | "Quick"
  | "Snacks"
  | "Dessert";

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

export type CategoryFilter = (typeof CATEGORIES)[number];
