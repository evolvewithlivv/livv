/**
 * LIVV data portability — local-only export / import / wipe.
 * No backend. Values are raw localStorage strings for exact restore.
 */

export const LIVV_BACKUP_VERSION = 1 as const;
export const LIVV_BACKUP_APP = "livv" as const;

/**
 * Known product keys. Import only writes allowlisted keys (plus
 * dynamic livv-pack-session-* markers collected at export time).
 * Excludes livv-demo-unlock (QA flag, not user progress).
 */
export const MANAGED_KEYS = [
  // Identity & auth (device-local)
  "livv-identity-v1",
  "livv-accounts-v1",
  "livv-session-v1",
  "livv-usernames-v1",
  // Progression
  "livv-record-v1",
  "livv-daily-v1",
  "livv-daily-buffs-v1",
  "livv-milestones-v1",
  "livv-milestone-queue-v1",
  "livv-events-v1",
  "livv-last-broken-streak",
  "livv-weekly-clear-v1",
  "livv-season-v1",
  "livv-fasting-v1",
  // Packs / entitlements (client-side state)
  "livv-packs-v2",
  "livv-packs-v1",
  "livv-entitlements-v1",
  "livv-official-profile-grants-v1",
  // Onboarding & prefs
  "livv-onboarding-v1",
  "livv-prefs-v1",
  // Social / local surfaces
  "livv-social-posts-v4",
  "livv-dms-v1",
  "livv_activities",
  "livv-pair-chain-v1",
  "livv-lab-v1",
] as const;

export type ManagedKey = (typeof MANAGED_KEYS)[number];

export type LivvBackupFile = {
  app: typeof LIVV_BACKUP_APP;
  version: typeof LIVV_BACKUP_VERSION;
  exportedAt: string;
  /** Raw localStorage string values */
  data: Record<string, string>;
};

const DYNAMIC_PREFIXES = ["livv-pack-session-"] as const;

function isBrowser() {
  return typeof window !== "undefined";
}

function collectDynamicKeys(): string[] {
  if (!isBrowser()) return [];
  const out: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (!k) continue;
    if (DYNAMIC_PREFIXES.some((p) => k.startsWith(p))) out.push(k);
  }
  return out;
}

function allExportKeys(): string[] {
  const set = new Set<string>([...MANAGED_KEYS, ...collectDynamicKeys()]);
  return [...set];
}

export function buildBackup(): LivvBackupFile {
  const data: Record<string, string> = {};
  if (isBrowser()) {
    for (const key of allExportKeys()) {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) data[key] = raw;
    }
  }
  return {
    app: LIVV_BACKUP_APP,
    version: LIVV_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function downloadBackup(): LivvBackupFile {
  const backup = buildBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const day = backup.exportedAt.slice(0, 10);
  a.href = url;
  a.download = `livv-backup-${day}.json`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return backup;
}

export type ImportValidation =
  | { ok: true; backup: LivvBackupFile; keyCount: number }
  | { ok: false; error: string };

function isAllowlistedKey(key: string): boolean {
  if ((MANAGED_KEYS as readonly string[]).includes(key)) return true;
  return DYNAMIC_PREFIXES.some((p) => key.startsWith(p));
}

/** Parse + validate without writing. */
export function validateBackupPayload(raw: unknown): ImportValidation {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "File is not a LIVV backup object." };
  }
  const obj = raw as Record<string, unknown>;
  if (obj.app !== LIVV_BACKUP_APP) {
    return { ok: false, error: "Not a LIVV backup (wrong app id)." };
  }
  if (obj.version !== LIVV_BACKUP_VERSION) {
    return {
      ok: false,
      error: `Unsupported backup version (${String(obj.version)}). This app reads v${LIVV_BACKUP_VERSION}.`,
    };
  }
  if (typeof obj.exportedAt !== "string" || !obj.exportedAt) {
    return { ok: false, error: "Missing exportedAt timestamp." };
  }
  if (obj.data === null || typeof obj.data !== "object" || Array.isArray(obj.data)) {
    return { ok: false, error: "Missing or invalid data map." };
  }
  const dataIn = obj.data as Record<string, unknown>;
  const data: Record<string, string> = {};
  for (const [k, v] of Object.entries(dataIn)) {
    if (!isAllowlistedKey(k)) continue; // skip unknown keys silently
    if (typeof v !== "string") {
      return { ok: false, error: `Key “${k}” must be a string (raw storage value).` };
    }
    // Soft JSON check for known structured keys — must parse if non-empty
    if (v.length > 0) {
      try {
        JSON.parse(v);
      } catch {
        // allow non-JSON strings for rare flags; pack-session markers are "1"
        if (v !== "1" && !k.startsWith("livv-pack-session-")) {
          return { ok: false, error: `Key “${k}” is not valid JSON.` };
        }
      }
    }
    data[k] = v;
  }
  if (Object.keys(data).length === 0) {
    return { ok: false, error: "Backup contains no recognized LIVV keys." };
  }
  return {
    ok: true,
    backup: {
      app: LIVV_BACKUP_APP,
      version: LIVV_BACKUP_VERSION,
      exportedAt: obj.exportedAt,
      data,
    },
    keyCount: Object.keys(data).length,
  };
}

export async function parseBackupFile(file: File): Promise<ImportValidation> {
  if (!file || file.size === 0) {
    return { ok: false, error: "Empty file." };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { ok: false, error: "File too large (max 8 MB)." };
  }
  let text: string;
  try {
    text = await file.text();
  } catch {
    return { ok: false, error: "Could not read file." };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "File is not valid JSON." };
  }
  return validateBackupPayload(parsed);
}

function clearManagedStorage() {
  if (!isBrowser()) return;
  for (const key of MANAGED_KEYS) {
    window.localStorage.removeItem(key);
  }
  for (const key of collectDynamicKeys()) {
    window.localStorage.removeItem(key);
  }
  try {
    window.sessionStorage.removeItem("livv-first-session-v1");
  } catch {
    /* ignore */
  }
}

function notifyStateRefresh() {
  if (!isBrowser()) return;
  const events = [
    "livv-identity",
    "livv-auth",
    "livv-record",
    "livv-prefs",
    "livv-packs",
    "livv-billing",
    "livv-daily",
    "livv-social",
  ];
  for (const name of events) {
    window.dispatchEvent(new Event(name));
  }
}

/**
 * Replace strategy: clear all managed keys, then write keys from backup.
 * Prevents stale keys from mixing with an older snapshot.
 */
export function importBackup(backup: LivvBackupFile): { ok: true } | { ok: false; error: string } {
  if (!isBrowser()) return { ok: false, error: "Not in browser." };
  const check = validateBackupPayload(backup);
  if (!check.ok) return check;

  try {
    clearManagedStorage();
    for (const [key, value] of Object.entries(check.backup.data)) {
      if (!isAllowlistedKey(key)) continue;
      window.localStorage.setItem(key, value);
    }
    notifyStateRefresh();
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Import failed while writing storage.",
    };
  }
}

/** Wipe all managed LIVV local data on this device. */
export function deleteAllLivvData(): void {
  clearManagedStorage();
  notifyStateRefresh();
}

export function countManagedKeysPresent(): number {
  if (!isBrowser()) return 0;
  let n = 0;
  for (const key of allExportKeys()) {
    if (window.localStorage.getItem(key) !== null) n++;
  }
  return n;
}
