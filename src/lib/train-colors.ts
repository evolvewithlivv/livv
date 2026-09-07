import type { Duration, Focus, Location } from "./train-data";

export const FOCUS_COLOR: Record<Focus, string> = {
  "Full Body": "#4C8DFF",
  "Upper Body": "#7C6BFF",
  "Lower Body": "#2EE0C0",
  Push: "#FF7A1A",
  Pull: "#FF5C8A",
  Legs: "#F5C542",
  Core: "#3DDC97",
  Cardio: "#FF4D6D",
};

export const LOCATION_COLOR: Record<Location, string> = {
  Home: "#7EB6FF",
  Gym: "#F5C542",
  Anywhere: "#2EE0C0",
};

export const DURATION_COLOR: Record<Duration, string> = {
  "10": "#3DDC97",
  "20": "#4C8DFF",
  "30": "#7C6BFF",
  "45": "#FF8A2A",
  "60+": "#FF4D6D",
};

export function chipStyle(hex: string, on: boolean) {
  return {
    borderColor: on ? hex : `${hex}44`,
    background: on ? `${hex}28` : `${hex}12`,
    boxShadow: on ? `0 0 22px ${hex}55` : undefined,
    color: on ? "#fff" : "rgba(255,255,255,0.82)",
  } as const;
}
