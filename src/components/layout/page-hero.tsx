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
    <header className="livv-page-hero relative flex items-end justify-between gap-4 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-px opacity-50" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 12px ${accent}80` }} />
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em]" style={{ color: accent }}>{eyebrow}</p>
        </div>
        <h1 className="font-display mt-2 text-[32px] font-semibold leading-[0.95] tracking-[-0.05em] text-[rgb(var(--livv-fg))]">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-[36ch] text-[14px] leading-[1.5] text-livv-muted">{subtitle}</p> : null}
      </div>
      {right ? <div className="mb-0.5 shrink-0">{right}</div> : <div className="mb-0.5 shrink-0 opacity-70" aria-hidden="true"><span className="flex items-end gap-1"><i className="h-2 w-1 rounded-full" style={{ background: accent }} /><i className="h-3.5 w-1 rounded-full" style={{ background: accent }} /><i className="h-5 w-1 rounded-full" style={{ background: accent }} /></span></div>}
    </header>
  );
}
