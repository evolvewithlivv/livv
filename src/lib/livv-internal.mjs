/** Server-side QA account check. Callers must import this through src/lib/livv-internal.ts. */

import { createHash } from "node:crypto";

export const INTERNAL_EMAIL_HASH_PREFIXES = new Set([
  "bce3c28b",
  "b8ed352a",
  "ed9c9284",
  "36da986a",
  "c4fd41ca",
  "75f3c6c2",
  "2e6c7533",
]);

function hashPrefix(normalizedEmail) {
  return createHash("md5").update(normalizedEmail).digest("hex").slice(0, 8);
}

/**
 * True when the account is internal. The return value is the only thing that
 * may leave this module. The address and the digest stay here.
 */
export function isLivvInternalEmail(email, prefixes = INTERNAL_EMAIL_HASH_PREFIXES) {
  if (typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at < 1 || at !== normalized.indexOf("@") || at === normalized.length - 1) return false;
  if (normalized.slice(at + 1) === "mail.grokbot.com") return true;
  return prefixes.has(hashPrefix(normalized));
}
