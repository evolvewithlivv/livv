"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

function landingPageviewOnly(event: BeforeSendEvent): BeforeSendEvent | null {
  if (event.type !== "pageview") return null;
  try {
    const path = new URL(event.url, "https://evolvewithlivv.com").pathname;
    if (path !== "/") return null;
  } catch {
    return null;
  }
  return event;
}

/** Cookieless Vercel Web Analytics pageview for the public landing only. */
export function LandingAnalytics() {
  return <Analytics beforeSend={landingPageviewOnly} />;
}
