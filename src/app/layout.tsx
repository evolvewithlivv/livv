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
      { url: "/api/icon?s=192", sizes: "192x192", type: "image/png" },
      { url: "/api/icon?s=512", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/api/icon?s=180", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#090a0c" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${body.variable} ${display.variable}`}>
      <body className="min-h-dvh font-sans antialiased">
        <ThemeShell>{children}</ThemeShell>
      </body>
    </html>
  );
}
