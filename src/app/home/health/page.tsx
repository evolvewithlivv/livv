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

import { PageHero } from "@/components/layout/page-hero";

const TOOLS = [
  {
    href: "/home/health/sleep",
    label: "Sleep",
    detail: "Track rest, quality, and patterns.",
    Icon: Moon,
  },
  {
    href: "/home/health/meditation",
    label: "Meditation",
    detail: "Short guided resets for your mind.",
    Icon: Brain,
  },
  {
    href: "/home/health/recipes",
    label: "Recipes",
    detail: "Simple food you can actually make.",
    Icon: Utensils,
  },
  {
    href: "/home/health/trails",
    label: "Walk / Run / Bike",
    detail: "Log distance, time, and movement.",
    Icon: Footprints,
  },
  {
    href: "/home/health/dictionary",
    label: "LIVV Dictionary",
    detail: "Words and principles worth knowing.",
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
  const history = useMemo(() => lastNDays(days, 7), [days]);
  const completion = dayCompletion(current);
  const trackedDays = days.filter(
    (day) => day.sleep > 0 || day.water > 0 || day.meals > 0 || day.movement,
  ).length;

  function update(patch: Partial<HealthDay>) {
    setDays((prev) =>
      upsertHealthDay({ ...current, ...patch, date: today }, prev),
    );
  }

  return (
    <main className="livv-page min-h-full pb-20">
      <div className="mx-auto w-full max-w-xl px-5 pb-12 sm:px-6">
        <PageHero
          eyebrow="Health"
          title="Build the baseline."
          subtitle="Health is the foundation underneath everything else. Track what keeps you rested, fueled, moving, and capable."
          right={
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[.16em] text-livv-muted">
              <HeartPulse size={13} />
              Baseline
            </span>
          }
        />

        <section className="mt-8 border-y border-livv-border py-6">
          <div className="flex items-center gap-5">
            <div
              className="grid h-[82px] w-[82px] shrink-0 place-items-center rounded-full"
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
                Today
              </p>
              <p className="mt-1 text-[25px] font-semibold tracking-[-.045em]">
                {completion.count} of 4 basics
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-livv-muted">
                {completion.count === 4
                  ? "Baseline checked. Keep the standard."
                  : "Small signals add up. Log what is true."}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-4 border-t border-livv-border pt-4">
            <Metric icon={<Moon size={14} />} label="Sleep" value={current.sleep ? `${current.sleep}h` : "—"} />
            <Metric icon={<Droplets size={14} />} label="Water" value={String(current.water)} />
            <Metric icon={<Utensils size={14} />} label="Meals" value={String(current.meals)} />
            <Metric icon={<Footprints size={14} />} label="Move" value={current.movement ? "✓" : "—"} />
          </div>
        </section>

        <section className="mt-9">
          <SectionHead
            label="Check in"
            title="The four basics."
            sub="No schedule. Log each one whenever you actually do it."
          />
          <div className="mt-4 divide-y divide-livv-border border-y border-livv-border">
            <LogRow
              icon={<Moon size={16} />}
              label="Sleep"
              detail={current.sleep ? `${current.sleep} hours logged` : "Not logged yet"}
              value={current.sleep ? `${current.sleep}h` : "—"}
              controls={
                <Adjust
                  minus={() =>
                    update({
                      sleep: Math.max(
                        0,
                        Math.round((current.sleep - 0.5) * 10) / 10,
                      ),
                    })
                  }
                  plus={() =>
                    update({
                      sleep: Math.min(
                        16,
                        Math.round((current.sleep + 0.5) * 10) / 10,
                      ),
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
                className={
                  "rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[.14em] transition " +
                  (current.movement
                    ? "border-livv-accent bg-livv-accent-soft text-livv-accent"
                    : "border-livv-border text-livv-muted")
                }
                aria-pressed={current.movement}
              >
                {current.movement ? "Logged" : "Log"}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-9">
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
          <div className="mt-4 divide-y divide-livv-border border-y border-livv-border">
            {TOOLS.map(({ href, label, detail, Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-4 py-4"
              >
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

        <section className="mt-9 border-y border-livv-border py-6">
          <div className="flex items-end justify-between gap-4">
            <SectionHead
              label="Signal"
              title="Seven days."
              sub="A quick read on whether the basics are becoming consistent."
            />
            <span className="shrink-0 text-[10px] text-livv-muted">
              {trackedDays} tracked
            </span>
          </div>

          <div className="mt-6 grid grid-cols-7 items-end gap-2">
            {history.map((day) => {
              const percent = dayCompletion(day).percent;
              return (
                <div key={day.date} className="flex min-w-0 flex-col items-center gap-2">
                  <div className="flex h-24 w-full items-end">
                    <div
                      className="w-full rounded-t-[4px] bg-livv-accent transition-all"
                      style={{ height: `${Math.max(percent ? 10 : 3, percent)}%` }}
                      title={`${percent}% tracked on ${day.date}`}
                    />
                  </div>
                  <span className="text-[9px] font-semibold uppercase tracking-[.08em] text-livv-muted">
                    {new Date(day.date + "T12:00:00").toLocaleDateString("en-US", {
                      weekday: "narrow",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-9 border-b border-livv-border pb-7">
          <div className="flex items-start gap-3">
            <HeartPulse size={15} className="mt-0.5 shrink-0 text-livv-muted" />
            <p className="text-[10px] leading-5 text-livv-muted">
              LIVV Health is a personal wellness and organization tool. It is
              not medical advice, diagnosis, or a substitute for professional
              care.
            </p>
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
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[.19em] text-livv-muted">
        {label}
      </p>
      <h2 className="mt-1 text-[24px] font-semibold tracking-[-.045em]">
        {title}
      </h2>
      {sub && (
        <p className="mt-2 max-w-[38ch] text-[11px] leading-relaxed text-livv-muted">
          {sub}
        </p>
      )}
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
    <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
      <span className="text-livv-muted">{icon}</span>
      <span className="text-[9px] font-semibold uppercase tracking-[.12em] text-livv-muted">
        {label}
      </span>
      <span className="text-[13px] font-semibold">{value}</span>
    </div>
  );
}

function IconBubble({ icon }: { icon: ReactNode }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-livv-border bg-[var(--livv-pro-surface-2)] text-livv-muted">
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
        className="grid h-10 w-10 place-items-center rounded-full border border-livv-border text-livv-muted"
        aria-label="Decrease"
      >
        <Minus size={14} />
      </button>
      <button
        type="button"
        onClick={plus}
        className="grid h-10 w-10 place-items-center rounded-full border border-livv-border text-livv-muted"
        aria-label="Increase"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
