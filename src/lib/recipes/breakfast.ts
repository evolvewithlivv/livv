import type { Recipe } from "./types";
import { BREAKFAST_PART_0 } from "./breakfast_0";
import { BREAKFAST_PART_1 } from "./breakfast_1";
import { BREAKFAST_PART_2 } from "./breakfast_2";
import { BREAKFAST_PART_3 } from "./breakfast_3";
import { BREAKFAST_PART_4 } from "./breakfast_4";

export const BREAKFAST_RECIPES: Recipe[] = [
  ...BREAKFAST_PART_0,
  ...BREAKFAST_PART_1,
  ...BREAKFAST_PART_2,
  ...BREAKFAST_PART_3,
  ...BREAKFAST_PART_4,
];
