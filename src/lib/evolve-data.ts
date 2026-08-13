export type Pillar = {
  id: string;
  name: string;
  description: string;
  level: number;
  progress: number; // 0-100 toward next level
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

export const PILLARS: Pillar[] = [
  {
    id: "body",
    name: "Body",
    description: "Physical strength, health & performance",
    level: 4,
    progress: 62,
  },
  {
    id: "mind",
    name: "Mind",
    description: "Focus, discipline & mental clarity",
    level: 3,
    progress: 41,
  },
  {
    id: "career",
    name: "Career",
    description: "Skills, leverage & professional growth",
    level: 2,
    progress: 78,
  },
  {
    id: "finance",
    name: "Finance",
    description: "Money systems & long-term security",
    level: 2,
    progress: 35,
  },
  {
    id: "social",
    name: "Social",
    description: "Relationships & meaningful connection",
    level: 3,
    progress: 55,
  },
  {
    id: "life",
    name: "Life",
    description: "Purpose, balance & daily quality",
    level: 3,
    progress: 28,
  },
];

export const INITIAL_OBJECTIVES: Objective[] = [
  {
    id: "obj1",
    title: "Complete a training session",
    pillar: "Body",
    xp: 40,
    completed: false,
  },
  {
    id: "obj2",
    title: "Write 3 priorities for tomorrow",
    pillar: "Mind",
    xp: 25,
    completed: false,
  },
  {
    id: "obj3",
    title: "30 minutes deep work",
    pillar: "Career",
    xp: 35,
    completed: false,
  },
  {
    id: "obj4",
    title: "Track today's spending",
    pillar: "Finance",
    xp: 20,
    completed: false,
  },
  {
    id: "obj5",
    title: "Send one meaningful message",
    pillar: "Social",
    xp: 20,
    completed: false,
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "a1",
    title: "First Spark",
    description: "Complete your first objective",
    unlocked: true,
    icon: "⚡",
  },
  {
    id: "a2",
    title: "Consistency Seed",
    description: "Maintain a 3-day streak",
    unlocked: true,
    icon: "🌱",
  },
  {
    id: "a3",
    title: "Body Awakening",
    description: "Reach Body Level 3",
    unlocked: true,
    icon: "💪",
  },
  {
    id: "a4",
    title: "Mind Architect",
    description: "Complete 10 Mind objectives",
    unlocked: false,
    icon: "🧠",
  },
  {
    id: "a5",
    title: "Streak Guardian",
    description: "Reach a 14-day streak",
    unlocked: false,
    icon: "🔥",
  },
  {
    id: "a6",
    title: "Full Spectrum",
    description: "Log activity in all 6 pillars",
    unlocked: false,
    icon: "✦",
  },
];

export const EVOLUTION_STATS = {
  level: 7,
  currentXp: 1240,
  xpToNext: 1600,
  streak: 5,
  goalsCompletedToday: 0,
  totalGoalsToday: 5,
};