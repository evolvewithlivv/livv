import type { PackGrade } from "@/lib/packs";

/* Pack artwork is shipped with the app so the core shop does not depend on GitHub at runtime. */
export const PACK_ART: Record<PackGrade, string> = {
  1: "/packs/spark.png",
  2: "/packs/rise.png",
  3: "/packs/signal.png",
  4: "/packs/apex.png",
};
