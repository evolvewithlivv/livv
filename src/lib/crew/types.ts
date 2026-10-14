export type CrewRole = "owner" | "admin" | "member";
export type CrewStatus = "active" | "archived";
export type CrewChallengeType = "daily_action_days" | "workout_sessions" | "learning_sessions" | "custom_checkin";
export type CrewChallengeStatus = "draft" | "active" | "completed" | "cancelled";
export type CrewUpdateKind = "growth" | "goal" | "support";

export interface CrewSummary {
  id: string;
  name: string;
  description: string;
  created_by: string;
  status: CrewStatus;
  created_at: string;
  updated_at: string;
  role: CrewRole;
  joined_at: string;
  member_count?: number;
}

export interface CrewMember {
  crew_id: string;
  user_id: string;
  role: CrewRole;
  status: "active" | "left" | "removed";
  display_name: string;
  joined_at: string;
}

export interface CrewUpdate {
  id: string;
  crew_id: string;
  author_user_id: string;
  author_display_name: string;
  kind: CrewUpdateKind;
  body: string;
  created_at: string;
  encouragement_count: number;
  encouraged_by_me: boolean;
}

export interface CrewChallenge {
  id: string;
  crew_id: string | null;
  title: string;
  description: string;
  challenge_type: CrewChallengeType;
  rules_version: number;
  target_count: number;
  starts_at: string;
  ends_at: string;
  visibility: "crew" | "private";
  status: CrewChallengeStatus;
}

export interface CrewProgress {
  challenge_id: string;
  user_id: string;
  accepted_count: number;
  target_count: number;
  completed: boolean;
}

/** Server must derive these values from database rows; never accept score totals from clients. */
export function calculateCrewProgress(acceptedCount: number, targetCount: number): CrewProgress["completed"] {
  return Number.isFinite(acceptedCount) && Number.isFinite(targetCount) &&
    targetCount > 0 && acceptedCount >= targetCount;
}
