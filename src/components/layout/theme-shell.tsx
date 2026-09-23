"use client";
import { useEffect,useState } from "react";
import { usePathname } from "next/navigation";
import { applyAppearance,loadIdentity } from "@/lib/identity";
import { hydrateServerEntitlement } from "@/lib/billing";
import { ensureAnonymousSession } from "@/lib/supabase/anon-session";
import { startCloudMemberStateSync } from "@/lib/supabase/cloud-state";
import { ensureCloudAuthForCurrentBrowser } from "@/lib/supabase/real-auth";

export function ThemeShell({children}:{children:React.ReactNode}){
 const [offline,setOffline]=useState(false);
 const pathname=usePathname();
 useEffect(()=>{document.documentElement.dataset.livvRoute=pathname.replaceAll("/","-").replace(/^-|-$/g,"")||"root";},[pathname]);
 useEffect(()=>{const apply=()=>{const me=loadIdentity();applyAppearance(me.appearance,me.accent,me.theme);const mode=me.appearance==="light"?"light":me.appearance==="system"?(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):"dark";document.querySelector('meta[name="theme-color"]')?.setAttribute("content",mode==="light"?"#f2f3f6":"#030405");};apply();const updateConnection=()=>setOffline(!navigator.onLine);updateConnection();window.addEventListener("online",updateConnection);window.addEventListener("offline",updateConnection);let stopCloudSync=()=>{};let cancelled=false;if("serviceWorker" in navigator){void navigator.serviceWorker.register("/sw.js",{scope:"/"}).catch(error=>console.warn("[LIVV PWA] service worker deferred",error));}void(async()=>{try{await ensureAnonymousSession();if(cancelled)return;await ensureCloudAuthForCurrentBrowser();if(cancelled)return;await hydrateServerEntitlement();if(cancelled)return;stopCloudSync=startCloudMemberStateSync();}catch(error){console.warn("[LIVV startup] cloud services deferred",error);}})();const mq=window.matchMedia("(prefers-color-scheme: light)"),onScheme=()=>{if(loadIdentity().appearance==="system")apply();};mq.addEventListener("change",onScheme);window.addEventListener("livv-identity",apply);window.addEventListener("storage",apply);return()=>{cancelled=true;stopCloudSync();mq.removeEventListener("change",onScheme);window.removeEventListener("livv-identity",apply);window.removeEventListener("storage",apply);window.removeEventListener("online",updateConnection);window.removeEventListener("offline",updateConnection);};},[]);
 useEffect(()=>{ const onVisible=()=>{ if(document.visibilityState!=="visible")return; const me=loadIdentity(); applyAppearance(me.appearance,me.accent,me.theme); }; document.addEventListener("visibilitychange",onVisible); return()=>document.removeEventListener("visibilitychange",onVisible); },[]);
return<>{offline&&<div role="status" aria-live="polite" className="fixed inset-x-3 top-2 z-[100] mx-auto max-w-xl rounded-2xl border border-white/10 bg-black/90 px-4 py-3 text-center text-[11px] font-medium tracking-wide text-white/75 shadow-lg backdrop-blur-xl">Offline mode · Your local changes are safe and will sync when you reconnect.</div>}{children}</>;
}
