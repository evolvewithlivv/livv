"use client";

import posthog from "posthog-js";
import {
  QUEUE_KEY,
  SIGNUP_KEY,
  claimOnce,
  enqueue,
  errorCodeFromMessage,
  isNewAccount,
  isPiiKey,
  readAttribution,
  takeQueue,
} from "./funnel-core.mjs";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || "phc_Dfy3Yy6gyQbKxve6bDCsHzJ4uMacQJ7nkf2HbPkTMcHi";
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let started = false;

function storage() {
  return window.sessionStorage;
}

export function track(name: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const attr = readAttribution(storage());
  enqueue(storage(), name, { ...attr, ...props });
  flushFunnel();
}

export function trackSignupCompleted(createdAt: string | null | undefined) {
  if (typeof window === "undefined") return;
  if (!isNewAccount(createdAt)) return;
  if (!claimOnce(window.localStorage, SIGNUP_KEY)) return;
  track("signup_completed");
}

export function funnelErrorCode(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  return errorCodeFromMessage(message);
}

export function flushFunnel() {
  if (typeof window === "undefined" || !posthog.__loaded) return;
  const queued = takeQueue(storage()) as Array<{ event: string; props: Record<string, string> } | null>;
  for (const item of queued) {
    if (!item) continue;
    posthog.capture(item.event, item.props, { transport: "sendBeacon" });
  }
}

export function initFunnel() {
  if (started || typeof window === "undefined") return;
  started = true;
  posthog.init(POSTHOG_KEY, {
    api_host: "/ingest",
    ui_host: POSTHOG_HOST.includes("us.i.posthog.com") ? "https://us.posthog.com" : POSTHOG_HOST,
    autocapture: false,
    rageclick: false,
    capture_dead_clicks: false,
    capture_heatmaps: false,
    capture_performance: false,
    capture_pageview: "history_change",
    capture_pageleave: false,
    disable_session_recording: true,
    disable_surveys: true,
    disable_surveys_automatic_display: true,
    person_profiles: "identified_only",
    persistence: "localStorage",
    disable_cookie: true,
    advanced_disable_feature_flags: true,
    before_send: (event) => {
      if (!event) return event;
      const properties = {
        ...readAttribution(window.sessionStorage),
        ...(event.properties || {}),
      } as Record<string, unknown>;
      for (const key of Object.keys(properties)) {
        if (isPiiKey(key)) delete properties[key];
      }
      return { ...event, properties };
    },
    loaded: () => {
      flushFunnel();
    },
  });
  window.__livvTrack = (name: string, props?: Record<string, unknown>) => track(name, props);
  window.addEventListener("livv-funnel-flush", flushFunnel);
}

declare global {
  interface Window {
    __livvTrack?: (name: string, props?: Record<string, unknown>) => void;
  }
}

export { QUEUE_KEY };
