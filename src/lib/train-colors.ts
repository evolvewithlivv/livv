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

export const SPLITS: SplitDef[] = [
  {
    id: "ppl",
    name: "6-Day Push / Pull / Legs",
    line: "The week is the system. Push, pull, legs. Repeat. Sunday off.",
    detail: "Split = what gets trained. Workout = how you train it.",
    color: "#FF4D6D",
    days: [
      { id: "ppl-mon", day: "MON", label: "Push", focus: "Push", muscles: "Chest + shoulders + triceps" },
      { id: "ppl-tue", day: "TUE", label: "Pull", focus: "Pull", muscles: "Back + biceps" },
      { id: "ppl-wed", day: "WED", label: "Legs", focus: "Legs", muscles: "Quads + hamstrings + glutes + calves" },
      { id: "ppl-thu", day: "THU", label: "Push", focus: "Push", muscles: "Chest + shoulders + triceps" },
      { id: "ppl-fri", day: "FRI", label: "Pull", focus: "Pull", muscles: "Back + biceps" },
      { id: "ppl-sat", day: "SAT", label: "Legs", focus: "Legs", muscles: "Quads + hamstrings + glutes + calves" },
      { id: "ppl-sun", day: "SUN", label: "Rest", focus: null, muscles: "Off. Recovery is in the split.", rest: true },
    ],
  },
  {
    id: "upper-lower",
    name: "Upper / Lower",
    line: "Upper. Lower. Rest. Upper. Lower. Then rest again.",
    detail: "Four training days. The split decides the half of the body. The workout fills the day.",
    color: "#4C8DFF",
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
    name: "Bro Split",
    line: "One muscle group owns the day. Five days. Weekend off.",
    detail: "Monday chest is not Tuesday back. Each day gets its own workout.",
    color: "#F5C542",
    days: [
      { id: "bro-mon", day: "MON", label: "Chest", focus: "Chest", muscles: "Chest" },
      { id: "bro-tue", day: "TUE", label: "Back", focus: "Back", muscles: "Back" },
      { id: "bro-wed", day: "WED", label: "Shoulders", focus: "Shoulders", muscles: "Shoulders" },
      { id: "bro-thu", day: "THU", label: "Arms", focus: "Arms", muscles: "Biceps + triceps" },
      { id: "bro-fri", day: "FRI", label: "Legs", focus: "Legs", muscles: "Quads + hamstrings + glutes + calves" },
      { id: "bro-sat", day: "SAT", label: "Rest", focus: null, muscles: "Off.", rest: true },
      { id: "bro-sun", day: "SUN", label: "Rest", focus: null, muscles: "Off.", rest: true },
    ],
  },
  {
    id: "full",
    name: "Full Body",
    line: "Three full-body days. The whole body every session.",
    detail: "No muscle group is parked on a different day. Recovery sits between sessions.",
    color: "#3DDC97",
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
    detail: "The week mixes lift days and conditioning days on purpose.",
    color: "#B45CFF",
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
  "Full Body": "#1EC8A5",
  "Upper Body": "#9B7CFF",
  "Lower Body": "#D4A017",
  Push: "#FF7A1A",
  Pull: "#5B8CFF",
  Legs: "#C8F542",
  Core: "#86E35A",
  Cardio: "#FF3B6B",
  Chest: "#FF8C42",
  Back: "#3D7EFF",
  Shoulders: "#D46BFF",
  Arms: "#FF5CA8",
};

export const LOCATION_COLOR: Record<Location, string> = {
  Home: "#7EB6FF",
  Gym: "#E85D04",
  Anywhere: "#2EE0C0",
};

export const DURATION_COLOR: Record<Duration, string> = {
  "10": "#A8FF60",
  "20": "#00C2A8",
  "30": "#7C6BFF",
  "45": "#FF8AB4",
  "60+": "#FF6B35",
};

const SPLIT_KEY = "livv-active-split";

export function loadActiveSplit(): SplitId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SPLIT_KEY);
    if (raw === "ppl" || raw === "upper-lower" || raw === "bro" || raw === "full" || raw === "hybrid") return raw;
  } catch {}
  return null;
}

export function saveActiveSplit(id: SplitId) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(SPLIT_KEY, id); } catch {}
}

export function chipStyle(hex: string, on: boolean) {
  return {
    borderColor: on ? hex : `${hex}55`,
    background: on ? `${hex}2E` : `${hex}14`,
    boxShadow: on ? `0 0 22px ${hex}55` : undefined,
    color: on ? "#fff" : "rgba(255,255,255,0.86)",
  } as const;
}
