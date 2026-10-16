import assert from "node:assert/strict";
import {
  FIRST_DAILY_KEY,
  SIGNUP_KEY,
  claimOnce,
  enqueue,
  errorCodeFromMessage,
  isNewAccount,
  persistQueryAttribution,
  sanitizeEvent,
  takeQueue,
} from "../src/lib/funnel-core.mjs";

function memory() {
  const data = new Map();
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    },
  };
}

const allowed = sanitizeEvent("cta_start_click", {
  src: "ig",
  variant: "default",
  position: "primary",
  utm_source: "instagram",
  email: "member@example.com",
  name: "Ada",
  reflection: "private note",
});
assert.equal(allowed.event, "cta_start_click");
assert.deepEqual(allowed.props, {
  src: "ig",
  variant: "default",
  position: "primary",
  utm_source: "instagram",
});

assert.equal(sanitizeEvent("not_an_event", { src: "ig" }), null);
assert.equal(sanitizeEvent("otp_request_failed", { error_code: "rate_limit", email: "a@b.com" }).props.error_code, "rate_limit");
assert.equal(sanitizeEvent("otp_request_failed", { error_code: "member@example.com" }).props.error_code, undefined);
assert.equal(sanitizeEvent("auth_view", { mode: "signup", src: "bad src" }).props.mode, "signup");
assert.equal(sanitizeEvent("auth_view", { mode: "signup", src: "bad src" }).props.src, undefined);

const store = memory();
assert.equal(claimOnce(store, FIRST_DAILY_KEY), true);
assert.equal(claimOnce(store, FIRST_DAILY_KEY), false);
assert.equal(enqueue(store, "first_daily_action", { email: "member@example.com", name: "Ada" }), true);
assert.deepEqual(takeQueue(store).map((item) => item.event), ["first_daily_action"]);
assert.equal(takeQueue(store).length, 0);
assert.equal(claimOnce(store, SIGNUP_KEY), true);
assert.equal(claimOnce(store, SIGNUP_KEY), false);

const session = memory();
const saved = persistQueryAttribution(session, "?src=newsletter&utm_source=october&utm_medium=email&email=member@example.com");
assert.equal(saved.src, "newsletter");
assert.equal(saved.utm_source, "october");
assert.equal(saved.utm_medium, "email");
assert.equal(saved.email, undefined);
assert.equal(session.getItem("livv-src"), "newsletter");

assert.equal(errorCodeFromMessage("Too many codes requested. Wait a minute, then try again."), "rate_limit");
assert.equal(errorCodeFromMessage("Enter a valid email address"), "invalid_email");
assert.equal(errorCodeFromMessage("Confirm that you are 13 or older before creating an account."), "age_required");
assert.equal(isNewAccount(new Date().toISOString()), true);
assert.equal(isNewAccount("2020-01-01T00:00:00.000Z"), false);

const source = await import("node:fs").then((fs) => fs.readFileSync(new URL("../src/lib/funnel.ts", import.meta.url), "utf8"));
assert.equal(source.includes(".identify("), false);
assert.equal(source.includes('persistence: "localStorage"'), true);
assert.equal(source.includes("autocapture: false"), true);
assert.equal(source.includes("disable_session_recording: true"), true);

console.log("funnel events passed");
