import { adoptStashedHandoff, handoffRefreshErrorIsBenign } from "./www-handoff-core.mjs";
import { getSupabaseBrowserClient } from "./supabase/client";

let inflight: Promise<void> | null = null;

type HandoffTokens = { access_token: string; refresh_token: string };
type RefreshAuth = {
  stopAutoRefresh: () => Promise<void>;
  startAutoRefresh: () => Promise<void>;
  _startAutoRefresh?: () => Promise<void>;
  getSession: () => Promise<{ data: { session: unknown } }>;
  setSession: (tokens: HandoffTokens) => Promise<{ error: unknown }>;
};

/**
 * Adopt a www session that arrived in the URL fragment.
 * The fragment is already removed by the head script.
 *
 * The browser client recovers its own stored session first and, inside the
 * expiry margin, refreshes that refresh token. setSession with the fragment
 * would use the same token again and Supabase answers 400. When this origin
 * already has a valid session for the same user, the fragment is ignored.
 * A 400 from a refresh that lost the race is ignored while that session remains.
 * Nothing here signs the member out.
 */
export function consumeApexHandoff(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!inflight) inflight = adoptHandoff();
  return inflight;
}

function handoffPending() {
  return Boolean((window as Window & { __livvHandoff?: unknown }).__livvHandoff);
}

async function restartAutoRefresh(auth: RefreshAuth) {
  if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
  if (typeof auth._startAutoRefresh === "function") {
    await auth._startAutoRefresh();
    return;
  }
  await auth.startAutoRefresh();
}

async function adoptHandoff() {
  try {
    const client = getSupabaseBrowserClient();
    // Wait until recovery (and its single refresh) has finished so the skip
    // check sees the rotated session instead of the pre-refresh token.
    if (client && handoffPending()) await client.auth.getSession();
    await adoptStashedHandoff(window, async (tokens: HandoffTokens) => {
      if (!client) return;
      const auth = client.auth as unknown as RefreshAuth;
      try {
        await auth.stopAutoRefresh();
        const { error } = await auth.setSession({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
        });
        if (!error) return;
        const { data } = await auth.getSession();
        if (handoffRefreshErrorIsBenign(error, data.session, tokens)) return;
      } finally {
        try {
          await restartAutoRefresh(auth);
        } catch {
          /* The visibility handler starts the ticker again when the tab is shown. */
        }
      }
    });
  } catch {
    /* Invalid or expired handoff. The fragment is already gone. The stored session stays. */
  }
}
