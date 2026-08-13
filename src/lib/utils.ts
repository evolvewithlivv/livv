/**
 * Simple class name helper.
 * Keeps the foundation free of extra dependencies for now.
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}