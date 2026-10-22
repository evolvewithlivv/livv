import vm from "node:vm";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  APEX_HANDOFF_BOOT,
  APEX_ORIGIN,
  WWW_HOST,
  adoptStashedHandoff,
  apexDestination,
  apexHandoffBrowserScript,
  handoffRefreshErrorIsBenign,
  handoffSessionAlreadyCurrent,
  renderWwwHandoffHtml,
  wwwHandoffScript,
  wwwMiddlewareAction,
  WWW_KILL_SWITCH,
} from "../src/lib/www-handoff-core.mjs";

const ACCESS = "test-access-token";
const REFRESH = "test-refresh-token";

function atob(value) {
  return Buffer.from(value, "base64").toString("binary");
}

function runWww({ hostname = WWW_HOST, path = "/home", search = "", storage = {}, cookie = "" } = {}) {
  const location = {
    hostname,
    pathname: path,
    search,
    hash: "",
    replaced: null,
    replace(url) {
      this.replaced = url;
    },
  };
  const logs = [];
  const context = {
    location,
    localStorage: {
      getItem(key) {
        return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null;
      },
    },
    document: { cookie },
    URLSearchParams,
    JSON,
    Object,
    Number,
    RegExp,
    encodeURIComponent,
    decodeURIComponent,
    atob,
    console: {
      log(...args) {
        logs.push(args);
      },
      info(...args) {
        logs.push(args);
      },
      debug(...args) {
        logs.push(args);
      },
    },
  };
  vm.runInNewContext(wwwHandoffScript(), context);
  return { location, logs };
}

function assertNoTokenLeak(url) {
  const parsed = new URL(url);
  assert.equal(parsed.search.includes(ACCESS), false);
  assert.equal(parsed.search.includes(REFRESH), false);
  assert.equal(parsed.searchParams.has("access_token"), false);
  assert.equal(parsed.searchParams.has("refresh_token"), false);
  assert.equal([...parsed.searchParams.keys()].some((key) => key.toLowerCase().includes("token")), false);
}

function runApex({ path = "/home", search = "", hash = "" } = {}) {
  const location = { pathname: path, search, hash };
  const attrs = {};
  const logs = [];
  const history = {
    replaceState(_state, _title, url) {
      const next = new URL(url, APEX_ORIGIN);
      location.pathname = next.pathname;
      location.search = next.search;
      location.hash = next.hash;
    },
  };
  const context = {
    location,
    history,
    document: {
      documentElement: {
        setAttribute(name, value) {
          attrs[name] = value;
        },
      },
    },
    window: {},
    URLSearchParams,
    JSON,
    decodeURIComponent,
    console: {
      log(...args) {
        logs.push(args);
      },
    },
  };
  context.window = context;
  vm.runInNewContext(APEX_HANDOFF_BOOT, context);
  return { location, attrs, window: context.window, logs };
}

const signedIn = runWww({
  path: "/home",
  search: "?src=test_growth&utm_source=october",
  storage: {
    "livv-supabase-auth": JSON.stringify({
      access_token: ACCESS,
      refresh_token: REFRESH,
      user: { email: "member@example.com", is_anonymous: false },
    }),
  },
});
assert.ok(signedIn.location.replaced);
const handed = new URL(signedIn.location.replaced);
assert.equal(handed.origin, APEX_ORIGIN);
assert.equal(handed.pathname, "/home");
assert.equal(handed.searchParams.get("src"), "test_growth");
assert.equal(handed.searchParams.get("utm_source"), "october");
assert.ok(handed.hash.startsWith("#livv_handoff="));
const payload = JSON.parse(decodeURIComponent(handed.hash.slice("#livv_handoff=".length)));
assert.deepEqual(payload, { access_token: ACCESS, refresh_token: REFRESH });
assertNoTokenLeak(signedIn.location.replaced);
assert.equal(signedIn.logs.length, 0);

const signedOut = runWww({ path: "/pricing", search: "?src=test_growth&utm_source=october" });
assert.equal(signedOut.location.replaced, `${APEX_ORIGIN}/pricing?src=test_growth&utm_source=october`);
assert.equal(new URL(signedOut.location.replaced).hash, "");
assertNoTokenLeak(signedOut.location.replaced);

const malformed = runWww({ storage: { "livv-supabase-auth": "{" } });
assert.equal(malformed.location.replaced, `${APEX_ORIGIN}/home`);
assert.equal(new URL(malformed.location.replaced).hash, "");

const codeWins = runWww({
  path: "/auth/callback",
  search: "?code=one-time-code&src=test_growth",
  storage: {
    "livv-supabase-auth": JSON.stringify({ access_token: ACCESS, refresh_token: REFRESH }),
  },
});
const codeUrl = new URL(codeWins.location.replaced);
assert.equal(codeUrl.pathname, "/auth/callback");
assert.equal(codeUrl.searchParams.get("code"), "one-time-code");
assert.equal(codeUrl.searchParams.get("src"), "test_growth");
assert.equal(codeUrl.hash, "");
assertNoTokenLeak(codeWins.location.replaced);

const otherHost = runWww({ hostname: "evolvewithlivv.com", storage: { "livv-supabase-auth": JSON.stringify({ access_token: ACCESS, refresh_token: REFRESH }) } });
assert.equal(otherHost.location.replaced, null);

const sessionJson = JSON.stringify({ access_token: ACCESS, refresh_token: REFRESH, user: { email: "member@example.com" } });
const b64 = Buffer.from(sessionJson, "utf8").toString("base64url");
const cookieSession = runWww({
  path: "/",
  search: "?utm_medium=email",
  cookie: `sb-project-auth-token=base64-${b64}`,
});
const cookieUrl = new URL(cookieSession.location.replaced);
assert.equal(cookieUrl.pathname, "/");
assert.equal(cookieUrl.searchParams.get("utm_medium"), "email");
assert.deepEqual(JSON.parse(decodeURIComponent(cookieUrl.hash.slice("#livv_handoff=".length))), {
  access_token: ACCESS,
  refresh_token: REFRESH,
});
assertNoTokenLeak(cookieSession.location.replaced);

const chunkA = sessionJson.slice(0, 12);
const chunkB = sessionJson.slice(12);
const chunked = runWww({
  cookie: `sb-project-auth-token.0=${encodeURIComponent(chunkA)}; sb-project-auth-token.1=${encodeURIComponent(chunkB)}`,
});
assert.deepEqual(JSON.parse(decodeURIComponent(new URL(chunked.location.replaced).hash.slice("#livv_handoff=".length))), {
  access_token: ACCESS,
  refresh_token: REFRESH,
});

const hash = `#livv_handoff=${encodeURIComponent(JSON.stringify({ access_token: ACCESS, refresh_token: REFRESH }))}`;
const adopted = runApex({ path: "/home", search: "?src=test_growth&utm_source=october", hash });
assert.equal(adopted.location.pathname, "/home");
assert.equal(adopted.location.search, "?src=test_growth&utm_source=october");
assert.equal(adopted.location.hash, "");
assert.equal(`${adopted.location.pathname}${adopted.location.search}${adopted.location.hash}`.includes(ACCESS), false);
assert.equal(adopted.window.__livvHandoff.access_token, ACCESS);
assert.equal(adopted.window.__livvHandoff.refresh_token, REFRESH);
assert.equal(adopted.attrs["data-livv-landing-hold"], "1");
assert.equal(adopted.logs.length, 0);

const calls = [];
const win = { __livvHandoff: { access_token: ACCESS, refresh_token: REFRESH } };
assert.equal(await adoptStashedHandoff(win, async (tokens) => {
  calls.push(tokens);
}), true);
assert.equal(calls.length, 1);
assert.deepEqual(calls[0], { access_token: ACCESS, refresh_token: REFRESH });
assert.equal(win.__livvHandoff, undefined);
assert.equal(await adoptStashedHandoff(win, async () => {
  throw new Error("setSession should not run twice");
}), false);

function jwt(payload) {
  return `e30.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.sig`;
}

const futureExp = Math.floor(Date.now() / 1000) + 3600;
const memberAccess = jwt({ sub: "member-1", exp: futureExp });
const staleAccess = jwt({ sub: "member-1", exp: futureExp - 30 });
const otherAccess = jwt({ sub: "member-2", exp: futureExp });
const currentSession = {
  access_token: memberAccess,
  refresh_token: "current-refresh",
  expires_at: futureExp,
  user: { id: "member-1", email: "member@example.com" },
};

assert.equal(handoffSessionAlreadyCurrent(currentSession, { access_token: staleAccess, refresh_token: "stale-refresh" }), true);
assert.equal(handoffSessionAlreadyCurrent(currentSession, { access_token: otherAccess, refresh_token: "other-refresh" }), false);
assert.equal(handoffSessionAlreadyCurrent({ ...currentSession, expires_at: Math.floor(Date.now() / 1000) - 10 }, { access_token: staleAccess, refresh_token: "stale-refresh" }), false);
assert.equal(handoffSessionAlreadyCurrent(null, { access_token: staleAccess, refresh_token: "stale-refresh" }), false);
assert.equal(handoffSessionAlreadyCurrent(currentSession, { access_token: ACCESS, refresh_token: REFRESH }), false);

const kept = [];
const already = {
  __livvHandoff: { access_token: staleAccess, refresh_token: "stale-refresh" },
  localStorage: {
    getItem(key) {
      return key === "livv-supabase-auth" ? JSON.stringify(currentSession) : null;
    },
  },
};
assert.equal(await adoptStashedHandoff(already, async (tokens) => {
  kept.push(tokens);
}), true);
assert.equal(kept.length, 0);
assert.equal(already.__livvHandoff, undefined);

const switched = [];
const otherUser = {
  __livvHandoff: { access_token: otherAccess, refresh_token: "other-refresh" },
  localStorage: {
    getItem(key) {
      return key === "livv-supabase-auth" ? JSON.stringify(currentSession) : null;
    },
  },
};
assert.equal(await adoptStashedHandoff(otherUser, async (tokens) => {
  switched.push(tokens.refresh_token);
}), true);
assert.deepEqual(switched, ["other-refresh"]);

const refreshError = { status: 400, message: "Invalid Refresh Token: Already Used", code: "refresh_token_already_used" };
assert.equal(handoffRefreshErrorIsBenign(refreshError, currentSession, { access_token: staleAccess, refresh_token: "stale-refresh" }), true);
assert.equal(handoffRefreshErrorIsBenign(refreshError, null, { access_token: staleAccess, refresh_token: "stale-refresh" }), false);
assert.equal(handoffRefreshErrorIsBenign({ status: 400, message: "Invalid payload" }, currentSession, { access_token: staleAccess, refresh_token: "stale-refresh" }), false);
assert.equal(handoffRefreshErrorIsBenign({ status: 500, message: "Invalid Refresh Token" }, currentSession, { access_token: staleAccess, refresh_token: "stale-refresh" }), false);

const browserScript = apexHandoffBrowserScript();
assert.equal(browserScript.includes("function handoffSessionAlreadyCurrent"), true);
assert.equal(browserScript.includes("async function adoptStashedHandoff"), true);
assert.equal(browserScript.includes("function readStoredSession"), true);

const handoffSource = wwwHandoffScript();
assert.equal(handoffSource.includes("refreshSession"), false);
assert.equal(handoffSource.includes("grant_type"), false);
assert.equal(handoffSource.includes("/token"), false);
assert.equal(handoffSource.includes("createClient"), false);
assert.equal(handoffSource.includes("fetch("), false);
assert.equal(handoffSource.includes("XMLHttpRequest"), false);

const apexSource = fs.readFileSync(new URL("../src/lib/apex-handoff.ts", import.meta.url), "utf8");
const recoverAt = apexSource.indexOf("await client.auth.getSession()");
const adoptAt = apexSource.indexOf("await adoptStashedHandoff");
assert.ok(recoverAt > 0 && adoptAt > recoverAt);
assert.equal(apexSource.includes("stopAutoRefresh"), true);
assert.equal(apexSource.includes("handoffRefreshErrorIsBenign"), true);
assert.equal(apexSource.includes("signOut"), false);
assert.equal(apexSource.includes("Clear-Site-Data"), false);

const codeLanding = runApex({
  path: "/auth/callback",
  search: "?code=one-time-code&src=test_growth",
  hash,
});
assert.equal(codeLanding.location.hash, "");
assert.equal(codeLanding.location.search, "?code=one-time-code&src=test_growth");
assert.equal(codeLanding.window.__livvHandoff, undefined);

const plain = runApex({ path: "/pricing", search: "?src=test_growth" });
assert.equal(plain.location.hash, "");
assert.equal(plain.window.__livvHandoff, undefined);
assert.equal(plain.attrs["data-livv-landing-hold"], undefined);

assert.equal(apexDestination("/home", "?src=test_growth&utm_source=october"), `${APEX_ORIGIN}/home?src=test_growth&utm_source=october`);
assert.equal(apexDestination("//evil.example", "?src=test_growth"), `${APEX_ORIGIN}/?src=test_growth`);
assert.equal(apexDestination("/home", ""), `${APEX_ORIGIN}/home`);

const documentAction = wwwMiddlewareAction(
  { host: "www.evolvewithlivv.com", accept: "text/html", "sec-fetch-dest": "document" },
  "/home",
  "?src=test_growth&utm_source=october",
);
assert.equal(documentAction.type, "html");
assert.equal(documentAction.location, `${APEX_ORIGIN}/home?src=test_growth&utm_source=october`);
assert.equal(documentAction.body.includes("livv-supabase-auth"), true);
assert.equal(documentAction.body.includes("#livv_handoff="), true);
assert.equal(documentAction.body.includes("history.replaceState"), false);
assert.equal(documentAction.body.includes(`href="${APEX_ORIGIN}/home?src=test_growth&amp;utm_source=october"`), true);
assert.equal(documentAction.body.includes(ACCESS), false);
assert.equal(documentAction.body.includes("?access_token="), false);

const assetAction = wwwMiddlewareAction(
  { host: "www.evolvewithlivv.com", accept: "*/*", "sec-fetch-dest": "script" },
  "/home",
  "?src=test_growth",
);
assert.equal(assetAction.type, "redirect");
assert.equal(assetAction.location, `${APEX_ORIGIN}/home?src=test_growth`);

const apexAction = wwwMiddlewareAction(
  { host: "evolvewithlivv.com", accept: "text/html", "sec-fetch-dest": "document" },
  "/",
  "?src=test_growth",
);
assert.equal(apexAction.type, "next");

const html = renderWwwHandoffHtml(`${APEX_ORIGIN}/`);
assert.equal(html.includes("<script>"), true);
assert.equal(html.includes("<noscript>"), true);
assert.equal(html.includes("console.log"), false);
assert.equal(wwwHandoffScript().includes("console."), false);
assert.equal(wwwHandoffScript().includes("/^\\s+/"), true);
assert.equal(wwwHandoffScript().includes("getRegistrations"), true);
assert.equal(wwwHandoffScript().includes("setTimeout(finish, 300)"), true);
assert.equal(wwwHandoffScript().includes("Clear-Site-Data"), false);
assert.equal(APEX_HANDOFF_BOOT.includes("history.replaceState"), true);
assert.equal(APEX_HANDOFF_BOOT.includes("console."), false);

const killSwitch = wwwMiddlewareAction(
  { host: "www.evolvewithlivv.com", accept: "*/*", "sec-fetch-dest": "serviceworker" },
  "/sw.js",
  "?src=test_growth",
);
assert.equal(killSwitch.type, "script");
assert.equal(killSwitch.body, WWW_KILL_SWITCH);
assert.equal(WWW_KILL_SWITCH.includes("Clear-Site-Data"), false);

function runKillSwitch() {
  const deleted = [];
  const navigated = [];
  const order = [];
  let unregistered = false;
  const listeners = {};
  const self = {
    skipWaiting() {
      return Promise.resolve();
    },
    registration: {
      async unregister() {
        order.push("unregister");
        unregistered = true;
        return true;
      },
    },
    clients: {
      async matchAll() {
        return [
          { url: "https://www.evolvewithlivv.com/?src=test_growth&utm_source=x", async navigate(url) { order.push("navigate"); navigated.push(url); } },
          { url: "https://www.evolvewithlivv.com/auth?src=kept", async navigate(url) { order.push("navigate"); navigated.push(url); } },
        ];
      },
    },
    addEventListener(type, fn) {
      listeners[type] = fn;
    },
  };
  const caches = {
    async keys() {
      return ["livv-shell-v2", "livv-field-guides-v1"];
    },
    async delete(key) {
      order.push("delete");
      deleted.push(key);
      return true;
    },
  };
  vm.runInNewContext(WWW_KILL_SWITCH, { self, caches, Promise }, { filename: "www-sw.js" });
  return { listeners, deleted, navigated, order, unregistered: () => unregistered };
}

const killer = runKillSwitch();
let installTask;
killer.listeners.install({
  waitUntil(value) {
    installTask = value;
  },
});
await installTask;
let activateTask;
killer.listeners.activate({
  waitUntil(value) {
    activateTask = value;
  },
});
await activateTask;
assert.deepEqual(killer.deleted.sort(), ["livv-field-guides-v1", "livv-shell-v2"]);
assert.equal(killer.unregistered(), true);
assert.deepEqual(killer.order, ["delete", "delete", "unregister", "navigate", "navigate"]);
assert.deepEqual(killer.navigated, [
  "https://www.evolvewithlivv.com/?src=test_growth&utm_source=x",
  "https://www.evolvewithlivv.com/auth?src=kept",
]);

function runWwwWithWorkers(registrations, { hang = false } = {}) {
  return new Promise((resolve) => {
    const unregistered = [];
    const location = {
      hostname: WWW_HOST,
      pathname: "/",
      search: "?src=test_growth&utm_source=x",
      hash: "",
      replaced: null,
      replace(url) {
        this.replaced = url;
        resolve({ location, unregistered });
      },
    };
    const context = {
      location,
      localStorage: { getItem() { return null; } },
      document: { cookie: "" },
      navigator: {
        serviceWorker: {
          getRegistrations() {
            if (hang) return new Promise(() => {});
            return Promise.resolve(registrations.map(() => ({
              unregister() {
                unregistered.push(true);
                return Promise.resolve(true);
              },
            })));
          },
        },
      },
      URLSearchParams,
      JSON,
      Object,
      Number,
      RegExp,
      encodeURIComponent,
      decodeURIComponent,
      atob,
      setTimeout,
      Promise,
      console: { log() {}, info() {}, debug() {} },
    };
    vm.runInNewContext(wwwHandoffScript(), context, { filename: "handoff.js" });
  });
}

const retired = await runWwwWithWorkers([1]);
assert.equal(retired.unregistered.length, 1);
assert.equal(retired.location.replaced, `${APEX_ORIGIN}/?src=test_growth&utm_source=x`);

const started = Date.now();
const timedOut = await runWwwWithWorkers([1], { hang: true });
assert.ok(Date.now() - started >= 250);
assert.ok(Date.now() - started < 800);
assert.equal(timedOut.unregistered.length, 0);
assert.equal(timedOut.location.replaced, `${APEX_ORIGIN}/?src=test_growth&utm_source=x`);

console.log("www session handoff passed");
