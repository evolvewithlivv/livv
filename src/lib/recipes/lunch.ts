import type { Recipe } from "./types";
import { LUNCH_PART_0 } from "./lunch_0";
import { LUNCH_PART_1 } from "./lunch_1";
import { LUNCH_PART_2 } from "./lunch_2";
import { LUNCH_PART_3 } from "./lunch_3";
import { LUNCH_PART_4 } from "./lunch_4";

export const LUNCH_RECIPES: Recipe[] = [
  ...LUNCH_PART_0,
  ...LUNCH_PART_1,
  ...LUNCH_PART_2,
  ...LUNCH_PART_3,
  ...LUNCH_PART_4,
];
