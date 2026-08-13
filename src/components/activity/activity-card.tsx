import { cn } from "@/lib/utils";
import {
  formatRelativeTime,
  type Activity,
  type ActivityType,
} from "@/lib/activity";

const TYPE_META: Record<
  ActivityType,
  { label: string; accent: string }
> = {
  workout_completed: {
    label: "Train",
    accent: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
  },
  objective_completed: {
    label: "Evolve",
    accent: "text-livv-accent-soft border-livv-accent/30 bg-livv-accent/10",
  },
  achievement_unlocked: {
    label: "Achievement",
    accent: "text-amber-300 border-amber-400/30 bg-amber-400/10",
  },
  level_increased: {
    label: "Level Up",
    accent: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
  },
  evolution_milestone: {
    label: "Milestone",
    accent: "text-fuchsia-300 border-fuchsia-400/30 bg-fuchsia-400/10",
  },
};

export function ActivityCard({ activity }: { activity: Activity }) {
  const meta = TYPE_META[activity.type];

  return (
    <article className="rounded-2xl border border-livv-border bg-livv-surface p-4 transition-colors hover:border-white/10">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: activity.user.avatarColor }}
        >
          {activity.user.avatarInitial}
        </div>

        <div className="min-w-0 flex-1">
          {/* Top row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">
              {activity.user.displayName}
            </span>
            <span className="text-xs text-livv-muted">
              @{activity.user.username}
            </span>
            <span className="text-xs text-white/25">·</span>
            <span className="text-xs text-livv-muted">
              {formatRelativeTime(activity.timestamp)}
            </span>
          </div>

          {/* Type badge */}
          <div className="mt-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                meta.accent
              )}
            >
              {meta.label}
            </span>
          </div>

          {/* Title + description */}
          <p className="mt-2.5 text-sm font-medium text-white leading-snug">
            {activity.title}
          </p>
          {activity.description && (
            <p className="mt-1 text-sm text-livv-muted leading-relaxed">
              {activity.description}
            </p>
          )}

          {/* Achievement visual */}
          {activity.achievement && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-livv-border bg-livv-black/50 px-3 py-2.5">
              <span className="text-lg">{activity.achievement.icon}</span>
              <span className="text-sm font-medium">
                {activity.achievement.title}
              </span>
            </div>
          )}

          {/* Stats + XP */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {activity.stats?.map((stat) => (
              <span
                key={stat}
                className="rounded-full bg-livv-black/70 px-2.5 py-1 text-[11px] text-livv-muted"
              >
                {stat}
              </span>
            ))}
            {typeof activity.xpEarned === "number" && activity.xpEarned > 0 && (
              <span className="rounded-full bg-livv-accent/15 px-2.5 py-1 text-[11px] font-medium text-livv-accent-soft">
                +{activity.xpEarned} XP
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}