/**
 * Official LIVV marks.
 * Black artwork on Daylight, white artwork on Midnight.
 * Both files sit in one grid cell and the theme attribute picks the visible one
 * before paint, so the mark does not flash the wrong color.
 */

export const WORDMARK_WIDTH = 1140;
export const WORDMARK_HEIGHT = 188;
export const FLAME_WIDTH = 256;
export const FLAME_HEIGHT = 512;

const MARKS = {
  wordmark: {
    light: "/brand/wordmark-black.png",
    dark: "/brand/wordmark-white.png",
    width: WORDMARK_WIDTH,
    height: WORDMARK_HEIGHT,
  },
  flame: {
    light: "/brand/icon-flame-l-black.png",
    dark: "/brand/icon-flame-l-white.png",
    width: FLAME_WIDTH,
    height: FLAME_HEIGHT,
  },
} as const;

type LivvMarkProps = {
  kind: keyof typeof MARKS;
  /** Accessible name for the Daylight image. The Midnight image is decorative. */
  alt?: string;
  className?: string;
  /** Above-the-fold marks load immediately. Everything else waits. */
  priority?: boolean;
};

export function LivvMark({ kind, alt = "", className, priority = false }: LivvMarkProps) {
  const spec = MARKS[kind];
  const loading = priority ? "eager" : "lazy";
  return (
    <span className={`livv-mark livv-mark-${kind}${className ? ` ${className}` : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="livv-mark-light"
        src={spec.light}
        width={spec.width}
        height={spec.height}
        alt={alt}
        decoding="async"
        loading={loading}
        fetchPriority={priority ? "high" : "auto"}
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="livv-mark-dark"
        src={spec.dark}
        width={spec.width}
        height={spec.height}
        alt=""
        aria-hidden="true"
        decoding="async"
        loading={loading}
        fetchPriority={priority ? "high" : "auto"}
        draggable={false}
      />
    </span>
  );
}
