import assert from "node:assert/strict";
import { isUuid, resetRateLimits, takeRateLimit } from "../src/lib/request-guards.ts";

resetRateLimits();

assert.equal(isUuid("550e8400-e29b-41d4-a716-446655440000"), true);
assert.equal(isUuid("550e8400e29b41d4a716446655440000"), false);
assert.equal(isUuid("------------------------------------"), false);
assert.equal(isUuid("not-a-uuid"), false);
assert.equal(isUuid(null), false);

const now = 1_700_000_000_000;
assert.equal(takeRateLimit("join:user", 2, 60_000, now).ok, true);
assert.equal(takeRateLimit("join:user", 2, 60_000, now + 10).ok, true);
const blocked = takeRateLimit("join:user", 2, 60_000, now + 20);
assert.equal(blocked.ok, false);
assert.ok(blocked.retryAfterSec >= 1);
assert.equal(takeRateLimit("join:user", 2, 60_000, now + 60_001).ok, true);

console.log("request-guards tests passed");
