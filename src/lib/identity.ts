import { getCurrentAccount, syncAccountFromIdentity } from "./auth";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./supabase/client";
export type LivvTier="spark"|"rise"|"apex"|"circle";export type LivvTheme="daylight"|"midnight";export type Appearance="dark"|"light"|"system";
export type Identity={displayName:string;username:string;bio:string;goal:string;photo:string|null;accent:string;tier:LivvTier;theme:LivvTheme;appearance:Appearance;embers:number};
const KEY="livv-identity-v1";
export const DEFAULT_ACCENT="#0F7FFF";
export const APP_COLORS=[{name:"Home",value:"#0F7FFF"},{name:"Daily",value:"#FCF927"},{name:"Train",value:"#F93827"},{name:"Mind",value:"#F61981"},{name:"Shop",value:"#9A00FF"},{name:"Social",value:"#4DFF00"},{name:"Profile",value:"#FF9D23"}];
export const ACCENTS=APP_COLORS.map(c=>c.value);
export const DEFAULT_IDENTITY:Identity={displayName:"",username:"",bio:"",goal:"",photo:null,accent:DEFAULT_ACCENT,tier:"spark",theme:"daylight",appearance:"system",embers:0};
function hexToRgb(hex:string){const clean=hex.replace("#","");const n=parseInt(clean.length===3?clean.split("").map(c=>c+c).join(""):clean,16);return{r:n>>16&255,g:n>>8&255,b:n&255};}
function soften(hex:string){const{r,g,b}=hexToRgb(hex);const mix=(c:number)=>Math.round(c+(255-c)*.42);return`${mix(r)} ${mix(g)} ${mix(b)}`;}
export function resolvedAppearance(appearance:Appearance):"dark"|"light"{if(appearance==="light")return"light";if(appearance==="dark")return"dark";if(typeof window==="undefined")return"dark";return window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}
export function applyAppearance(appearance:Appearance,accent:string,theme:LivvTheme="daylight"){if(typeof document==="undefined")return;const mode=resolvedAppearance(appearance),root=document.documentElement;root.dataset.theme=mode;root.dataset.livvTheme=theme;root.style.colorScheme=mode;const{r,g,b}=hexToRgb(ACCENTS.includes(accent)?accent:DEFAULT_ACCENT);root.style.setProperty("--livv-accent",`${r} ${g} ${b}`);root.style.setProperty("--livv-accent-soft",soften(ACCENTS.includes(accent)?accent:DEFAULT_ACCENT));root.style.setProperty("--livv-accent-hex",ACCENTS.includes(accent)?accent:DEFAULT_ACCENT);}
export function applyAppColor(hex:string,theme:LivvTheme="ember"){applyAppearance(loadIdentity().appearance,hex,theme);}
export function loadIdentity():Identity{if(typeof window==="undefined")return DEFAULT_IDENTITY;try{const account=getCurrentAccount();let parsed:Identity;if(account)parsed={displayName:account.displayName,username:account.username,bio:account.bio,goal:account.goal||"",photo:account.photo,accent:account.accent,tier:account.tier,theme:account.theme,appearance:account.appearance,embers:account.embers};else{const raw=window.localStorage.getItem(KEY);if(!raw)return DEFAULT_IDENTITY;parsed={...DEFAULT_IDENTITY,...JSON.parse(raw)} as Identity;}if(!ACCENTS.includes(parsed.accent))parsed.accent=DEFAULT_ACCENT;if(!parsed.appearance)parsed.appearance="system";if(parsed.theme!=="daylight"&&parsed.theme!=="midnight")parsed.theme=parsed.appearance==="dark"?"midnight":"daylight";if(!parsed.goal)parsed.goal="";return parsed;}catch{return DEFAULT_IDENTITY;}}
export function saveIdentity(next:Identity){if(typeof window==="undefined")return;const account=getCurrentAccount();if(account?.usernameLocked)next={...next,username:account.username};if(!ACCENTS.includes(next.accent))next={...next,accent:DEFAULT_ACCENT};window.localStorage.setItem(KEY,JSON.stringify(next));applyAppearance(next.appearance,next.accent,next.theme);syncAccountFromIdentity(next);window.dispatchEvent(new Event("livv-identity"));}
export function patchIdentity(partial:Partial<Identity>){const current=loadIdentity();const next={...current,...partial};saveIdentity(next);return next;}
export type EmberAction = "checkin" | "workout" | "objective" | "custom";

function sizeFromAmount(amount: number): "small" | "standard" | "major" {
  if (amount <= 4) return "small";
  if (amount >= 12) return "major";
  return "standard";
}

export function addEmbers(
  actionOrAmount: EmberAction | number,
  optsOrEventKey?: { detail?: string; size?: "small" | "standard" | "major" } | string,
) {
  const current = loadIdentity();

  let action: EmberAction;
  let opts: { detail?: string; size?: "small" | "standard" | "major" } | undefined;

  if (typeof actionOrAmount === "number") {
    action = "custom";
    opts = {
      detail: typeof optsOrEventKey === "string" && optsOrEventKey.includes("checkin")
        ? "checkin-bonus"
        : "legacy",
      size: sizeFromAmount(actionOrAmount),
    };
  } else {
    action = actionOrAmount;
    opts = typeof optsOrEventKey === "object" && optsOrEventKey ? optsOrEventKey : undefined;
  }

  const offlineAmounts: Record<EmberAction, number> = {
    checkin: 6,
    workout: 10,
    objective: 4,
    custom: opts?.size === "small" ? 4 : opts?.size === "major" ? 12 : 6,
  };

  if (typeof window !== "undefined" && isSupabaseConfigured()) {
    void (async () => {
      try {
        const client = getSupabaseBrowserClient();
        if (!client) return;
        const { data } = await client.auth.getSession();
        const token = data.session?.access_token;
        if (!token) return;
        const body: Record<string, string> = { action };
        if (opts?.detail) body.detail = opts.detail;
        if (opts?.size) body.size = opts.size;
        const response = await fetch("/api/embers/award", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(body),
        });
        if (!response.ok) return;
        const payload = (await response.json()) as { total?: number };
        if (typeof payload.total === "number") {
          patchIdentity({ embers: Math.max(0, payload.total) });
        }
      } catch {
        /* Server remains authoritative */
      }
    })();
    return current;
  }
  return patchIdentity({
    embers: Math.max(0, current.embers + offlineAmounts[action]),
  });
}

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export function fileToPhoto(file: File): Promise<string> {
  if (file.size > MAX_PHOTO_BYTES) return Promise.reject(new Error("too-large"));
  if (!file.type.startsWith("image/")) return Promise.reject(new Error("type"));
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
