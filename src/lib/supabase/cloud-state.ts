import { getSupabaseBrowserClient, isSupabaseConfigured } from "./client";

const SHADOW_KEY = "livv-cloud-state-shadow-v1";
const EXCLUDED_KEYS = new Set([
  "livv-session-v1",
  "livv-accounts-v1",
  "livv-cloud-account-v1",
  "livv-cloud-state-shadow-v1",
  "livv-supabase-auth",
]);

function canSync() {
  return typeof window !== "undefined" && isSupabaseConfigured();
}

function readLocalState(): Record<string, string> {
  const state: Record<string, string> = {};
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key || !key.startsWith("livv-") || EXCLUDED_KEYS.has(key)) continue;
    if (/(token|password|secret|credential|auth)/i.test(key)) continue;
    const value = window.localStorage.getItem(key);
    if (value !== null) state[key] = value;
  }
  return state;
}

function writeLocalState(state: Record<string, string>) {
  for (const [key, value] of Object.entries(state)) {
    window.localStorage.setItem(key, value);
  }
}

function notifyStateHydrated() {
  window.dispatchEvent(new Event("livv-record"));
  window.dispatchEvent(new Event("livv-daily"));
  window.dispatchEvent(new Event("livv-identity"));
  window.dispatchEvent(new Event("livv-billing"));
}

function clearLocalStateExceptAuth() {
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key?.startsWith("livv-") && !EXCLUDED_KEYS.has(key) && !/(token|password|secret|credential|auth)/i.test(key)) {
      keys.push(key);
    }
  }
  for (const key of keys) window.localStorage.removeItem(key);
}

/** Clear user-owned synced state when signing out so another person using the same device cannot see it. */
export function clearLocalCloudSyncedState() {
  if (typeof window === "undefined") return;
  clearLocalStateExceptAuth();
  window.localStorage.removeItem("livv-cloud-state-shadow-v1");
  window.localStorage.removeItem("livv-cloud-account-v1");
  window.localStorage.removeItem("livv-session-v1");
  window.localStorage.removeItem("livv-accounts-v1");
  window.localStorage.removeItem("livv-usernames-v1");
  window.localStorage.removeItem("livv-identity-v1");
  notifyStateHydrated();
}

function snapshot(state: Record<string, string>) {
  return JSON.stringify(Object.keys(state).sort().reduce<Record<string, string>>((out, key) => {
    out[key] = state[key];
    return out;
  }, {}));
}

function loadShadow(): Record<string, string> | null {
  try {
    const raw = window.localStorage.getItem(SHADOW_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : null;
  } catch {
    return null;
  }
}

function saveShadow(state: Record<string, string>) {
  window.localStorage.setItem(SHADOW_KEY, JSON.stringify(state));
}

async function currentUserId() {
  const client = getSupabaseBrowserClient();
  if (!client) return null;
  const { data, error } = await client.auth.getUser();
  if (error || !data.user || data.user.is_anonymous) return null;
  return data.user.id;
}

async function readCloud(userId: string) {
  const client = getSupabaseBrowserClient();
  if (!client) return null;
  const { data, error } = await client
    .from("member_state")
    .select("state, updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as { state: Record<string, string>; updated_at: string } | null;
}

async function writeCloud(userId: string, state: Record<string, string>) {
  const client = getSupabaseBrowserClient();
  if (!client) return false;
  const { error } = await client
    .from("member_state")
    .upsert({ user_id: userId, state }, { onConflict: "user_id" });
  if (error) throw error;
  return true;
}

export async function bootstrapCloudMemberState() {
  if (!canSync()) return;
  const userId = await currentUserId();
  if (!userId) return;

  const local = readLocalState();
  const cloud = await readCloud(userId);

  if (!cloud) {
    if (Object.keys(local).length) {
      await writeCloud(userId, local);
      saveShadow(local);
    }
    return;
  }

  const shadow = loadShadow();
  const localSnapshot = snapshot(local);
  const shadowSnapshot = shadow ? snapshot(shadow) : null;
  const localHasChanges = Object.keys(local).length > 0 && localSnapshot !== shadowSnapshot;

  if (!Object.keys(local).length) {
    writeLocalState(cloud.state || {});
    saveShadow(cloud.state || {});
    notifyStateHydrated();
    return;
  }

  if (localHasChanges) {
    const merged = { ...(cloud.state || {}), ...local };
    await writeCloud(userId, merged);
    writeLocalState(merged);
    saveShadow(merged);
    notifyStateHydrated();
    return;
  }

  clearLocalStateExceptAuth();
  writeLocalState(cloud.state || {});
  saveShadow(cloud.state || {});
  notifyStateHydrated();
}

export async function syncCloudMemberState() {
  if (!canSync()) return;
  const userId = await currentUserId();
  if (!userId) return;

  const local = readLocalState();
  const shadow = loadShadow();
  if (shadow && snapshot(local) === snapshot(shadow)) return;

  await writeCloud(userId, local);
  saveShadow(local);
}

export function startCloudMemberStateSync() {
  if (!canSync()) return () => {};

  let stopped = false;
  let timer: number | null = null;
  const tick = async () => {
    if (stopped) return;
    try { await syncCloudMemberState(); }
    catch (error) { console.warn("[LIVV cloud state] sync deferred", error); }
  };
  void bootstrapCloudMemberState().catch((error) => console.warn("[LIVV cloud state] bootstrap deferred", error));
  timer = window.setInterval(() => void tick(), 3000);
  const onVisibility = () => { if (document.visibilityState === "visible") void tick(); };
  window.addEventListener("visibilitychange", onVisibility);
  return () => {
    stopped = true;
    if (timer !== null) window.clearInterval(timer);
    window.removeEventListener("visibilitychange", onVisibility);
  };
}
