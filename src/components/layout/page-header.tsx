import type { ReactNode } from "react";

type PageHeaderProps = {
  /** Page name. Rendered as the shared blue eyebrow. */
  eyebrow: string;
  /** Optional control on the eyebrow row (back link, settings). */
  trailing?: ReactNode;
  className?: string;
  children?: ReactNode;
};

/**
 * One top-of-page label for every LIVV screen.
 * The eyebrow is the page name. Offset includes the safe area.
 */
export function PageHeader({ eyebrow, trailing, className, children }: PageHeaderProps) {
  return (
    <header className={`livv-ph${className ? ` ${className}` : ""}`}>
      <div className="livv-ph-row">
        <p className="livv-ph-eyebrow">{eyebrow}</p>
        {trailing ? <div className="livv-ph-trailing">{trailing}</div> : null}
      </div>
      {children}
    </header>
  );
}
