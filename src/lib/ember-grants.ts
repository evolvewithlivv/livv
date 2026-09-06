/** One-time official ember grants by username. Applied on identity load. */

const GRANT_FLAG = "livv-ember-grants-v1";

export const EMBER_GRANTS: Record<string, number> = {
  livvwillprosper: 1000,
};

export function applyEmberGrants(username: string, current: number) {
  if (typeof window === "undefined") return current;
  const clean = username.toLowerCase().replace(/^@/, "");
  const amount = EMBER_GRANTS[clean];
  if (!amount) return current;

  try {
    const raw = window.localStorage.getItem(GRANT_FLAG);
    const done = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    const key = `${clean}:${amount}`;
    if (done[key]) return current;
    done[key] = true;
    window.localStorage.setItem(GRANT_FLAG, JSON.stringify(done));
    return current + amount;
  } catch {
    return current;
  }
}
