export type ActivityType =
  | "workout_completed"
  | "objective_completed"
  | "achievement_unlocked"
  | "level_increased"
  | "evolution_milestone";

export type ActivityUser = {
  displayName: string;
  username: string;
  avatarInitial: string;
  avatarColor: string;
};

export type Activity = {
  id: string;
  type: ActivityType;
  user: ActivityUser;
  timestamp: number;
  title: string;
  description: string;
  xpEarned?: number;
  stats?: string[];
  achievement?: {
    title: string;
    icon: string;
  };
  workout?: {
    name: string;
    focus: string;
    location: string;
    duration: string;
    difficulty: string;
    exerciseCount: number;
  };
};

const STORAGE_KEY = "livv_activities";

const DEFAULT_USER: ActivityUser = {
  displayName: "Kanye",
  username: "evolvewithlivv",
  avatarInitial: "K",
  avatarColor: "#7c5cff",
};

export function getDefaultUser(): ActivityUser {
  return { ...DEFAULT_USER };
}

export function createActivityId(): string {
  return `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function loadActivities(): Activity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getSeedActivities();
    const parsed = JSON.parse(raw) as Activity[];
    return Array.isArray(parsed) ? parsed : getSeedActivities();
  } catch {
    return getSeedActivities();
  }
}

export function saveActivities(activities: Activity[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities.slice(0, 50)));
  } catch {
    // ignore quota errors in mock mode
  }
}

export function addActivity(
  partial: Omit<Activity, "id" | "timestamp" | "user"> & {
    user?: ActivityUser;
  }
): Activity {
  const activity: Activity = {
    id: createActivityId(),
    timestamp: Date.now(),
    user: partial.user ?? getDefaultUser(),
    type: partial.type,
    title: partial.title,
    description: partial.description,
    xpEarned: partial.xpEarned,
    stats: partial.stats,
    achievement: partial.achievement,
    workout: partial.workout,
  };

  const existing = loadActivities();
  const next = [activity, ...existing];
  saveActivities(next);
  return activity;
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function getSeedActivities(): Activity[] {
  const user = getDefaultUser();
  const now = Date.now();

  return [
    {
      id: "seed_1",
      type: "workout_completed",
      user,
      timestamp: now - 1000 * 60 * 45,
      title: `${user.displayName} completed a Full Body workout`,
      description: "Full Body Ignition session finished.",
      xpEarned: 120,
      stats: ["42 min", "Gym", "Intermediate"],
      workout: {
        name: "Full Body Ignition",
        focus: "Full Body",
        location: "Gym",
        duration: "30 min",
        difficulty: "Intermediate",
        exerciseCount: 5,
      },
    },
    {
      id: "seed_2",
      type: "objective_completed",
      user,
      timestamp: now - 1000 * 60 * 120,
      title: `${user.displayName} completed an objective`,
      description: "Write 3 priorities for tomorrow",
      xpEarned: 25,
      stats: ["Mind"],
    },
    {
      id: "seed_3",
      type: "achievement_unlocked",
      user,
      timestamp: now - 1000 * 60 * 60 * 5,
      title: `${user.displayName} unlocked Consistency Seed`,
      description: "Maintain a 3-day streak",
      xpEarned: 50,
      achievement: {
        title: "Consistency Seed",
        icon: "🌱",
      },
    },
    {
      id: "seed_4",
      type: "level_increased",
      user,
      timestamp: now - 1000 * 60 * 60 * 26,
      title: `${user.displayName} reached Level 7`,
      description: "Evolution continues.",
      xpEarned: 0,
      stats: ["Evolution Level"],
    },
  ];
}

/** Helpers to create typed activities from product events */

export function activityFromWorkout(input: {
  workoutName: string;
  focus: string;
  location: string;
  duration: string;
  difficulty: string;
  exerciseCount: number;
  xp?: number;
  user?: ActivityUser;
}): Activity {
  const user = input.user ?? getDefaultUser();
  const xp = input.xp ?? Math.max(40, input.exerciseCount * 20);

  return addActivity({
    type: "workout_completed",
    user,
    title: `${user.displayName} completed a ${input.focus} workout`,
    description: `${input.workoutName} session finished.`,
    xpEarned: xp,
    stats: [input.duration, input.location, input.difficulty],
    workout: {
      name: input.workoutName,
      focus: input.focus,
      location: input.location,
      duration: input.duration,
      difficulty: input.difficulty,
      exerciseCount: input.exerciseCount,
    },
  });
}

export function activityFromObjective(input: {
  objectiveTitle: string;
  pillar: string;
  xp: number;
  user?: ActivityUser;
}): Activity {
  const user = input.user ?? getDefaultUser();
  return addActivity({
    type: "objective_completed",
    user,
    title: `${user.displayName} completed an objective`,
    description: input.objectiveTitle,
    xpEarned: input.xp,
    stats: [input.pillar],
  });
}

export function activityFromAchievement(input: {
  title: string;
  description: string;
  icon: string;
  xp?: number;
  user?: ActivityUser;
}): Activity {
  const user = input.user ?? getDefaultUser();
  return addActivity({
    type: "achievement_unlocked",
    user,
    title: `${user.displayName} unlocked ${input.title}`,
    description: input.description,
    xpEarned: input.xp ?? 50,
    achievement: {
      title: input.title,
      icon: input.icon,
    },
  });
}

export function activityFromLevelUp(input: {
  level: number;
  user?: ActivityUser;
}): Activity {
  const user = input.user ?? getDefaultUser();
  return addActivity({
    type: "level_increased",
    user,
    title: `${user.displayName} reached Level ${input.level}`,
    description: "Evolution continues.",
    stats: ["Evolution Level"],
  });
}