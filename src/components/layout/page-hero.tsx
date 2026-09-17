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
    <header className="livv-page-hero relative flex items-start justify-between gap-4 border-b border-white/[0.08] pb-5 pt-1">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 10px ${accent}66` }} />
          <p className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: accent }}>{eyebrow}</p>
        </div>
        <h1 className="font-display mt-2.5 max-w-[15ch] text-[clamp(2rem,7.5vw,3rem)] font-semibold leading-[.96] tracking-[-.06em] text-[rgb(var(--livv-fg))]">{title}</h1>
        {subtitle ? <p className="mt-2.5 max-w-[42ch] text-[13px] leading-[1.5] text-livv-muted">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0 pt-5">{right}</div> : null}
      <span className="absolute bottom-[-1px] left-0 h-[2px] w-12" style={{ background: accent }} aria-hidden="true" />
    </header>
  );
}
