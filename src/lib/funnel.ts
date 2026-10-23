"use client";

import posthog from "posthog-js";
import {
  QUEUE_KEY,
  cleanToken,
  enqueue,
  errorCodeFromMessage,
  isPiiKey,
  readAttribution,
  scrubHandoffValue,
  takeQueue,
} from "./funnel-core.mjs";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
const IDENTIFY_KEY = "livv-identify-v1";

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

export function identifyFunnelUser(distinctId: string, livvInternal?: boolean) {
  if (typeof window === "undefined") return;
  const id = cleanToken(distinctId);
  if (!id) return;
  const record: { id: string; livv_internal?: boolean } = { id };
  if (livvInternal === true || livvInternal === false) record.livv_internal = livvInternal;
  try {
    window.sessionStorage.setItem(IDENTIFY_KEY, JSON.stringify(record));
  } catch {
    /* private mode */
  }
  flushIdentify();
}

function flushIdentify() {
  if (typeof window === "undefined" || !posthog.__loaded) return;
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(IDENTIFY_KEY);
  } catch {
    return;
  }
  if (!raw) return;
  let parsed: { id?: unknown; livv_internal?: unknown } | null = null;
  try {
    parsed = JSON.parse(raw) as { id?: unknown; livv_internal?: unknown };
  } catch {
    try { window.sessionStorage.removeItem(IDENTIFY_KEY); } catch { /* private mode */ }
    return;
  }
  const id = cleanToken(typeof parsed?.id === "string" ? parsed.id : "");
  if (!id) {
    try { window.sessionStorage.removeItem(IDENTIFY_KEY); } catch { /* private mode */ }
    return;
  }
  const flag = parsed?.livv_internal;
  if (flag === true || flag === false) posthog.identify(id, { livv_internal: flag });
  else posthog.identify(id);
  try { window.sessionStorage.removeItem(IDENTIFY_KEY); } catch { /* private mode */ }
}

export function funnelErrorCode(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  return errorCodeFromMessage(message);
}

export function flushFunnel() {
  if (typeof window === "undefined" || !posthog.__loaded) return;
  flushIdentify();
  const queued = takeQueue(storage()) as Array<{ event: string; props: Record<string, string | boolean> } | null>;
  for (const item of queued) {
    if (!item) continue;
    posthog.capture(item.event, item.props, { transport: "sendBeacon" });
  }
}

export function initFunnel() {
  if (started || typeof window === "undefined" || !POSTHOG_KEY) return;
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
    advanced_disable_feature_flags: true,
    before_send: (event) => {
      if (!event) return event;
      const properties = {
        ...readAttribution(window.sessionStorage),
        ...(event.properties || {}),
      } as Record<string, unknown>;
      for (const key of Object.keys(properties)) {
        // PostHog drops the event if properties.token is removed. That value is the public project key.
        if (key !== "token" && isPiiKey(key)) {
          delete properties[key];
          continue;
        }
        properties[key] = scrubHandoffValue(properties[key]);
      }
      event.properties = properties;
      return event;
    },
    loaded: () => {
      flushIdentify();
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
