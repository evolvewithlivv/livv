import { readAttribution } from "./funnel-core.mjs";
import { getSupabaseBrowserClient } from "./supabase/client";

export type AccountReport =
  | { ok: true; distinctId: string; livvInternal: boolean; signupRecorded: boolean }
  | { ok: false };

/** Ask the server to record a new email account and return the internal flag. */
export async function reportVerifiedAccount(): Promise<AccountReport> {
  if (typeof window === "undefined") return { ok: false };
  const client = getSupabaseBrowserClient();
  if (!client) return { ok: false };
  const { data } = await client.auth.getSession();
  const token = data.session?.access_token || "";
  const distinctId = data.session?.user?.id || "";
  if (!token || !distinctId) return { ok: false };
  const attribution = readAttribution(window.sessionStorage);
  try {
    const response = await fetch("/api/analytics/signup", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(attribution),
      cache: "no-store",
      keepalive: true,
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return { ok: false };
    const payload = (await response.json()) as { livv_internal?: unknown; signup_recorded?: unknown };
    return {
      ok: true,
      distinctId,
      livvInternal: payload.livv_internal === true,
      signupRecorded: payload.signup_recorded === true,
    };
  } catch {
    return { ok: false };
  }
}
