import vm from "node:vm";
import assert from "node:assert/strict";
import {
  APEX_HANDOFF_BOOT,
  APEX_ORIGIN,
  WWW_HOST,
  adoptStashedHandoff,
  apexDestination,
  renderWwwHandoffHtml,
  wwwHandoffScript,
  wwwMiddlewareAction,
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
assert.equal(APEX_HANDOFF_BOOT.includes("history.replaceState"), true);
assert.equal(APEX_HANDOFF_BOOT.includes("console."), false);

console.log("www session handoff passed");
