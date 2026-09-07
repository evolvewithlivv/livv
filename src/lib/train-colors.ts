import type { Duration, Focus, Location } from "./train-data";

export type SplitId = "ppl" | "upper-lower" | "bro" | "full" | "hybrid";

export type SplitDef = {
  id: SplitId;
  name: string;
  line: string;
  days: Focus[];
  color: string;
};

export const SPLITS: SplitDef[] = [
  {
    id: "ppl",
    name: "Push Pull Legs",
    line: "Push one day. Pull the next. Legs after that.",
    days: ["Push", "Pull", "Legs"],
    color: "#FF4D6D",
  },
  {
    id: "upper-lower",
    name: "Upper Lower",
    line: "Upper one day. Lower the next. Repeat.",
    days: ["Upper Body", "Lower Body"],
    color: "#4C8DFF",
  },
  {
    id: "bro",
    name: "Bro Split",
    line: "One focus a day. Five days. High volume.",
    days: ["Push", "Pull", "Legs", "Core", "Cardio"],
    color: "#F5C542",
  },
  {
    id: "full",
    name: "Full Body",
    line: "Same session any day you train.",
    days: ["Full Body"],
    color: "#3DDC97",
  },
  {
    id: "hybrid",
    name: "Hybrid",
    line: "Lift. Engine. Trunk. Rotate those three.",
    days: ["Full Body", "Cardio", "Core"],
    color: "#B45CFF",
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
