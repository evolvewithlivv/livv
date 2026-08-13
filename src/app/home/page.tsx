import Link from "next/link";
import { Container } from "@/components/ui/container";

const AREAS = [
  {
    href: "/home/train",
    title: "Train",
    description: "Workouts, programs, and physical performance",
    accent: "from-cyan-500/20 to-transparent",
  },
  {
    href: "/home/evolve",
    title: "Evolve",
    description: "Mindset, habits, and identity work",
    accent: "from-violet-500/20 to-transparent",
  },
  {
    href: "/home/connect",
    title: "Connect",
    description: "Community and real relationships",
    accent: "from-fuchsia-500/15 to-transparent",
  },
  {
    href: "/home/progress",
    title: "Progress",
    description: "Track growth across every dimension",
    accent: "from-emerald-500/15 to-transparent",
  },
];

export default function HomePage() {
  return (
    <main className="pt-8 pb-4">
      <Container>
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs text-livv-muted tracking-wider uppercase">
              Welcome to
            </p>
            <h1 className="text-2xl font-bold tracking-tight mt-0.5">LIVV</h1>
          </div>
          <Link
            href="/home/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-livv-border bg-livv-surface text-sm font-medium text-white/80"
          >
            P
          </Link>
        </div>

        {/* Hero statement */}
        <div className="relative overflow-hidden rounded-3xl border border-livv-border bg-livv-surface p-6 mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-livv-accent/10 to-transparent" />
          <div className="relative">
            <p className="text-lg font-medium leading-snug text-white">
              Your evolution starts here.
            </p>
            <p className="mt-2 text-sm text-livv-muted leading-relaxed">
              Train your body. Evolve your mind. Connect with purpose. Track everything that matters.
            </p>
          </div>
        </div>

        {/* Primary areas */}
        <div className="space-y-3">
          <p className="text-xs text-livv-muted tracking-wider uppercase mb-3">
            Explore
          </p>
          {AREAS.map((area) => (
            <Link
              key={area.href}
              href={area.href}
              className="group relative block overflow-hidden rounded-2xl border border-livv-border bg-livv-surface p-5 transition-all duration-200 hover:border-white/15 active:scale-[0.99]"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${area.accent} opacity-0 group-hover:opacity-100 transition-opacity`}
              />
              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-white">{area.title}</h2>
                  <p className="mt-1 text-sm text-livv-muted">
                    {area.description}
                  </p>
                </div>
                <span className="text-white/30 group-hover:text-white/60 transition-colors">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* LIVV+ teaser */}
        <div className="mt-8 rounded-2xl border border-livv-accent/30 bg-livv-accent/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-livv-accent-soft">
                LIVV+
              </p>
              <p className="mt-1 text-xs text-livv-muted">
                Premium tools, products & experiences
              </p>
            </div>
            <span className="text-xs text-livv-muted border border-livv-border rounded-full px-2.5 py-1">
              Soon
            </span>
          </div>
        </div>
      </Container>
    </main>
  );
}