/** LIVV Health tracking — local lifestyle logs, not medical records. */

export const HEALTH_KEY = "livv-health-v2";
export const HEALTH_LEGACY_KEY = "livv-health-v1";
export const HEALTH_MAX_DAYS = 90;

export const WATER_TARGET = 8;
export const MEALS_TARGET = 3;

export type HealthDay = {
  date: string;
  sleep: number;
  water: number;
  meals: number;
  movement: boolean;
  movementNote: string;
  weight: string;
  note: string;
};

export function blankDay(date: string): HealthDay {
  return {
    date,
    sleep: 0,
    water: 0,
    meals: 0,
    movement: false,
    movementNote: "",
    weight: "",
    note: "",
  };
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isDay(v: unknown): v is HealthDay {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return typeof o.date === "string";
}

function normalizeDay(partial: Partial<HealthDay> & { date: string }): HealthDay {
  const base = blankDay(partial.date);
  return {
    ...base,
    sleep: typeof partial.sleep === "number" && Number.isFinite(partial.sleep) ? Math.max(0, Math.min(16, partial.sleep)) : 0,
    water: typeof partial.water === "number" && Number.isFinite(partial.water) ? Math.max(0, Math.min(20, Math.round(partial.water))) : 0,
    meals: typeof partial.meals === "number" && Number.isFinite(partial.meals) ? Math.max(0, Math.min(6, Math.round(partial.meals))) : 0,
    movement: Boolean(partial.movement),
    movementNote: typeof partial.movementNote === "string" ? partial.movementNote.slice(0, 80) : "",
    weight: typeof partial.weight === "string" ? partial.weight.slice(0, 12) : "",
    note: typeof partial.note === "string" ? partial.note.slice(0, 280) : "",
  };
}

/** Load health history, migrating livv-health-v1 when needed. Never wipes data. */
export function loadHealthDays(): HealthDay[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HEALTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .filter(isDay)
          .map((d) => normalizeDay(d))
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-HEALTH_MAX_DAYS);
      }
      // Object map shape { "YYYY-MM-DD": {...} }
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const fromMap = Object.entries(parsed as Record<string, Partial<HealthDay>>).map(([date, v]) =>
          normalizeDay({ ...v, date }),
        );
        const sorted = fromMap.sort((a, b) => a.date.localeCompare(b.date)).slice(-HEALTH_MAX_DAYS);
        saveHealthDays(sorted);
        return sorted;
      }
    }

    const legacy = window.localStorage.getItem(HEALTH_LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as unknown;
      let migrated: HealthDay[] = [];
      if (Array.isArray(parsed)) {
        migrated = parsed.filter(isDay).map((d) => normalizeDay(d));
      } else if (parsed && typeof parsed === "object") {
        const o = parsed as Partial<HealthDay> & { date?: string };
        migrated = [normalizeDay({ ...o, date: o.date || todayKey() })];
      }
      migrated = migrated.sort((a, b) => a.date.localeCompare(b.date)).slice(-HEALTH_MAX_DAYS);
      if (migrated.length) saveHealthDays(migrated);
      return migrated;
    }
  } catch {
    /* ignore corrupt storage */
  }
  return [];
}

export function saveHealthDays(days: HealthDay[]): void {
  if (typeof window === "undefined") return;
  try {
    const next = days
      .map((d) => normalizeDay(d))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-HEALTH_MAX_DAYS);
    window.localStorage.setItem(HEALTH_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("livv-health"));
  } catch {
    /* quota */
  }
}

export function upsertHealthDay(day: HealthDay, existing: HealthDay[]): HealthDay[] {
  const next = [...existing.filter((d) => d.date !== day.date), normalizeDay(day)]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-HEALTH_MAX_DAYS);
  saveHealthDays(next);
  return next;
}

export function dayCompletion(d: HealthDay): { count: number; total: number; percent: number } {
  const flags = [d.sleep > 0, d.water > 0, d.meals > 0, d.movement];
  const count = flags.filter(Boolean).length;
  return { count, total: 4, percent: Math.round((count / 4) * 100) };
}

export function lastNDays(days: HealthDay[], n: number): HealthDay[] {
  const map = new Map(days.map((d) => [d.date, d]));
  const out: HealthDay[] = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = todayKey(d);
    out.push(map.get(key) ?? blankDay(key));
  }
  return out;
}

export function weekAverages(history: HealthDay[]) {
  const tracked = history.filter((d) => d.sleep > 0 || d.water > 0 || d.meals > 0 || d.movement);
  if (!tracked.length) {
    return { sleep: 0, water: 0, meals: 0, movementDays: 0, trackedDays: 0 };
  }
  return {
    sleep: tracked.reduce((s, d) => s + d.sleep, 0) / tracked.length,
    water: tracked.reduce((s, d) => s + d.water, 0) / tracked.length,
    meals: tracked.reduce((s, d) => s + d.meals, 0) / tracked.length,
    movementDays: tracked.filter((d) => d.movement).length,
    trackedDays: tracked.length,
  };
}

export function weekdayLabel(dateKey: string): string {
  try {
    return new Date(dateKey + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  } catch {
    return "—";
  }
}
