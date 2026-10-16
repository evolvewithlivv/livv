/**
 * Signed-in entry from `/`.
 * The Supabase session is stored in localStorage (`livv-supabase-auth`), not
 * cookies, so the server cannot see it on this request. This blocking script
 * runs from the document head and sends a real email session to the same
 * place the auth screen does: `/home` when local onboarding is complete,
 * otherwise a hold until the cloud onboarding check finishes.
 * Logged-out visitors stay on the landing page.
 * With no saved Daylight or Midnight choice, `/` follows the system scheme.
 * The head script does not set cookies or send identifiers.
 */
export const LANDING_SESSION_SCRIPT = `(function(){
  try {
    if (location.pathname !== "/") return;
    var src = "";
    var variant = "default";
    try {
      var tokenOk = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
      var cleanToken = function (value) {
        return value && tokenOk.test(value) ? value : "";
      };
      var params = new URLSearchParams(location.search || "");
      var storedAttr = {};
      try { storedAttr = JSON.parse(sessionStorage.getItem("livv-attr-v1") || "{}") || {}; } catch (attrRead) { storedAttr = {}; }
      src = cleanToken(params.get("src")) || cleanToken(storedAttr.src) || "";
      variant = cleanToken(params.get("variant")) || cleanToken(params.get("v")) || cleanToken(storedAttr.variant) || "default";
      var utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
      var attr = {};
      if (src) attr.src = src;
      if (variant) attr.variant = variant;
      for (var i = 0; i < utmKeys.length; i++) {
        var utmKey = utmKeys[i];
        var utmValue = cleanToken(params.get(utmKey)) || cleanToken(storedAttr[utmKey]) || "";
        if (utmValue) attr[utmKey] = utmValue;
      }
      sessionStorage.setItem("livv-attr-v1", JSON.stringify(attr));
      if (src) sessionStorage.setItem("livv-src", src);
    } catch (attrError) {}
    var emitFunnel = function (eventName, props) {
      if (typeof window.__livvTrack === "function") {
        try { window.__livvTrack(eventName, props || {}); return; } catch (trackError) {}
      }
      try {
        var queued = [];
        var rawQueue = sessionStorage.getItem("livv-funnel-queue");
        if (rawQueue) queued = JSON.parse(rawQueue);
        if (!Array.isArray(queued)) queued = [];
        queued.push({ event: eventName, props: props || {} });
        sessionStorage.setItem("livv-funnel-queue", JSON.stringify(queued.slice(-20)));
      } catch (queueError) {}
    };
    var deviceKind = function () {
      return window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
    };
    try {
      var saved = false;
      var lookRaw = localStorage.getItem("livv-look-v1");
      if (lookRaw) {
        var look = JSON.parse(lookRaw);
        if (look && typeof look.updatedAt === "number" && look.updatedAt > (look.syncedAt || 0)) saved = true;
      }
      if (!saved) {
        var idRaw = localStorage.getItem("livv-identity-v1");
        if (idRaw) {
          var id = JSON.parse(idRaw);
          if (id && (id.appearance || id.theme)) saved = true;
        }
      }
      if (!saved) {
        var applyScheme = function () {
          var stillSaved = false;
          var nextLook = localStorage.getItem("livv-look-v1");
          if (nextLook) {
            var parsedLook = JSON.parse(nextLook);
            if (parsedLook && typeof parsedLook.updatedAt === "number" && parsedLook.updatedAt > (parsedLook.syncedAt || 0)) stillSaved = true;
          }
          if (!stillSaved) {
            var nextId = localStorage.getItem("livv-identity-v1");
            if (nextId) {
              var parsedId = JSON.parse(nextId);
              if (parsedId && (parsedId.appearance || parsedId.theme)) stillSaved = true;
            }
          }
          if (stillSaved) return;
          var dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          var root = document.documentElement;
          root.setAttribute("data-livv-scheme", "system");
          root.setAttribute("data-theme", dark ? "dark" : "light");
          root.setAttribute("data-livv-theme", dark ? "midnight" : "daylight");
          root.style.colorScheme = dark ? "dark" : "light";
        };
        applyScheme();
        var schemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
        if (schemeQuery.addEventListener) schemeQuery.addEventListener("change", applyScheme);
      }
    } catch (schemeError) {}
    var raw = localStorage.getItem("livv-supabase-auth");
    if (raw) {
      var session = JSON.parse(raw);
      var user = session && session.user;
      if (user && user.is_anonymous !== true && user.email) {
        var draftRaw = localStorage.getItem("livv-onboarding-v1");
        var complete = false;
        if (draftRaw) {
          var draft = JSON.parse(draftRaw);
          complete = !!(draft && typeof draft.completedAt === "number" && draft.completedAt > 0);
        }
        if (complete) {
          location.replace("/home");
          return;
        }
        document.documentElement.setAttribute("data-livv-landing-hold", "1");
      }
    }
    var withAttr = function (props) {
      var next = {};
      var key;
      var base = attr && typeof attr === "object" ? attr : {};
      for (key in base) if (Object.prototype.hasOwnProperty.call(base, key)) next[key] = base[key];
      for (key in props) if (Object.prototype.hasOwnProperty.call(props, key)) next[key] = props[key];
      return next;
    };
    if (document.documentElement.getAttribute("data-livv-landing-hold") !== "1" && !window.__livvLandingViewed) {
      window.__livvLandingViewed = 1;
      emitFunnel("landing_view", withAttr({ src: src, variant: variant, device: deviceKind() }));
    }
    var stampCreateHref = function (link) {
      if (!src || !link || !link.setAttribute) return;
      link.setAttribute("href", "/auth?mode=create&src=" + src);
    };
    document.addEventListener("click", function (event) {
      var target = event.target;
      if (target && target.nodeType === 3) target = target.parentElement;
      var link = target && target.closest ? target.closest("a[data-landing-event]") : null;
      if (!link) return;
      var name = link.getAttribute("data-landing-event");
      if (name !== "cta_start_click") return;
      var position = link.getAttribute("data-landing-position");
      if (position !== "primary" && position !== "secondary") return;
      if (position === "primary") stampCreateHref(link);
      emitFunnel("cta_start_click", withAttr({ src: src, variant: variant, position: position }));
    }, true);
    var stampWhenReady = function () {
      if (!src || !document.querySelector) return;
      stampCreateHref(document.querySelector('a[data-landing-position="primary"]'));
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", stampWhenReady);
    else stampWhenReady();
    if (typeof window !== "undefined") {
      window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
      window.va("beforeSend", function (event) {
        try {
          if (document.documentElement.getAttribute("data-livv-landing-hold") === "1") return null;
          var path = new URL(event.url, location.origin).pathname;
          if (path !== "/") return null;
        } catch (err) { return null; }
        return event;
      });
    }
  } catch (e) {}
})();`;
