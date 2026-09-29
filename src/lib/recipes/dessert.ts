import type { Recipe } from "./types";
import { DESSERT_PART_0 } from "./dessert_0";
import { DESSERT_PART_1 } from "./dessert_1";
import { DESSERT_PART_2 } from "./dessert_2";
import { DESSERT_PART_3 } from "./dessert_3";
import { DESSERT_PART_4 } from "./dessert_4";

export const DESSERT_RECIPES: Recipe[] = [
  ...DESSERT_PART_0,
  ...DESSERT_PART_1,
  ...DESSERT_PART_2,
  ...DESSERT_PART_3,
  ...DESSERT_PART_4,
];
