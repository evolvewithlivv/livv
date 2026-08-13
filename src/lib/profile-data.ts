export type ProfileData = {
  displayName: string;
  username: string;
  bio: string;
  avatarInitial: string;
  avatarColor: string;
};

export type ProfileStats = {
  level: number;
  currentXp: number;
  xpToNext: number;
  streak: number;
  workoutsCompleted: number;
  goalsCompleted: number;
};

export const DEFAULT_PROFILE: ProfileData = {
  displayName: "Kanye",
  username: "evolvewithlivv",
  bio: "Building discipline. Training daily. Evolving across every dimension.",
  avatarInitial: "K",
  avatarColor: "#7c5cff",
};

export const PROFILE_STATS: ProfileStats = {
  level: 7,
  currentXp: 1240,
  xpToNext: 1600,
  streak: 5,
  workoutsCompleted: 23,
  goalsCompleted: 41,
};

export const AVATAR_COLORS = [
  "#7c5cff",
  "#22d3ee",
  "#a78bfa",
  "#34d399",
  "#f472b6",
  "#fbbf24",
];