import type { Duration, Focus, Location } from "./train-data";

export type SplitId = "ppl" | "upper-lower" | "bro" | "full" | "hybrid";
export type SplitDay = {
  id: string;
  day: string;
  label: string;
  focus: Focus | null;
  muscles: string;
  rest?: boolean;
};
export type SplitDef = {
  id: SplitId;
  name: string;
  line: string;
  detail: string;
  days: SplitDay[];
  color: string;
};

const ACCENT = "#FF9D23";
const CUSTOM_SPLIT_KEY = "livv-custom-split-v1";

export const LIVV_COLORS = {
  blue: "#0F7FFF",
  yellow: "#F5D90A",
  red: "#F93827",
  pink: "#F61981",
  purple: "#9A00FF",
  green: "#39B54A",
  orange: "#FF9D23",
} as const;

export const SPLITS: SplitDef[] = [
  {
    id: "ppl",
    name: "6-Day Push / Pull / Legs",
    line: "The week is the system. Push, pull, legs. Repeat. Sunday off.",
    detail: "Split = what gets trained. Workout = how you train it.",
    color: ACCENT,
    days: [
      { id: "ppl-mon", day: "MON", label: "Push", focus: "Push", muscles: "Chest + shoulders + triceps" },
      { id: "ppl-tue", day: "TUE", label: "Pull", focus: "Pull", muscles: "Back + biceps" },
      { id: "ppl-wed", day: "WED", label: "Legs", focus: "Legs", muscles: "Quads + hamstrings + glutes + calves" },
      { id: "ppl-thu", day: "THU", label: "Push", focus: "Push", muscles: "Chest + shoulders + triceps" },
      { id: "ppl-fri", day: "FRI", label: "Pull", focus: "Pull", muscles: "Back + biceps" },
      { id: "ppl-sat", day: "SAT", label: "Legs", focus: "Legs", muscles: "Quads + hamstrings + glutes + calves" },
      { id: "ppl-sun", day: "SUN", label: "Rest", focus: null, muscles: "Off.", rest: true },
    ],
  },
  {
    id: "upper-lower",
    name: "Upper / Lower",
    line: "Upper. Lower. Rest. Upper. Lower. Then rest again.",
    detail: "Four training days. The split decides the half of the body. The workout fills the day.",
    color: ACCENT,
    days: [
      { id: "ul-mon", day: "MON", label: "Upper", focus: "Upper Body", muscles: "Chest + back + shoulders + arms" },
      { id: "ul-tue", day: "TUE", label: "Lower", focus: "Lower Body", muscles: "Quads + hamstrings + glutes + calves" },
      { id: "ul-wed", day: "WED", label: "Rest", focus: null, muscles: "Off.", rest: true },
      { id: "ul-thu", day: "THU", label: "Upper", focus: "Upper Body", muscles: "Chest + back + shoulders + arms" },
      { id: "ul-fri", day: "FRI", label: "Lower", focus: "Lower Body", muscles: "Quads + hamstrings + glutes + calves" },
      { id: "ul-sat", day: "SAT", label: "Rest", focus: null, muscles: "Off.", rest: true },
      { id: "ul-sun", day: "SUN", label: "Rest", focus: null, muscles: "Off.", rest: true },
    ],
  },
  {
    id: "bro",
    name: "Body-part",
    line: "One muscle group owns the day. Five days. Weekend off.",
    detail: "Classic bodybuilding split. Each training day owns one primary group.",
    color: ACCENT,
    days: [
      { id: "bro-mon", day: "MON", label: "Chest", focus: "Chest", muscles: "Chest + triceps" },
      { id: "bro-tue", day: "TUE", label: "Back", focus: "Back", muscles: "Back + biceps" },
      { id: "bro-wed", day: "WED", label: "Legs", focus: "Legs", muscles: "Quads + hamstrings + glutes + calves" },
      { id: "bro-thu", day: "THU", label: "Shoulders", focus: "Shoulders", muscles: "Delts + traps" },
      { id: "bro-fri", day: "FRI", label: "Arms", focus: "Arms", muscles: "Biceps + triceps" },
      { id: "bro-sat", day: "SAT", label: "Rest", focus: null, muscles: "Off.", rest: true },
      { id: "bro-sun", day: "SUN", label: "Rest", focus: null, muscles: "Off.", rest: true },
    ],
  },
  {
    id: "full",
    name: "Full Body",
    line: "Three full-body days. The whole body every session.",
    detail: "Fewer training days, full coverage. Recovery sits between sessions.",
    color: ACCENT,
    days: [
      { id: "full-mon", day: "MON", label: "Full Body", focus: "Full Body", muscles: "Whole body" },
      { id: "full-tue", day: "TUE", label: "Rest", focus: null, muscles: "Off.", rest: true },
      { id: "full-wed", day: "WED", label: "Full Body", focus: "Full Body", muscles: "Whole body" },
      { id: "full-thu", day: "THU", label: "Rest", focus: null, muscles: "Off.", rest: true },
      { id: "full-fri", day: "FRI", label: "Full Body", focus: "Full Body", muscles: "Whole body" },
      { id: "full-sat", day: "SAT", label: "Rest", focus: null, muscles: "Off.", rest: true },
      { id: "full-sun", day: "SUN", label: "Rest", focus: null, muscles: "Off.", rest: true },
    ],
  },
  {
    id: "hybrid",
    name: "Hybrid",
    line: "Strength. Engine. Trunk. Then repeat.",
    detail: "The week mixes strength and conditioning days on purpose.",
    color: ACCENT,
    days: [
      { id: "hyb-mon", day: "MON", label: "Strength", focus: "Full Body", muscles: "Whole-body strength" },
      { id: "hyb-tue", day: "TUE", label: "Engine", focus: "Cardio", muscles: "Conditioning" },
      { id: "hyb-wed", day: "WED", label: "Trunk", focus: "Core", muscles: "Abs + obliques" },
      { id: "hyb-thu", day: "THU", label: "Strength", focus: "Full Body", muscles: "Whole-body strength" },
      { id: "hyb-fri", day: "FRI", label: "Engine", focus: "Cardio", muscles: "Conditioning" },
      { id: "hyb-sat", day: "SAT", label: "Rest", focus: null, muscles: "Off.", rest: true },
      { id: "hyb-sun", day: "SUN", label: "Rest", focus: null, muscles: "Off.", rest: true },
    ],
  },
];

export const FOCUS_COLOR: Record<Focus, string> = {
  "Full Body": LIVV_COLORS.blue,
  "Upper Body": LIVV_COLORS.purple,
  "Lower Body": LIVV_COLORS.green,
  Push: LIVV_COLORS.red,
  Pull: LIVV_COLORS.blue,
  Legs: LIVV_COLORS.green,
  Core: LIVV_COLORS.yellow,
  Cardio: LIVV_COLORS.pink,
  Chest: LIVV_COLORS.red,
  Back: LIVV_COLORS.blue,
  Shoulders: LIVV_COLORS.purple,
  Arms: LIVV_COLORS.orange,
};

export const LOCATION_COLOR: Record<Location, string> = {
  Home: ACCENT,
  Gym: ACCENT,
  Anywhere: ACCENT,
};

export const DURATION_COLOR: Record<Duration, string> = {
  "10": ACCENT,
  "20": ACCENT,
  "30": ACCENT,
  "45": ACCENT,
  "60+": ACCENT,
};

const SPLIT_KEY = "livv-active-split";

export type CustomSplit = {
  id: "custom";
  name: string;
  line: string;
  detail: string;
  days: SplitDay[];
  color: string;
};

export const FOCUS_OPTIONS: Focus[] = [
  "Full Body","Upper Body","Lower Body","Push","Pull","Legs","Core","Cardio","Chest","Back","Shoulders","Arms",
];

export function loadCustomSplit(): CustomSplit | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CUSTOM_SPLIT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CustomSplit;
    if (!parsed || !Array.isArray(parsed.days) || parsed.days.length !== 7) return null;
    return parsed;
  } catch { return null; }
}

export function saveCustomSplit(split: CustomSplit) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(CUSTOM_SPLIT_KEY, JSON.stringify(split)); } catch {}
}

export function loadActiveSplit(): SplitId | "custom" | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SPLIT_KEY);
    return raw === "ppl" || raw === "upper-lower" || raw === "bro" || raw === "full" || raw === "hybrid" || raw === "custom"
      ? raw
      : null;
  } catch {
    return null;
  }
}

export function saveActiveSplit(id: SplitId) {
  if (typeof window !== "undefined")
    try {
      window.localStorage.setItem(SPLIT_KEY, id);
    } catch {}
}

export function chipStyle(_hex: string, on: boolean) {
  return {
    borderColor: on
      ? ACCENT
      : "color-mix(in srgb, rgb(var(--livv-ink)) 14%, transparent)",
    background: on
      ? "rgba(255,157,35,.10)"
      : "color-mix(in srgb, rgb(var(--livv-ink)) 4%, transparent)",
    boxShadow: "none",
    color: on ? "rgb(var(--livv-ink))" : "rgb(var(--livv-muted))",
  } as const;
}
