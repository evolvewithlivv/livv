export type Pillar = {
  id: string;
  name: string;
  description: string;
  level: number;
  progress: number;
};

export type Objective = {
  id: string;
  title: string;
  pillar: string;
  xp: number;
  completed: boolean;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
};

export const PILLAR_DEFS: Omit<Pillar, "level" | "progress">[] = [
  { id: "body", name: "Body", description: "Physical strength, health & performance" },
  { id: "mind", name: "Mind", description: "Focus, discipline & mental clarity" },
  { id: "career", name: "Career", description: "Skills, leverage & professional growth" },
  { id: "finance", name: "Finance", description: "Money systems & long-term security" },
  { id: "social", name: "Social", description: "Relationships & meaningful connection" },
  { id: "life", name: "Life", description: "Purpose, balance & daily quality" },
];

export const OBJECTIVE_DEFS: Omit<Objective, "completed">[] = [
  { id: "obj1", title: "Complete a training session", pillar: "Body", xp: 40 },
  { id: "obj2", title: "Write 3 priorities for tomorrow", pillar: "Mind", xp: 25 },
  { id: "obj3", title: "30 minutes deep work", pillar: "Career", xp: 35 },
  { id: "obj4", title: "Track today's spending", pillar: "Finance", xp: 20 },
  { id: "obj5", title: "Send one meaningful message", pillar: "Social", xp: 20 },
];

export const ACHIEVEMENT_DEFS: Omit<Achievement, "unlocked">[] = [
  { id: "a1", title: "First Spark", description: "Complete your first objective", icon: "⚡" },
  { id: "a2", title: "Consistency Seed", description: "Maintain a 3-day streak", icon: "🌱" },
  { id: "a3", title: "Body Awakening", description: "Reach Body Level 3", icon: "💪" },
  { id: "a4", title: "Mind Architect", description: "Complete 10 Mind objectives", icon: "🧠" },
  { id: "a5", title: "Streak Guardian", description: "Reach a 14-day streak", icon: "🔥" },
  { id: "a6", title: "Full Spectrum", description: "Log activity in all 6 pillars", icon: "✦" },
];

export const PILLARS: Pillar[] = PILLAR_DEFS.map((p) => ({ ...p, level: 1, progress: 0 }));
export const INITIAL_OBJECTIVES: Objective[] = OBJECTIVE_DEFS.map((o) => ({ ...o, completed: false }));
export const ACHIEVEMENTS: Achievement[] = ACHIEVEMENT_DEFS.map((a) => ({ ...a, unlocked: false }));
