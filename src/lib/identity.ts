import { getCurrentAccount, syncAccountFromIdentity, syncIdentityToCloud } from "./auth";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./supabase/client";
export type LivvTier="spark"|"rise"|"apex"|"circle";export type LivvTheme="daylight"|"midnight";export type Appearance="dark"|"light"|"system";
export type Identity={displayName:string;username:string;bio:string;goal:string;photo:string|null;accent:string;tier:LivvTier;theme:LivvTheme;appearance:Appearance;embers:number};
const KEY="livv-identity-v1";
export const DEFAULT_ACCENT="#0F7FFF";
export const APP_COLORS=[{name:"Home",value:"#0F7FFF"},{name:"Daily",value:"#FCF927"},{name:"Train",value:"#F93827"},{name:"Mind",value:"#F61981"},{name:"Shop",value:"#9A00FF"},{name:"Social",value:"#4DFF00"},{name:"Profile",value:"#FF9D23"}];
export const ACCENTS=APP_COLORS.map(c=>c.value);
export const DEFAULT_IDENTITY:Identity={displayName:"",username:"",bio:"",goal:"",photo:null,accent:DEFAULT_ACCENT,tier:"spark",theme:"daylight",appearance:"light",embers:0};
function hexToRgb(hex:string){const clean=hex.replace("#","");const n=parseInt(clean.length===3?clean.split("").map(c=>c+c).join(""):clean,16);return{r:n>>16&255,g:n>>8&255,b:n&255};}
function soften(hex:string){const{r,g,b}=hexToRgb(hex);const mix=(c:number)=>Math.round(c+(255-c)*.42);return`${mix(r)} ${mix(g)} ${mix(b)}`;}
const LOOK_KEY="livv-look-v1";
export type StoredLook={appearance:"light"|"dark";theme:LivvTheme;updatedAt:number;syncedAt:number};

/** Daylight + Midnight only. Legacy Light/Dark/Match device/bone/ember collapse here. */
export function normalizeLook(appearance?:string|null,theme?:string|null):{appearance:"light"|"dark";theme:LivvTheme}{
  const a=(appearance||"").toLowerCase();
  const t=(theme||"").toLowerCase();
  if(a==="system"){
    const light=typeof window!=="undefined"&&window.matchMedia("(prefers-color-scheme: light)").matches;
    return light?{appearance:"light",theme:"daylight"}:{appearance:"dark",theme:"midnight"};
  }
  if(a==="light"||t==="bone")return{appearance:"light",theme:"daylight"};
  if(a==="dark"||t==="midnight"||t==="ember"||t==="dark")return{appearance:"dark",theme:"midnight"};
  if(t==="daylight")return{appearance:"light",theme:"daylight"};
  return{appearance:"dark",theme:"midnight"};
}

export function readStoredLook():StoredLook|null{
  if(typeof window==="undefined")return null;
  try{
    const raw=window.localStorage.getItem(LOOK_KEY);
    if(!raw)return null;
    const parsed=JSON.parse(raw) as Partial<StoredLook>;
    const look=normalizeLook(parsed.appearance,parsed.theme);
    if(typeof parsed.updatedAt!=="number")return null;
    return{...look,updatedAt:parsed.updatedAt,syncedAt:typeof parsed.syncedAt==="number"?parsed.syncedAt:0};
  }catch{return null;}
}

export function writeStoredLook(look:StoredLook){
  if(typeof window==="undefined")return;
  window.localStorage.setItem(LOOK_KEY,JSON.stringify(look));
}

export function resolvedAppearance(appearance:Appearance):"dark"|"light"{
  return normalizeLook(appearance, appearance==="light"?"daylight":"midnight").appearance;
}
export function applyAppearance(appearance:Appearance,accent:string,theme:LivvTheme="daylight"){if(typeof document==="undefined")return;const look=normalizeLook(appearance,theme),root=document.documentElement;root.dataset.theme=look.appearance;root.dataset.livvTheme=look.theme;root.style.colorScheme=look.appearance;root.style.removeProperty("background-color");if(document.body)document.body.style.removeProperty("background-color");const{r,g,b}=hexToRgb(ACCENTS.includes(accent)?accent:DEFAULT_ACCENT);root.style.setProperty("--livv-accent",`${r} ${g} ${b}`);root.style.setProperty("--livv-accent-soft",soften(ACCENTS.includes(accent)?accent:DEFAULT_ACCENT));root.style.setProperty("--livv-accent-hex",ACCENTS.includes(accent)?accent:DEFAULT_ACCENT);}
export function applyAppColor(hex:string,theme:LivvTheme="daylight"){applyAppearance(loadIdentity().appearance,hex,theme);}
export function loadIdentity():Identity{if(typeof window==="undefined")return DEFAULT_IDENTITY;try{const account=getCurrentAccount();let parsed:Identity;if(account)parsed={displayName:account.displayName,username:account.username,bio:account.bio,goal:account.goal||"",photo:account.photo,accent:account.accent,tier:account.tier,theme:account.theme,appearance:account.appearance,embers:account.embers};else{const raw=window.localStorage.getItem(KEY);if(!raw)return DEFAULT_IDENTITY;parsed={...DEFAULT_IDENTITY,...JSON.parse(raw)} as Identity;}if(!ACCENTS.includes(parsed.accent))parsed.accent=DEFAULT_ACCENT;const pending=readStoredLook();const look=pending&&pending.updatedAt>pending.syncedAt?pending:normalizeLook(parsed.appearance,parsed.theme);parsed.appearance=look.appearance;parsed.theme=look.theme;if(!parsed.goal)parsed.goal="";return parsed;}catch{return DEFAULT_IDENTITY;}}
export function saveIdentity(next:Identity){if(typeof window==="undefined")return;const account=getCurrentAccount();if(account?.usernameLocked)next={...next,username:account.username};if(!ACCENTS.includes(next.accent))next={...next,accent:DEFAULT_ACCENT};window.localStorage.setItem(KEY,JSON.stringify(next));applyAppearance(next.appearance,next.accent,next.theme);syncAccountFromIdentity(next);window.dispatchEvent(new Event("livv-identity"));}
const EMBER_STAMP_KEY="livv-embers-stamp-v1";
export function coerceEmberCount(value:unknown):number|null{if(typeof value==="number"&&Number.isFinite(value))return Math.max(0,Math.round(value));if(typeof value==="string"&&value.trim()!==""&&Number.isFinite(Number(value)))return Math.max(0,Math.round(Number(value)));return null;}
/** Award responses are absolute totals. A missing or zero total with a positive award still has to move the counter. Out-of-order responses must not walk the balance backward. */
export function balanceAfterAward(local:number,payload:{total?:unknown;awarded?:unknown}|null):number{const awarded=coerceEmberCount(payload?.awarded)??0;const reported=coerceEmberCount(payload?.total);const current=Math.max(0,Math.round(local)||0);if(reported!=null&&reported>0)return Math.max(current,reported);if(awarded>0)return current+awarded;if(reported!=null)return reported;return current;}
function stampEmberWrite(){if(typeof window==="undefined")return;window.localStorage.setItem(EMBER_STAMP_KEY,String(Date.now()));}
export function emberBalanceIsFresh(withinMs=20000):boolean{if(typeof window==="undefined")return false;const raw=window.localStorage.getItem(EMBER_STAMP_KEY);const stamp=raw?Number(raw):0;return Number.isFinite(stamp)&&stamp>0&&Date.now()-stamp<withinMs&&Date.now()-stamp>=0;}
/** A profile hydrate that started before an award must not write the pre-award balance back over the response. */
export function keepNewerEmberBalance<T extends {embers:number}>(account:T,startedAt:number):T{if(typeof window==="undefined")return account;const raw=window.localStorage.getItem(EMBER_STAMP_KEY);const stamp=raw?Number(raw):0;if(!Number.isFinite(stamp)||stamp<startedAt)return account;const fresh=getCurrentAccount();if(!fresh||typeof fresh.embers!=="number")return account;return {...account,embers:fresh.embers};}
export function patchIdentity(partial:Partial<Identity>){const current=loadIdentity();const next={...current,...partial};if(partial.appearance||partial.theme){const look=normalizeLook(next.appearance,next.theme);next.appearance=look.appearance;next.theme=look.theme;}if(typeof partial.embers==="number")stampEmberWrite();saveIdentity(next);return next;}

/** Write Daylight/Midnight locally and to profiles when a signed-in member exists. */
export async function persistLook(appearance:Appearance,theme:LivvTheme):Promise<"cloud"|"local"|"error">{
  const look=normalizeLook(appearance,theme);
  const next=patchIdentity(look);
  const stored:StoredLook={...look,updatedAt:Date.now(),syncedAt:0};
  writeStoredLook(stored);
  try{
    const result=await syncIdentityToCloud(next);
    if(result==="error")return"error";
    if(result!=="cloud")return"local";
    writeStoredLook({...stored,syncedAt:stored.updatedAt});
    return"cloud";
  }catch{
    return"error";
  }
}
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
        const payload = (await response.json().catch(() => null)) as { total?: unknown; error?: string; awarded?: unknown } | null;
        if (!response.ok) {
          const error = payload?.error || "Embers could not be awarded.";
          window.dispatchEvent(new CustomEvent("livv-ember-award", { detail: { ok: false, error } }));
          return;
        }
        const localNow = loadIdentity().embers || 0;
        const total = balanceAfterAward(localNow, payload);
        if (total !== localNow) patchIdentity({ embers: total });
        window.dispatchEvent(new CustomEvent("livv-ember-award", { detail: { ok: true, total, awarded: coerceEmberCount(payload?.awarded) ?? 0 } }));
        void confirmEmbersFromProfile();
      } catch {
        window.dispatchEvent(new CustomEvent("livv-ember-award", { detail: { ok: false, error: "Embers could not be awarded." } }));
      }
    })();
    return current;
  }
  const offline = patchIdentity({
    embers: Math.max(0, current.embers + offlineAmounts[action]),
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("livv-ember-award", { detail: { ok: true, total: offline.embers, awarded: offlineAmounts[action] } }));
  }
  return offline;
}

/** Same profiles.embers read the session hydrate uses. A lower stale row must not erase the award just applied. */
async function confirmEmbersFromProfile() {
  try {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    const { data: sessionData } = await client.auth.getSession();
    const user = sessionData.session?.user;
    if (!user || user.is_anonymous) return;
    const { data, error } = await client.from("profiles").select("embers").eq("id", user.id).maybeSingle();
    if (error || !data) return;
    const cloud = coerceEmberCount(data.embers);
    if (cloud == null) return;
    const local = loadIdentity().embers || 0;
    if (cloud > local) patchIdentity({ embers: cloud });
  } catch {
    /* The award response is already on screen. */
  }
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
