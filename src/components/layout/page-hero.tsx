import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  accent?: string;
  right?: ReactNode;
};

export function PageHero({ eyebrow, title, subtitle, accent = "#0F7FFF", right }: PageHeroProps) {
  return (
    <header className="livv-page-hero relative flex items-end justify-between gap-4 pb-5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 10px ${accent}66` }} />
          <p className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: accent }}>{eyebrow}</p>
        </div>
        <h1 className="font-display mt-3 max-w-[13ch] text-[clamp(2.1rem,8vw,3.15rem)] font-semibold leading-[.94] tracking-[-.065em] text-[rgb(var(--livv-fg))]">{title}</h1>
        {subtitle ? <p className="mt-3 max-w-[39ch] text-[14px] leading-[1.48] text-livv-muted">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0 self-end pb-1">{right}</div> : null}
      <div className="absolute inset-x-0 bottom-0 flex h-px items-center overflow-hidden">
        <span className="h-px w-20 shrink-0" style={{ background: accent }} />
        <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${accent}30, transparent)` }} />
      </div>
    </header>
  );
}
