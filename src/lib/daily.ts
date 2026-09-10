/**
 * LIVV Daily — the retention engine.
 * Open → Discover → Act → Earn → Unlock → Reflect → Come back tomorrow.
 */

import { addEmbers, loadIdentity, patchIdentity } from "./identity";
import { logCustomAction, loadRecord, useStreakFreeze } from "./record";
import { dayKey } from "./dates";
import { adaptiveDailyTasks } from "./daily-adaptive";

export type DailyTask = {
  id: "mind" | "body" | "life";
  label: string;
  title: string;
  description: string;
  pillar: string;
  xpSize: "small" | "standard" | "major";
};

export type DailyJournalEntry = {
  key: string;
  question: string;
  answer: string;
  savedAt: number;
};

export type DropKind =
  | "embers"
  | "xp_boost"
  | "streak_freeze"
  | "pack_ticket"
  | "frame"
  | "artifact"
  | "accent"
  | "double_xp_day";

export type DailyDrop = {
  id: string;
  kind: DropKind;
  name: string;
  description: string;
  icon: string;
  /** Embers granted on claim (0 if none) */
  embers: number;
  /** XP granted on claim */
  xp: number;
  /** Extra payload (frame id, accent hex, etc.) */
  meta?: string;
};

export type DailyBuffs = {
  /** dayKey until which 2x XP is active */
  doubleXpUntil: string | null;
  /** Owned profile frame ids */
  frames: string[];
  activeFrame: string | null;
  /** Artifact collectible ids */
  artifacts: string[];
  /** Bonus pack tickets (claim on Packs) */
  packTickets: number;
};

export const DAILY_KEY = "livv-daily-v1";
export const BUFFS_KEY = "livv-daily-buffs-v1";
export const SEASON_START = "2026-09-01";
