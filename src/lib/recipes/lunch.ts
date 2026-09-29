import type { Recipe } from "./types";
import { LUNCH_PART_0 } from "./lunch_0";
import { LUNCH_PART_1 } from "./lunch_1";
import { LUNCH_PART_2 } from "./lunch_2";

// Parts 3–4 upload next — temporary partial export keeps the build green.
export const LUNCH_RECIPES: Recipe[] = [
  ...LUNCH_PART_0,
  ...LUNCH_PART_1,
  ...LUNCH_PART_2,
];
