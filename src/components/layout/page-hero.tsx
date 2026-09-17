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
    <header className="livv-page-hero relative flex items-end justify-between gap-5 pb-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 12px ${accent}70` }} />
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em]" style={{ color: accent }}>{eyebrow}</p>
        </div>
        <h1 className="font-display mt-3 text-[clamp(2.15rem,9vw,3.2rem)] font-semibold leading-[0.92] tracking-[-0.065em] text-[rgb(var(--livv-fg))]">{title}</h1>
        {subtitle ? <p className="mt-3 max-w-[34ch] text-[14px] leading-[1.45] text-livv-muted">{subtitle}</p> : null}
      </div>
      {right ? <div className="mb-1 shrink-0">{right}</div> : null}
      <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: `linear-gradient(90deg, ${accent}80, ${accent}18 42%, transparent 85%)` }} />
    </header>
  );
}
