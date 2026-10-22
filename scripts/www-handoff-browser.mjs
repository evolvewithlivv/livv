/**
 * Cross-origin browser check for the www session handoff.
 * Uses fake tokens and never prints them.
 */
import http from "node:http";
import { spawn } from "node:child_process";
import {
  APEX_HANDOFF_BOOT,
  adoptStashedHandoff,
  renderWwwHandoffHtml,
} from "../src/lib/www-handoff-core.mjs";

const PORT = 8080;
const LOCAL_APEX = `http://evolvewithlivv.com:${PORT}`;
const ACCESS = "test-access-token";
const REFRESH = "test-refresh-token";

function apexPage() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><script>${APEX_HANDOFF_BOOT}</script><script>
window.__livvSetSession = function (tokens) {
  document.documentElement.setAttribute("data-livv-set", "1");
  localStorage.setItem("livv-supabase-auth", JSON.stringify({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_type: "bearer",
    user: { email: "member@example.com", is_anonymous: false }
  }));
  return Promise.resolve();
};
(${adoptStashedHandoff.toString()})(window, window.__livvSetSession).then(function () {
  document.documentElement.setAttribute("data-livv-adopted", "1");
}).catch(function (error) {
  var message = String(error && (error.message || error) || "error");
  message = message.split(${JSON.stringify(ACCESS)}).join("[redacted]").split(${JSON.stringify(REFRESH)}).join("[redacted]");
  document.documentElement.setAttribute("data-livv-error", message.slice(0, 180));
  document.documentElement.setAttribute("data-livv-adopted", "error");
});
</script></head><body>ok</body></html>`;
}

function jwt(payload) {
  return `e30.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.sig`;
}

const FUTURE_EXP = Math.floor(Date.now() / 1000) + 3600;
const APEX_REFRESH = "apex-refresh-kept";
const APEX_ACCESS = jwt({ sub: "member-1", exp: FUTURE_EXP });
const WWW_ACCESS = jwt({ sub: "member-1", exp: FUTURE_EXP });

function seedPage() {
  const session = JSON.stringify({
    access_token: ACCESS,
    refresh_token: REFRESH,
    user: { email: "member@example.com", is_anonymous: false },
  });
  return `<!doctype html><html><head><script>
localStorage.setItem("livv-supabase-auth", ${JSON.stringify(session)});
location.replace("/home?src=test_growth&utm_source=october");
</script></head><body>seed</body></html>`;
}

function apexSeedPage() {
  const session = JSON.stringify({
    access_token: APEX_ACCESS,
    refresh_token: APEX_REFRESH,
    expires_at: FUTURE_EXP,
    token_type: "bearer",
    user: { id: "member-1", email: "member@example.com", is_anonymous: false },
  });
  return `<!doctype html><html><head><script>
localStorage.setItem("livv-supabase-auth", ${JSON.stringify(session)});
document.documentElement.setAttribute("data-livv-adopted", "1");
</script></head><body>seed-apex</body></html>`;
}

function seedCurrentPage() {
  const session = JSON.stringify({
    access_token: WWW_ACCESS,
    refresh_token: "www-refresh-stale",
    expires_at: FUTURE_EXP,
    user: { id: "member-1", email: "member@example.com", is_anonymous: false },
  });
  return `<!doctype html><html><head><script>
localStorage.setItem("livv-supabase-auth", ${JSON.stringify(session)});
location.replace("/home/daily?src=test_growth&utm_source=october");
</script></head><body>seed-current</body></html>`;
}

const server = http.createServer((req, res) => {
  const host = String(req.headers.host || "");
  const url = new URL(req.url || "/", `http://${host || "localhost"}`);
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  if (host.startsWith("www.evolvewithlivv.com")) {
    if (url.pathname === "/seed") {
      res.end(seedPage());
      return;
    }
    if (url.pathname === "/seed-current") {
      res.end(seedCurrentPage());
      return;
    }
    const destination = `${LOCAL_APEX}${url.pathname}${url.search}`;
    res.end(renderWwwHandoffHtml(destination, LOCAL_APEX));
    return;
  }
  if (url.pathname === "/apex-seed") {
    res.end(apexSeedPage());
    return;
  }
  res.end(apexPage());
});

await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));

const chrome = spawn(
  "google-chrome",
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--remote-debugging-port=9222",
    `--user-data-dir=/tmp/livv-www-handoff-${process.pid}`,
    `--host-resolver-rules=MAP www.evolvewithlivv.com 127.0.0.1, MAP evolvewithlivv.com 127.0.0.1`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function debugList() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:9222/json/version");
      if (response.ok) return;
    } catch {
      /* chrome still starting */
    }
    await sleep(100);
  }
  throw new Error("Chrome debugging port did not open");
}

await debugList();

async function withPage(run) {
  let created;
  const put = await fetch("http://127.0.0.1:9222/json/new?about:blank", { method: "PUT" });
  if (put.ok) created = await put.json();
  else {
    const post = await fetch("http://127.0.0.1:9222/json/new?about:blank", { method: "PUT" });
    if (!post.ok) throw new Error("Could not open a Chrome tab");
    created = await post.json();
  }
  const ws = new WebSocket(created.webSocketDebuggerUrl);
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
    await fetch(`http://127.0.0.1:9222/json/close/${created.id}`);
  }
}

async function readState(send) {
  const evaluated = await send("Runtime.evaluate", {
    expression: `(() => {
      const params = new URLSearchParams(location.search);
      const href = location.href;
      let signedIn = false;
      try {
        const raw = localStorage.getItem("livv-supabase-auth");
        const session = raw ? JSON.parse(raw) : null;
        const user = session && session.user;
        signedIn = !!(session && session.access_token && session.refresh_token && user && user.email === "member@example.com" && user.is_anonymous === false);
      } catch (error) {}
      return {
        host: location.host,
        path: location.pathname,
        src: params.get("src") || "",
        utm_source: params.get("utm_source") || "",
        hashEmpty: location.hash === "",
        searchHasToken: href.indexOf(${JSON.stringify(ACCESS)}) !== -1 && location.search.indexOf(${JSON.stringify(ACCESS)}) !== -1,
        leaked: href.indexOf(${JSON.stringify(ACCESS)}) !== -1 || href.indexOf(${JSON.stringify(REFRESH)}) !== -1,
        adopted: document.documentElement.getAttribute("data-livv-adopted") || "",
        hold: document.documentElement.getAttribute("data-livv-landing-hold") || "",
        error: document.documentElement.getAttribute("data-livv-error") || "",
        signedIn: signedIn,
        set: document.documentElement.getAttribute("data-livv-set") || "",
        keptApex: (() => {
          try {
            const raw = localStorage.getItem("livv-supabase-auth");
            const session = raw ? JSON.parse(raw) : null;
            return !!(session && session.refresh_token === ${JSON.stringify(APEX_REFRESH)});
          } catch (error) {
            return false;
          }
        })()
      };
    })()`,
    returnByValue: true,
  });
  return evaluated.result.value;
}

async function goto(send, url) {
  await send("Page.navigate", { url });
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const state = await readState(send);
    if (state && state.host === `evolvewithlivv.com:${PORT}` && state.adopted === "1") return state;
    await sleep(100);
  }
  return readState(send);
}

const loggedOut = await withPage(async (send) => {
  return goto(send, `http://www.evolvewithlivv.com:${PORT}/pricing?src=test_growth&utm_source=october`);
});

const signedIn = await withPage(async (send) => {
  return goto(send, `http://www.evolvewithlivv.com:${PORT}/seed`);
});

async function waitFor(send, predicate) {
  let last = null;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    last = await readState(send);
    if (last && predicate(last)) return last;
    await sleep(100);
  }
  return last;
}

const alreadySignedIn = await withPage(async (send) => {
  await send("Page.navigate", { url: `http://evolvewithlivv.com:${PORT}/apex-seed` });
  await waitFor(send, (state) => state.host === `evolvewithlivv.com:${PORT}` && state.adopted === "1" && state.keptApex === true);
  await send("Page.navigate", { url: `http://www.evolvewithlivv.com:${PORT}/seed-current` });
  return waitFor(
    send,
    (state) => state.host === `evolvewithlivv.com:${PORT}` && state.path === "/home/daily" && state.adopted === "1" && state.hashEmpty === true,
  );
});

chrome.kill();
server.close();

function assertState(name, state, expected) {
  const problems = [];
  for (const [key, value] of Object.entries(expected)) {
    if (!state || state[key] !== value) problems.push(`${key}`);
  }
  if (!state || state.leaked || state.searchHasToken) problems.push("url");
  if (problems.length) {
    const safe = state
      ? {
          host: state.host,
          path: state.path,
          src: state.src,
          utm_source: state.utm_source,
          hashEmpty: state.hashEmpty,
          leaked: state.leaked,
          adopted: state.adopted,
          signedIn: state.signedIn,
          error: state.error || "",
        }
      : null;
    throw new Error(`${name} failed (${problems.join(", ")}): ${JSON.stringify(safe)}`);
  }
}

assertState("logged-out www redirect", loggedOut, {
  host: `evolvewithlivv.com:${PORT}`,
  path: "/pricing",
  src: "test_growth",
  utm_source: "october",
  hashEmpty: true,
  signedIn: false,
  leaked: false,
});

assertState("signed-in www handoff", signedIn, {
  host: `evolvewithlivv.com:${PORT}`,
  path: "/home",
  src: "test_growth",
  utm_source: "october",
  hashEmpty: true,
  signedIn: true,
  hold: "1",
  leaked: false,
  set: "1",
});

assertState("apex keeps a valid same-user session", alreadySignedIn, {
  host: `evolvewithlivv.com:${PORT}`,
  path: "/home/daily",
  src: "test_growth",
  utm_source: "october",
  hashEmpty: true,
  signedIn: true,
  hold: "1",
  leaked: false,
  set: "",
  keptApex: true,
});

console.log("browser handoff passed: logged-out redirect kept path and query; signed-in www session landed signed in on the apex with the fragment removed; a valid apex session skipped setSession");
