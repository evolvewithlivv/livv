import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { INTERNAL_EMAIL_HASH_PREFIXES, isLivvInternalEmail } from "../src/lib/livv-internal.mjs";
import {
  accountIdentify,
  attributionFromUnknown,
  shouldRecordSignup,
  signupAlreadyRecorded,
  signupCapture,
  signupEventUuid,
  signupMetadataPatch,
} from "../src/lib/signup-analytics.mjs";

const prefixes = [
  "bce3c28b",
  "b8ed352a",
  "ed9c9284",
  "36da986a",
  "c4fd41ca",
  "75f3c6c2",
  "2e6c7533",
];
assert.deepEqual([...INTERNAL_EMAIL_HASH_PREFIXES], prefixes);
assert.equal(isLivvInternalEmail("QA@Mail.Grokbot.com"), true);
assert.equal(isLivvInternalEmail("  person@mail.grokbot.com "), true);
assert.equal(isLivvInternalEmail("person@sub.mail.grokbot.com"), false);
assert.equal(isLivvInternalEmail("person@mail.grokbot.com.evil.com"), false);
assert.equal(isLivvInternalEmail("not-an-email"), false);
assert.equal(isLivvInternalEmail(""), false);
assert.equal(isLivvInternalEmail(null), false);

const sample = "person@example.com";
const samplePrefix = createHash("md5").update(sample).digest("hex").slice(0, 8);
assert.equal(isLivvInternalEmail(sample), INTERNAL_EMAIL_HASH_PREFIXES.has(samplePrefix));
assert.equal(isLivvInternalEmail(sample, new Set([samplePrefix])), true);
assert.equal(isLivvInternalEmail(sample, new Set()), false);
assert.equal(isLivvInternalEmail("QA@Mail.Grokbot.com", new Set()), true);

const now = Date.parse("2026-10-23T12:00:00.000Z");
const recent = "2026-10-23T11:30:00.000Z";
const old = "2026-01-01T00:00:00.000Z";
const base = { email: "member@example.com", is_anonymous: false, created_at: old, email_confirmed_at: old };

assert.equal(shouldRecordSignup({ ...base, created_at: recent }, now), true);
assert.equal(shouldRecordSignup({ ...base, email_confirmed_at: recent }, now), true);
assert.equal(shouldRecordSignup(base, now), false);
assert.equal(shouldRecordSignup({ ...base, created_at: recent, is_anonymous: true }, now), false);
assert.equal(shouldRecordSignup({ ...base, created_at: recent, email: "" }, now), false);
assert.equal(
  shouldRecordSignup({ ...base, created_at: recent, app_metadata: { livv_signup_completed: true } }, now),
  false,
);
assert.equal(
  shouldRecordSignup({ ...base, email_confirmed_at: recent, user_metadata: { livv_signup_completed: true } }, now),
  false,
);
assert.equal(signupAlreadyRecorded({ app_metadata: { provider: "email" } }), false);
assert.equal(signupAlreadyRecorded({ user_metadata: { livv_signup_completed: true } }), true);

const patched = signupMetadataPatch({ provider: "email", email: "member@example.com", phone: "555" });
assert.equal(patched.provider, "email");
assert.equal(patched.livv_signup_completed, true);
assert.equal(patched.email, undefined);
assert.equal(patched.phone, undefined);

const long = `a${"b".repeat(63)}`;
const longer = `a${"b".repeat(64)}`;
const attr = attributionFromUnknown({
  src: "newsletter",
  utm_source: "october",
  utm_medium: "email",
  utm_campaign: long,
  utm_content: longer,
  utm_term: "bad term",
  email: "member@example.com",
  variant: "default",
});
assert.equal(attr.src, "newsletter");
assert.equal(attr.utm_source, "october");
assert.equal(attr.utm_medium, "email");
assert.equal(attr.utm_campaign, long);
assert.equal(attr.utm_content, undefined);
assert.equal(attr.utm_term, undefined);
assert.equal(attr.email, undefined);
assert.equal(attr.variant, undefined);

const userId = "11111111-1111-4111-8111-111111111111";
const capture = signupCapture(userId, { ...attr, email: "member@example.com" }, false);
assert.equal(capture.event, "signup_completed");
assert.equal(capture.distinctId, userId);
assert.equal(capture.uuid, signupEventUuid(userId));
assert.equal(capture.uuid, signupEventUuid(userId));
assert.match(capture.uuid, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[ab89][0-9a-f]{3}-[0-9a-f]{12}$/);
assert.equal(capture.properties.email, undefined);
assert.deepEqual(capture.properties.$set, { livv_internal: false });
assert.equal(capture.properties.src, "newsletter");
assert.equal(JSON.stringify(capture).includes("member@example.com"), false);
assert.equal(JSON.stringify(capture).includes(samplePrefix), false);

const identified = accountIdentify(userId, true);
assert.deepEqual(identified, { distinctId: userId, properties: { livv_internal: true } });
assert.equal(JSON.stringify(identified).includes("@"), false);
assert.deepEqual(accountIdentify(userId, false).properties, { livv_internal: false });

const root = fileURLToPath(new URL("../src/", import.meta.url));
const offenders = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(ts|tsx|mjs|js)$/.test(name)) continue;
    const text = fs.readFileSync(full, "utf8");
    if (name === "livv-internal.mjs" || name === "livv-internal.ts") continue;
    if (text.includes("livv-internal.mjs") || text.includes("INTERNAL_EMAIL_HASH_PREFIXES") || text.includes("bce3c28b")) {
      offenders.push(path.relative(root, full));
    }
  }
}
walk(root);
assert.deepEqual(offenders, []);

const route = fs.readFileSync(new URL("../src/app/api/analytics/signup/route.ts", import.meta.url), "utf8");
const server = fs.readFileSync(new URL("../src/lib/posthog-server.ts", import.meta.url), "utf8");
assert.equal(route.includes("shutdown(") || server.includes("shutdown("), true);
assert.equal(server.includes("captureImmediate"), true);
assert.equal(server.includes("identifyImmediate"), true);
assert.equal(route.includes("bce3c28b"), false);
assert.equal(route.includes("mail.grokbot.com"), false);

console.log("signup analytics passed");
