export type LivvTier = "spark" | "rise" | "apex" | "circle";
export type LivvTheme = "ember" | "midnight" | "bone";

export type Identity = {
  displayName: string;
  username: string;
  bio: string;
  photo: string | null;
  accent: string;
  tier: LivvTier;
  theme: LivvTheme;
  embers: number;
};

const KEY = "livv-identity-v1";

export const ACCENTS = [
  "#FF6A1A",
  "#E8E2D6",
  "#7C9CFF",
  "#3DDC97",
  "#FF5C8A",
  "#F5C542",
];

export const DEFAULT_IDENTITY: Identity = {
  displayName: "Kanye",
  username: "evolvewithlivv",
  bio: "Building the version that does not fold.",
  photo: null,
  accent: "#FF6A1A",
  tier: "spark",
  theme: "ember",
  embers: 40,
};

export function loadIdentity(): Identity {
  if (typeof window === "undefined") return DEFAULT_IDENTITY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_IDENTITY;
    return { ...DEFAULT_IDENTITY, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_IDENTITY;
  }
}

export function saveIdentity(next: Identity) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(next));
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
