import { LivvMark } from "@/components/brand/livv-mark";

type BrandLockupProps = {
  /** Flame L above the wordmark. Either piece can be omitted. */
  flame?: boolean;
  wordmark?: boolean;
  priority?: boolean;
  className?: string;
};

/** The account and landing mark: flame L stacked above the official wordmark. */
export function BrandLockup({ flame = true, wordmark = true, priority = false, className }: BrandLockupProps) {
  return (
    <div className={`livv-lockup${className ? ` ${className}` : ""}`}>
      {flame ? <LivvMark kind="flame" alt="" className="auth-flame" priority={priority} /> : null}
      {wordmark ? (
        <div className="livv-lockup-word">
          <LivvMark kind="wordmark" alt="LIVV" priority={priority} />
        </div>
      ) : null}
    </div>
  );
}
