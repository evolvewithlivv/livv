import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const source = fs.readFileSync(new URL("../src/lib/landing-session.ts", import.meta.url), "utf8");
const match = source.match(/export const LANDING_SESSION_SCRIPT = `([\s\S]*)`;\s*$/);
assert.ok(match, "landing session script export missing");
const script = match[1];

function run({ path = "/", search = "", storage = {}, clicks = [], scheme = "light", width = 390, track = null } = {}) {
  const attrs = {};
  const style = {};
  const listeners = [];
  const fetches = [];
  const tracked = [];
  const sessionData = {};
  const location = {
    pathname: path,
    search,
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
  const sessionStorage = {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(sessionData, key) ? sessionData[key] : null;
    },
    setItem(key, value) {
      sessionData[key] = String(value);
    },
  };
  const context = {
    location,
    document,
    localStorage,
    sessionStorage,
    URL,
    URLSearchParams,
    fetch(url, init) {
      fetches.push({ url, init });
      return Promise.resolve();
    },
    matchMedia(query) {
      if (query.includes("max-width")) {
        return { matches: width < 768, addEventListener() {} };
      }
      const wantsDark = query.includes("dark");
      return {
        matches: wantsDark ? scheme === "dark" : scheme === "light",
        addEventListener() {},
      };
    },
  };
  if (track) context.__livvTrack = (eventName, props) => tracked.push({ eventName, props });
  context.window = context;
  vm.runInNewContext(script, context);
  for (const click of clicks) {
    const listener = listeners.find((item) => item.type === "click");
    const link = {
      href: click.href || (click.position === "primary" ? "/auth?mode=create" : "/auth"),
      getAttribute(name) {
        if (name === "data-landing-event") return click.event || "cta_start_click";
        if (name === "data-landing-position") return click.position || null;
        if (name === "href") return this.href;
        return null;
      },
      setAttribute(name, value) {
        if (name === "href") this.href = value;
      },
    };
    click.link = link;
    listener?.handler({
      target: {
        closest(selector) {
          if (selector !== "a[data-landing-event]") return null;
          return link;
        },
      },
    });
  }
  return {
    replaced: location.replaced,
    hold: attrs["data-livv-landing-hold"] || null,
    theme: attrs["data-theme"] || null,
    livvTheme: attrs["data-livv-theme"] || null,
    scheme: attrs["data-livv-scheme"] || null,
    colorScheme: style.colorScheme || null,
    fetches,
    tracked,
    queue: sessionData["livv-funnel-queue"] ? JSON.parse(sessionData["livv-funnel-queue"]) : [],
    attr: sessionData["livv-attr-v1"] ? JSON.parse(sessionData["livv-attr-v1"]) : null,
    src: sessionData["livv-src"] || null,
    listeners,
  };
}

const loggedOut = run();
assert.equal(loggedOut.replaced, null);
assert.equal(loggedOut.hold, null);
assert.equal(loggedOut.theme, "light");
assert.equal(loggedOut.livvTheme, "daylight");
assert.equal(loggedOut.scheme, "system");
assert.equal(loggedOut.colorScheme, "light");
assert.equal(loggedOut.listeners.some((item) => item.type === "click"), true);

const darkScheme = run({ scheme: "dark" });
assert.equal(darkScheme.theme, "dark");
assert.equal(darkScheme.livvTheme, "midnight");
assert.equal(darkScheme.scheme, "system");
assert.equal(darkScheme.colorScheme, "dark");
assert.equal(darkScheme.replaced, null);

const savedDaylight = run({
  scheme: "dark",
  storage: {
    "livv-identity-v1": JSON.stringify({ appearance: "light", theme: "daylight" }),
  },
});
assert.equal(savedDaylight.theme, "dark");
assert.equal(savedDaylight.livvTheme, "midnight");
assert.equal(savedDaylight.scheme, "system");
assert.equal(savedDaylight.colorScheme, "dark");

const namedDaylight = run({
  scheme: "dark",
  storage: {
    "livv-identity-v1": JSON.stringify({ appearance: "light", theme: "daylight", displayName: "Ada" }),
  },
});
assert.equal(namedDaylight.theme, null);
assert.equal(namedDaylight.livvTheme, null);
assert.equal(namedDaylight.scheme, null);

const midnightAlone = run({
  scheme: "light",
  storage: {
    "livv-identity-v1": JSON.stringify({ theme: "midnight" }),
  },
});
assert.equal(midnightAlone.theme, null);
assert.equal(midnightAlone.scheme, null);

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
assert.equal(signedInHome.queue.some((item) => item.event === "landing_view"), false);

const signedInAttributed = run({
  search: "?src=test_growth&utm_source=x",
  storage: {
    "livv-supabase-auth": JSON.stringify({ user: { is_anonymous: false, email: "member@example.com" } }),
    "livv-onboarding-v1": JSON.stringify({ completedAt: 1_700_000_000_000 }),
  },
});
assert.equal(signedInAttributed.replaced, "/home?src=test_growth&utm_source=x");
assert.equal(signedInAttributed.attr.src, "test_growth");
assert.equal(signedInAttributed.attr.utm_source, "x");
assert.equal(signedInAttributed.src, "test_growth");

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
  search: "?src=test_growth&utm_source=october&utm_medium=email",
  storage: {
    "livv-supabase-auth": JSON.stringify({ user: { email: "member@example.com" } }),
    "livv-onboarding-v1": JSON.stringify({ completedAt: 1_700_000_000_000 }),
  },
});
assert.equal(otherPath.replaced, null);
assert.equal(otherPath.theme, null);
assert.equal(otherPath.listeners.length, 0);
assert.equal(otherPath.attr.src, "test_growth");
assert.equal(otherPath.attr.utm_source, "october");
assert.equal(otherPath.attr.utm_medium, "email");
assert.equal(otherPath.src, "test_growth");

const pricingPath = run({
  path: "/pricing",
  search: "?src=newsletter&utm_campaign=october",
});
assert.equal(pricingPath.replaced, null);
assert.equal(pricingPath.listeners.length, 0);
assert.equal(pricingPath.attr.src, "newsletter");
assert.equal(pricingPath.attr.utm_campaign, "october");

const clicks = run({
  search: "?src=ig&utm_source=instagram&utm_medium=social",
  clicks: [{ position: "primary" }, { position: "secondary" }, { position: "nope" }],
});
assert.equal(clicks.fetches.length, 0);
assert.equal(clicks.src, "ig");
assert.equal(clicks.attr.utm_source, "instagram");
assert.equal(clicks.attr.utm_medium, "social");
assert.deepEqual(
  clicks.queue.map((item) => item.event),
  ["landing_view", "cta_start_click", "cta_start_click"]
);
assert.equal(clicks.queue[0].props.device, "mobile");
assert.equal(clicks.queue[0].props.src, "ig");
assert.deepEqual(
  clicks.queue.slice(1).map((item) => item.props.position),
  ["primary", "secondary"]
);

const tracked = run({
  track: true,
  clicks: [{ position: "primary" }],
});
assert.equal(tracked.queue.length, 0);
assert.deepEqual(
  tracked.tracked.map((item) => item.eventName),
  ["landing_view", "cta_start_click"]
);

const held = run({
  storage: {
    "livv-supabase-auth": JSON.stringify({ user: { email: "member@example.com" } }),
  },
});
assert.equal(held.queue.some((item) => item.event === "landing_view"), false);

assert.equal(script.includes("/go/001"), false);
assert.equal(script.includes("—"), false);
assert.equal(script.includes("/api/landing-event"), false);
assert.equal(script.includes("cta_start_click"), true);
assert.equal(script.includes("landing_view"), true);
assert.equal(script.includes("utm_source"), true);

const growthClicks = [{ position: "primary", href: "/auth?mode=create" }];
const growth = run({
  search: "?src=test_growth&utm_source=october",
  width: 1280,
  clicks: growthClicks,
});
assert.deepEqual(
  growth.queue.map((item) => item.event),
  ["landing_view", "cta_start_click"]
);
assert.equal(growth.queue.filter((item) => item.event === "landing_view").length, 1);
assert.equal(growth.queue.filter((item) => item.event === "cta_start_click").length, 1);
assert.equal(growth.queue[0].props.src, "test_growth");
assert.equal(growth.queue[0].props.device, "desktop");
assert.equal(growth.queue[0].props.utm_source, "october");
assert.equal(growth.queue[1].props.src, "test_growth");
assert.equal(growth.queue[1].props.position, "primary");
assert.equal(growthClicks[0].link.href, "/auth?mode=create&src=test_growth");
assert.equal(growth.queue[0].props.email, undefined);

console.log("landing entry script passed");

const layout = fs.readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
const themeBoot = layout.match(/const THEME_BOOT=`([\s\S]*?)`;/);
assert.ok(themeBoot, "theme boot script missing");
assert.equal(themeBoot[1].includes("matchMedia('(prefers-color-scheme: dark)')"), true);

function runThemeBoot({ scheme = "light", storage = {} } = {}) {
  const attrs = {};
  const style = {};
  const localStorage = {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null;
    },
  };
  const context = {
    localStorage,
    matchMedia(query) {
      return { matches: query.includes("dark") ? scheme === "dark" : scheme !== "dark" };
    },
    document: {
      documentElement: {
        setAttribute(name, value) {
          attrs[name] = value;
        },
        style,
      },
    },
  };
  context.window = context;
  vm.runInNewContext(themeBoot[1], context);
  return { theme: attrs["data-theme"], livvTheme: attrs["data-livv-theme"], scheme: attrs["data-livv-scheme"], colorScheme: style.colorScheme };
}

const bootDark = runThemeBoot({ scheme: "dark" });
assert.equal(bootDark.theme, "dark");
assert.equal(bootDark.livvTheme, "midnight");
assert.equal(bootDark.scheme, "system");
assert.equal(bootDark.colorScheme, "dark");

const bootLight = runThemeBoot({ scheme: "light" });
assert.equal(bootLight.theme, "light");
assert.equal(bootLight.livvTheme, "daylight");
assert.equal(bootLight.scheme, "system");

const bootSaved = runThemeBoot({
  scheme: "dark",
  storage: { "livv-identity-v1": JSON.stringify({ appearance: "light", theme: "daylight", displayName: "Ada" }) },
});
assert.equal(bootSaved.theme, "light");
assert.equal(bootSaved.livvTheme, "daylight");
assert.equal(bootSaved.scheme, "choice");

const bootStub = runThemeBoot({
  scheme: "dark",
  storage: { "livv-identity-v1": JSON.stringify({ appearance: "light", theme: "daylight" }) },
});
assert.equal(bootStub.theme, "dark");
assert.equal(bootStub.livvTheme, "midnight");
assert.equal(bootStub.scheme, "system");

const bootMidnightAlone = runThemeBoot({
  scheme: "light",
  storage: { "livv-identity-v1": JSON.stringify({ theme: "midnight" }) },
});
assert.equal(bootMidnightAlone.theme, "dark");
assert.equal(bootMidnightAlone.livvTheme, "midnight");
assert.equal(bootMidnightAlone.scheme, "choice");

const bootSystem = runThemeBoot({
  scheme: "dark",
  storage: { "livv-identity-v1": JSON.stringify({ appearance: "system", theme: "daylight" }) },
});
assert.equal(bootSystem.theme, "dark");
assert.equal(bootSystem.scheme, "system");

console.log("theme boot script passed");

const og = fs.readFileSync(new URL("../src/app/opengraph-image.tsx", import.meta.url), "utf8");
const topLevelRead = og.split("\n").some((line) => !/^\s/.test(line) && line.includes("readFileSync("));
assert.equal(topLevelRead, false, "opengraph image must not read the wordmark while the module loads");
