/**
 * LIVV data portability — user progress backup / import / wipe.
 * Authentication and browser session state are intentionally excluded.
 */

export const LIVV_BACKUP_VERSION = 2 as const;
export const LIVV_BACKUP_APP = "livv" as const;
type SupportedBackupVersion = 1 | 2;

export const MANAGED_KEYS = [
  "livv-record-v1", "livv-daily-v1", "livv-daily-buffs-v1", "livv-milestones-v1",
  "livv-milestone-queue-v1", "livv-events-v1", "livv-last-broken-streak", "livv-weekly-clear-v1",
  "livv-season-v1", "livv-fasting-v1", "livv-packs-v2", "livv-packs-v1", "livv-entitlements-v1",
  "livv-official-profile-grants-v1", "livv-onboarding-v1", "livv-prefs-v1", "livv-social-posts-v4",
  "livv-dms-v1", "livv_activities", "livv-pair-chain-v1", "livv-lab-v1",
] as const;

export type ManagedKey = (typeof MANAGED_KEYS)[number];

export type LivvBackupFile = {
  app: typeof LIVV_BACKUP_APP;
  version: typeof LIVV_BACKUP_VERSION;
  exportedAt: string;
  data: Record<string, string>;
};

const DYNAMIC_PREFIXES = ["livv-pack-session-"] as const;
function isBrowser() { return typeof window !== "undefined"; }

function collectDynamicKeys(): string[] {
  if (!isBrowser()) return [];
  const out: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key && DYNAMIC_PREFIXES.some((prefix) => key.startsWith(prefix))) out.push(key);
  }
  return out;
}
function allExportKeys() { return [...new Set([...MANAGED_KEYS, ...collectDynamicKeys()])]; }

export function buildBackup(): LivvBackupFile {
  const data: Record<string, string> = {};
  if (isBrowser()) for (const key of allExportKeys()) {
    const raw = window.localStorage.getItem(key);
    if (raw !== null) data[key] = raw;
  }
  return { app: LIVV_BACKUP_APP, version: LIVV_BACKUP_VERSION, exportedAt: new Date().toISOString(), data };
}

export function downloadBackup(): LivvBackupFile {
  const backup = buildBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `livv-backup-${backup.exportedAt.slice(0, 10)}.json`;
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

function isAllowlistedKey(key: string) {
  return (MANAGED_KEYS as readonly string[]).includes(key) || DYNAMIC_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export function validateBackupPayload(raw: unknown): ImportValidation {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, error: "File is not a LIVV backup object." };
  const obj = raw as Record<string, unknown>;
  if (obj.app !== LIVV_BACKUP_APP) return { ok: false, error: "Not a LIVV backup (wrong app id)." };
  if (obj.version !== 1 && obj.version !== 2) return { ok: false, error: `Unsupported backup version (${String(obj.version)}). This app reads v1 and v2.` };
  if (typeof obj.exportedAt !== "string" || !obj.exportedAt) return { ok: false, error: "Missing exportedAt timestamp." };
  if (obj.data === null || typeof obj.data !== "object" || Array.isArray(obj.data)) return { ok: false, error: "Missing or invalid data map." };

  const data: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj.data as Record<string, unknown>)) {
    // v1 backups may contain auth/session keys. Deliberately discard them.
    if (!isAllowlistedKey(key)) continue;
    if (typeof value !== "string") return { ok: false, error: `Key “${key}” must be a string (raw storage value).` };
    if (value.length > 0) {
      try { JSON.parse(value); }
      catch { if (value !== "1" && !key.startsWith("livv-pack-session-")) return { ok: false, error: `Key “${key}” is not valid JSON.` }; }
    }
    data[key] = value;
  }
  if (Object.keys(data).length === 0) return { ok: false, error: "Backup contains no recognized LIVV progress keys." };

  return {
    ok: true,
    backup: { app: LIVV_BACKUP_APP, version: LIVV_BACKUP_VERSION, exportedAt: obj.exportedAt, data },
    keyCount: Object.keys(data).length,
  };
}

export async function parseBackupFile(file: File): Promise<ImportValidation> {
  if (!file || file.size === 0) return { ok: false, error: "Empty file." };
  if (file.size > 8 * 1024 * 1024) return { ok: false, error: "File too large (max 8 MB)." };
  let text: string;
  try { text = await file.text(); } catch { return { ok: false, error: "Could not read file." }; }
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { return { ok: false, error: "File is not valid JSON." }; }
  return validateBackupPayload(parsed);
}

function clearManagedStorage() {
  if (!isBrowser()) return;
  for (const key of MANAGED_KEYS) window.localStorage.removeItem(key);
  for (const key of collectDynamicKeys()) window.localStorage.removeItem(key);
  try { window.sessionStorage.removeItem("livv-first-session-v1"); } catch { /* ignore */ }
}

function notifyStateRefresh() {
  if (!isBrowser()) return;
  for (const name of ["livv-record", "livv-prefs", "livv-packs", "livv-billing", "livv-daily", "livv-social"]) window.dispatchEvent(new Event(name));
}

export function importBackup(backup: LivvBackupFile): { ok: true } | { ok: false; error: string } {
  if (!isBrowser()) return { ok: false, error: "Not in browser." };
  const check = validateBackupPayload(backup);
  if (!check.ok) return check;
  try {
    clearManagedStorage();
    for (const [key, value] of Object.entries(check.backup.data)) if (isAllowlistedKey(key)) window.localStorage.setItem(key, value);
    notifyStateRefresh();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Import failed while writing storage." };
  }
}

export function deleteAllLivvData(): void { clearManagedStorage(); notifyStateRefresh(); }
export function countManagedKeysPresent(): number {
  if (!isBrowser()) return 0;
  let count = 0;
  for (const key of allExportKeys()) if (window.localStorage.getItem(key) !== null) count += 1;
  return count;
}
