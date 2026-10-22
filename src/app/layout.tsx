import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";
import "./livv-background.css";
import "./livv-final-pass.css";
import "./livv-visual-redesign.css";
import "./livv-professional.css";
import "./livv-tabbar.css";
import "./livv-search-fix.css";
import "./livv-tier-unlock.css";
import "./livv-motion.css";
import "./livv-craft.css";
import "./livv-desktop.css";
import { ThemeShell } from "@/components/layout/theme-shell";
import { FunnelProvider } from "@/components/funnel/funnel-provider";
import { ApexSessionHandoff } from "@/components/auth/apex-session-handoff";
import { LANDING_SESSION_SCRIPT } from "@/lib/landing-session";
import { APEX_HANDOFF_BOOT } from "@/lib/www-handoff-core.mjs";

const body=Plus_Jakarta_Sans({subsets:["latin"],variable:"--font-body",display:"swap"});
const display=Syne({subsets:["latin"],variable:"--font-display",display:"swap",weight:["500","600","700"]});

export const metadata: Metadata = {
  title: { default: "LIVV", template: "%s · LIVV" },
  description: "Build capability across your body, mind, work, relationships, and everyday life.",
  applicationName: "LIVV",
  metadataBase: new URL("https://evolvewithlivv.com"),
  openGraph: {
    type: "website",
    siteName: "LIVV",
    title: "LIVV",
    description: "A modern operating system for a life you can actually live.",
    url: "https://evolvewithlivv.com",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "LIVV" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LIVV",
    description: "A modern operating system for a life you can actually live.",
    images: ["/opengraph-image"],
  },
  appleWebApp: { capable: true, title: "LIVV", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/api/icon?s=32&c=black", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: light)" },
      { url: "/api/icon?s=32&c=white", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: dark)" },
      { url: "/api/icon?s=64&c=black", sizes: "64x64", type: "image/png", media: "(prefers-color-scheme: light)" },
      { url: "/api/icon?s=64&c=white", sizes: "64x64", type: "image/png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: [
      { url: "/api/icon?s=180&c=black&bg=1", sizes: "180x180", media: "(prefers-color-scheme: light)" },
      { url: "/api/icon?s=180&c=white&bg=1", sizes: "180x180", media: "(prefers-color-scheme: dark)" },
    ],
  },
  other: { "mobile-web-app-capable": "yes" },
};
export const viewport:Viewport={width:"device-width",initialScale:1,maximumScale:5,viewportFit:"cover",themeColor:[{media:"(prefers-color-scheme: light)",color:"#f7f7f5"},{media:"(prefers-color-scheme: dark)",color:"#090a0c"}]};
const THEME_BOOT=`(function(){try{var a="",t="",mode="system";function chosen(p){if(!p)return false;var ap=p.appearance||"",th=p.theme||"";var midnight=th==="midnight"||th==="ember"||th==="dark"||ap==="dark";if(ap==="system")return midnight;if(midnight)return true;if(ap==="light"||th==="daylight"||th==="bone")return !!(p.displayName||p.username||p.bio||p.photo||(p.embers>0));return false;}function paint(ap,th){if(th==="midnight"||th==="ember"||th==="dark"||ap==="dark")return {a:"dark",t:"midnight"};if(th==="daylight"||th==="bone"||ap==="light")return {a:"light",t:"daylight"};return null;}var lookRaw=localStorage.getItem("livv-look-v1");if(lookRaw){var l=JSON.parse(lookRaw);if(l&&typeof l.updatedAt==="number"&&l.updatedAt>0){a=l.appearance||"";t=l.theme||"";mode="choice";}}if(mode!=="choice"){var raw=localStorage.getItem("livv-identity-v1");if(raw){var p=JSON.parse(raw);if(chosen(p)){a=p.appearance||"";t=p.theme||"";mode="choice";}}}var root=document.documentElement;if(mode==="choice"){var next=paint(a,t)||{a:"dark",t:"midnight"};a=next.a;t=next.t;root.setAttribute("data-livv-scheme","choice");}else{var dark=window.matchMedia('(prefers-color-scheme: dark)').matches;a=dark?"dark":"light";t=dark?"midnight":"daylight";root.setAttribute("data-livv-scheme","system");}root.setAttribute("data-theme",a);root.setAttribute("data-livv-theme",t);root.style.colorScheme=a;}catch(e){}})();`;
const PWA_BOOT=`(function(){try{if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(){});});}}catch(e){}})();`;
const BRAND_BOOT=`(function(){try{var root=document.documentElement;var choice=root.getAttribute("data-livv-scheme")==="choice";var dark=choice?root.getAttribute("data-theme")==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;var want=dark?"white":"black";if(choice){var links=document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]');for(var i=0;i<links.length;i++){var link=links[i];var href=link.getAttribute("href")||"";if(href.indexOf("/api/icon")===-1)continue;link.media=href.indexOf("c="+want)===-1?"not all":"all";}}var path=location.pathname;if(path!=="/"&&path!=="/auth")return;var files=path==="/auth"?["/brand/icon-flame-l-"+want+".png","/brand/wordmark-"+want+".png"]:["/brand/wordmark-"+want+".png"];for(var j=0;j<files.length;j++){var preload=document.createElement("link");preload.rel="preload";preload.as="image";preload.href=files[j];document.head.appendChild(preload);}}catch(e){}})();`;
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={`${body.variable} ${display.variable}`} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:APEX_HANDOFF_BOOT}}/><script dangerouslySetInnerHTML={{__html:THEME_BOOT}}/><script dangerouslySetInnerHTML={{__html:LANDING_SESSION_SCRIPT}}/><style>{`html[data-livv-landing-hold="1"] .livv-landing{visibility:hidden}`}</style><script dangerouslySetInnerHTML={{__html:PWA_BOOT}}/><script dangerouslySetInnerHTML={{__html:BRAND_BOOT}}/></head><body className="min-h-dvh bg-[var(--livv-bg,#030405)] text-[rgb(var(--livv-fg))] antialiased"><ApexSessionHandoff /><FunnelProvider /><ThemeShell>{children}</ThemeShell></body></html>;}
