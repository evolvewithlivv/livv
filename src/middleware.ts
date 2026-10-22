import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { wwwMiddlewareAction } from "./lib/www-handoff-core.mjs";

const NO_STORE = "private, no-store, max-age=0";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=(), browsing-topics=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Permitted-Cross-Domain-Policies": "none",
  "X-DNS-Prefetch-Control": "off",
};

function withSecurity(headers: Record<string, string>) {
  return { ...SECURITY_HEADERS, ...headers };
}

export function middleware(request: NextRequest) {
  const action = wwwMiddlewareAction(
    {
      host: request.headers.get("host") || "",
      "x-forwarded-host": request.headers.get("x-forwarded-host") || "",
      "sec-fetch-dest": request.headers.get("sec-fetch-dest") || "",
      accept: request.headers.get("accept") || "",
    },
    request.nextUrl.pathname,
    request.nextUrl.search,
  );
  if (action.type === "script") {
    return new NextResponse(action.body, {
      status: 200,
      headers: withSecurity({
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": NO_STORE,
        "Service-Worker-Allowed": "/",
        "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
      }),
    });
  }
  if (action.type === "next" || !action.location) {
    const response = NextResponse.next();
    if (request.nextUrl.pathname === "/sw.js") response.headers.set("Cache-Control", NO_STORE);
    return response;
  }
  if (action.type === "redirect") {
    const redirect = NextResponse.redirect(action.location, 307);
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) redirect.headers.set(key, value);
    redirect.headers.set("Cache-Control", NO_STORE);
    redirect.headers.set("X-Robots-Tag", "noindex, nofollow");
    return redirect;
  }
  return new NextResponse(action.body, {
    status: 200,
    headers: withSecurity({
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": NO_STORE,
      "X-Robots-Tag": "noindex, nofollow",
      "Content-Security-Policy":
        "default-src 'none'; script-src 'unsafe-inline'; style-src 'none'; img-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    }),
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
