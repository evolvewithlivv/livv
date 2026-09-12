import { type AuthError, type User } from "@supabase/supabase-js";
import { DEFAULT_ACCENT, applyAppearance, type Identity } from "../identity";
import {
  loadAccounts,
  normalizeUsername,
  suggestUsername,
  type Account,
  type AuthProvider,
} from "../auth";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./client";
import { ensureAnonymousSession } from "./anon-session";

const SESSION_KEY = "livv-session-v1";
const ACCOUNTS_KEY = "livv-accounts-v1";
const IDENTITY_KEY = "livv-identity-v1";
const CLOUD_MAP_KEY = "livv-cloud-account-v1";

function saveAccounts(accounts: Account[]) {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function saveIdentity(account: Account) {
  const identity: Identity = {
    displayName: account.displayName,
    username: account.username,
    bio: account.bio,
    photo: account.photo,
    accent: account.accent,
    appearance: account.appearance,
    tier: account.tier,
    theme: account.theme,
    embers: account.embers,
  };
  window.localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  applyAppearance(account.appearance, account.accent);
}

function saveSession(accountId: string) {
  window.localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ accountId, signedInAt: Date.now() })
  );
  window.dispatchEvent(new Event("livv-auth"));
  window.dispatchEvent(new Event("livv-identity"));
}

function loadCloudMap(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(CLOUD_MAP_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveCloudMap(map: Record<string, string>) {
  window.localStorage.setItem(CLOUD_MAP_KEY, JSON.stringify(map));
}

function providerForUser(user: User, fallback?: AuthProvider): AuthProvider {
  const provider = user.app_metadata?.provider as string | undefined;
  if (provider === "phone") return "phone";
  if (provider === "email") return "email";
  return fallback || "email";
}

function metadataName(user: User) {
  const metadata = user.user_metadata || {};
  return (
    metadata.full_name ||
    metadata.name ||
    metadata.display_name ||
    metadata.preferred_username ||
    (user.email ? user.email.split("@")[0] : "") ||
    user.phone ||
    "Member"
  )
    .toString()
    .trim();
}

function metadataUsername(user: User) {
  const metadata = user.user_metadata || {};
  return (metadata.preferred_username || metadata.username || metadataName(user)).toString();
}

function photoForUser(user: User) {
  const metadata = user.user_metadata || {};
  const value = metadata.avatar_url || metadata.picture || metadata.photo_url || null;
  return typeof value === "string" && value.startsWith("http") ? value : null;
}

/** Map Supabase Auth errors to actionable copy. */
export function mapSupabaseAuthError(error: unknown, channel: "email" | "phone"): Error {
  if (!(error instanceof Error) && typeof error !== "object") {
    return new Error("Authentication failed. Try again.");
  }
  const err = error as AuthError & { message?: string; status?: number; code?: string };
  const message = (err.message || "").toLowerCase();
  const code = (err.code || "").toLowerCase();
  const status = err.status;

  if (!isSupabaseConfigured()) {
    return new Error(
      "LIVV authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Production."
    );
  }
  if (message.includes("rate limit") || message.includes("email rate limit") || code.includes("over_email_send_rate_limit")) {
    return new Error("Too many codes requested. Wait a minute, then try again.");
  }
  if (message.includes("sms") && (message.includes("not") || message.includes("provider"))) {
    return new Error(
      "SMS delivery is not configured in Supabase yet. Enable Phone auth and connect an SMS provider (e.g. Twilio) in the Supabase dashboard."
    );
  }
  if (
    message.includes("phone provider") ||
    message.includes("unsupported phone") ||
    message.includes("phone signups are disabled") ||
    (channel === "phone" && message.includes("provider is not enabled"))
  ) {
    return new Error(
      "Phone sign-in is disabled in Supabase. Enable Authentication → Providers → Phone and configure SMS."
    );
  }
  if (
    message.includes("error sending") ||
    message.includes("error sending confirmation") ||
    message.includes("error sending magic link") ||
    message.includes("error sending otp")
  ) {
    if (channel === "email") {
      return new Error(
        "Supabase could not send the email code. Check Auth email templates use {{ .Token }}, confirm Email provider is enabled, and review SMTP / rate limits in the Supabase dashboard."
      );
    }
    return new Error(
      "Supabase could not send the SMS code. Confirm Phone auth + SMS provider (Twilio, etc.) in the Supabase dashboard."
    );
  }
  if (message.includes("otp_expired") || message.includes("token has expired") || code === "otp_expired") {
    return new Error("That code expired or is invalid. Request a new code and try again.");
  }
  if (message.includes("invalid") && (message.includes("otp") || message.includes("token") || message.includes("code"))) {
    return new Error("That code is incorrect. Check the 6 digits and try again.");
  }
  if (message.includes("invalid") && message.includes("phone")) {
    return new Error("Enter a valid phone number with country code, e.g. +15551234567.");
  }
  if (status === 429) {
    return new Error("Too many attempts. Wait a minute, then try again.");
  }
  if (err.message && err.message.length > 8 && err.message.length < 180) {
    return new Error(err.message);
  }
  return new Error(
    channel === "email"
      ? "Could not complete email authentication. Check the code or try resending."
      : "Could not complete phone authentication. Check the code or try resending."
  );
}

/** Normalize to E.164-ish: keep leading +, digits only after. */
export function normalizePhoneE164(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  if (!hasPlus && digits.length === 10) return `+1${digits}`;
  if (!hasPlus && digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (hasPlus) return `+${digits}`;
  return `+${digits}`;
}

export async function materializeSupabaseUser(user: User, providerHint?: AuthProvider) {
  if (typeof window === "undefined") throw new Error("Authentication requires a browser");
  const provider = providerForUser(user, providerHint);
  const map = loadCloudMap();
  const mappedAccountId = map[user.id];
  const accounts = loadAccounts();
  let account = mappedAccountId
    ? accounts.find((item) => item.id === mappedAccountId) || null
    : null;

  if (!account) {
    const suggested = normalizeUsername(metadataUsername(user));
    const suggestedFromName = suggestUsername(metadataName(user), provider);
    const username =
      suggested.length >= 3
        ? suggestUsername(suggested, provider) === suggested
          ? suggested
          : suggestedFromName
        : suggestedFromName;
    account = {
      id: `supabase_${user.id}`,
      provider,
      email: user.email?.toLowerCase(),
      phone: user.phone || undefined,
      displayName: metadataName(user),
      username,
      usernameLocked: true,
      photo: photoForUser(user),
      accent: DEFAULT_ACCENT,
      appearance: "dark",
      tier: "spark",
      theme: "ember",
      embers: 0,
      bio: "",
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    };
    accounts.push(account);
  } else {
    account = {
      ...account,
      provider: account.provider || provider,
      email: user.email?.toLowerCase() || account.email,
      phone: user.phone || account.phone,
      photo: photoForUser(user) || account.photo,
      lastLoginAt: Date.now(),
    };
    const index = accounts.findIndex((item) => item.id === account!.id);
    if (index >= 0) accounts[index] = account;
  }

  saveAccounts(accounts);
  map[user.id] = account.id;
  saveCloudMap(map);
  saveSession(account.id);
  saveIdentity(account);
  return account;
}

export async function getAuthenticatedUser() {
  const client = getSupabaseBrowserClient();
  if (!client) return null;
  const { data, error } = await client.auth.getUser();
  if (error) return null;
  return data.user;
}

/** Email passwordless OTP (6-digit code). */
export async function startEmailAuth(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
    throw new Error("Enter a valid email address");
  }
  if (!isSupabaseConfigured()) {
    throw new Error(
      "LIVV authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Production."
    );
  }
  const client = getSupabaseBrowserClient();
  if (!client) {
    throw new Error(
      "LIVV authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Production."
    );
  }

  const { error } = await client.auth.signInWithOtp({
    email: cleanEmail,
    options: {
      shouldCreateUser: true,
      emailRedirectTo:
        typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
    },
  });
  if (error) throw mapSupabaseAuthError(error, "email");
  return { linked: false as const };
}

export async function verifyEmailAuth(email: string, token: string) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim().replace(/\s/g, "");
  if (!cleanEmail || !cleanEmail.includes("@")) throw new Error("Enter a valid email address");
  if (!/^\d{6}$/.test(cleanToken)) throw new Error("Enter the 6-digit code from your email");
  if (!isSupabaseConfigured()) {
    throw new Error(
      "LIVV authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Production."
    );
  }
  const client = getSupabaseBrowserClient();
  if (!client) {
    throw new Error(
      "LIVV authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Production."
    );
  }

  const { data, error } = await client.auth.verifyOtp({
    email: cleanEmail,
    token: cleanToken,
    type: "email",
  });
  if (error) throw mapSupabaseAuthError(error, "email");
  if (!data.user) throw new Error("Email verification did not return a user");
  return materializeSupabaseUser(data.user, "email");
}

/** Phone passwordless SMS OTP. */
export async function startPhoneAuth(phone: string) {
  const cleanPhone = normalizePhoneE164(phone);
  if (!cleanPhone || cleanPhone.replace(/\D/g, "").length < 8) {
    throw new Error("Enter a valid phone number with country code, e.g. +15551234567");
  }
  if (!isSupabaseConfigured()) {
    throw new Error(
      "LIVV authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Production."
    );
  }
  const client = getSupabaseBrowserClient();
  if (!client) {
    throw new Error(
      "LIVV authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Production."
    );
  }

  const { error } = await client.auth.signInWithOtp({
    phone: cleanPhone,
    options: { shouldCreateUser: true },
  });
  if (error) throw mapSupabaseAuthError(error, "phone");
  return { linked: false as const, phone: cleanPhone };
}

export async function verifyPhoneAuth(phone: string, token: string) {
  const cleanPhone = normalizePhoneE164(phone);
  const cleanToken = token.trim().replace(/\s/g, "");
  if (!cleanPhone || cleanPhone.replace(/\D/g, "").length < 8) {
    throw new Error("Enter a valid phone number with country code, e.g. +15551234567");
  }
  if (!/^\d{6}$/.test(cleanToken)) throw new Error("Enter the 6-digit code from your text");
  if (!isSupabaseConfigured()) {
    throw new Error(
      "LIVV authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Production."
    );
  }
  const client = getSupabaseBrowserClient();
  if (!client) {
    throw new Error(
      "LIVV authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Production."
    );
  }

  const { data, error } = await client.auth.verifyOtp({
    phone: cleanPhone,
    token: cleanToken,
    type: "sms",
  });
  if (error) throw mapSupabaseAuthError(error, "phone");
  if (!data.user) throw new Error("Phone verification did not return a user");
  return materializeSupabaseUser(data.user, "phone");
}

/** Legacy callback verifier for previously issued email links. */
export async function finishSupabaseCallback(code?: string) {
  const client = getSupabaseBrowserClient();
  if (!client) {
    throw new Error(
      "LIVV authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Production."
    );
  }
  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) throw mapSupabaseAuthError(error, "email");
  }
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Authentication completed without a session");
  return materializeSupabaseUser(user);
}

export async function ensureCloudAuthForCurrentBrowser() {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabaseBrowserClient();
  if (!client) return null;
  const user = await getAuthenticatedUser();
  if (user && !user.is_anonymous) return materializeSupabaseUser(user);
  await ensureAnonymousSession();
  return null;
}
