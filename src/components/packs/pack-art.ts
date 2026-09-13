import type { PackGrade } from "@/lib/packs";

const RAW = "https://raw.githubusercontent.com/evolvewithlivv/livv/main";

/* Canonical visual order matches GRADE_META: Spark → Rise → Signal → Apex. */
export const PACK_ART: Record<PackGrade, string> = {
  1: `${RAW}/public/packs/spark.png`,
  2: `${RAW}/public/packs/rise.png`,
  3: `${RAW}/public/packs/signal.png`,
  4: `${RAW}/public/packs/apex.png`,
};
