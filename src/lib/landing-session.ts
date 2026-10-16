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
    document.addEventListener("click", function (event) {
      var target = event.target;
      if (target && target.nodeType === 3) target = target.parentElement;
      var link = target && target.closest ? target.closest("a[data-landing-event]") : null;
      if (!link) return;
      var name = link.getAttribute("data-landing-event");
      if (name !== "landing_create_account" && name !== "landing_sign_in") return;
      var body = JSON.stringify({ name: name });
      var sent = false;
      try {
        if (navigator.sendBeacon) {
          sent = navigator.sendBeacon("/api/landing-event", new Blob([body], { type: "application/json" })) === true;
        }
      } catch (beaconError) {
        sent = false;
      }
      if (!sent) {
        fetch("/api/landing-event", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: body,
          keepalive: true,
          credentials: "same-origin"
        }).catch(function () {});
      }
    }, true);
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
