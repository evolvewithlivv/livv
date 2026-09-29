import type { Recipe } from "./types";
import { SNACKS_PART_0 } from "./snacks_0";
import { SNACKS_PART_1 } from "./snacks_1";
import { SNACKS_PART_2 } from "./snacks_2";
import { SNACKS_PART_3 } from "./snacks_3";
import { SNACKS_PART_4 } from "./snacks_4";

export const SNACKS_RECIPES: Recipe[] = [
  ...SNACKS_PART_0,
  ...SNACKS_PART_1,
  ...SNACKS_PART_2,
  ...SNACKS_PART_3,
  ...SNACKS_PART_4,
];
