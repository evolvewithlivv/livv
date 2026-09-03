import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";
import { ThemeShell } from "@/components/layout/theme-shell";

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LIVV",
  description: "Evolve. Train. Connect. Progress.",
  applicationName: "LIVV",
  appleWebApp: {
    capable: true,
    title: "LIVV",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/api/icon?s=32", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/api/icon?s=180", sizes: "180x180", type: "image/png" }],
    shortcut: ["/api/icon?s=32"],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/api/icon?s=180" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-dvh text-white antialiased">
        <ThemeShell>{children}</ThemeShell>
      </body>
    </html>
  );
}
