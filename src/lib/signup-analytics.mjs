/** Pure signup capture rules. No network and no personal data in the payload. */

import { createHash } from "node:crypto";
import { cleanToken, isNewAccount } from "./funnel-core.mjs";

export const SIGNUP_RECORDED_FLAG = "livv_signup_completed";

const ATTR_KEYS = ["src", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

export function attributionFromUnknown(input) {
  const source = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const next = {};
  for (const key of ATTR_KEYS) {
    const value = cleanToken(source[key]);
    if (value) next[key] = value;
  }
  return next;
}

export function signupAlreadyRecorded(user) {
  if (!user || typeof user !== "object") return false;
  const app = user.app_metadata;
  const meta = user.user_metadata;
  if (app && typeof app === "object" && app[SIGNUP_RECORDED_FLAG] === true) return true;
  if (meta && typeof meta === "object" && meta[SIGNUP_RECORDED_FLAG] === true) return true;
  return false;
}

export function signupMetadataPatch(metadata) {
  const next = {};
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    for (const key of Object.keys(metadata)) {
      if (key === "email" || key === "phone") continue;
      next[key] = metadata[key];
    }
  }
  next[SIGNUP_RECORDED_FLAG] = true;
  return next;
}

export function shouldRecordSignup(user, now = Date.now()) {
  if (!user || typeof user !== "object") return false;
  if (user.is_anonymous === true || user.isAnonymous === true) return false;
  const email = typeof user.email === "string" ? user.email.trim() : "";
  if (!email || !email.includes("@")) return false;
  if (signupAlreadyRecorded(user)) return false;
  const createdAt = user.created_at || user.createdAt || "";
  if (isNewAccount(createdAt, now)) return true;
  const confirmedAt = user.email_confirmed_at || user.emailConfirmedAt || "";
  if (confirmedAt && isNewAccount(confirmedAt, now)) return true;
  return false;
}

export function signupEventUuid(distinctId) {
  const hex = createHash("sha256").update(`livv.signup_completed.${String(distinctId || "")}`).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export function accountIdentify(distinctId, livvInternal) {
  return {
    distinctId,
    properties: { livv_internal: livvInternal === true },
  };
}

export function signupCapture(distinctId, attribution, livvInternal) {
  return {
    distinctId,
    event: "signup_completed",
    uuid: signupEventUuid(distinctId),
    properties: {
      ...attributionFromUnknown(attribution),
      $set: { livv_internal: livvInternal === true },
    },
  };
}
