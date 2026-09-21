import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";
import "./livv-background.css";
import "./livv-final-pass.css";
import "./livv-visual-redesign.css";
import "./livv-professional.css";
import { ThemeShell } from "@/components/layout/theme-shell";

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
      { url: "/api/icon?s=32", sizes: "32x32", type: "image/png" },
      { url: "/api/icon?s=64", sizes: "64x64", type: "image/png" },
    ],
    apple: [{ url: "/api/icon?s=180", sizes: "180x180" }],
    shortcut: ["/api/icon?s=32"],
  },
  other: { "mobile-web-app-capable": "yes" },
};
export const viewport:Viewport={width:"device-width",initialScale:1,maximumScale:5,viewportFit:"cover",themeColor:[{media:"(prefers-color-scheme: light)",color:"#f7f7f5"},{media:"(prefers-color-scheme: dark)",color:"#090a0c"}]};
const THEME_BOOT=`(function(){try{var a='dark';var raw=localStorage.getItem('livv-identity-v1');if(raw){var p=JSON.parse(raw);if(p&&p.appearance)a=p.appearance;}var mode=a==='light'?'light':a==='system'?(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):'dark';document.documentElement.setAttribute('data-theme',mode);document.documentElement.style.colorScheme=mode;}catch(e){}})();`;
const PWA_BOOT=`(function(){try{if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(){});});}}catch(e){}})();`;
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={`${body.variable} ${display.variable}`} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:THEME_BOOT}}/><script dangerouslySetInnerHTML={{__html:PWA_BOOT}}/><link rel="apple-touch-icon" href="/api/icon?s=180" sizes="180x180"/><link rel="icon" href="/api/icon?s=32" type="image/png" sizes="32x32"/><link rel="icon" href="/api/icon?s=64" type="image/png" sizes="64x64"/></head><body className="min-h-dvh bg-[var(--livv-bg)] text-[rgb(var(--livv-fg))] antialiased"><ThemeShell>{children}</ThemeShell></body></html>;}
