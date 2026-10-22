/**
 * www -> apex session handoff.
 *
 * The Supabase session lives in localStorage under `livv-supabase-auth`
 * (see src/lib/supabase/client.ts). This app does not set Supabase SSR
 * cookies; server auth verifies a Bearer token and does not persist a session.
 * A host-only cookie is read here if one is already present, and is not written.
 *
 * The www document only reads that stored session and puts the tokens in the
 * fragment. It must not construct a Supabase client or call the refresh
 * endpoint. A refresh here rotates the token, and the apex would then present
 * the pre-rotation token.
 */

export const WWW_HOST = "www.evolvewithlivv.com";
export const APEX_ORIGIN = "https://evolvewithlivv.com";
export const STORAGE_KEY = "livv-supabase-auth";
export const HANDOFF_PREFIX = "#livv_handoff=";
const MAX_TOKEN_LENGTH = 16384;

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function apexDestination(pathname, search) {
  const path = typeof pathname === "string" && pathname.startsWith("/") && !pathname.startsWith("//") ? pathname : "/";
  let query = "";
  if (typeof search === "string" && search.startsWith("?")) query = search.split("#")[0];
  return APEX_ORIGIN + path + query;
}

function hostnameOf(value) {
  return String(value || "")
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/\.$/, "")
    .replace(/:\d+$/, "");
}

export function requestHostname(headers) {
  const source = headers || {};
  const host = hostnameOf(source.host);
  const forwarded = hostnameOf(source["x-forwarded-host"]);
  if (host === WWW_HOST || host === "evolvewithlivv.com") return host;
  return forwarded || host;
}

export function isDocumentNavigation(headers) {
  const source = headers || {};
  const dest = String(source["sec-fetch-dest"] || "").toLowerCase();
  if (dest === "document" || dest === "iframe") return true;
  if (dest) return false;
  const accept = String(source.accept || "");
  if (!accept) return true;
  return accept.includes("text/html") || accept.includes("*/*");
}

export function wwwHandoffScript(apexOrigin = APEX_ORIGIN) {
  return `(function(){
  var STORAGE_KEY = ${JSON.stringify(STORAGE_KEY)};
  var APEX = ${JSON.stringify(apexOrigin)};
  var WWW = ${JSON.stringify(WWW_HOST)};
  var MAX_TOKEN = ${MAX_TOKEN_LENGTH};
  function tokensFrom(value) {
    var parsed = value;
    if (typeof parsed === "string") {
      var text = parsed;
      if (text.indexOf("base64-") === 0) {
        try {
          var b64 = text.slice(7).replace(/-/g, "+").replace(/_/g, "/");
          while (b64.length % 4) b64 += "=";
          text = atob(b64);
        } catch (decodeError) { return null; }
      }
      try { parsed = JSON.parse(text); } catch (parseError) { return null; }
    }
    if (!parsed || typeof parsed !== "object") return null;
    var access = parsed.access_token;
    var refresh = parsed.refresh_token;
    if (typeof access === "string" && access && typeof refresh === "string" && refresh && access.length <= MAX_TOKEN && refresh.length <= MAX_TOKEN) {
      return { access_token: access, refresh_token: refresh };
    }
    if (parsed.currentSession) return tokensFrom(parsed.currentSession);
    if (parsed.session) return tokensFrom(parsed.session);
    return null;
  }
  function cookieTokens() {
    var jar = "";
    try { jar = document.cookie || ""; } catch (cookieError) { return null; }
    if (!jar) return null;
    var map = {};
    var parts = jar.split(";");
    var i;
    for (i = 0; i < parts.length; i++) {
      var piece = parts[i].replace(/^\\s+/, "");
      var eq = piece.indexOf("=");
      if (eq < 1) continue;
      try {
        map[decodeURIComponent(piece.slice(0, eq))] = decodeURIComponent(piece.slice(eq + 1));
      } catch (decodeError) {}
    }
    var groups = {};
    var names = Object.keys(map);
    for (i = 0; i < names.length; i++) {
      var cookieName = names[i];
      var base = cookieName;
      var chunk = -1;
      var dot = cookieName.lastIndexOf(".");
      if (dot > 0 && /^[0-9]+$/.test(cookieName.slice(dot + 1))) {
        base = cookieName.slice(0, dot);
        chunk = Number(cookieName.slice(dot + 1));
      }
      if (base !== STORAGE_KEY && base.indexOf("auth-token") === -1) continue;
      if (!groups[base]) groups[base] = [];
      groups[base].push({ chunk: chunk, value: map[cookieName] });
    }
    var bases = Object.keys(groups);
    var b;
    for (b = 0; b < bases.length; b++) {
      var chunks = groups[bases[b]].sort(function (left, right) { return left.chunk - right.chunk; });
      var joined = "";
      var c;
      for (c = 0; c < chunks.length; c++) joined += chunks[c].value;
      var found = tokensFrom(joined);
      if (found) return found;
    }
    return null;
  }
  function readTokens() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var stored = raw ? tokensFrom(raw) : null;
      if (stored) return stored;
    } catch (storageError) {}
    return cookieTokens();
  }
  function handoff() {
    try {
      if (location.hostname !== WWW) return;
      var path = location.pathname || "/";
      if (path.charAt(0) !== "/" || path.slice(0, 2) === "//") path = "/";
      var search = typeof location.search === "string" && location.search.charAt(0) === "?" ? location.search.split("#")[0] : "";
      var dest = APEX + path + search;
      var go = function (hash) { location.replace(dest + (hash || "")); };
      var params;
      try { params = new URLSearchParams(search); } catch (paramError) { params = null; }
      if (params && params.get("code")) { go(""); return; }
      var tokens = null;
      try { tokens = readTokens(); } catch (readError) { tokens = null; }
      if (!tokens) { go(""); return; }
      go("#livv_handoff=" + encodeURIComponent(JSON.stringify({ access_token: tokens.access_token, refresh_token: tokens.refresh_token })));
    } catch (handoffError) {
      try {
        var fallbackPath = location.pathname || "/";
        if (fallbackPath.charAt(0) !== "/" || fallbackPath.slice(0, 2) === "//") fallbackPath = "/";
        var fallbackSearch = typeof location.search === "string" && location.search.charAt(0) === "?" ? location.search.split("#")[0] : "";
        location.replace(APEX + fallbackPath + fallbackSearch);
      } catch (fallbackError) {}
    }
  }
  try {
    if (location.hostname !== WWW) return;
    var agent = typeof navigator === "undefined" ? null : navigator;
    var workers = agent && agent.serviceWorker;
    if (!workers || typeof workers.getRegistrations !== "function") {
      handoff();
      return;
    }
    var settled = false;
    function finish() {
      if (settled) return;
      settled = true;
      handoff();
    }
    setTimeout(finish, 300);
    try {
      workers.getRegistrations().then(function (regs) {
        var jobs = [];
        var r;
        for (r = 0; regs && r < regs.length; r++) {
          try { jobs.push(regs[r].unregister()); } catch (unregisterError) {}
        }
        return Promise.all(jobs);
      }).then(finish, finish);
    } catch (registrationError) {
      finish();
    }
  } catch (outerError) {
    handoff();
  }
})();`;
}

export const WWW_KILL_SWITCH = `self.addEventListener("install",function(event){event.waitUntil(self.skipWaiting());});self.addEventListener("activate",function(event){event.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.map(function(key){return caches.delete(key);}));}).then(function(){return self.registration.unregister();}).then(function(){return self.clients.matchAll({type:"window",includeUncontrolled:true});}).then(function(list){return Promise.all(list.map(function(client){return client.navigate(client.url);}));}));});`;

export const APEX_HANDOFF_BOOT = `(function(){
  try {
    var prefix = "#livv_handoff=";
    var hash = location.hash || "";
    if (hash.indexOf(prefix) !== 0) return;
    var encoded = hash.slice(prefix.length);
    var clean = (location.pathname || "/") + (typeof location.search === "string" ? location.search.split("#")[0] : "");
    try { history.replaceState(null, "", clean); } catch (stripError) {}
    var code = "";
    try { code = new URLSearchParams(location.search || "").get("code") || ""; } catch (paramError) { code = ""; }
    if (code) return;
    var parsed = JSON.parse(decodeURIComponent(encoded));
    var access = parsed && parsed.access_token;
    var refresh = parsed && parsed.refresh_token;
    if (typeof access !== "string" || typeof refresh !== "string") return;
    if (!access || !refresh || access.length > 16384 || refresh.length > 16384) return;
    window.__livvHandoff = { access_token: access, refresh_token: refresh };
    if (document.documentElement && document.documentElement.setAttribute) {
      document.documentElement.setAttribute("data-livv-landing-hold", "1");
    }
  } catch (handoffError) {
    try {
      if ((location.hash || "").indexOf("#livv_handoff=") === 0) {
        history.replaceState(null, "", (location.pathname || "/") + (location.search || ""));
      }
    } catch (stripError) {}
  }
})();`;

function decodeBase64Url(value) {
  try {
    let b64 = String(value).replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    if (typeof atob !== "function") return null;
    return atob(b64);
  } catch {
    return null;
  }
}

export function jwtPayload(token) {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2 || !parts[1]) return null;
  const decoded = decodeBase64Url(parts[1]);
  if (!decoded) return null;
  try {
    const parsed = JSON.parse(decoded);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function unwrapStoredSession(value) {
  let parsed = value;
  if (typeof parsed === "string") {
    let text = parsed;
    if (text.indexOf("base64-") === 0) {
      const decoded = decodeBase64Url(text.slice(7));
      if (!decoded) return null;
      text = decoded;
    }
    try {
      parsed = JSON.parse(text);
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== "object") return null;
  if (typeof parsed.access_token === "string" && typeof parsed.refresh_token === "string") return parsed;
  if (parsed.currentSession) return unwrapStoredSession(parsed.currentSession);
  if (parsed.session) return unwrapStoredSession(parsed.session);
  return null;
}

function readStoredSession(win) {
  try {
    if (!win || !win.localStorage || typeof win.localStorage.getItem !== "function") return null;
    const raw = win.localStorage.getItem("livv-supabase-auth");
    if (!raw) return null;
    return unwrapStoredSession(raw);
  } catch {
    return null;
  }
}

function sessionSubject(session) {
  if (!session || typeof session !== "object") return "";
  const fromToken = jwtPayload(session.access_token);
  if (fromToken && typeof fromToken.sub === "string" && fromToken.sub) return fromToken.sub;
  const user = session.user;
  if (user && typeof user.id === "string" && user.id) return user.id;
  return "";
}

function sessionExpiryMs(session) {
  if (!session || typeof session !== "object") return 0;
  let expiresAt = session.expires_at;
  if (typeof expiresAt !== "number" || !Number.isFinite(expiresAt)) {
    const payload = jwtPayload(session.access_token);
    expiresAt = payload && typeof payload.exp === "number" ? payload.exp : NaN;
  }
  if (typeof expiresAt !== "number" || !Number.isFinite(expiresAt)) return 0;
  return expiresAt > 1e12 ? expiresAt : expiresAt * 1000;
}

/**
 * True when the apex already has a usable session for the handed-off user.
 * setSession would refresh or overwrite that session with the fragment token.
 * After the apex client has recovered storage, that second use is what returns
 * refresh_token HTTP 400.
 */
export function handoffSessionAlreadyCurrent(existing, handoff, now = Date.now()) {
  const stored = unwrapStoredSession(existing);
  if (!stored || !handoff || typeof handoff !== "object") return false;
  const handoffAccess = handoff.access_token;
  const handoffRefresh = handoff.refresh_token;
  if (typeof handoffAccess !== "string" || !handoffAccess || typeof handoffRefresh !== "string" || !handoffRefresh) return false;
  if (typeof stored.access_token !== "string" || !stored.access_token || typeof stored.refresh_token !== "string" || !stored.refresh_token) return false;
  const handoffPayload = jwtPayload(handoffAccess);
  const handoffSub = handoffPayload && typeof handoffPayload.sub === "string" ? handoffPayload.sub : "";
  const existingSub = sessionSubject(stored);
  if (!existingSub || !handoffSub || existingSub !== handoffSub) return false;
  return sessionExpiryMs(stored) > now;
}

/** A reused refresh token is non-fatal while the apex session is still valid. */
export function handoffRefreshErrorIsBenign(error, existing, handoff, now = Date.now()) {
  if (!error || typeof error !== "object") return false;
  const status = Number(error.status);
  const message = String(error.message || "").toLowerCase();
  const code = String(error.code || "").toLowerCase();
  const invalidRefresh = status === 400 && (message.includes("refresh") || code.includes("refresh"));
  if (!invalidRefresh) return false;
  return handoffSessionAlreadyCurrent(existing, handoff, now);
}

/** Source for the browser harness. The page has no module scope, so every helper has to travel with adoptStashedHandoff. */
export function apexHandoffBrowserScript() {
  return [
    decodeBase64Url,
    jwtPayload,
    unwrapStoredSession,
    readStoredSession,
    sessionSubject,
    sessionExpiryMs,
    handoffSessionAlreadyCurrent,
    adoptStashedHandoff,
  ].map((fn) => fn.toString()).join("\n");
}

export async function adoptStashedHandoff(win, setSession) {
  const stashed = win && win.__livvHandoff;
  if (!stashed || typeof stashed !== "object") return false;
  const access_token = stashed.access_token;
  const refresh_token = stashed.refresh_token;
  delete win.__livvHandoff;
  if (typeof access_token !== "string" || !access_token || typeof refresh_token !== "string" || !refresh_token) return false;
  if (access_token.length > 16384 || refresh_token.length > 16384) return false;
  if (handoffSessionAlreadyCurrent(readStoredSession(win), { access_token, refresh_token })) return true;
  await setSession({ access_token, refresh_token });
  return true;
}

export function renderWwwHandoffHtml(destination, apexOrigin = APEX_ORIGIN) {
  const safe = escapeHtml(destination);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><title>Redirecting...</title><link rel="canonical" href="${safe}"><script>${wwwHandoffScript(apexOrigin)}</script><noscript><meta http-equiv="refresh" content="0;url=${safe}"></noscript></head><body></body></html>`;
}

export function wwwMiddlewareAction(headers, pathname, search) {
  if (requestHostname(headers) !== WWW_HOST) return { type: "next" };
  // Same-origin kill switch. A redirect is rejected, and the apex worker must
  // not be installed on www: the handoff leaves before that update can finish.
  if (pathname === "/sw.js") return { type: "script", body: WWW_KILL_SWITCH };
  const location = apexDestination(pathname, search);
  if (!isDocumentNavigation(headers)) return { type: "redirect", location };
  return { type: "html", location, body: renderWwwHandoffHtml(location) };
}
