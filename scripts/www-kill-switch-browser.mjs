/**
 * Registers the old www v2 worker on a www-like origin, confirms it sends
 * /?src&utm to /auth without the query, then confirms the handoff page
 * unregisters that worker and the next visit keeps the query.
 * A second phase loads the kill-switch /sw.js and confirms activate
 * unregisters it. Fake session values are never printed.
 */
import http from "node:http";
import { spawn } from "node:child_process";
import { renderWwwHandoffHtml, WWW_KILL_SWITCH } from "../src/lib/www-handoff-core.mjs";

const PORT = 8094;
const DEBUG_PORT = 9344;
const WWW = `http://www.evolvewithlivv.com:${PORT}`;
const APEX = `http://evolvewithlivv.com:${PORT}`;
const QUERY = "/?src=test_growth&utm_source=x";
const ACCESS = "test-access-token";
const REFRESH = "test-refresh-token";

const OLD_WORKER = `const CACHE="livv-shell-v2";
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.put("/",new Response("old-shell"))).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(url.pathname==="/"&&request.mode==="navigate"){
    event.respondWith((async()=>{
      const response=await fetch(request,{redirect:"manual"});
      if(response.type==="opaqueredirect"||(response.status>=300&&response.status<400)){
        return Response.redirect("/auth",307);
      }
      return response;
    })());
  }
});
`;

let workerMode = "old";
const hits = [];

function isDocument(req) {
  const dest = String(req.headers["sec-fetch-dest"] || "").toLowerCase();
  return dest === "document" || dest === "iframe";
}

function handoff(url) {
  return renderWwwHandoffHtml(`${APEX}${url.pathname}${url.search}`, APEX);
}

const server = http.createServer((req, res) => {
  const host = String(req.headers.host || "");
  const url = new URL(req.url || "/", `http://${host || "localhost"}`);
  const onWww = host.startsWith("www.evolvewithlivv.com");
  hits.push(`${onWww ? "www" : "apex"} ${req.method} ${url.pathname}${url.search ? "?…" : ""}`);
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  if (onWww && url.pathname === "/sw.js") {
    const body = workerMode === "kill" ? WWW_KILL_SWITCH : OLD_WORKER;
    res.writeHead(200, {
      "Content-Type": "application/javascript; charset=utf-8",
      "Service-Worker-Allowed": "/",
    });
    res.end(body);
    return;
  }
  if (!onWww) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<!doctype html><html><head><meta charset=\"utf-8\"></head><body>apex</body></html>");
    return;
  }
  if (url.pathname === "/install") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<!doctype html><html><body>install<script>
localStorage.setItem("livv-supabase-auth", ${JSON.stringify(JSON.stringify({ access_token: ACCESS, refresh_token: REFRESH }))});
var again = new URLSearchParams(location.search).get("again") === "1";
if (sessionStorage.getItem("livv-installed") === "1" && !again) {
  document.documentElement.setAttribute("data-ready", navigator.serviceWorker.controller ? "1" : "0");
} else {
  sessionStorage.setItem("livv-installed", "1");
  navigator.serviceWorker.register("/sw.js",{updateViaCache:"none"}).then(function(){
    return navigator.serviceWorker.ready;
  }).then(function(){
    history.replaceState(null, "", "/install");
    document.documentElement.setAttribute("data-ready","1");
  });
}
</script></body></html>`);
    return;
  }
  if (url.pathname === "/status") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<!doctype html><html><body>status<script>
navigator.serviceWorker.getRegistrations().then(function(regs){
  document.documentElement.setAttribute("data-regs", String(regs.length));
  return caches.keys();
}).then(function(keys){
  document.documentElement.setAttribute("data-caches", keys.join(","));
  document.documentElement.setAttribute("data-ready","1");
});
</script></body></html>`);
    return;
  }
  if (url.pathname === "/" && !isDocument(req)) {
    res.writeHead(307, { Location: `${APEX}/${url.search}` });
    res.end();
    return;
  }
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(handoff(url));
});

await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));

const chrome = spawn(
  "google-chrome",
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=/tmp/livv-www-kill-${process.pid}`,
    `--host-resolver-rules=MAP www.evolvewithlivv.com 127.0.0.1, MAP evolvewithlivv.com 127.0.0.1`,
    `--unsafely-treat-insecure-origin-as-secure=${WWW},${APEX}`,
    `${WWW}/install`,
  ],
  { stdio: "ignore" },
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDebug() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      if (response.ok) return;
    } catch {
      /* chrome still starting */
    }
    await sleep(100);
  }
  throw new Error("Chrome debugging port did not open");
}

await waitForDebug();

async function withPage(run) {
  const listed = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
  const tabs = await listed.json();
  const pageTab = tabs.find((tab) => tab.type === "page" && tab.webSocketDebuggerUrl);
  if (!pageTab) throw new Error("Chrome did not open the install page");
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve);
    ws.addEventListener("error", reject);
  });
  let nextId = 0;
  const pending = new Map();
  const navigations = [];
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Page.frameNavigated" && message.params?.frame?.url) {
      const landed = new URL(message.params.frame.url);
      navigations.push({
        host: landed.hostname,
        path: landed.pathname,
        src: landed.searchParams.get("src") || "",
        utm_source: landed.searchParams.get("utm_source") || "",
        fragment: landed.hash.startsWith("#livv_handoff="),
      });
    }
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message || "cdp error"));
      else resolve(message.result);
    }
  });
  function send(method, params = {}) {
    const id = ++nextId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }
  try {
    await send("Page.enable");
    await send("Runtime.enable");
    return await run(send, navigations);
  } finally {
    ws.close();
  }
}

async function evaluate(send, expression) {
  const evaluated = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (evaluated.exceptionDetails) {
    throw new Error(evaluated.exceptionDetails.text || "page evaluation failed");
  }
  return evaluated.result.value;
}

async function readLocation(send) {
  return evaluate(send, `(() => {
    const params = new URLSearchParams(location.search);
    const hash = location.hash || "";
    return {
      host: location.hostname,
      path: location.pathname,
      src: params.get("src") || "",
      utm_source: params.get("utm_source") || "",
      fragment: hash.indexOf("#livv_handoff=") === 0,
      ready: document.documentElement.getAttribute("data-ready") || "",
      regs: document.documentElement.getAttribute("data-regs") || "",
      caches: document.documentElement.getAttribute("data-caches") || ""
    };
  })()`);
}

async function waitFor(send, predicate, label) {
  let last = null;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      last = await readLocation(send);
    } catch {
      last = null;
    }
    if (last && predicate(last)) return last;
    await sleep(100);
  }
  throw new Error(`${label}: ${JSON.stringify(last)}`);
}

try {
  const result = await withPage(async (send, navigations) => {
    await waitFor(send, (state) => state.path === "/install" && state.ready === "1", "old worker install");
    const controlling = await evaluate(send, "Boolean(navigator.serviceWorker.controller)");
    if (!controlling) throw new Error("old v2 worker did not take control");
    await send("Page.navigate", { url: `${WWW}${QUERY}` });
    const stripped = await waitFor(
      send,
      (state) => state.host === "evolvewithlivv.com" && state.path === "/auth" && state.src === "" && state.utm_source === "",
      "old worker should strip the query before the handoff leaves www",
    );
    await send("Page.navigate", { url: `${WWW}/status` });
    const status = await waitFor(
      send,
      (state) => state.host.startsWith("www") && state.path === "/status" && state.ready === "1",
      "www status after the handoff unregisters",
    );
    await send("Page.navigate", { url: `${WWW}${QUERY}` });
    const kept = await waitFor(
      send,
      (state) => state.host === "evolvewithlivv.com" && state.path === "/" && state.src === "test_growth" && state.utm_source === "x" && state.fragment,
      "second visit should keep src, utm, and the session fragment",
    );

    workerMode = "old";
    await send("Page.navigate", { url: `${WWW}/install?again=1` });
    await waitFor(send, (state) => state.host.startsWith("www") && state.path === "/install" && state.ready === "1", "reinstall old worker");
    workerMode = "kill";
    try {
      await evaluate(send, `navigator.serviceWorker.getRegistration().then(function (registration) {
        if (!registration) throw new Error("missing");
        return registration.update();
      })`);
    } catch {
      /* activate navigates this client and can drop the execution context */
    }
    let cleared = false;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      try {
        const pending = await evaluate(send, "navigator.serviceWorker.getRegistrations().then(function(regs){return regs.length;})");
        if (pending === 0) { cleared = true; break; }
      } catch {
        /* page reloaded */
      }
      await sleep(100);
    }
    if (!cleared) throw new Error("kill switch did not unregister the www worker");
    await send("Page.navigate", { url: `${WWW}/status` });
    const killed = await waitFor(
      send,
      (state) => state.path === "/status" && state.ready === "1" && state.regs === "0" && !state.caches.includes("livv-shell-v2"),
      "kill switch should unregister and delete the v2 cache",
    );
    await send("Page.navigate", { url: `${WWW}${QUERY}` });
    const afterKill = await waitFor(
      send,
      (state) => state.host === "evolvewithlivv.com" && state.path === "/" && state.src === "test_growth" && state.utm_source === "x" && state.fragment,
      "kill switch should leave the next www visit with the query",
    );
    const sawStrippedAuth = navigations.some((item) => item.host.startsWith("www") && item.path === "/auth" && item.src === "" && item.utm_source === "");
    return { controlling, stripped, status, kept, killed, afterKill, sawStrippedAuth };
  });

  if (result.status.regs !== "0") throw new Error(`www registrations left after handoff: ${result.status.regs}`);
  if (result.killed.regs !== "0" || result.killed.caches.includes("livv-shell-v2")) {
    throw new Error(`kill switch left worker state ${result.killed.regs} caches ${result.killed.caches}`);
  }
  if (!result.sawStrippedAuth) throw new Error("did not observe the old worker land on www/auth without the query");
  console.log(
    `old v2 worker landed on www/auth with an empty query, then the handoff unregistered it; next visit kept /?src=${result.kept.src}&utm_source=${result.kept.utm_source} with a session fragment; kill switch left ${result.killed.regs} registrations and caches "${result.killed.caches || "none"}"; after kill /?src=${result.afterKill.src}&utm_source=${result.afterKill.utm_source}`,
  );
} finally {
  chrome.kill();
  server.close();
}
