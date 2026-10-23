import "server-only";
import { signupMetadataPatch } from "./signup-analytics.mjs";
import { getSupabaseAdmin } from "./supabase/admin";

function clean(value: string | undefined) {
  return (value || "").trim().replace(/^['"]|['"]$/g, "");
}

/** Mark the account so a later sign-in does not capture signup_completed again. */
export async function markSignupRecorded(
  userId: string,
  appMetadata: Record<string, unknown> | null,
  userMetadata: Record<string, unknown> | null,
  accessToken: string,
): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (admin) {
    try {
      const { error } = await admin.auth.admin.updateUserById(userId, {
        app_metadata: signupMetadataPatch(appMetadata),
      });
      if (!error) return true;
    } catch {
      /* Fall through to the signed-in user metadata write. */
    }
  }

  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!url || !anonKey || !accessToken) return false;
  try {
    const response = await fetch(`${url}/auth/v1/user`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: signupMetadataPatch(userMetadata) }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
