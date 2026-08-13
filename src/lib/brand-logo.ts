/** Transparent LIVV logo PNG (base64) at common icon sizes */
export const LIVV_ICONS: Record<number, string> = {
  32: "PLACEHOLDER",
};

export function getLivvIconPng(size: number = 32): Buffer {
  const key = ([32, 180, 192, 512] as const).reduce(
    (best, n) => (Math.abs(n - size) < Math.abs(best - size) ? n : best),
    32 as 32 | 180 | 192 | 512
  );
  return Buffer.from(LIVV_ICONS[key], "base64");
}
