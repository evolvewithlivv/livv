/**
 * Product updates on Home.
 * Short. Factual. Ship-relevant. Not a marketing feed.
 */

export type Announcement = {
  id: string;
  label: string;
  title: string;
  body: string;
  href?: string;
  cta?: string;
};

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "v1-free-core",
    label: "Now",
    title: "The full system is free.",
    body: "Daily, Train, Health, and Embers — same for everyone. No tiers. Collection funds the work.",
    href: "/home/shop",
    cta: "Collection",
  },
  {
    id: "embers-1x",
    label: "Embers",
    title: "Show up. Earn the same.",
    body: "Embers come from real actions, at one rate for every user. Redeem on Collection — never cash.",
    href: "/home/shop",
    cta: "Your balance",
  },
];
