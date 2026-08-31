import type { Metadata, Viewport } from "next";
import { Outfit, Instrument_Serif } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const instrument = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
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
    <html lang="en" className={`${outfit.variable} ${instrument.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/api/icon?s=180" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-dvh bg-livv-black font-sans text-white antialiased">
        {children}
      </body>
    </html>
  );
}
