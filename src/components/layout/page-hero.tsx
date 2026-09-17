import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  accent?: string;
  right?: ReactNode;
};

export function PageHero({ title, eyebrow, subtitle, right }: PageHeroProps) {
  return (
    <header className="livv-page-hero relative flex items-end justify-between gap-4 border-b border-[var(--livv-pro-line)] pb-7 pt-2">
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[var(--livv-pro-muted)]">{eyebrow}</p>
        <h1 className="mt-3 max-w-[18ch] font-display text-[clamp(2.15rem,8vw,3.35rem)] font-semibold leading-[.94] tracking-[-.065em] text-[var(--livv-pro-ink)]">{title}</h1>
        {subtitle ? <p className="mt-3 max-w-[46ch] text-[13px] leading-[1.55] text-[var(--livv-pro-muted)]">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0 pb-1 text-[var(--livv-pro-muted)]">{right}</div> : null}
    </header>
  );
}
