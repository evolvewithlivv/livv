import {
  DEFAULT_ACCENT,
  applyAppearance,
  type Identity,
  type Appearance,
} from "./identity";

export type AuthProvider = "google" | "apple" | "email" | "phone" | "x";

export type Account = {
  id: string;
  provider: AuthProvider;
  email?: string;
  phone?: string;
  xHandle?: string;
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

export type Session = {
  accountId: string;
  signedInAt: number;
};

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
  const map = loadUsernameMap();
  const owner = map[clean];
  if (!owner) return true;
  return owner === exceptAccountId;
}

export function normalizeUsername(raw: string) {
  return raw
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24);
}

export function suggestUsername(displayName: string, provider: AuthProvider) {
  const base =
    normalizeUsername(displayName) ||
    (provider === "x" ? "livv" : "member");
  let candidate = base.slice(0, 18) || "member";
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

export function isSignedIn() {
  const session = getSession();
  if (!session) return false;
  return Boolean(loadAccounts().find((a) => a.id === session.accountId));
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
    accent: account.accent,
    tier: account.tier,
    theme: account.theme,
    appearance: account.appearance,
    embers: account.embers,
  };
  window.localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  applyAppearance(account.appearance, account.accent);
  window.dispatchEvent(new Event("livv-identity"));
}

function setSession(accountId: string) {
  const session: Session = { accountId, signedInAt: Date.now() };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("livv-auth"));
}

export function signOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
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

  accounts[idx] = {
    ...accounts[idx],
    username: clean,
    usernameLocked: true,
  };
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
    // username stays locked from account
    username: accounts[idx].usernameLocked
      ? accounts[idx].username
      : identity.username,
  };
  saveAccounts(accounts);
}

export async function signUpWithProvider(input: {
  provider: AuthProvider;
  displayName: string;
  username: string;
  email?: string;
  phone?: string;
  password?: string;
  xHandle?: string;
}) {
  await delay(400);
  const username = normalizeUsername(input.username);
  if (!isUsernameAvailable(username)) {
    throw new Error("That username is taken");
  }
  if (username.length < 3) throw new Error("Username must be at least 3 characters");

  if (input.provider === "email") {
    if (!input.email || !input.password) throw new Error("Email and password required");
    if (input.password.length < 6) throw new Error("Password must be 6+ characters");
    const exists = loadAccounts().some(
      (a) => a.provider === "email" && a.email === input.email?.toLowerCase()
    );
    if (exists) throw new Error("An account with this email already exists. Sign in instead.");
  }
  if (input.provider === "phone") {
    if (!input.phone) throw new Error("Phone number required");
    const exists = loadAccounts().some((a) => a.provider === "phone" && a.phone === input.phone);
    if (exists) throw new Error("An account with this phone already exists. Sign in instead.");
  }

  const account: Account = {
    id: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    provider: input.provider,
    email: input.email?.toLowerCase(),
    phone: input.phone,
    xHandle: input.xHandle?.replace(/^@/, ""),
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

export async function signInWithEmail(email: string, password: string) {
  await delay(350);
  const account = loadAccounts().find(
    (a) => a.provider === "email" && a.email === email.toLowerCase()
  );
  if (!account || account.passwordHash !== hash(password)) {
    throw new Error("Email or password is wrong");
  }
  account.lastLoginAt = Date.now();
  const accounts = loadAccounts().map((a) => (a.id === account.id ? account : a));
  saveAccounts(accounts);
  setSession(account.id);
  writeIdentityFromAccount(account);
  return account;
}

export async function signInWithPhone(phone: string) {
  await delay(350);
  const account = loadAccounts().find((a) => a.provider === "phone" && a.phone === phone);
  if (!account) throw new Error("No account with that number. Create one first.");
  account.lastLoginAt = Date.now();
  const accounts = loadAccounts().map((a) => (a.id === account.id ? account : a));
  saveAccounts(accounts);
  setSession(account.id);
  writeIdentityFromAccount(account);
  return account;
}

export async function continueWithSocial(
  provider: "google" | "apple" | "x",
  opts?: { displayName?: string; xHandle?: string }
) {
  await delay(500);
  // Local simulation of OAuth until provider keys are wired.
  // Same device reuses the existing social account if present.
  const existing = loadAccounts().find((a) => a.provider === provider);
  if (existing) {
    existing.lastLoginAt = Date.now();
    const accounts = loadAccounts().map((a) => (a.id === existing.id ? existing : a));
    saveAccounts(accounts);
    setSession(existing.id);
    writeIdentityFromAccount(existing);
    return { account: existing, isNew: false };
  }

  const displayName =
    opts?.displayName ||
    (provider === "google"
      ? "Google Member"
      : provider === "apple"
        ? "Apple Member"
        : opts?.xHandle || "X Member");
  const username = suggestUsername(
    provider === "x" ? opts?.xHandle || displayName : displayName,
    provider
  );

  const account = await signUpWithProvider({
    provider,
    displayName,
    username,
    xHandle: opts?.xHandle,
  });
  return { account, isNew: true };
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
