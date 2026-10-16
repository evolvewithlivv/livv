/** Pure funnel rules. No network, no cookies, no personal data. */

export const ATTR_KEY = "livv-attr-v1";
export const QUEUE_KEY = "livv-funnel-queue";
export const FIRST_DAILY_KEY = "livv-first-daily-action";
export const FIRST_TRAIN_KEY = "livv-first-train-action";
export const SIGNUP_KEY = "livv-signup-completed";

const TOKEN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const PII_KEYS = new Set([
  "email",
  "name",
  "displayname",
  "display_name",
  "firstname",
  "lastname",
  "first_name",
  "last_name",
  "fullname",
  "full_name",
  "why",
  "reflection",
  "answer",
  "note",
  "bio",
  "phone",
  "otp",
  "token",
  "password",
]);

const ERROR_CODES = new Set([
  "rate_limit",
  "send_failed",
  "otp_expired",
  "invalid_code",
  "unavailable",
  "age_required",
  "invalid_email",
  "unknown",
]);

const EVENT_PROPS = {
  landing_view: ["src", "variant", "device", ...UTM_KEYS],
  cta_start_click: ["src", "variant", "position", ...UTM_KEYS],
  signup_completed: ["src", ...UTM_KEYS],
  onboarding_completed: ["src", ...UTM_KEYS],
  first_daily_action: ["src", ...UTM_KEYS],
  first_train_action: ["src", ...UTM_KEYS],
  auth_view: ["src", "mode", ...UTM_KEYS],
  otp_requested: ["src", ...UTM_KEYS],
  otp_request_failed: ["src", "error_code", ...UTM_KEYS],
  otp_verify_failed: ["src", "error_code", ...UTM_KEYS],
};

export function funnelEventNames() {
  return Object.keys(EVENT_PROPS);
}

export function isPiiKey(key) {
  return PII_KEYS.has(String(key || "").toLowerCase().replace(/[^a-z0-9_]/g, ""));
}

export function cleanToken(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return TOKEN.test(trimmed) ? trimmed : "";
}

function cleanProp(key, value) {
  if (key === "device") return value === "mobile" || value === "desktop" ? value : "";
  if (key === "position") return value === "primary" || value === "secondary" ? value : "";
  if (key === "mode") return value === "signin" || value === "signup" ? value : "";
  if (key === "error_code") return ERROR_CODES.has(value) ? value : "";
  if (key === "src" || key === "variant" || UTM_KEYS.includes(key)) return cleanToken(value);
  return "";
}

export function sanitizeEvent(name, props) {
  const allowed = EVENT_PROPS[name];
  if (!allowed) return null;
  const next = {};
  const source = props && typeof props === "object" ? props : {};
  for (const key of allowed) {
    if (isPiiKey(key)) continue;
    const value = cleanProp(key, source[key]);
    if (value) next[key] = value;
  }
  return { event: name, props: next };
}

export function readAttribution(storage) {
  try {
    const parsed = JSON.parse(storage.getItem(ATTR_KEY) || "{}");
    const next = {};
    if (!parsed || typeof parsed !== "object") return next;
    const src = cleanToken(parsed.src);
    const variant = cleanToken(parsed.variant);
    if (src) next.src = src;
    if (variant) next.variant = variant;
    for (const key of UTM_KEYS) {
      const value = cleanToken(parsed[key]);
      if (value) next[key] = value;
    }
    return next;
  } catch {
    return {};
  }
}

export function persistQueryAttribution(storage, search) {
  const params = new URLSearchParams(search || "");
  const current = readAttribution(storage);
  const src = cleanToken(params.get("src")) || current.src || "";
  const variant = cleanToken(params.get("variant")) || cleanToken(params.get("v")) || current.variant || "default";
  const next = {};
  if (src) next.src = src;
  if (variant) next.variant = variant;
  for (const key of UTM_KEYS) {
    const value = cleanToken(params.get(key)) || current[key] || "";
    if (value) next[key] = value;
  }
  try {
    storage.setItem(ATTR_KEY, JSON.stringify(next));
    if (src) storage.setItem("livv-src", src);
  } catch {
    /* private mode */
  }
  return next;
}

export function claimOnce(storage, key) {
  try {
    if (storage.getItem(key) === "1") return false;
    storage.setItem(key, "1");
    return true;
  } catch {
    return false;
  }
}

export function enqueue(storage, name, props) {
  const clean = sanitizeEvent(name, props);
  if (!clean) return false;
  try {
    const raw = storage.getItem(QUEUE_KEY);
    const queued = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(queued) ? queued : [];
    next.push(clean);
    storage.setItem(QUEUE_KEY, JSON.stringify(next.slice(-20)));
    return true;
  } catch {
    return false;
  }
}

export function takeQueue(storage) {
  try {
    const raw = storage.getItem(QUEUE_KEY);
    storage.removeItem(QUEUE_KEY);
    const queued = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(queued)) return [];
    return queued
      .map((item) => sanitizeEvent(item && item.event, item && item.props))
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function noteFirstAction(localStorage, sessionStorage, key, name) {
  if (!claimOnce(localStorage, key)) return false;
  return enqueue(sessionStorage, name, readAttribution(sessionStorage));
}

export function errorCodeFromMessage(message) {
  const text = String(message || "").toLowerCase();
  if (text.includes("too many") || text.includes("rate limit") || text.includes("too many attempts")) return "rate_limit";
  if (text.includes("couldn't send") || text.includes("could not send") || text.includes("couldn’t send")) return "send_failed";
  if (text.includes("expired")) return "otp_expired";
  if (text.includes("valid email") || text.includes("email address")) return "invalid_email";
  if (text.includes("13 or older") || text.includes("age")) return "age_required";
  if (text.includes("unavailable") || text.includes("try again later")) return "unavailable";
  if (text.includes("incorrect") || text.includes("invalid") || text.includes("8-digit") || text.includes("8 digit")) return "invalid_code";
  return "unknown";
}

export function isNewAccount(createdAt, now = Date.now()) {
  const created = Date.parse(String(createdAt || ""));
  return Number.isFinite(created) && now - created >= 0 && now - created < 24 * 60 * 60 * 1000;
}
