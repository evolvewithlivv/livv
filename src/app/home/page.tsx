import Link from "next/link";
import { Container } from "@/components/ui/container";

const LOGO =
  "https://raw.githubusercontent.com/evolvewithlivv/livv/main/Photoroom_20260831_123254.png";

const AREAS = [
  {
    href: "/home/train",
    kicker: "Body",
    title: "Train",
    description: "Build the session. Do the work.",
  },
  {
    href: "/home/evolve",
    kicker: "Mind",
    title: "Evolve",
    description: "Habits, identity, daily objectives.",
  },
  {
    href: "/home/connect",
    kicker: "People",
    title: "Connect",
    description: "See who else is putting in reps.",
  },
  {
    href: "/home/progress",
    kicker: "Proof",
    title: "Progress",
    description: "The scoreboard for all of it.",
  },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="relative overflow-hidden pt-6 pb-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-livv-gradient"
      />
      <Container className="relative">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <span className="font-display text-xl leading-none tracking-tight">
              LIVV
            </span>
          </div>
          <Link
            href="/home/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-livv-border bg-livv-surface text-sm font-medium text-white/80"
          >
            Y
          </Link>
        </div>

        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-livv-muted">
          {today}
        </p>
        <h1 className="mt-2 max-w-[14ch] font-display text-[2.35rem] leading-[1.05] text-white">
          {greeting()}.
          <br />
          Keep going.
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/45">
          Four rooms. One direction. Show up in at least one of them today.
        </p>

        <div className="mt-8 overflow-hidden rounded-3xl border border-livv-border bg-livv-surface p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-livv-accent-soft">
            Today
          </p>
          <p className="mt-2 font-display text-2xl leading-tight">
            Train once. Check one objective.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/45">
            That is a complete day. Everything else is extra.
          </p>
          <div className="mt-5 flex gap-2">
            <Link
              href="/home/train"
              className="inline-flex h-10 items-center rounded-full bg-livv-accent px-4 text-xs font-medium uppercase tracking-[0.18em] text-white"
            >
              Start training
            </Link>
            <Link
              href="/home/evolve"
              className="inline-flex h-10 items-center rounded-full border border-livv-border px-4 text-xs font-medium uppercase tracking-[0.18em] text-white/70"
            >
              Objectives
            </Link>
          </div>
        </div>

        <div className="mt-8 space-y-2.5">
          {AREAS.map((area) => (
            <Link
              key={area.href}
              href={area.href}
              className="group flex items-center justify-between rounded-2xl border border-livv-border bg-livv-surface/80 px-5 py-4 transition-all duration-200 hover:border-white/16 active:scale-[0.99]"
            >
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-livv-muted">
                  {area.kicker}
                </p>
                <h2 className="mt-1 font-display text-[1.65rem] leading-none text-white">
                  {area.title}
                </h2>
                <p className="mt-1.5 text-sm text-white/40">{area.description}</p>
              </div>
              <span className="text-white/25 transition-colors group-hover:text-livv-accent">
                →
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </main>
  );
}
