export type Focus =
  | "Full Body"
  | "Upper Body"
  | "Lower Body"
  | "Push"
  | "Pull"
  | "Legs"
  | "Core"
  | "Cardio";

export type Location = "Home" | "Gym" | "Anywhere";
export type Duration = "10" | "20" | "30" | "45" | "60+";

export type Exercise = {
  id: string;
  name: string;
  sets?: number;
  reps?: string;
  duration?: string;
  rest: string;
  notes?: string;
};

export type Workout = {
  id: string;
  name: string;
  focus: Focus;
  location: Location;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  exercises: Exercise[];
};

const EXERCISE_POOL: Record<Focus, Exercise[]> = {
  "Full Body": [
    { id: "fb1", name: "Bodyweight Squats", sets: 3, reps: "12-15", rest: "45s" },
    { id: "fb2", name: "Push-ups", sets: 3, reps: "8-12", rest: "45s" },
    { id: "fb3", name: "Bent-over Rows (dumbbell or band)", sets: 3, reps: "10-12", rest: "45s" },
    { id: "fb4", name: "Glute Bridges", sets: 3, reps: "12-15", rest: "40s" },
    { id: "fb5", name: "Plank", sets: 3, duration: "30-45s", rest: "30s" },
    { id: "fb6", name: "Jumping Jacks", sets: 2, duration: "40s", rest: "20s" },
  ],
  "Upper Body": [
    { id: "ub1", name: "Push-ups", sets: 4, reps: "8-12", rest: "50s" },
    { id: "ub2", name: "Pike Push-ups", sets: 3, reps: "6-10", rest: "50s" },
    { id: "ub3", name: "Dumbbell Rows", sets: 3, reps: "10-12", rest: "45s" },
    { id: "ub4", name: "Shoulder Taps", sets: 3, reps: "10/side", rest: "40s" },
    { id: "ub5", name: "Tricep Dips", sets: 3, reps: "8-12", rest: "45s" },
  ],
  "Lower Body": [
    { id: "lb1", name: "Squats", sets: 4, reps: "12-15", rest: "50s" },
    { id: "lb2", name: "Reverse Lunges", sets: 3, reps: "10/leg", rest: "45s" },
    { id: "lb3", name: "Romanian Deadlifts", sets: 3, reps: "10-12", rest: "50s" },
    { id: "lb4", name: "Calf Raises", sets: 3, reps: "15-20", rest: "30s" },
    { id: "lb5", name: "Wall Sit", sets: 2, duration: "40s", rest: "40s" },
  ],
  Push: [
    { id: "p1", name: "Push-ups", sets: 4, reps: "8-12", rest: "50s" },
    { id: "p2", name: "Overhead Press", sets: 3, reps: "8-10", rest: "50s" },
    { id: "p3", name: "Incline Push-ups", sets: 3, reps: "10-12", rest: "45s" },
    { id: "p4", name: "Lateral Raises", sets: 3, reps: "12-15", rest: "40s" },
    { id: "p5", name: "Tricep Extensions", sets: 3, reps: "12", rest: "40s" },
  ],
  Pull: [
    { id: "pl1", name: "Pull-ups / Inverted Rows", sets: 4, reps: "6-10", rest: "60s" },
    { id: "pl2", name: "Dumbbell Rows", sets: 3, reps: "10-12", rest: "45s" },
    { id: "pl3", name: "Face Pulls", sets: 3, reps: "12-15", rest: "40s" },
    { id: "pl4", name: "Bicep Curls", sets: 3, reps: "10-12", rest: "40s" },
    { id: "pl5", name: "Superman Holds", sets: 3, duration: "25s", rest: "30s" },
  ],
  Legs: [
    { id: "lg1", name: "Goblet Squats", sets: 4, reps: "10-12", rest: "50s" },
    { id: "lg2", name: "Walking Lunges", sets: 3, reps: "10/leg", rest: "45s" },
    { id: "lg3", name: "Hip Thrusts", sets: 3, reps: "12-15", rest: "45s" },
    { id: "lg4", name: "Step-ups", sets: 3, reps: "10/leg", rest: "40s" },
    { id: "lg5", name: "Calf Raises", sets: 3, reps: "15-20", rest: "30s" },
  ],
  Core: [
    { id: "c1", name: "Plank", sets: 3, duration: "40s", rest: "30s" },
    { id: "c2", name: "Dead Bugs", sets: 3, reps: "10/side", rest: "30s" },
    { id: "c3", name: "Russian Twists", sets: 3, reps: "16-20", rest: "30s" },
    { id: "c4", name: "Leg Raises", sets: 3, reps: "10-12", rest: "35s" },
    { id: "c5", name: "Side Plank", sets: 2, duration: "30s/side", rest: "30s" },
  ],
  Cardio: [
    { id: "cd1", name: "Jumping Jacks", sets: 4, duration: "40s", rest: "20s" },
    { id: "cd2", name: "High Knees", sets: 4, duration: "30s", rest: "20s" },
    { id: "cd3", name: "Burpees", sets: 3, reps: "8-10", rest: "40s" },
    { id: "cd4", name: "Mountain Climbers", sets: 3, duration: "30s", rest: "25s" },
    { id: "cd5", name: "Shadow Boxing", sets: 3, duration: "45s", rest: "30s" },
  ],
};

function getDifficulty(duration: Duration): Workout["difficulty"] {
  if (duration === "10" || duration === "20") return "Beginner";
  if (duration === "30" || duration === "45") return "Intermediate";
  return "Advanced";
}

function getExerciseCount(duration: Duration): number {
  switch (duration) {
    case "10":
      return 3;
    case "20":
      return 4;
    case "30":
      return 5;
    case "45":
      return 6;
    default:
      return 7;
  }
}

export function generateWorkout(
  focus: Focus,
  location: Location,
  duration: Duration
): Workout {
  const pool = EXERCISE_POOL[focus];
  const count = Math.min(getExerciseCount(duration), pool.length);
  const exercises = pool.slice(0, count);

  const nameMap: Record<Focus, string> = {
    "Full Body": "Full Body Ignition",
    "Upper Body": "Upper Body Drive",
    "Lower Body": "Lower Body Power",
    Push: "Push Protocol",
    Pull: "Pull Protocol",
    Legs: "Leg Engine",
    Core: "Core Stability",
    Cardio: "Cardio Surge",
  };

  return {
    id: `w-${Date.now()}`,
    name: nameMap[focus],
    focus,
    location,
    duration: duration === "60+" ? "60+ min" : `${duration} min`,
    difficulty: getDifficulty(duration),
    exercises,
  };
}

export const FOCUS_OPTIONS: Focus[] = [
  "Full Body",
  "Upper Body",
  "Lower Body",
  "Push",
  "Pull",
  "Legs",
  "Core",
  "Cardio",
];

export const LOCATION_OPTIONS: Location[] = ["Home", "Gym", "Anywhere"];

export const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: "10", label: "10 min" },
  { value: "20", label: "20 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60+", label: "60+ min" },
];