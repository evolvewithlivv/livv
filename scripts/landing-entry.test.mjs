import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const source = fs.readFileSync(new URL("../src/lib/landing-session.ts", import.meta.url), "utf8");
const match = source.match(/export const LANDING_SESSION_SCRIPT = `([\s\S]*)`;\s*$/);
assert.ok(match, "landing session script export missing");
const script = match[1];

function run({ path = "/", storage = {}, clicks = [], scheme = "light", beacon = "ok" } = {}) {
  const attrs = {};
  const style = {};
  const listeners = [];
  const fetches = [];
  const beacons = [];
  const location = {
    pathname: path,
    origin: "https://evolvewithlivv.com",
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
      getAttribute(name) {
        return Object.prototype.hasOwnProperty.call(attrs, name) ? attrs[name] : null;
      },
      style,
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
  const navigator = {
    sendBeacon(url, data) {
      beacons.push({ url, type: data && data.type, size: data && data.size });
      if (beacon === "throw") throw new Error("beacon failed");
      return beacon !== "fail";
    },
  };
  if (beacon === "missing") delete navigator.sendBeacon;
  const context = {
    location,
    document,
    localStorage,
    navigator,
    Blob,
    URL,
    fetch(url, init) {
      fetches.push({ url, init });
      return Promise.resolve();
    },
    matchMedia(query) {
      const wantsDark = query.includes("dark");
      return {
        matches: wantsDark ? scheme === "dark" : scheme === "light",
        addEventListener() {},
      };
    },
  };
  context.window = context;
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
  return {
    replaced: location.replaced,
    hold: attrs["data-livv-landing-hold"] || null,
    theme: attrs["data-theme"] || null,
    livvTheme: attrs["data-livv-theme"] || null,
    colorScheme: style.colorScheme || null,
    fetches,
    beacons,
    listeners,
  };
}

const loggedOut = run();
assert.equal(loggedOut.replaced, null);
assert.equal(loggedOut.hold, null);
assert.equal(loggedOut.theme, "light");
assert.equal(loggedOut.livvTheme, "daylight");
assert.equal(loggedOut.colorScheme, "light");
assert.equal(loggedOut.listeners.some((item) => item.type === "click"), true);

const darkScheme = run({ scheme: "dark" });
assert.equal(darkScheme.theme, "dark");
assert.equal(darkScheme.livvTheme, "midnight");
assert.equal(darkScheme.colorScheme, "dark");
assert.equal(darkScheme.replaced, null);

const savedDaylight = run({
  scheme: "dark",
  storage: {
    "livv-identity-v1": JSON.stringify({ appearance: "light", theme: "daylight" }),
  },
});
assert.equal(savedDaylight.theme, null);
assert.equal(savedDaylight.livvTheme, null);

const savedMidnight = run({
  scheme: "light",
  storage: {
    "livv-identity-v1": JSON.stringify({ appearance: "dark", theme: "midnight" }),
  },
});
assert.equal(savedMidnight.theme, null);
assert.equal(savedMidnight.livvTheme, null);

const unsyncedLook = run({
  scheme: "dark",
  storage: {
    "livv-look-v1": JSON.stringify({ appearance: "light", theme: "daylight", updatedAt: 5, syncedAt: 0 }),
  },
});
assert.equal(unsyncedLook.theme, null);

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
assert.equal(signedInHome.listeners.some((item) => item.type === "click"), false);

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
  scheme: "dark",
  storage: {
    "livv-supabase-auth": JSON.stringify({ user: { email: "member@example.com" } }),
    "livv-onboarding-v1": JSON.stringify({ completedAt: 1_700_000_000_000 }),
  },
});
assert.equal(otherPath.replaced, null);
assert.equal(otherPath.theme, null);
assert.equal(otherPath.listeners.length, 0);

const clicks = run({ clicks: ["landing_create_account", "landing_sign_in", "not_allowed"] });
assert.equal(clicks.beacons.length, 2);
assert.equal(clicks.fetches.length, 0);
assert.deepEqual(
  clicks.beacons.map((item) => item.url),
  ["/api/landing-event", "/api/landing-event"]
);
assert.equal(clicks.beacons.every((item) => item.type === "application/json"), true);
assert.equal(clicks.beacons[0].size, JSON.stringify({ name: "landing_create_account" }).length);
assert.equal(clicks.beacons[1].size, JSON.stringify({ name: "landing_sign_in" }).length);

const beaconFails = run({ beacon: "fail", clicks: ["landing_sign_in"] });
assert.equal(beaconFails.beacons.length, 1);
assert.equal(beaconFails.fetches.length, 1);
assert.equal(beaconFails.fetches[0].init.keepalive, true);
assert.equal(beaconFails.fetches[0].init.body, JSON.stringify({ name: "landing_sign_in" }));

const beaconThrows = run({ beacon: "throw", clicks: ["landing_create_account"] });
assert.equal(beaconThrows.fetches.length, 1);
assert.equal(beaconThrows.fetches[0].init.keepalive, true);

const beaconMissing = run({ beacon: "missing", clicks: ["landing_create_account", "landing_sign_in"] });
assert.equal(beaconMissing.beacons.length, 0);
assert.equal(beaconMissing.fetches.length, 2);
assert.equal(beaconMissing.fetches.every((item) => item.url === "/api/landing-event" && item.init.keepalive === true), true);

assert.equal(script.includes("/go/001"), false);
assert.equal(script.includes("—"), false);
assert.equal(script.includes("navigator.sendBeacon"), true);
assert.equal(script.includes("keepalive: true"), true);

console.log("landing entry script passed");
