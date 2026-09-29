import type { Recipe } from "./types";
import { DINNER_PART_0 } from "./dinner_0";
import { DINNER_PART_1 } from "./dinner_1";
import { DINNER_PART_2 } from "./dinner_2";
import { DINNER_PART_3 } from "./dinner_3";
import { DINNER_PART_4 } from "./dinner_4";

export const DINNER_RECIPES: Recipe[] = [
  ...DINNER_PART_0,
  ...DINNER_PART_1,
  ...DINNER_PART_2,
  ...DINNER_PART_3,
  ...DINNER_PART_4,
];
