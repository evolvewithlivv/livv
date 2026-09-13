import { type AuthError, type User } from "@supabase/supabase-js";
import { DEFAULT_ACCENT, applyAppearance, type Identity } from "../identity";
import { loadAccounts, normalizeUsername, suggestUsername, type Account, type AuthProvider } from "../auth";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./client";
import { ensureAnonymousSession } from "./anon-session";

const SESSION_KEY = "livv-session-v1";
const ACCOUNTS_KEY = "livv-accounts-v1";
const IDENTITY_KEY = "livv-identity-v1";
const CLOUD_MAP_KEY = "livv-cloud-account-v1";
const USERNAMES_KEY = "livv-usernames-v1";
function saveAccounts(accounts: Account[]) { window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); }
function saveIdentity(account: Account) { const identity: Identity = { displayName: account.displayName, username: account.username, bio: account.bio, goal: account.goal || "", photo: account.photo, accent: account.accent, appearance: account.appearance, tier: account.tier, theme: account.theme, embers: account.embers }; window.localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity)); applyAppearance(account.appearance, account.accent); }
function saveSession(accountId: string) { window.localStorage.setItem(SESSION_KEY, JSON.stringify({ accountId, signedInAt: Date.now() })); window.dispatchEvent(new Event("livv-auth")); window.dispatchEvent(new Event("livv-identity")); }
function loadCloudMap(): Record<string, string> { try { const raw = window.localStorage.getItem(CLOUD_MAP_KEY); return raw ? (JSON.parse(raw) as Record<string, string>) : {}; } catch { return {}; } }
function saveCloudMap(map: Record<string, string>) { window.localStorage.setItem(CLOUD_MAP_KEY, JSON.stringify(map)); }
function loadUsernameMap(): Record<string, string> { try { const raw = window.localStorage.getItem(USERNAMES_KEY); return raw ? (JSON.parse(raw) as Record<string, string>) : {}; } catch { return {}; } }
function saveUsernameMap(map: Record<string, string>) { window.localStorage.setItem(USERNAMES_KEY, JSON.stringify(map)); }
function metadataName(user: User) { const m = user.user_metadata || {}; return (m.full_name || m.name || m.display_name || m.preferred_username || (user.email ? user.email.split("@")[0] : "") || "Member").toString(); }
function metadataUsername(user: User) { const m = user.user_metadata || {}; return (m.preferred_username || m.username || metadataName(user)).toString(); }
function photoForUser(user: User) { const m = user.user_metadata || {}; const value = m.avatar_url || m.picture || m.photo_url || null; return typeof value === "string" && value.startsWith("http") ? value : null; }

async function hydrateCloudProfile(user: User, account: Account): Promise<Account> { const client = getSupabaseBrowserClient(); if (!client) return account; const { data: profile, error } = await client.from("profiles").select("*").eq("id", user.id).maybeSingle(); if (error || !profile) return account; return account; }
function syncUsernameOwnership(account: Account, previousUsername?: string) { const map = loadUsernameMap(); if (previousUsername && map[previousUsername] === account.id) delete map[previousUsername]; map[account.username] = account.id; saveUsernameMap(map); }

export function mapSupabaseAuthError(error: unknown): Error { if (!(error instanceof Error) && typeof error !== "object") return new Error("Authentication failed. Try again."); const err = error as AuthError & { message?: string; code?: string; status?: number }; const message = (err.message || "Authentication failed. Try again.").toString(); if (/rate limit|too many/i.test(message)) return new Error("Too many attempts. Wait a moment and try again."); if (/expired|otp/i.test(message) && /invalid|expired/i.test(message)) return new Error("That code is invalid or expired. Request a new one."); if (/invalid/i.test(message) && /email/i.test(message)) return new Error("Enter a valid email address."); if (/not configured|api key/i.test(message)) return new Error("LIVV authentication is temporarily unavailable. Please try again later."); return new Error(message); }

export async function materializeSupabaseUser(user: User, providerHint: AuthProvider = "email") { if (typeof window === "undefined") throw new Error("Authentication requires a browser"); const map = loadCloudMap(); const existingId = map[user.id]; const accounts = loadAccounts(); let account = existingId ? accounts.find((a) => a.id === existingId) : undefined; if (!account && user.email) account = accounts.find((a) => a.email === user.email.toLowerCase()); const displayName = metadataName(user); const username = suggestUsername(metadataUsername(user), providerHint); if (!account) { account = { id: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, provider: providerHint, email: user.email?.toLowerCase(), displayName, username, usernameLocked: true, photo: photoForUser(user), accent: DEFAULT_ACCENT, appearance: "dark", tier: "spark", theme: "ember", embers: 0, bio: "", goal: "", createdAt: Date.now(), lastLoginAt: Date.now() }; accounts.push(account); } else { account = { ...account, email: user.email?.toLowerCase() || account.email, displayName: account.displayName || displayName, lastLoginAt: Date.now(), photo: account.photo || photoForUser(user) }; const idx = accounts.findIndex((a) => a.id === account!.id); if (idx >= 0) accounts[idx] = account; } saveAccounts(accounts); map[user.id] = account.id; saveCloudMap(map); syncUsernameOwnership(account); saveIdentity(account); saveSession(account.id); try { await hydrateCloudProfile(user, account); } catch { /* local session remains valid */ } return account; }

export async function getAuthenticatedUser() { const client = getSupabaseBrowserClient(); if (!client) return null; const { data, error } = await client.auth.getUser(); if (error) return null; return data.user ?? null; }

export async function startEmailAuth(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) throw new Error("Enter a valid email address");
  if (!isSupabaseConfigured()) throw new Error("LIVV authentication is temporarily unavailable. Please try again later.");
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("LIVV authentication is temporarily unavailable. Please try again later.");
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
  if (!isSupabaseConfigured()) throw new Error("LIVV authentication is temporarily unavailable. Please try again later.");
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("LIVV authentication is temporarily unavailable. Please try again later.");
  const { data, error } = await client.auth.verifyOtp({ email: cleanEmail, token: cleanToken, type: "email" });
  if (error) throw mapSupabaseAuthError(error);
  if (!data.user) throw new Error("Email verification did not return a user");
  return materializeSupabaseUser(data.user, "email");
}

export async function finishSupabaseCallback(code?: string) {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("LIVV authentication is temporarily unavailable. Please try again later.");
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
