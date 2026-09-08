import type { Duration, Focus, Location, SplitTarget } from "./train-data";

export type SplitId = "ppl" | "upper-lower" | "bro" | "full" | "hybrid";

export type SplitDay = {
  id: string;
  day: string;
  label: string;
  focus: Focus | null;
  target?: SplitTarget;
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
    name: "Push / Pull / Legs",
    line: "Push one day. Pull the next. Legs after that.",
    detail: "A repeatable 6-day structure built around movement patterns and recovery.",
    color: "#FF4D6D",
    days: [
      { id: "ppl-mon", day: "MON", label: "Push", focus: "Push", target: "Push", muscles: "Chest · shoulders · triceps" },
      { id: "ppl-tue", day: "TUE", label: "Pull", focus: "Pull", target: "Pull", muscles: "Back · biceps" },
      { id: "ppl-wed", day: "WED", label: "Legs", focus: "Legs", target: "Legs", muscles: "Quads · hamstrings · glutes · calves" },
      { id: "ppl-thu", day: "THU", label: "Push", focus: "Push", target: "Push", muscles: "Chest · shoulders · triceps" },
      { id: "ppl-fri", day: "FRI", label: "Pull", focus: "Pull", target: "Pull", muscles: "Back · biceps" },
      { id: "ppl-sat", day: "SAT", label: "Legs", focus: "Legs", target: "Legs", muscles: "Quads · hamstrings · glutes · calves" },
      { id: "ppl-sun", day: "SUN", label: "Recovery", focus: null, muscles: "Rest · mobility · recovery", rest: true },
    ],
  },
  {
    id: "upper-lower",
    name: "Upper / Lower",
    line: "Upper one day. Lower the next. Repeat.",
    detail: "Simple frequency without making every session a full-body marathon.",
    color: "#4C8DFF",
    days: [
      { id: "ul-mon", day: "MON", label: "Upper", focus: "Upper Body", target: "Upper Body", muscles: "Chest · back · shoulders · arms" },
      { id: "ul-tue", day: "TUE", label: "Lower", focus: "Lower Body", target: "Lower Body", muscles: "Quads · hamstrings · glutes · calves" },
      { id: "ul-wed", day: "WED", label: "Recovery", focus: null, muscles: "Rest · mobility · recovery", rest: true },
      { id: "ul-thu", day: "THU", label: "Upper", focus: "Upper Body", target: "Upper Body", muscles: "Chest · back · shoulders · arms" },
      { id: "ul-fri", day: "FRI", label: "Lower", focus: "Lower Body", target: "Lower Body", muscles: "Quads · hamstrings · glutes · calves" },
      { id: "ul-sat", day: "SAT", label: "Recovery", focus: null, muscles: "Rest · mobility · recovery", rest: true },
      { id: "ul-sun", day: "SUN", label: "Recovery", focus: null, muscles: "Rest · mobility · recovery", rest: true },
    ],
  },
  {
    id: "bro",
    name: "Bro Split",
    line: "One major focus per training day. Five days. Recover hard.",
    detail: "Each day has a primary muscle-group mission instead of bundling everything together.",
    color: "#F5C542",
    days: [
      { id: "bro-mon", day: "MON", label: "Chest", focus: "Push", target: "Chest", muscles: "Chest" },
      { id: "bro-tue", day: "TUE", label: "Back", focus: "Pull", target: "Back", muscles: "Back" },
      { id: "bro-wed", day: "WED", label: "Shoulders", focus: "Upper Body", target: "Shoulders", muscles: "Front · side · rear delts" },
      { id: "bro-thu", day: "THU", label: "Arms", focus: "Upper Body", target: "Arms", muscles: "Biceps · triceps · forearms" },
      { id: "bro-fri", day: "FRI", label: "Legs", focus: "Legs", target: "Legs", muscles: "Quads · hamstrings · glutes · calves" },
      { id: "bro-sat", day: "SAT", label: "Recovery", focus: null, muscles: "Rest · mobility · recovery", rest: true },
      { id: "bro-sun", day: "SUN", label: "Recovery", focus: null, muscles: "Rest · mobility · recovery", rest: true },
    ],
  },
  {
    id: "full",
    name: "Full Body",
    line: "Train the whole body each session. Recover between sessions.",
    detail: "A flexible structure for people who want fewer training days without skipping muscle groups.",
    color: "#3DDC97",
    days: [
      { id: "full-mon", day: "MON", label: "Full Body", focus: "Full Body", target: "Full Body", muscles: "Upper · lower · core" },
      { id: "full-tue", day: "TUE", label: "Recovery", focus: null, muscles: "Rest · mobility · recovery", rest: true },
      { id: "full-wed", day: "WED", label: "Full Body", focus: "Full Body", target: "Full Body", muscles: "Upper · lower · core" },
      { id: "full-thu", day: "THU", label: "Recovery", focus: null, muscles: "Rest · mobility · recovery", rest: true },
      { id: "full-fri", day: "FRI", label: "Full Body", focus: "Full Body", target: "Full Body", muscles: "Upper · lower · core" },
      { id: "full-sat", day: "SAT", label: "Recovery", focus: null, muscles: "Rest · mobility · recovery", rest: true },
      { id: "full-sun", day: "SUN", label: "Recovery", focus: null, muscles: "Rest · mobility · recovery", rest: true },
    ],
  },
  {
    id: "hybrid",
    name: "Hybrid",
    line: "Strength, engine, and trunk work rotated across the week.",
    detail: "A balanced structure for people who want lifting plus conditioning in one system.",
    color: "#B45CFF",
    days: [
      { id: "hyb-mon", day: "MON", label: "Strength", focus: "Full Body", target: "Full Body", muscles: "Full-body strength" },
      { id: "hyb-tue", day: "TUE", label: "Engine", focus: "Cardio", target: "Cardio", muscles: "Conditioning · work capacity" },
      { id: "hyb-wed", day: "WED", label: "Trunk", focus: "Core", target: "Core", muscles: "Abs · obliques · trunk stability" },
      { id: "hyb-thu", day: "THU", label: "Strength", focus: "Full Body", target: "Full Body", muscles: "Full-body strength" },
      { id: "hyb-fri", day: "FRI", label: "Engine", focus: "Cardio", target: "Cardio", muscles: "Conditioning · work capacity" },
      { id: "hyb-sat", day: "SAT", label: "Recovery", focus: null, muscles: "Rest · mobility · recovery", rest: true },
      { id: "hyb-sun", day: "SUN", label: "Recovery", focus: null, muscles: "Rest · mobility · recovery", rest: true },
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

export function chipStyle(hex: string, on: boolean) {
  return {
    borderColor: on ? hex : `${hex}55`,
    background: on ? `${hex}2E` : `${hex}14`,
    boxShadow: on ? `0 0 22px ${hex}55` : undefined,
    color: on ? "#fff" : "rgba(255,255,255,0.86)",
  } as const;
}
