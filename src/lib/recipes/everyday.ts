import type { Recipe } from "./types";
import { EVERYDAY_PART_0 } from "./everyday_0";
import { EVERYDAY_PART_1 } from "./everyday_1";
import { EVERYDAY_PART_2 } from "./everyday_2";
import { EVERYDAY_PART_3 } from "./everyday_3";

/** Everyday American healthy meals. Clean English. Detailed methods. */
export const EVERYDAY_RECIPES: Recipe[] = [
  ...EVERYDAY_PART_0,
  ...EVERYDAY_PART_1,
  ...EVERYDAY_PART_2,
  ...EVERYDAY_PART_3,
];
