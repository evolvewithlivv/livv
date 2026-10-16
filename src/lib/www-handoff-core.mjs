/**
 * www -> apex session handoff.
 *
 * The Supabase session lives in localStorage under `livv-supabase-auth`
 * (see src/lib/supabase/client.ts). This app does not set Supabase SSR
 * cookies; server auth verifies a Bearer token and does not persist a session.
 * A host-only cookie is read here if one is already present, and is not written.
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
})();`;
}

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

export async function adoptStashedHandoff(win, setSession) {
  const stashed = win && win.__livvHandoff;
  if (!stashed || typeof stashed !== "object") return false;
  const access_token = stashed.access_token;
  const refresh_token = stashed.refresh_token;
  delete win.__livvHandoff;
  if (typeof access_token !== "string" || !access_token || typeof refresh_token !== "string" || !refresh_token) return false;
  if (access_token.length > 16384 || refresh_token.length > 16384) return false;
  await setSession({ access_token, refresh_token });
  return true;
}

export function renderWwwHandoffHtml(destination, apexOrigin = APEX_ORIGIN) {
  const safe = escapeHtml(destination);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><title>Redirecting...</title><link rel="canonical" href="${safe}"><script>${wwwHandoffScript(apexOrigin)}</script><noscript><meta http-equiv="refresh" content="0;url=${safe}"></noscript></head><body></body></html>`;
}

export function wwwMiddlewareAction(headers, pathname, search) {
  if (requestHostname(headers) !== WWW_HOST) return { type: "next" };
  // The registered www worker updates from this exact URL. A redirect would
  // be rejected and the old worker would keep sending / to /auth.
  if (pathname === "/sw.js") return { type: "next" };
  const location = apexDestination(pathname, search);
  if (!isDocumentNavigation(headers)) return { type: "redirect", location };
  return { type: "html", location, body: renderWwwHandoffHtml(location) };
}
