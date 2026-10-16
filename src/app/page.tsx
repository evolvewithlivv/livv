import type { Metadata } from "next";
import Script from "next/script";
import { LandingSignedInEntry } from "@/components/landing/signed-in-entry";
import "./landing.css";

const THESIS = "A system for becoming more capable in real life.";
const DESCRIPTION = "A system for becoming more capable in real life. The core is free.";
const CANONICAL = "https://evolvewithlivv.com";

export const metadata: Metadata = {
  title: { absolute: "LIVV · A system for becoming more capable in real life." },
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: "website",
    siteName: "LIVV",
    title: "LIVV",
    description: THESIS,
    url: CANONICAL,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "LIVV" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LIVV",
    description: THESIS,
    images: ["/opengraph-image"],
  },
};

export default function RootPage() {
  return (
    <main className="livv-landing">
      <LandingSignedInEntry />
      <div className="livv-landing-inner">
        <p className="livv-landing-mark">LIVV</p>
        <h1>{THESIS}</h1>
        <ul className="livv-landing-lines">
          <li><strong>Body.</strong> Train, move, and keep a record of the work.</li>
          <li><strong>Mind.</strong> Decide, focus, and write down what is true.</li>
          <li><strong>Life.</strong> Learn the skills to grow, keep, and repair.</li>
        </ul>
        <p className="livv-landing-free">The core is free.</p>
        <div className="livv-landing-actions">
          <a className="livv-landing-primary" href="/auth?mode=create" data-landing-event="cta_start_click" data-landing-position="primary">
            Create account
          </a>
          <a className="livv-landing-secondary" href="/auth" data-landing-event="cta_start_click" data-landing-position="secondary">
            Sign in
          </a>
        </div>
      </div>
      {process.env.NODE_ENV === "production" ? (
        <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
      ) : null}
    </main>
  );
}
