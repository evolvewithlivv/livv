import { type User } from "@supabase/supabase-js";
import { DEFAULT_ACCENT, applyAppearance, type Identity } from "../identity";
import { loadAccounts, normalizeUsername, suggestUsername, type Account, type AuthProvider } from "../auth";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./client";
import { ensureAnonymousSession } from "./anon-session";

const SESSION_KEY = "livv-session-v1";
const ACCOUNTS_KEY = "livv-accounts-v1";
const IDENTITY_KEY = "livv-identity-v1";
const CLOUD_MAP_KEY = "livv-cloud-account-v1";

function saveAccounts(accounts: Account[]) { window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); }
function saveIdentity(account: Account) {
  const identity: Identity = { displayName: account.displayName, username: account.username, bio: account.bio, photo: account.photo, accent: account.accent, appearance: account.appearance, tier: account.tier, theme: account.theme, embers: account.embers };
  window.localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity)); applyAppearance(account.appearance, account.accent);
}
function saveSession(accountId: string) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify({ accountId, signedInAt: Date.now() }));
  window.dispatchEvent(new Event("livv-auth")); window.dispatchEvent(new Event("livv-identity"));
}
function loadCloudMap(): Record<string, string> { try { const raw = window.localStorage.getItem(CLOUD_MAP_KEY); return raw ? (JSON.parse(raw) as Record<string, string>) : {}; } catch { return {}; } }
function saveCloudMap(map: Record<string, string>) { window.localStorage.setItem(CLOUD_MAP_KEY, JSON.stringify(map)); }
function providerForUser(user: User, fallback?: AuthProvider): AuthProvider { const provider = user.app_metadata?.provider as string | undefined; if (provider === "phone") return "phone"; if (provider === "email") return "email"; return fallback || "email"; }
function metadataName(user: User) { const metadata = user.user_metadata || {}; return (metadata.full_name || metadata.name || metadata.display_name || metadata.preferred_username || (user.email ? user.email.split("@")[0] : "") || user.phone || "Member").toString().trim(); }
function metadataUsername(user: User) { const metadata = user.user_metadata || {}; return (metadata.preferred_username || metadata.username || metadataName(user)).toString(); }
function photoForUser(user: User) { const metadata = user.user_metadata || {}; return (metadata.avatar_url || metadata.picture || metadata.photo_url || null) as string | null; }

export async function materializeSupabaseUser(user: User, providerHint?: AuthProvider) {
  if (typeof window === "undefined") throw new Error("Authentication requires a browser");
  const provider = providerForUser(user, providerHint); const map = loadCloudMap(); const mappedAccountId = map[user.id]; const accounts = loadAccounts();
  let account = mappedAccountId ? accounts.find((item) => item.id === mappedAccountId) || null : null;
  if (!account) {
    const suggested = normalizeUsername(metadataUsername(user)); const suggestedFromName = suggestUsername(metadataName(user), provider);
    const username = suggested.length >= 3 ? (suggestUsername(suggested, provider) === suggested ? suggested : suggestedFromName) : suggestedFromName;
    account = { id: `supabase_${user.id}`, provider, email: user.email?.toLowerCase(), phone: user.phone || undefined, displayName: metadataName(user), username, usernameLocked: true, photo: photoForUser(user), accent: DEFAULT_ACCENT, appearance: "dark", tier: "spark", theme: "ember", embers: 0, bio: "", createdAt: Date.now(), lastLoginAt: Date.now() };
    accounts.push(account);
  } else {
    account = { ...account, provider: account.provider || provider, email: user.email?.toLowerCase() || account.email, phone: user.phone || account.phone, photo: photoForUser(user) || account.photo, lastLoginAt: Date.now() };
    const index = accounts.findIndex((item) => item.id === account!.id); if (index >= 0) accounts[index] = account;
  }
  saveAccounts(accounts); map[user.id] = account.id; saveCloudMap(map); saveSession(account.id); saveIdentity(account); return account;
}

export async function getAuthenticatedUser() { const client = getSupabaseBrowserClient(); if (!client) return null; const { data, error } = await client.auth.getUser(); if (error) return null; return data.user; }

/** First-class LIVV email authentication is passwordless OTP. Anonymous sessions are never upgraded here. */
export async function startEmailAuth(email: string) {
  const cleanEmail = email.trim().toLowerCase(); if (!cleanEmail || !cleanEmail.includes("@")) throw new Error("Enter a valid email address");
  const client = getSupabaseBrowserClient(); if (!client) throw new Error("LIVV authentication is not configured");
  const { error } = await client.auth.signInWithOtp({ email: cleanEmail, options: { shouldCreateUser: true } }); if (error) throw error;
  return { linked: false };
}

export async function verifyEmailAuth(email: string, token: string) {
  const cleanEmail = email.trim().toLowerCase(); const cleanToken = token.trim();
  if (!cleanEmail || !cleanEmail.includes("@")) throw new Error("Enter a valid email address");
  if (!/^\d{6}$/.test(cleanToken)) throw new Error("Enter the 6-digit code from your email");
  const client = getSupabaseBrowserClient(); if (!client) throw new Error("LIVV authentication is not configured");
  const { data, error } = await client.auth.verifyOtp({ email: cleanEmail, token: cleanToken, type: "email" });
  if (error) throw error; if (!data.user) throw new Error("Email verification did not return a user");
  return materializeSupabaseUser(data.user, "email");
}

/** First-class LIVV phone authentication is passwordless SMS OTP. */
export async function startPhoneAuth(phone: string) {
  const cleanPhone = phone.trim(); if (!cleanPhone || cleanPhone.replace(/\D/g, "").length < 7) throw new Error("Enter a valid phone number with country code");
  const client = getSupabaseBrowserClient(); if (!client) throw new Error("LIVV authentication is not configured");
  const { error } = await client.auth.signInWithOtp({ phone: cleanPhone, options: { shouldCreateUser: true } }); if (error) throw error;
  return { linked: false };
}

export async function verifyPhoneAuth(phone: string, token: string) {
  const cleanPhone = phone.trim(); const cleanToken = token.trim();
  if (!cleanPhone || cleanPhone.replace(/\D/g, "").length < 7) throw new Error("Enter a valid phone number with country code");
  if (!/^\d{6}$/.test(cleanToken)) throw new Error("Enter the 6-digit code from your text");
  const client = getSupabaseBrowserClient(); if (!client) throw new Error("LIVV authentication is not configured");
  const { data, error } = await client.auth.verifyOtp({ phone: cleanPhone, token: cleanToken, type: "sms" });
  if (error) throw error; if (!data.user) throw new Error("Phone verification did not return a user");
  return materializeSupabaseUser(data.user, "phone");
}

/** Legacy callback verifier for previously issued email links. New LIVV sign-in uses direct OTP verification. */
export async function finishSupabaseCallback(code?: string) {
  const client = getSupabaseBrowserClient(); if (!client) throw new Error("LIVV authentication is not configured");
  if (code) { const { error } = await client.auth.exchangeCodeForSession(code); if (error) throw error; }
  const user = await getAuthenticatedUser(); if (!user) throw new Error("Authentication completed without a session");
  return materializeSupabaseUser(user);
}

export async function ensureCloudAuthForCurrentBrowser() {
  if (!isSupabaseConfigured()) return null; const client = getSupabaseBrowserClient(); if (!client) return null;
  const user = await getAuthenticatedUser(); if (user && !user.is_anonymous) return materializeSupabaseUser(user);
  await ensureAnonymousSession(); return null;
}
