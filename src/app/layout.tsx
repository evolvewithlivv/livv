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
    shortcut: ["/api/icon?s=32&c=black"],
  },
  other: { "mobile-web-app-capable": "yes" },
};
export const viewport:Viewport={width:"device-width",initialScale:1,maximumScale:5,viewportFit:"cover",themeColor:[{media:"(prefers-color-scheme: light)",color:"#f7f7f5"},{media:"(prefers-color-scheme: dark)",color:"#090a0c"}]};
const THEME_BOOT=`(function(){try{var a='light',t='daylight',used=false;var lookRaw=localStorage.getItem('livv-look-v1');if(lookRaw){var l=JSON.parse(lookRaw);if(l&&typeof l.updatedAt==='number'&&l.updatedAt>(l.syncedAt||0)){a=l.appearance||a;t=l.theme||t;used=true;}}if(!used){var raw=localStorage.getItem('livv-identity-v1');if(raw){var p=JSON.parse(raw);if(p){if(p.appearance)a=p.appearance;if(p.theme)t=p.theme;}}}if(a==='system'){var light=window.matchMedia('(prefers-color-scheme: light)').matches;a=light?'light':'dark';t=light?'daylight':'midnight';}else if(a==='light'||t==='bone'){a='light';t='daylight';}else if(a==='dark'||t==='midnight'||t==='ember'||t==='dark'){a='dark';t='midnight';}else if(t==='daylight'){a='light';t='daylight';}else{a='dark';t='midnight';}var root=document.documentElement;root.setAttribute('data-theme',a);root.setAttribute('data-livv-theme',t);root.style.colorScheme=a;}catch(e){}})();`;
const PWA_BOOT=`(function(){try{if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(){});});}}catch(e){}})();`;
const BRAND_BOOT=`(function(){try{var dark=document.documentElement.getAttribute("data-theme")==="dark";var want=dark?"white":"black";var links=document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]');for(var i=0;i<links.length;i++){var link=links[i];var href=link.getAttribute("href")||"";if(href.indexOf("/api/icon")===-1)continue;link.media=href.indexOf("c="+want)===-1?"not all":"all";}var path=location.pathname;if(path!=="/"&&path!=="/auth")return;var files=path==="/auth"?["/brand/icon-flame-l-"+want+".png","/brand/wordmark-"+want+".png"]:["/brand/wordmark-"+want+".png"];for(var j=0;j<files.length;j++){var preload=document.createElement("link");preload.rel="preload";preload.as="image";preload.href=files[j];document.head.appendChild(preload);}}catch(e){}})();`;
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={`${body.variable} ${display.variable}`} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:APEX_HANDOFF_BOOT}}/><script dangerouslySetInnerHTML={{__html:THEME_BOOT}}/><script dangerouslySetInnerHTML={{__html:LANDING_SESSION_SCRIPT}}/><style>{`html[data-livv-landing-hold="1"] .livv-landing{visibility:hidden}`}</style><script dangerouslySetInnerHTML={{__html:PWA_BOOT}}/><link rel="icon" href="/api/icon?s=32&c=black" type="image/png" sizes="32x32" media="(prefers-color-scheme: light)"/><link rel="icon" href="/api/icon?s=32&c=white" type="image/png" sizes="32x32" media="(prefers-color-scheme: dark)"/><link rel="icon" href="/api/icon?s=64&c=black" type="image/png" sizes="64x64" media="(prefers-color-scheme: light)"/><link rel="icon" href="/api/icon?s=64&c=white" type="image/png" sizes="64x64" media="(prefers-color-scheme: dark)"/><link rel="apple-touch-icon" href="/api/icon?s=180&c=black&bg=1" sizes="180x180" media="(prefers-color-scheme: light)"/><link rel="apple-touch-icon" href="/api/icon?s=180&c=white&bg=1" sizes="180x180" media="(prefers-color-scheme: dark)"/><script dangerouslySetInnerHTML={{__html:BRAND_BOOT}}/></head><body className="min-h-dvh bg-[var(--livv-bg,#030405)] text-[rgb(var(--livv-fg))] antialiased"><ApexSessionHandoff /><FunnelProvider /><ThemeShell>{children}</ThemeShell></body></html>;}
