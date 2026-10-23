import { NextResponse, type NextRequest } from "next/server";
import { isLivvInternalEmail } from "@/lib/livv-internal";
import { flushAccountAnalytics } from "@/lib/posthog-server";
import { isUuid, readJsonLimited, requestActor, takeRateLimit } from "@/lib/request-guards";
import { shouldRecordSignup } from "@/lib/signup-analytics.mjs";
import { markSignupRecorded } from "@/lib/signup-record";
import { getVerifiedSupabaseUser } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

function bearer(req: NextRequest) {
  const header = req.headers.get("authorization") || "";
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
}

export async function POST(req: NextRequest) {
  const limited = takeRateLimit(`signup-analytics:${requestActor(req.headers)}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "rate_limit" },
      { status: 429, headers: { ...NO_STORE, "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const user = await getVerifiedSupabaseUser(req);
  if (!user || !isUuid(user.id)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: NO_STORE });
  }

  const parsed = await readJsonLimited(req, 2048);
  if (!parsed.ok) {
    return NextResponse.json({ error: "invalid" }, { status: parsed.status, headers: NO_STORE });
  }

  if (!user.email || user.isAnonymous) {
    return NextResponse.json({ livv_internal: false, signup_recorded: false }, { headers: NO_STORE });
  }

  const livvInternal = isLivvInternalEmail(user.email);
  const record = shouldRecordSignup({
    email: user.email,
    is_anonymous: user.isAnonymous,
    created_at: user.createdAt,
    email_confirmed_at: user.emailConfirmedAt,
    app_metadata: user.appMetadata,
    user_metadata: user.userMetadata,
  });
  const attribution = parsed.value && typeof parsed.value === "object" ? (parsed.value as Record<string, unknown>) : null;
  const sent = await flushAccountAnalytics({
    distinctId: user.id,
    attribution,
    livvInternal,
    recordSignup: record,
  });

  let signupRecorded = false;
  if (record && sent) {
    signupRecorded = true;
    await markSignupRecorded(user.id, user.appMetadata, user.userMetadata, bearer(req));
  }

  return NextResponse.json(
    { livv_internal: livvInternal, signup_recorded: signupRecorded },
    { headers: NO_STORE },
  );
}
