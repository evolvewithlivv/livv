/**
 * Registers the old root worker, confirms it strips src and utm, then updates
 * to the current worker and confirms the same navigation keeps them.
 */
import http from "node:http";
import fs from "node:fs";
import { spawn } from "node:child_process";

const PORT = 8091;
const DEBUG_PORT = 9333;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const QUERY = "/?src=test_growth&utm_source=x";

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

const CURRENT_WORKER = fs.readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
let serveCurrent = false;

function page(marker) {
  return `<!doctype html><html><head><meta charset="utf-8"></head><body>${marker}</body></html>`;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", ORIGIN);
  if (url.pathname === "/sw.js") {
    res.writeHead(200, {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
      "Service-Worker-Allowed": "/",
    });
    res.end(serveCurrent ? CURRENT_WORKER : OLD_WORKER);
    return;
  }
  if (url.pathname === "/install") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    res.end(`<!doctype html><html><body>install<script>
navigator.serviceWorker.register("/sw.js",{updateViaCache:"none"}).then(function(){
  return navigator.serviceWorker.ready;
}).then(function(){
  document.documentElement.setAttribute("data-ready","1");
});
</script></body></html>`);
    return;
  }
  if (url.pathname === "/" && !serveCurrent) {
    res.writeHead(307, {
      Location: `${ORIGIN}/kept${url.search}`,
      "Cache-Control": "no-store",
    });
    res.end();
    return;
  }
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
  res.end(page(url.pathname));
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
    `--user-data-dir=/tmp/livv-sw-query-${process.pid}`,
    `${ORIGIN}/install`,
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
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
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
    return await run(send);
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
    return {
      path: location.pathname,
      src: params.get("src") || "",
      utm_source: params.get("utm_source") || "",
      ready: document.documentElement.getAttribute("data-ready") || ""
    };
  })()`);
}

async function waitFor(send, predicate, label) {
  let last = null;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    last = await readLocation(send);
    if (last && predicate(last)) return last;
    await sleep(100);
  }
  throw new Error(`${label}: ${JSON.stringify(last)}`);
}

try {
  const result = await withPage(async (send) => {
    await waitFor(send, (state) => state.path === "/install" && state.ready === "1", "old worker install");
    await send("Page.navigate", { url: `${ORIGIN}${QUERY}` });
    const stripped = await waitFor(
      send,
      (state) => state.path === "/auth" && state.src === "" && state.utm_source === "",
      "old worker should strip the query",
    );
    serveCurrent = true;
    const updated = await evaluate(send, `(() => {
      const changed = new Promise(function (resolve) {
        navigator.serviceWorker.addEventListener("controllerchange", function () { resolve("changed"); }, { once: true });
        setTimeout(function () { resolve("timeout"); }, 8000);
      });
      return navigator.serviceWorker.getRegistration().then(function (registration) {
        return registration.update().then(function () { return changed; });
      });
    })()`);
    if (updated !== "changed") throw new Error(`worker update did not take control (${updated})`);
    await send("Page.navigate", { url: `${ORIGIN}${QUERY}` });
    const kept = await waitFor(
      send,
      (state) => state.path === "/" && state.src === "test_growth" && state.utm_source === "x",
      "updated worker should keep the query",
    );
    const caches = await evaluate(send, "caches.keys()");
    return { stripped, kept, caches, updated };
  });

  if (!Array.isArray(result.caches) || result.caches.includes("livv-shell-v2") || result.caches.includes("livv-shell-v3")) {
    throw new Error(`old cache still present: ${JSON.stringify(result.caches)}`);
  }
  if (!result.caches.includes("livv-shell-v4")) {
    throw new Error(`new cache missing: ${JSON.stringify(result.caches)}`);
  }
  console.log(
    `old worker landed on ${result.stripped.path} with an empty query; updated worker kept ${result.kept.path}?src=${result.kept.src}&utm_source=${result.kept.utm_source}; caches ${result.caches.join(",")}`,
  );
} finally {
  chrome.kill();
  server.close();
}
