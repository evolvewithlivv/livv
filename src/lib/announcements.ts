/**
 * Product announcements for the Home screen.
 * Keep short, factual, and ship-relevant — not marketing spam.
 */

export type Announcement = {
  id: string;
  date: string;
  title: string;
  body: string;
  href?: string;
  cta?: string;
};

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "v1-free-core",
    date: "2026-10",
    title: "LIVV is free for everyone.",
    body: "No membership tiers. Same Daily, Train, Health, and Embers for every user. Collection is how we fund the work.",
    href: "/home/shop",
    cta: "See Collection",
  },
  {
    id: "embers-1x",
    date: "2026-10",
    title: "Embers track showing up.",
    body: "Earn them through real actions at the same rate for everyone. Redeem on Collection when pieces drop — never as cash.",
    href: "/home/shop",
    cta: "Your Embers",
  },
  {
    id: "core-rooms",
    date: "2026-09",
    title: "Daily, Train, and Health are the system.",
    body: "Home is the front door. The work lives in the tabs — a few real moves, a body you can rely on, and a baseline that holds.",
  },
];
