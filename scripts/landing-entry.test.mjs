import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const source = fs.readFileSync(new URL("../src/lib/landing-session.ts", import.meta.url), "utf8");
const match = source.match(/export const LANDING_SESSION_SCRIPT = `([\s\S]*)`;\s*$/);
assert.ok(match, "landing session script export missing");
const script = match[1];

function run({ path = "/", storage = {}, clicks = [] } = {}) {
  const attrs = {};
  const listeners = [];
  const fetches = [];
  const location = {
    pathname: path,
    replaced: null,
    replace(url) {
      this.replaced = url;
    },
  };
  const document = {
    documentElement: {
      setAttribute(name, value) {
        attrs[name] = value;
      },
    },
    addEventListener(type, handler, capture) {
      listeners.push({ type, handler, capture });
    },
  };
  const localStorage = {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null;
    },
  };
  const context = {
    location,
    document,
    localStorage,
    fetch(url, init) {
      fetches.push({ url, init });
      return Promise.resolve();
    },
  };
  vm.runInNewContext(script, context);
  for (const click of clicks) {
    const listener = listeners.find((item) => item.type === "click");
    listener?.handler({
      target: {
        closest(selector) {
          if (selector !== "a[data-landing-event]") return null;
          return {
            getAttribute(name) {
              return name === "data-landing-event" ? click : null;
            },
          };
        },
      },
    });
  }
  return { replaced: location.replaced, hold: attrs["data-livv-landing-hold"] || null, fetches, listeners };
}

const loggedOut = run();
assert.equal(loggedOut.replaced, null);
assert.equal(loggedOut.hold, null);
assert.equal(loggedOut.listeners.length, 1);

const anonymous = run({
  storage: {
    "livv-supabase-auth": JSON.stringify({ user: { is_anonymous: true, email: null } }),
  },
});
assert.equal(anonymous.replaced, null);
assert.equal(anonymous.hold, null);

const signedInHome = run({
  storage: {
    "livv-supabase-auth": JSON.stringify({ user: { is_anonymous: false, email: "member@example.com" } }),
    "livv-onboarding-v1": JSON.stringify({ completedAt: 1_700_000_000_000 }),
  },
});
assert.equal(signedInHome.replaced, "/home");
assert.equal(signedInHome.listeners.length, 0);

const signedInHold = run({
  storage: {
    "livv-supabase-auth": JSON.stringify({ user: { email: "member@example.com" } }),
    "livv-onboarding-v1": JSON.stringify({ completedAt: null }),
  },
});
assert.equal(signedInHold.replaced, null);
assert.equal(signedInHold.hold, "1");

const otherPath = run({
  path: "/home",
  storage: {
    "livv-supabase-auth": JSON.stringify({ user: { email: "member@example.com" } }),
    "livv-onboarding-v1": JSON.stringify({ completedAt: 1_700_000_000_000 }),
  },
});
assert.equal(otherPath.replaced, null);
assert.equal(otherPath.listeners.length, 0);

const clicks = run({ clicks: ["landing_create_account", "landing_sign_in", "not_allowed"] });
assert.equal(clicks.fetches.length, 2);
assert.deepEqual(
  clicks.fetches.map((item) => JSON.parse(item.init.body)),
  [{ name: "landing_create_account" }, { name: "landing_sign_in" }]
);
assert.equal(clicks.fetches.every((item) => item.url === "/api/landing-event" && item.init.keepalive === true), true);

assert.equal(script.includes("/go/001"), false);
assert.equal(script.includes("—"), false);

console.log("landing entry script passed");
