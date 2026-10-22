import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
import { wwwMiddlewareAction } from "../src/lib/www-handoff-core.mjs";

const source = fs.readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
const entry = fs.readFileSync(new URL("../src/components/landing/signed-in-entry.tsx", import.meta.url), "utf8");
const landing = fs.readFileSync(new URL("../src/lib/landing-session.ts", import.meta.url), "utf8");

assert.equal(source.includes("Response.redirect"), false);
assert.equal(source.includes("livv-shell-v4"), true);
assert.equal(source.includes("livv-shell-v3"), false);
assert.equal(source.includes("livv-shell-v2"), false);
assert.equal(source.includes('request.mode==="navigate"&&!url.pathname.startsWith("/field-offline/")'), true);
assert.equal(entry.includes('window.location.replace("/home" + window.location.search)'), true);
assert.equal(entry.includes('window.location.replace("/onboarding" + window.location.search)'), true);
assert.equal(landing.includes('location.replace("/home" + location.search)'), true);
const attrAt = landing.indexOf('sessionStorage.setItem("livv-attr-v1"');
const homeAt = landing.indexOf('location.replace("/home" + location.search)');
assert.ok(attrAt > 0 && homeAt > attrAt);

function loadWorker() {
  const listeners = {};
  const deleted = [];
  const opened = [];
  const cacheStore = {
    async add() {},
    async match() {
      return undefined;
    },
    async put() {},
  };
  const caches = {
    async open(name) {
      opened.push(name);
      return cacheStore;
    },
    async keys() {
      return ["livv-shell-v2", "livv-shell-v3", "livv-field-guides-v1", "livv-static-assets-v1", "livv-other"];
    },
    async delete(key) {
      deleted.push(key);
      return true;
    },
    async match() {
      return undefined;
    },
  };
  const self = {
    location: { origin: "https://evolvewithlivv.com", href: "https://evolvewithlivv.com/sw.js" },
    skipWaiting() {
      return Promise.resolve();
    },
    clients: {
      claim() {
        return Promise.resolve();
      },
    },
    addEventListener(type, fn) {
      listeners[type] = fn;
    },
  };
  const context = {
    self,
    caches,
    URL,
    Promise,
    Response,
    console,
    fetch: async () => new Response("offline-guide", { status: 200, headers: { "Content-Type": "text/html" } }),
  };
  vm.runInNewContext(source, context, { filename: "sw.js" });
  return { listeners, deleted, opened };
}

function dispatch(listeners, request) {
  let task = null;
  listeners.fetch({
    request,
    respondWith(value) {
      task = value;
    },
  });
  return task;
}

const worker = loadWorker();
let activation;
worker.listeners.activate({
  waitUntil(value) {
    activation = value;
  },
});
await activation;
assert.deepEqual(worker.deleted.sort(), ["livv-other", "livv-shell-v2", "livv-shell-v3", "livv-static-assets-v1"].sort());

const rootNavigation = dispatch(worker.listeners, {
  method: "GET",
  mode: "navigate",
  destination: "document",
  url: "https://evolvewithlivv.com/?src=test_growth&utm_source=x",
});
assert.equal(rootNavigation, null);

const authNavigation = dispatch(worker.listeners, {
  method: "GET",
  mode: "navigate",
  destination: "document",
  url: "https://evolvewithlivv.com/auth?src=test_growth&utm_source=x",
});
assert.equal(authNavigation, null);

const guide = dispatch(worker.listeners, {
  method: "GET",
  mode: "navigate",
  destination: "document",
  url: "https://evolvewithlivv.com/field-offline/grow-leafy-greens/",
});
assert.ok(guide);
const guideResponse = await guide;
assert.equal(guideResponse.status, 200);

const api = dispatch(worker.listeners, {
  method: "GET",
  mode: "cors",
  destination: "",
  url: "https://evolvewithlivv.com/api/health",
});
assert.equal(api, null);

const search = "?src=test_growth&utm_source=x";
const documentHandoff = wwwMiddlewareAction(
  { host: "www.evolvewithlivv.com", "sec-fetch-dest": "document", accept: "text/html" },
  "/",
  search,
);
assert.equal(documentHandoff.type, "html");
assert.equal(documentHandoff.location, `https://evolvewithlivv.com/${search}`);
assert.equal(documentHandoff.body.includes("https://evolvewithlivv.com/?src=test_growth&amp;utm_source=x"), true);

const workerFetch = wwwMiddlewareAction(
  { host: "www.evolvewithlivv.com", "sec-fetch-dest": "empty", accept: "*/*" },
  "/",
  search,
);
assert.equal(workerFetch.type, "redirect");
assert.equal(workerFetch.location, `https://evolvewithlivv.com/${search}`);

const workerScript = wwwMiddlewareAction(
  { host: "www.evolvewithlivv.com", "sec-fetch-dest": "serviceworker", accept: "*/*" },
  "/sw.js",
  "",
);
assert.equal(workerScript.type, "script");
assert.equal(workerScript.body.includes("skipWaiting"), true);
assert.equal(workerScript.body.includes("caches.delete"), true);
assert.equal(workerScript.body.includes("self.registration.unregister()"), true);
assert.equal(workerScript.body.includes("client.navigate(client.url)"), true);
assert.equal(workerScript.body.includes("Clear-Site-Data"), false);
assert.equal(workerScript.body.includes("livv-shell-v2"), false);
assert.equal(workerScript.body.includes("Response.redirect"), false);
const deleteAt = workerScript.body.indexOf("caches.delete");
const unregisterAt = workerScript.body.indexOf("self.registration.unregister()");
const navigateAt = workerScript.body.indexOf("client.navigate(client.url)");
assert.ok(deleteAt > 0 && deleteAt < unregisterAt && unregisterAt < navigateAt);

const authScreen = fs.readFileSync(new URL("../src/app/auth/auth-screen.tsx", import.meta.url), "utf8");
assert.equal(authScreen.includes('router.replace(path + window.location.search)'), true);
assert.equal(authScreen.includes('window.location.replace("/home")'), false);
assert.equal(authScreen.includes('window.location.replace("/onboarding")'), false);

console.log("service worker navigation passed");
