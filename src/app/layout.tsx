import type { Metadata, Viewport } from "next";
import "./globals.css";

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
      { url: "/api/icon?s=32", sizes: "32x32", type: "image/png" },
      { url: "/api/icon?s=192", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/api/icon?s=180", sizes: "180x180", type: "image/png" }],
    shortcut: ["/api/icon?s=32"],
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
    <html lang="en">
      <body className="min-h-dvh bg-livv-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
