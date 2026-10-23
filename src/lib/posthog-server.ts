import "server-only";
import { PostHog } from "posthog-node";
import { accountIdentify, signupCapture } from "./signup-analytics.mjs";

function clean(value: string | undefined) {
  return (value || "").trim().replace(/^['"]|['"]$/g, "");
}

export async function flushAccountAnalytics(input: {
  distinctId: string;
  attribution: Record<string, unknown> | null;
  livvInternal: boolean;
  recordSignup: boolean;
}): Promise<boolean> {
  const key = clean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
  if (!key || !input.distinctId) return false;
  const host = clean(process.env.NEXT_PUBLIC_POSTHOG_HOST) || "https://us.i.posthog.com";
  const client = new PostHog(key, {
    host,
    flushAt: 1,
    flushInterval: 0,
  });
  try {
    const identify = accountIdentify(input.distinctId, input.livvInternal);
    await client.identifyImmediate({ ...identify, disableGeoip: true });
    if (input.recordSignup) {
      const capture = signupCapture(input.distinctId, input.attribution, input.livvInternal);
      await client.captureImmediate({ ...capture, disableGeoip: true, sendFeatureFlags: false });
    }
    await client.shutdown();
    return true;
  } catch {
    try {
      await client.shutdown();
    } catch {
      /* The function is ending. A second shutdown failure is ignored. */
    }
    return false;
  }
}
