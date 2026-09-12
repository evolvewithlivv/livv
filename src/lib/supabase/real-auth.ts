import { type AuthError, type User } from "@supabase/supabase-js";
import { DEFAULT_ACCENT, applyAppearance, type Identity } from "../identity";
import { loadAccounts, normalizeUsername, suggestUsername, type Account, type AuthProvider } from "../auth";
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
  window.localStorage.setItem(SESSION_KEY, JSON.stringify({ accountId, signedInAt: Date.now() }));
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

function metadataName(user: User) {
  const metadata = user.user_metadata || {};
  return (
    metadata.full_name ||
    metadata.name ||
    metadata.display_name ||
    metadata.preferred_username ||
    (user.email ? user.email.split("@")[0] : "") ||
    "Member"
  ).toString().trim();
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

export function mapSupabaseAuthError(error: unknown): Error {
  if (!(error instanceof Error) && typeof error !== "object") return new Error("Authentication failed. Try again.");
  const err = error as AuthError & { message?: string; status?: number; code?: string };
  const message = (err.message || "").toLowerCase();
  const code = (err.code || "").toLowerCase();
  const status = err.status;

  if (!isSupabaseConfigured()) {
    return new Error("LIVV authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Production.");
  }
  if (message.includes("rate limit") || message.includes("email rate limit") || code.includes("over_email_send_rate_limit")) {
    return new Error("Too many codes requested. Wait a minute, then try again.");
  }
  if (message.includes("error sending") || message.includes("error sending confirmation") || message.includes("error sending magic link") || message.includes("error sending otp")) {
    return new Error("Supabase could not send the email code. Check the email template includes {{ .Token }}, confirm Email provider is enabled, and review SMTP / rate limits in the Supabase dashboard.");
  }
  if (message.includes("otp_expired") || message.includes("token has expired") || code === "otp_expired") {
    return new Error("That code expired or is invalid. Request a new code and try again.");
  }
  if (message.includes("invalid") && (message.includes("otp") || message.includes("token") || message.includes("code"))) {
    return new Error("That code is incorrect. Check the 8 digits and try again.");
  }
  if (status === 429) return new Error("Too many attempts. Wait a minute, then try again.");
  if (err.message && err.message.length > 8 && err.message.length < 180) return new Error(err.message);
  return new Error("Could not complete email authentication. Check the code or try resending.");
}

export async function materializeSupabaseUser(user: User, providerHint: AuthProvider = "email") {
  if (typeof window === "undefined") throw new Error("Authentication requires a browser");
  const map = loadCloudMap();
  const mappedAccountId = map[user.id];
  const accounts = loadAccounts();
  let account = mappedAccountId ? accounts.find((item) => item.id === mappedAccountId) || null : null;

  if (!account) {
    const suggested = normalizeUsername(metadataUsername(user));
    const suggestedFromName = suggestUsername(metadataName(user), providerHint);
    const username = suggested.length >= 3 ? (suggestUsername(suggested, "email") === suggested ? suggested : suggestedFromName) : suggestedFromName;
    account = {
      id: `supabase_${user.id}`,
      provider: "email",
      email: user.email?.toLowerCase(),
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
      provider: "email",
      email: user.email?.toLowerCase() || account.email,
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

export async function startEmailAuth(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) throw new Error("Enter a valid email address");
  if (!isSupabaseConfigured()) throw new Error("LIVV authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Production.");
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("LIVV authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Production.");
  const { error } = await client.auth.signInWithOtp({
    email: cleanEmail,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
    },
  });
  if (error) throw mapSupabaseAuthError(error);
  return { linked: false as const };
}

export async function verifyEmailAuth(email: string, token: string) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim().replace(/\s/g, "");
  if (!cleanEmail || !cleanEmail.includes("@")) throw new Error("Enter a valid email address");
  if (!/^\d{8}$/.test(cleanToken)) throw new Error("Enter the 8-digit code from your email");
  if (!isSupabaseConfigured()) throw new Error("LIVV authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Production.");
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("LIVV authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Production.");
  const { data, error } = await client.auth.verifyOtp({ email: cleanEmail, token: cleanToken, type: "email" });
  if (error) throw mapSupabaseAuthError(error);
  if (!data.user) throw new Error("Email verification did not return a user");
  return materializeSupabaseUser(data.user, "email");
}

export async function finishSupabaseCallback(code?: string) {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("LIVV authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Production.");
  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) throw mapSupabaseAuthError(error);
  }
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Authentication completed without a session");
  return materializeSupabaseUser(user, "email");
}

export async function ensureCloudAuthForCurrentBrowser() {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabaseBrowserClient();
  if (!client) return null;
  const user = await getAuthenticatedUser();
  if (user && !user.is_anonymous) return materializeSupabaseUser(user, "email");
  await ensureAnonymousSession();
  return null;
}
