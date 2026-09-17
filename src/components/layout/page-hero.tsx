import type { ReactNode } from "react";

type PageHeroProps = { eyebrow:string; title:ReactNode; subtitle?:string; accent?:string; right?:ReactNode };

export function PageHero({ title, eyebrow, subtitle, right }: PageHeroProps) {
  return <header className="livv-page-hero flex items-end justify-between gap-4 border-b border-[var(--livv-pro-line)] pb-6 pt-1">
    <div className="min-w-0 flex-1">
      <p className="text-[9px] font-semibold uppercase tracking-[.22em] text-[var(--livv-pro-muted)]">{eyebrow}</p>
      <h1 className="mt-2.5 max-w-[22ch] font-display text-[clamp(2rem,8vw,3.1rem)] font-semibold leading-[.96] tracking-[-.06em] text-[var(--livv-pro-ink)]">{title}</h1>
      {subtitle ? <p className="mt-3 max-w-[48ch] text-[13px] leading-[1.5] text-[var(--livv-pro-muted)]">{subtitle}</p> : null}
    </div>
    {right ? <div className="shrink-0 pb-1 text-[var(--livv-pro-muted)]">{right}</div> : null}
  </header>;
}
