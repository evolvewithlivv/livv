"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Brain,
  BookOpen,
  Check,
  ChevronRight,
  Droplets,
  Footprints,
  HeartPulse,
  Minus,
  Moon,
  Plus,
  Utensils,
} from "lucide-react";
import {
  blankDay,
  dayCompletion,
  lastNDays,
  loadHealthDays,
  todayKey,
  upsertHealthDay,
  WATER_TARGET,
  MEALS_TARGET,
  type HealthDay,
} from "@/lib/health";
import { feedback } from "@/lib/sensory";

const TOOLS = [
  {
    href: "/home/health/sleep",
    label: "Sleep",
    detail: "Hours, quality, and patterns.",
    Icon: Moon,
  },
  {
    href: "/home/health/meditation",
    label: "Meditation",
    detail: "Short resets you can actually use.",
    Icon: Brain,
  },
  {
    href: "/home/health/recipes",
    label: "Recipes",
    detail: "Food you can cook tonight.",
    Icon: Utensils,
  },
  {
    href: "/home/health/trails",
    label: "Walk / Run / Bike",
    detail: "Distance, time, and movement.",
    Icon: Footprints,
  },
  {
    href: "/home/health/dictionary",
    label: "LIVV Dictionary",
    detail: "Language that changes how you act.",
    Icon: BookOpen,
  },
] as const;

export default function HealthPage() {
  const [days, setDays] = useState<HealthDay[]>([]);
  const today = todayKey();

  useEffect(() => {
    const refresh = () => setDays(loadHealthDays());
    refresh();
    window.addEventListener("livv-health", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("livv-health", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const current = useMemo(
    () => days.find((day) => day.date === today) ?? blankDay(today),
    [days, today],
  );

  const completion = useMemo(() => dayCompletion(current), [current]);
  const week = useMemo(() => lastNDays(days, 7), [days]);
  const trackedDays = days.filter(
    (day) => day.sleep > 0 || day.water > 0 || day.meals > 0 || day.movement,
  ).length;

  function update(patch: Partial<HealthDay>) {
    setDays((prev) =>
      upsertHealthDay({ ...current, ...patch, date: today }, prev),
    );
    const hitWater =
      (patch.water ?? current.water) >= WATER_TARGET && current.water < WATER_TARGET;
    const hitMeals =
      (patch.meals ?? current.meals) >= MEALS_TARGET && current.meals < MEALS_TARGET;
    const hitMove = patch.movement === true && !current.movement;
    if (hitWater || hitMeals || hitMove) feedback("complete");
    else feedback("tick");
  }

  return (
    <main className="livv-page min-h-full pb-20">
      <div className="livv-stagger mx-auto w-full max-w-xl px-5 pb-12 sm:px-6">
        <header className="livv-page-hero pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-livv-muted">Health</p>
          <h1 className="mt-2 max-w-[18ch] text-[30px] font-semibold leading-[1.1] tracking-[-0.045em] sm:text-[34px]">
            The baseline that holds everything else.
          </h1>
          <p className="mt-3 max-w-[36ch] text-[14px] leading-relaxed text-livv-muted">
            Sleep, fuel, movement, and calm. Small systems that compound.
          </p>
        </header>

        <section className="mt-10">
          <div className="flex items-center gap-5">
            <div
              className="grid h-[82px] w-[82px] shrink-0 place-items-center rounded-full transition-[background] duration-500"
              style={{
                background: `conic-gradient(var(--livv-pro-accent) ${completion.percent}%, var(--livv-pro-line) 0)`,
              }}
              aria-label={`${completion.percent}% of today's health basics tracked`}
            >
              <div className="grid h-[68px] w-[68px] place-items-center rounded-full bg-[var(--livv-pro-bg)]">
                <span className="text-[18px] font-semibold tracking-[-.04em]">
                  {completion.percent}%
                </span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-livv-muted">
                Baseline today
              </p>
              <p className="mt-1.5 text-[25px] font-semibold tracking-[-.04em]">
                {completion.done}/{completion.total} logged
              </p>
              <p className="mt-1 text-[12px] text-livv-muted">
                {trackedDays} day{trackedDays === 1 ? "" : "s"} with entries.
              </p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-4 gap-2">
            <Metric icon={<Moon size={14} />} label="Sleep" value={current.sleep ? `${current.sleep}h` : "—"} />
            <Metric icon={<Droplets size={14} />} label="Water" value={`${current.water}`} />
            <Metric icon={<Utensils size={14} />} label="Meals" value={`${current.meals}`} />
            <Metric icon={<Footprints size={14} />} label="Move" value={current.movement ? "✓" : "—"} />
          </div>
        </section>

        <section className="mt-12">
          <SectionHead
            label="Check in"
            title="The four basics."
            sub="No schedule. Log each one when you actually do it."
          />
          <div className="mt-5 divide-y divide-livv-border border-t border-livv-border">
            <LogRow
              icon={<Moon size={16} />}
              label="Sleep"
              detail={current.sleep ? `${current.sleep} hours logged` : "Not logged yet"}
              value={current.sleep ? `${current.sleep}h` : "—"}
              controls={
                <Adjust
                  minus={() =>
                    update({
                      sleep: Math.max(0, Math.round((current.sleep - 0.5) * 10) / 10),
                    })
                  }
                  plus={() =>
                    update({
                      sleep: Math.min(16, Math.round((current.sleep + 0.5) * 10) / 10),
                    })
                  }
                />
              }
            />
            <LogRow
              icon={<Droplets size={16} />}
              label="Water"
              detail={`${current.water} / ${WATER_TARGET} cups`}
              value={current.water >= WATER_TARGET ? "Goal" : `${current.water}/${WATER_TARGET}`}
              controls={
                <Adjust
                  minus={() => update({ water: Math.max(0, current.water - 1) })}
                  plus={() => update({ water: Math.min(20, current.water + 1) })}
                />
              }
            />
            <LogRow
              icon={<Utensils size={16} />}
              label="Meals"
              detail={`${current.meals} / ${MEALS_TARGET} logged`}
              value={current.meals >= MEALS_TARGET ? "Goal" : `${current.meals}/${MEALS_TARGET}`}
              controls={
                <Adjust
                  minus={() => update({ meals: Math.max(0, current.meals - 1) })}
                  plus={() => update({ meals: Math.min(6, current.meals + 1) })}
                />
              }
            />
            <div className="flex items-center gap-4 py-4">
              <IconBubble icon={<Footprints size={16} />} />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold">Movement</p>
                <p className="mt-1 text-[11px] leading-relaxed text-livv-muted">
                  Any intentional movement counts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => update({ movement: !current.movement })}
                className="livv-press shrink-0 rounded-full border border-livv-border px-3 py-2 text-[10px] font-semibold uppercase tracking-[.12em]"
              >
                {current.movement ? "Done" : "Mark"}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <SectionHead
              label="Explore"
              title="Your health system."
              sub="Go deeper when you want more than a quick check-in."
            />
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[.15em] text-livv-muted">
              {TOOLS.length} tools
            </span>
          </div>
          <div className="mt-5 divide-y divide-livv-border border-t border-livv-border">
            {TOOLS.map(({ href, label, detail, Icon }) => (
              <Link key={href} href={href} className="livv-press group flex items-center gap-4 py-4">
                <IconBubble icon={<Icon size={17} />} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold">{label}</span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-livv-muted">
                    {detail}
                  </span>
                </span>
                <ChevronRight
                  size={17}
                  className="shrink-0 text-livv-muted transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <SectionHead label="Week" title="Recent days." />
          </div>
          <div className="mt-5 space-y-2">
            {week.map((day) => {
              const c = dayCompletion(day);
              return (
                <div
                  key={day.date}
                  className="flex items-center gap-3 rounded-xl border border-livv-border px-3 py-3"
                >
                  <span className="w-20 shrink-0 text-[11px] font-semibold tabular-nums text-livv-muted">
                    {day.date.slice(5)}
                  </span>
                  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--livv-pro-surface-2)]">
                    <div
                      className="h-full rounded-full bg-[var(--livv-pro-accent)] transition-[width] duration-500 ease-out"
                      style={{ width: `${c.percent}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-livv-muted">
                    {c.done}/{c.total}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionHead({
  label,
  title,
  sub,
}: {
  label: string;
  title: string;
  sub?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-livv-muted">{label}</p>
      <h2 className="mt-1.5 text-[26px] font-semibold tracking-tight">{title}</h2>
      {sub ? <p className="mt-1.5 text-[12px] text-livv-muted">{sub}</p> : null}
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-livv-border px-2 py-3 text-center">
      <div className="mx-auto mb-1.5 flex justify-center text-livv-muted">{icon}</div>
      <p className="text-[12px] font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[9px] uppercase tracking-[.12em] text-livv-muted">{label}</p>
    </div>
  );
}

function IconBubble({ icon }: { icon: ReactNode }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-livv-border text-livv-muted">
      {icon}
    </span>
  );
}

function LogRow({
  icon,
  label,
  detail,
  value,
  controls,
}: {
  icon: ReactNode;
  label: string;
  detail: string;
  value: string;
  controls: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-4">
      <IconBubble icon={icon} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-semibold">{label}</p>
          {value === "Goal" && <Check size={14} className="text-livv-accent" />}
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-livv-muted">{detail}</p>
      </div>
      <span className="hidden text-[11px] font-semibold text-livv-muted sm:block">{value}</span>
      {controls}
    </div>
  );
}

function Adjust({ minus, plus }: { minus: () => void; plus: () => void }) {
  return (
    <div className="flex shrink-0 gap-1.5">
      <button
        type="button"
        onClick={minus}
        className="livv-press grid h-10 w-10 place-items-center rounded-full border border-livv-border text-livv-muted"
        aria-label="Decrease"
      >
        <Minus size={14} />
      </button>
      <button
        type="button"
        onClick={plus}
        className="livv-press grid h-10 w-10 place-items-center rounded-full border border-livv-border text-livv-muted"
        aria-label="Increase"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
