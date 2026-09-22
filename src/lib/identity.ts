import { getCurrentAccount, syncAccountFromIdentity } from "./auth";
import { applyEmberGrants } from "./ember-grants";
import { applyOfficialProfileGrant } from "./official-grants";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./supabase/client";
export type LivvTier="spark"|"rise"|"apex"|"circle";export type LivvTheme="ember"|"midnight"|"bone";export type Appearance="dark"|"light"|"system";
export type Identity={displayName:string;username:string;bio:string;goal:string;photo:string|null;accent:string;tier:LivvTier;theme:LivvTheme;appearance:Appearance;embers:number};
const KEY="livv-identity-v1";
export const DEFAULT_ACCENT="#0F7FFF";
export const APP_COLORS=[{name:"Home",value:"#0F7FFF"},{name:"Daily",value:"#FCF927"},{name:"Train",value:"#F93827"},{name:"Mind",value:"#F61981"},{name:"Shop",value:"#9A00FF"},{name:"Social",value:"#4DFF00"},{name:"Profile",value:"#FF9D23"}];
export const ACCENTS=APP_COLORS.map(c=>c.value);
export const DEFAULT_IDENTITY:Identity={displayName:"",username:"",bio:"",goal:"",photo:null,accent:DEFAULT_ACCENT,tier:"spark",theme:"ember",appearance:"dark",embers:0};
function hexToRgb(hex:string){const clean=hex.replace("#","");const n=parseInt(clean.length===3?clean.split("").map(c=>c+c).join(""):clean,16);return{r:n>>16&255,g:n>>8&255,b:n&255};}
function soften(hex:string){const{r,g,b}=hexToRgb(hex);const mix=(c:number)=>Math.round(c+(255-c)*.42);return`${mix(r)} ${mix(g)} ${mix(b)}`;}
export function resolvedAppearance(appearance:Appearance):"dark"|"light"{if(appearance==="light")return"light";if(appearance==="dark")return"dark";if(typeof window==="undefined")return"dark";return window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}
export function applyAppearance(appearance:Appearance,accent:string,theme:LivvTheme="ember"){if(typeof document==="undefined")return;const mode=resolvedAppearance(appearance),root=document.documentElement;root.dataset.theme=mode;root.dataset.livvTheme=theme;root.style.colorScheme=mode;const{r,g,b}=hexToRgb(ACCENTS.includes(accent)?accent:DEFAULT_ACCENT);root.style.setProperty("--livv-accent",`${r} ${g} ${b}`);root.style.setProperty("--livv-accent-soft",soften(ACCENTS.includes(accent)?accent:DEFAULT_ACCENT));root.style.setProperty("--livv-accent-hex",ACCENTS.includes(accent)?accent:DEFAULT_ACCENT);}
export function applyAppColor(hex:string,theme:LivvTheme="ember"){applyAppearance(loadIdentity().appearance,hex,theme);}
export function loadIdentity():Identity{if(typeof window==="undefined")return DEFAULT_IDENTITY;try{const account=getCurrentAccount();let parsed:Identity;if(account)parsed={displayName:account.displayName,username:account.username,bio:account.bio,goal:account.goal||"",photo:account.photo,accent:account.accent,tier:account.tier,theme:account.theme,appearance:account.appearance,embers:account.embers};else{const raw=window.localStorage.getItem(KEY);if(!raw)return DEFAULT_IDENTITY;parsed={...DEFAULT_IDENTITY,...JSON.parse(raw)} as Identity;}if(!ACCENTS.includes(parsed.accent))parsed.accent=DEFAULT_ACCENT;if(!parsed.appearance)parsed.appearance="dark";if(!parsed.goal)parsed.goal="";let next={...parsed,embers:applyEmberGrants(parsed.username,parsed.embers)};next=applyOfficialProfileGrant(next);if(next.embers!==parsed.embers||next.tier!==parsed.tier){window.localStorage.setItem(KEY,JSON.stringify(next));syncAccountFromIdentity(next);window.dispatchEvent(new Event("livv-identity"));}return next;}catch{return DEFAULT_IDENTITY;}}
export function saveIdentity(next:Identity){if(typeof window==="undefined")return;const account=getCurrentAccount();if(account?.usernameLocked)next={...next,username:account.username};if(!ACCENTS.includes(next.accent))next={...next,accent:DEFAULT_ACCENT};window.localStorage.setItem(KEY,JSON.stringify(next));applyAppearance(next.appearance,next.accent,next.theme);syncAccountFromIdentity(next);window.dispatchEvent(new Event("livv-identity"));}
export function patchIdentity(partial:Partial<Identity>){const current=loadIdentity();const next={...current,...partial};saveIdentity(next);return next;}
export function addEmbers(amount:number,eventKey?:string){
  const id=loadIdentity();
  const next=patchIdentity({embers:Math.max(0,id.embers+amount)});
  if(typeof window!=="undefined" && isSupabaseConfigured()){
    const key=eventKey || `ember-${Date.now()}-${typeof crypto!=="undefined"&&"randomUUID" in crypto?crypto.randomUUID():Math.random().toString(36).slice(2)}`;
    void (async()=>{
      try{
        const client=getSupabaseBrowserClient();
        if(!client)return;
        const{data}=await client.auth.getSession();
        const token=data.session?.access_token;
        if(!token)return;
        const response=await fetch("/api/embers/award",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({eventKey:key,baseAmount:amount})});
        if(!response.ok)return;
        const payload=await response.json() as {total?:number};
        if(typeof payload.total==="number")patchIdentity({embers:Math.max(0,payload.total)});
      }catch{
        /* optimistic local state remains until the next cloud/profile hydration */
      }
    })();
  }
  return next;
}
export function fileToPhoto(file:File):Promise<string>{return new Promise((resolve,reject)=>{const img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{const size=512,canvas=document.createElement("canvas");canvas.width=size;canvas.height=size;const ctx=canvas.getContext("2d");if(!ctx){URL.revokeObjectURL(url);reject(new Error("canvas"));return;}const min=Math.min(img.width,img.height),sx=(img.width-min)/2,sy=(img.height-min)/2;ctx.drawImage(img,sx,sy,min,min,0,0,size,size);URL.revokeObjectURL(url);resolve(canvas.toDataURL("image/jpeg",.86));};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("image"));};img.src=url;});}
