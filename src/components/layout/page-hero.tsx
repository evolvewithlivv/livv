import type { ReactNode } from "react";

/**
 * Canonical LIVV primary-screen header.
 * Eyebrow = section label (neutral, never accent blue).
 * Title = display headline.
 * Subtitle = supporting description.
 * Blue is reserved for UI state elsewhere — not for page labels.
 */
type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Optional trailing control (icon, level chip, etc.). Does not change type scale. */
  right?: ReactNode;
  /** @deprecated Ignored — page labels stay neutral. Kept for call-site compatibility. */
  accent?: string;
  className?: string;
};

export function PageHero({ title, eyebrow, subtitle, right, className }: PageHeroProps) {
  return (
    <header className={`livv-page-hero${className ? ` ${className}` : ""}`}>
      <div className="livv-page-hero-main">
        <p className="livv-page-eyebrow">{eyebrow}</p>
        <h1 className="livv-page-title">{title}</h1>
        {subtitle ? <p className="livv-page-subtitle">{subtitle}</p> : null}
      </div>
      {right ? <div className="livv-page-hero-right">{right}</div> : null}
    </header>
  );
}
