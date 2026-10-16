import { adoptStashedHandoff } from "./www-handoff-core.mjs";
import { getSupabaseBrowserClient } from "./supabase/client";

let inflight: Promise<void> | null = null;

/**
 * Adopt a www session that arrived in the URL fragment.
 * The fragment is already removed by the head script. setSession persists it
 * on this origin. Failures continue signed out and are not logged.
 */
export function consumeApexHandoff(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!inflight) inflight = adoptHandoff();
  return inflight;
}

async function adoptHandoff() {
  try {
    const client = getSupabaseBrowserClient();
    await adoptStashedHandoff(window, async (tokens: { access_token: string; refresh_token: string }) => {
      if (!client) return;
      await client.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });
    });
  } catch {
    /* Invalid or expired handoff. The fragment is already gone. */
  }
}
