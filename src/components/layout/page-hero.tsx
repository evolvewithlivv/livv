import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  accent?: string;
  right?: ReactNode;
};

/** Shared page title block so every screen opens the same way under the app header. */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  accent = "#67d8ff",
  right,
}: PageHeroProps) {
  return (
    <header className="livv-page-hero flex items-end justify-between gap-4">
      <div className="min-w-0">
        <p
          className="text-[9px] font-semibold uppercase tracking-[0.34em]"
          style={{ color: accent }}
        >
          {eyebrow}
        </p>
        <h1 className="font-display mt-2 text-[32px] font-semibold leading-[0.95] tracking-[-0.05em] text-[rgb(var(--livv-fg))]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-[36ch] text-[13px] leading-relaxed text-white/40">
            {subtitle}
          </p>
        ) : null}
      </div>
      {right ? <div className="mb-0.5 shrink-0">{right}</div> : null}
    </header>
  );
}
