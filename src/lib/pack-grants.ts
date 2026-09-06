/** One-time official pack grants by username. */

import type { PackGrade, PackState } from "./packs";

const GRANT_FLAG = "livv-pack-grants-v1";

export const PACK_GRANTS: Record<string, PackGrade[]> = {
  livvwillprosper: [1, 2, 3, 4],
};

export function applyPackGrants(username: string, state: PackState): PackState {
  if (typeof window === "undefined") return state;
  const clean = username.toLowerCase().replace(/^@/, "");
  const grades = PACK_GRANTS[clean];
  if (!grades?.length) return state;

  try {
    const raw = window.localStorage.getItem(GRANT_FLAG);
    const done = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    const key = `${clean}:spark-rise-signal-apex`;
    if (done[key]) return state;

    const now = Date.now();
    const pending = [...state.pending];
    for (const grade of grades) {
      pending.push({
        id: `grant_${grade}_${now}`,
        grade,
        grantedAt: now,
      });
    }
    done[key] = true;
    window.localStorage.setItem(GRANT_FLAG, JSON.stringify(done));
    const next = { ...state, pending };
    window.localStorage.setItem("livv-packs-v2", JSON.stringify(next));
    window.dispatchEvent(new Event("livv-packs"));
    return next;
  } catch {
    return state;
  }
}
