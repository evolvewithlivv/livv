import { getCurrentAccount, syncAccountFromIdentity } from "./auth";
import { applyEmberGrants } from "./ember-grants";

export type LivvTier = "spark" | "rise" | "apex" | "circle";
export type LivvTheme = "ember" | "midnight" | "bone";
export type Appearance = "dark" | "light" | "system";

export type Identity = {
  displayName: string;
  username: string;
  bio: string;
  photo: string | null;
  accent: string;
  tier: LivvTier;
  theme: LivvTheme;
  appearance: Appearance;
  embers: number;
};

const KEY = "livv-identity-v1";

export const DEFAULT_ACCENT = "#4C8DFF";

export const APP_COLORS = [
  { name: "Signal", value: "#4C8DFF" },
  { name: "Ice", value: "#7EB6FF" },
  { name: "Violet", value: "#7C6BFF" },
  { name: "Teal", value: "#2EE0C0" },
  { name: "Green", value: "#3DDC97" },
  { name: "Rose", value: "#FF5C8A" },
  { name: "Gold", value: "#F5C542" },
  { name: "Bone", value: "#E8E2D6" },
];

export const ACCENTS = APP_COLORS.map((c) => c.value);

export const DEFAULT_IDENTITY: Identity = {
  displayName: "",
  username: "",
  bio: "",
  photo: null,
  accent: DEFAULT_ACCENT,
  tier: "spark",
  theme: "ember",
  appearance: "dark",
  embers: 0,
};

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const n = parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

function soften(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c: number) => Math.round(c + (255 - c) * 0.42);
  return `${mix(r)} ${mix(g)} ${mix(b)}`;
}

export function resolvedAppearance(appearance: Appearance): "dark" | "light" {
  if (appearance === "light") return "light";
  if (appearance === "dark") return "dark";
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function applyAppearance(appearance: Appearance, accent: string) {
  if (typeof document === "undefined") return;
  const mode = resolvedAppearance(appearance);
  const root = document.documentElement;
  root.dataset.theme = mode;
  root.style.colorScheme = mode;

  const { r, g, b } = hexToRgb(accent);
  root.style.setProperty("--livv-accent", `${r} ${g} ${b}`);
  root.style.setProperty("--livv-accent-soft", soften(accent));
  root.style.setProperty("--livv-accent-hex", accent);
}

export function applyAppColor(hex: string, theme: LivvTheme = "ember") {
  applyAppearance(loadIdentity().appearance, hex);
  void theme;
}

export function loadIdentity(): Identity {
  if (typeof window === "undefined") return DEFAULT_IDENTITY;
  try {
    const account = getCurrentAccount();
    let parsed: Identity;
    if (account) {
      parsed = {
        displayName: account.displayName,
        username: account.username,
        bio: account.bio,
        photo: account.photo,
        accent: account.accent,
        tier: account.tier,
        theme: account.theme,
        appearance: account.appearance,
        embers: account.embers,
      };
    } else {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return DEFAULT_IDENTITY;
      parsed = { ...DEFAULT_IDENTITY, ...JSON.parse(raw) } as Identity;
    }
    if (parsed.accent === "#FF6A1A") parsed.accent = DEFAULT_ACCENT;
    if (!parsed.appearance) parsed.appearance = "dark";

    const granted = applyEmberGrants(parsed.username, parsed.embers);
    if (granted !== parsed.embers) {
      parsed = { ...parsed, embers: granted };
      window.localStorage.setItem(KEY, JSON.stringify(parsed));
      syncAccountFromIdentity(parsed);
      window.dispatchEvent(new Event("livv-identity"));
    }
    return parsed;
  } catch {
    return DEFAULT_IDENTITY;
  }
}

export function saveIdentity(next: Identity) {
  if (typeof window === "undefined") return;
  const account = getCurrentAccount();
  if (account?.usernameLocked) {
    next = { ...next, username: account.username };
  }
  window.localStorage.setItem(KEY, JSON.stringify(next));
  applyAppearance(next.appearance, next.accent);
  syncAccountFromIdentity(next);
  window.dispatchEvent(new Event("livv-identity"));
}

export function patchIdentity(partial: Partial<Identity>) {
  const next = { ...loadIdentity(), ...partial };
  saveIdentity(next);
  return next;
}

export function addEmbers(amount: number) {
  const id = loadIdentity();
  return patchIdentity({ embers: Math.max(0, id.embers + amount) });
}

export function fileToPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const size = 512;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("canvas"));
        return;
      }
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.86));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };
    img.src = url;
  });
}
