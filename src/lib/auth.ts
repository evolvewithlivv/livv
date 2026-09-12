import {
  DEFAULT_ACCENT,
  applyAppearance,
  type Identity,
  type Appearance,
} from "./identity";
import { ensureAnonymousSession, getAnonSessionState } from "./supabase/anon-session";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./supabase/client";

export type AuthProvider = "email";

export type Account = {
  id: string;
  provider: AuthProvider;
  email?: string;
  passwordHash?: string;
  displayName: string;
  username: string;
  usernameLocked: boolean;
  photo: string | null;
  accent: string;
  appearance: Appearance;
  tier: Identity["tier"];
  theme: Identity["theme"];
  embers: number;
  bio: string;
  createdAt: number;
  lastLoginAt: number;
};

export type Session = { accountId: string; signedInAt: number };

const ACCOUNTS_KEY = "livv-accounts-v1";
const SESSION_KEY = "livv-session-v1";
const USERNAMES_KEY = "livv-usernames-v1";
const IDENTITY_KEY = "livv-identity-v1";

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return `h${Math.abs(h)}`;
}

export function loadAccounts(): Account[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Account[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: Account[]) {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function loadUsernameMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(USERNAMES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveUsernameMap(map: Record<string, string>) {
  window.localStorage.setItem(USERNAMES_KEY, JSON.stringify(map));
}

export function isUsernameAvailable(username: string, exceptAccountId?: string) {
  const clean = normalizeUsername(username);
  if (clean.length < 3) return false;
  const owner = loadUsernameMap()[clean];
  return !owner || owner === exceptAccountId;
}

export function normalizeUsername(raw: string) {
  return raw.toLowerCase().replace(/^@/, "").replace(/[^a-z0-9_]/g, "").slice(0, 24);
}

export function suggestUsername(displayName: string, _provider: AuthProvider = "email") {
  const base = normalizeUsername(displayName) || "member";
  const candidate = base.slice(0, 18) || "member";
  if (isUsernameAvailable(candidate)) return candidate;
  for (let i = 1; i < 99; i++) {
    const next = `${candidate}${i}`;
    if (isUsernameAvailable(next)) return next;
  }
  return `m${Date.now().toString(36).slice(-6)}`;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function isSignedInLocal() {
  const session = getSession();
  return Boolean(session && loadAccounts().find((a) => a.id === session.accountId));
}

export function isSignedIn() {
  return isSignedInLocal();
}

export function getCloudUserId(): string | null {
  const cloud = getAnonSessionState();
  return cloud.status === "ready" && cloud.userId ? cloud.userId : null;
}

/**
 * Home access is intentionally based on a real LIVV account session.
 * Anonymous Supabase sessions are infrastructure only and never grant
 * authenticated access to the product.
 */
export async function resolveHomeAccess(): Promise<"ok" | "deny"> {
  if (typeof window === "undefined") return "deny";
  return isSignedInLocal() ? "ok" : "deny";
}

export function getCurrentAccount(): Account | null {
  const session = getSession();
  if (!session) return null;
  return loadAccounts().find((a) => a.id === session.accountId) || null;
}

function writeIdentityFromAccount(account: Account) {
  const identity: Identity = {
    displayName: account.displayName,
    username: account.username,
    bio: account.bio,
    photo: account.photo,
    tier: account.tier,
    theme: account.theme,
    appearance: account.appearance,
    accent: account.accent,
    embers: account.embers,
  };
  window.localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  applyAppearance(account.appearance, account.accent);
  window.dispatchEvent(new Event("livv-identity"));
}

function setSession(accountId: string) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify({ accountId, signedInAt: Date.now() }));
  window.dispatchEvent(new Event("livv-auth"));
}

export function signOut() {
  if (typeof window === "undefined") return;
  if (isSupabaseConfigured()) {
    const client = getSupabaseBrowserClient();
    if (client) void client.auth.signOut({ scope: "local" }).catch((error: unknown) => console.warn("[auth] Supabase sign-out failed", error));
  }
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("livv-auth"));
}

export function setCurrentAccountEmail(email: string) {
  if (typeof window === "undefined") return;
  const session = getSession();
  if (!session) return;
  const accounts = loadAccounts();
  const idx = accounts.findIndex((a) => a.id === session.accountId);
  if (idx < 0) return;
  accounts[idx] = { ...accounts[idx], email: email.trim().toLowerCase() || undefined };
  saveAccounts(accounts);
  window.dispatchEvent(new Event("livv-auth"));
}

export function claimUsername(accountId: string, username: string) {
  const clean = normalizeUsername(username);
  if (clean.length < 3) throw new Error("Username must be at least 3 characters");
  if (!isUsernameAvailable(clean, accountId)) throw new Error("Username is taken");
  const accounts = loadAccounts();
  const idx = accounts.findIndex((a) => a.id === accountId);
  if (idx < 0) throw new Error("Account not found");
  if (accounts[idx].usernameLocked) throw new Error("Username is locked");
  const map = loadUsernameMap();
  if (accounts[idx].username) delete map[accounts[idx].username];
  map[clean] = accountId;
  saveUsernameMap(map);
  accounts[idx] = { ...accounts[idx], username: clean, usernameLocked: true };
  saveAccounts(accounts);
  writeIdentityFromAccount(accounts[idx]);
  return accounts[idx];
}

export function syncAccountFromIdentity(identity: Identity) {
  const session = getSession();
  if (!session) return;
  const accounts = loadAccounts();
  const idx = accounts.findIndex((a) => a.id === session.accountId);
  if (idx < 0) return;
  accounts[idx] = {
    ...accounts[idx],
    displayName: identity.displayName,
    bio: identity.bio,
    photo: identity.photo,
    accent: identity.accent,
    appearance: identity.appearance,
    tier: identity.tier,
    theme: identity.theme,
    embers: identity.embers,
    username: accounts[idx].usernameLocked ? accounts[idx].username : identity.username,
  };
  saveAccounts(accounts);
}

/** Legacy local helper retained for offline/dev compatibility. Production auth is email OTP. */
export async function signUpWithProvider(input: {
  provider: AuthProvider;
  displayName: string;
  username: string;
  email?: string;
  password?: string;
}) {
  await delay(400);
  const username = normalizeUsername(input.username);
  if (!isUsernameAvailable(username)) throw new Error("That username is taken");
  if (username.length < 3) throw new Error("Username must be at least 3 characters");
  if (!input.email) throw new Error("Email required");
  const exists = loadAccounts().some((a) => a.provider === "email" && a.email === input.email?.toLowerCase());
  if (exists) throw new Error("An account with this email already exists. Sign in instead.");

  const account: Account = {
    id: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    provider: "email",
    email: input.email.toLowerCase(),
    passwordHash: input.password ? hash(input.password) : undefined,
    displayName: input.displayName.trim() || "Member",
    username,
    usernameLocked: true,
    photo: null,
    accent: DEFAULT_ACCENT,
    appearance: "dark",
    tier: "spark",
    theme: "ember",
    embers: 0,
    bio: "",
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
  };
  const accounts = loadAccounts();
  accounts.push(account);
  saveAccounts(accounts);
  const map = loadUsernameMap();
  map[username] = account.id;
  saveUsernameMap(map);
  setSession(account.id);
  writeIdentityFromAccount(account);
  return account;
}

export async function completeDeviceOnboarding(input: { displayName: string }): Promise<{ account: Account; isNew: boolean }> {
  await delay(200);
  try { await ensureAnonymousSession(); } catch { /* local onboarding must still succeed */ }
  const displayName = input.displayName.trim() || "Member";

  if (isSignedInLocal()) {
    const existing = getCurrentAccount();
    if (existing) {
      const accounts = loadAccounts();
      const idx = accounts.findIndex((a) => a.id === existing.id);
      if (idx >= 0) {
        accounts[idx] = { ...accounts[idx], displayName, lastLoginAt: Date.now() };
        saveAccounts(accounts);
        writeIdentityFromAccount(accounts[idx]);
        return { account: accounts[idx], isNew: false };
      }
    }
  }

  const username = suggestUsername(displayName, "email");
  const account: Account = {
    id: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    provider: "email",
    displayName,
    username,
    usernameLocked: true,
    photo: null,
    accent: DEFAULT_ACCENT,
    appearance: "dark",
    tier: "spark",
    theme: "ember",
    embers: 0,
    bio: "",
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
  };
  const accounts = loadAccounts();
  accounts.push(account);
  saveAccounts(accounts);
  const map = loadUsernameMap();
  map[username] = account.id;
  saveUsernameMap(map);
  setSession(account.id);
  writeIdentityFromAccount(account);
  return { account, isNew: true };
}

export async function signInWithEmail(email: string, password: string) {
  await delay(350);
  const account = loadAccounts().find((a) => a.provider === "email" && a.email === email.toLowerCase());
  if (!account || account.passwordHash !== hash(password)) throw new Error("Email or password is wrong");
  account.lastLoginAt = Date.now();
  saveAccounts(loadAccounts().map((a) => (a.id === account.id ? account : a)));
  setSession(account.id);
  writeIdentityFromAccount(account);
  return account;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
