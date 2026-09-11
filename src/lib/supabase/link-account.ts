/**
 * A3-4 · Upgrade the current anonymous Supabase user with email + password.
 *
 * Uses auth.updateUser so auth.users.id stays the same.
 * Never calls signUp() (would create a second user).
 * Never merges accounts. Never clears local product data.
 */

import { ensureAnonymousSession, getAnonSessionState } from "./anon-session";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./client";

export type LinkAccountSuccess = {
  ok: true;
  userId: string;
  email: string;
  /** True when Supabase still expects the user to confirm the email. */
  confirmationRequired: boolean;
};

export type LinkAccountFailure = {
  ok: false;
  code:
    | "not_configured"
    | "no_session"
    | "already_linked"
    | "email_taken"
    | "weak_password"
    | "invalid_email"
    | "unknown";
  message: string;
};

export type LinkAccountResult = LinkAccountSuccess | LinkAccountFailure;

function normalizeEmail(raw: string) {
  return raw.trim().toLowerCase();
}

function mapUpdateError(message: string): LinkAccountFailure {
  const m = message.toLowerCase();
  if (
    m.includes("already") ||
    m.includes("registered") ||
    m.includes("exists") ||
    m.includes("taken")
  ) {
    return {
      ok: false,
      code: "email_taken",
      message:
        "That email is already registered. Sign in with that account instead — we will not merge accounts.",
    };
  }
  if (m.includes("password") && (m.includes("weak") || m.includes("least") || m.includes("short") || m.includes("6"))) {
    return {
      ok: false,
      code: "weak_password",
      message: "Password must be at least 6 characters.",
    };
  }
  if (m.includes("email") && (m.includes("invalid") || m.includes("format"))) {
    return {
      ok: false,
      code: "invalid_email",
      message: "Enter a valid email address.",
    };
  }
  return {
    ok: false,
    code: "unknown",
    message: message || "Could not save account.",
  };
}

/**
 * Attach email + password to the current Supabase session user (anonymous upgrade).
 * Preserves auth.users.id. Does not sign out. Does not touch localStorage product keys.
 */
export async function linkEmailPasswordToCurrentUser(
  emailRaw: string,
  password: string
): Promise<LinkAccountResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      code: "not_configured",
      message: "Cloud identity is not configured on this deployment.",
    };
  }

  const email = normalizeEmail(emailRaw);
  if (!email || !email.includes("@")) {
    return {
      ok: false,
      code: "invalid_email",
      message: "Enter a valid email address.",
    };
  }
  if (!password || password.length < 6) {
    return {
      ok: false,
      code: "weak_password",
      message: "Password must be at least 6 characters.",
    };
  }

  const ensured = await ensureAnonymousSession();
  if (ensured.status !== "ready" || !ensured.userId) {
    return {
      ok: false,
      code: "no_session",
      message: "No active identity session. Open LIVV again and retry.",
    };
  }

  const client = getSupabaseBrowserClient();
  if (!client) {
    return {
      ok: false,
      code: "not_configured",
      message: "Cloud identity is not configured on this deployment.",
    };
  }

  const { data: userData, error: userErr } = await client.auth.getUser();
  if (userErr || !userData.user) {
    return {
      ok: false,
      code: "no_session",
      message: userErr?.message || "No active identity session.",
    };
  }

  const beforeId = userData.user.id;
  if (beforeId !== ensured.userId) {
    // Keep a single source of truth; refuse if state drifted.
    return {
      ok: false,
      code: "unknown",
      message: "Session mismatch. Reload and try again.",
    };
  }

  // Already a permanent (non-anonymous) user with email — do not create another user.
  const isAnon = userData.user.is_anonymous === true;
  if (!isAnon && userData.user.email) {
    return {
      ok: false,
      code: "already_linked",
      message: "This identity is already protected with email.",
    };
  }

  // CRITICAL: updateUser upgrades the current user. Never signUp here.
  const { data, error } = await client.auth.updateUser({
    email,
    password,
  });

  if (error) {
    return mapUpdateError(error.message);
  }

  const afterId = data.user?.id ?? beforeId;
  if (afterId !== beforeId) {
    return {
      ok: false,
      code: "unknown",
      message: "Identity id changed unexpectedly. Linking aborted.",
    };
  }

  // Keep module session state aligned (same id).
  const state = getAnonSessionState();
  if (state.status === "ready") {
    // userId unchanged; nothing to rewrite beyond confirming ready.
  }

  // Confirmation pending: email may be on user.email or awaiting confirm (new_email / unconfirmed).
  const confirmedAt = data.user?.email_confirmed_at;
  const confirmationRequired = !confirmedAt;

  return {
    ok: true,
    userId: beforeId,
    email,
    confirmationRequired,
  };
}
