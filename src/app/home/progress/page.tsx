import { Container } from "@/components/ui/container";
import { PILLARS } from "@/lib/evolve-data";

const WEEK = [
  { d: "M", v: 70 },
  { d: "T", v: 40 },
  { d: "W", v: 90 },
  { d: "T", v: 55 },
  { d: "F", v: 80 },
  { d: "S", v: 20 },
  { d: "S", v: 10 },
];

export default function ProgressPage() {
  return (
    <main className="pt-8 pb-6">
      <Container>
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-livv-muted">
          Scoreboard
        </p>
        <h1 className="mt-2 font-display text-[2.4rem] leading-none">Progress</h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/45">
          Not a dashboard of noise. Just the signal that you showed up.
        </p>

        <section className="mt-8 rounded-3xl border border-livv-border bg-livv-surface p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-livv-muted">
                This week
              </p>
              <p className="mt-1 font-display text-4xl leading-none">4 / 7</p>
            </div>
            <p className="text-sm text-livv-accent-soft">On pace</p>
          </div>
          <div className="mt-6 flex h-28 items-end justify-between gap-2">
            {WEEK.map((day, i) => (
              <div key={`${day.d}-${i}`} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-20 w-full items-end rounded-full bg-black/40">
                  <div
                    className="w-full rounded-full bg-gradient-to-t from-livv-accent to-livv-energy"
                    style={{ height: `${day.v}%` }}
                  />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-livv-muted">
                  {day.d}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-2.5">
          {[
            { label: "Workouts", value: "12" },
            { label: "Objectives", value: "28" },
            { label: "Streak", value: "7d" },
            { label: "Level", value: "3" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-livv-border bg-livv-surface px-4 py-4"
            >
              <p className="text-[10px] uppercase tracking-[0.22em] text-livv-muted">
                {stat.label}
              </p>
              <p className="mt-2 font-display text-3xl leading-none">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-livv-muted">
            Pillars
          </p>
          <div className="space-y-2.5">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.id}
                className="rounded-2xl border border-livv-border bg-livv-surface p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-xl leading-none">{pillar.name}</p>
                  <span className="text-xs text-livv-accent-soft">Lv {pillar.level}</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/50">
                  <div
                    className="h-full rounded-full bg-livv-accent"
                    style={{ width: `${pillar.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
