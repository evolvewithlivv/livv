import type { Activity, ActivityUser } from "./activity";

export type ConnectUser = ActivityUser & {
  id: string;
  level: number;
  xp: number;
  streak: number;
  bio?: string;
  isFollowing?: boolean;
};

export type FeedItem = Activity & {
  likes: number;
  comments: number;
  likedByMe?: boolean;
};

export type Conversation = {
  id: string;
  user: ConnectUser;
  lastMessage: string;
  timestamp: number;
  unread: number;
};

export type Challenge = {
  id: string;
  name: string;
  description: string;
  pillar: string;
  duration: string;
  participants: number;
  progress: number; // 0-100 personal progress if joined
  joined: boolean;
};

export const MOCK_USERS: ConnectUser[] = [
  {
    id: "u1",
    displayName: "Maya Chen",
    username: "mayarise",
    avatarInitial: "M",
    avatarColor: "#22d3ee",
    level: 12,
    xp: 2840,
    streak: 14,
    bio: "Discipline over motivation.",
    isFollowing: true,
  },
  {
    id: "u2",
    displayName: "Jordan Blake",
    username: "jblake",
    avatarInitial: "J",
    avatarColor: "#a78bfa",
    level: 9,
    xp: 1920,
    streak: 7,
    bio: "Training mind and body.",
    isFollowing: true,
  },
  {
    id: "u3",
    displayName: "Sofia Reyes",
    username: "sofiarise",
    avatarInitial: "S",
    avatarColor: "#f472b6",
    level: 15,
    xp: 4100,
    streak: 21,
    bio: "Evolution is the only flex.",
    isFollowing: false,
  },
  {
    id: "u4",
    displayName: "Marcus Webb",
    username: "mwebb",
    avatarInitial: "M",
    avatarColor: "#34d399",
    level: 6,
    xp: 980,
    streak: 3,
    bio: "One day at a time.",
    isFollowing: false,
  },
  {
    id: "u5",
    displayName: "Aisha Okonkwo",
    username: "aishaok",
    avatarInitial: "A",
    avatarColor: "#fbbf24",
    level: 11,
    xp: 2650,
    streak: 9,
    bio: "Build in silence.",
    isFollowing: false,
  },
  {
    id: "u6",
    displayName: "Leo Park",
    username: "leopark",
    avatarInitial: "L",
    avatarColor: "#7c5cff",
    level: 8,
    xp: 1540,
    streak: 5,
    bio: "Consistency compounds.",
    isFollowing: true,
  },
];

function hoursAgo(h: number) {
  return Date.now() - h * 60 * 60 * 1000;
}

export const MOCK_FEED: FeedItem[] = [
  {
    id: "f1",
    type: "workout_completed",
    user: MOCK_USERS[0],
    timestamp: hoursAgo(0.5),
    title: "Maya Chen completed an Upper Body workout",
    description: "Upper Body Drive session finished.",
    xpEarned: 95,
    stats: ["30 min", "Gym", "Intermediate"],
    workout: {
      name: "Upper Body Drive",
      focus: "Upper Body",
      location: "Gym",
      duration: "30 min",
      difficulty: "Intermediate",
      exerciseCount: 5,
    },
    likes: 12,
    comments: 3,
  },
  {
    id: "f2",
    type: "achievement_unlocked",
    user: MOCK_USERS[2],
    timestamp: hoursAgo(2),
    title: "Sofia Reyes unlocked Streak Guardian",
    description: "Reach a 14-day streak",
    xpEarned: 100,
    achievement: { title: "Streak Guardian", icon: "🔥" },
    likes: 28,
    comments: 7,
  },
  {
    id: "f3",
    type: "objective_completed",
    user: MOCK_USERS[1],
    timestamp: hoursAgo(3),
    title: "Jordan Blake completed an objective",
    description: "30 minutes deep work",
    xpEarned: 35,
    stats: ["Career"],
    likes: 8,
    comments: 1,
  },
  {
    id: "f4",
    type: "level_increased",
    user: MOCK_USERS[5],
    timestamp: hoursAgo(5),
    title: "Leo Park reached Level 8",
    description: "Evolution continues.",
    stats: ["Evolution Level"],
    likes: 15,
    comments: 4,
  },
  {
    id: "f5",
    type: "workout_completed",
    user: MOCK_USERS[3],
    timestamp: hoursAgo(8),
    title: "Marcus Webb completed a Core workout",
    description: "Core Stability session finished.",
    xpEarned: 60,
    stats: ["20 min", "Home", "Beginner"],
    workout: {
      name: "Core Stability",
      focus: "Core",
      location: "Home",
      duration: "20 min",
      difficulty: "Beginner",
      exerciseCount: 4,
    },
    likes: 6,
    comments: 0,
  },
  {
    id: "f6",
    type: "evolution_milestone",
    user: MOCK_USERS[4],
    timestamp: hoursAgo(12),
    title: "Aisha Okonkwo hit a Mind pillar milestone",
    description: "Mind Level 5 reached through consistent objectives.",
    xpEarned: 80,
    stats: ["Mind", "Pillar"],
    likes: 19,
    comments: 5,
  },
  {
    id: "f7",
    type: "objective_completed",
    user: MOCK_USERS[0],
    timestamp: hoursAgo(18),
    title: "Maya Chen completed an objective",
    description: "Send one meaningful message",
    xpEarned: 20,
    stats: ["Social"],
    likes: 4,
    comments: 2,
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    user: MOCK_USERS[0],
    lastMessage: "Just finished the upper body session. You in tomorrow?",
    timestamp: hoursAgo(1),
    unread: 2,
  },
  {
    id: "c2",
    user: MOCK_USERS[2],
    lastMessage: "Congrats on the streak 🔥",
    timestamp: hoursAgo(4),
    unread: 0,
  },
  {
    id: "c3",
    user: MOCK_USERS[1],
    lastMessage: "That 30-day challenge looks solid.",
    timestamp: hoursAgo(20),
    unread: 1,
  },
  {
    id: "c4",
    user: MOCK_USERS[5],
    lastMessage: "Level 8. Let's go.",
    timestamp: hoursAgo(28),
    unread: 0,
  },
];

export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: "ch1",
    name: "30 Day Evolution",
    description: "Complete at least one TRAIN or EVOLVE action every day for 30 days.",
    pillar: "Life",
    duration: "30 days",
    participants: 1284,
    progress: 0,
    joined: false,
  },
  {
    id: "ch2",
    name: "100 Push-Up Challenge",
    description: "Accumulate 100 quality push-ups across your training sessions this week.",
    pillar: "Body",
    duration: "7 days",
    participants: 892,
    progress: 34,
    joined: true,
  },
  {
    id: "ch3",
    name: "7 Day Discipline",
    description: "Hit all daily objectives for 7 consecutive days. No skips.",
    pillar: "Mind",
    duration: "7 days",
    participants: 2103,
    progress: 0,
    joined: false,
  },
  {
    id: "ch4",
    name: "10K Steps Challenge",
    description: "Average 10,000 steps per day for 14 days.",
    pillar: "Body",
    duration: "14 days",
    participants: 756,
    progress: 0,
    joined: false,
  },
];