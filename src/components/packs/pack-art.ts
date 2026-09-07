import type { PackGrade } from "@/lib/packs";

const RAW = "https://raw.githubusercontent.com/evolvewithlivv/livv/main";

/* Canonical visual order matches GRADE_META: Spark → Rise → Apex → Signal. */
export const PACK_ART: Record<PackGrade, string> = {
  1: `${RAW}/public%3Apacks%3Aspark.jpg.PNG`,
  2: `${RAW}/public%3Apacks%3Arise.jpg.PNG`,
  3: `${RAW}/public%3Apacks%3Aapex.jpg.PNG`,
  4: `${RAW}/public%3Apacks%3Asignal.jpg.PNG`,
};
