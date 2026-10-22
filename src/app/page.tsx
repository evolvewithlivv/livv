import type { Metadata } from "next";
import Script from "next/script";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { LandingSignedInEntry } from "@/components/landing/signed-in-entry";
import { Button } from "@/components/ui/button";
import { sanitizeTrafficSource } from "@/lib/attribution";
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

function first(value: string | string[] | undefined): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? null;
  return null;
}

export default async function RootPage({ searchParams }: { searchParams: Promise<{ src?: string | string[] }> }) {
  const params = await searchParams;
  const src = sanitizeTrafficSource(first(params.src));
  const createHref = src ? `/auth?mode=create&src=${encodeURIComponent(src)}` : "/auth?mode=create";
  return (
    <main className="livv-landing">
      <LandingSignedInEntry />
      <aside className="livv-landing-desk">
        <BrandLockup priority />
        <h1>{THESIS}</h1>
      </aside>
      <div className="livv-landing-stage">
        <ul className="livv-landing-lines">
          <li><strong>Body.</strong> Train, move, and keep a record of the work.</li>
          <li><strong>Mind.</strong> Decide, focus, and write down what is true.</li>
          <li><strong>Life.</strong> Learn the skills to grow, keep, and repair.</li>
        </ul>
        <p className="livv-landing-free">The core is free.</p>
        <div className="livv-landing-actions">
          <Button href={createHref} className="livv-landing-primary" data-landing-event="cta_start_click" data-landing-position="primary">
            Create account
          </Button>
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
