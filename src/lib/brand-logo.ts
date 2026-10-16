import { readFileSync } from "node:fs";
import path from "node:path";

/** Square flame L masters. The icon route resizes these to the exact requested pixel size. */
const FILES = {
  black: path.join(process.cwd(), "public/brand/icon-flame-square-black.png"),
  white: path.join(process.cwd(), "public/brand/icon-flame-square-white.png"),
} as const;

const cache = new Map<string, Uint8Array>();

export type IconColor = keyof typeof FILES;

export function getLivvIconPng(color: IconColor = "black"): Uint8Array {
  const hit = cache.get(color);
  if (hit) return hit;
  const bytes = new Uint8Array(readFileSync(FILES[color]));
  cache.set(color, bytes);
  return bytes;
}
