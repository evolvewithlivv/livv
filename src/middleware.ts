import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { wwwMiddlewareAction } from "./lib/www-handoff-core.mjs";

const NO_STORE = "private, no-store, max-age=0";

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
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": NO_STORE,
        "Service-Worker-Allowed": "/",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
  if (action.type === "next" || !action.location) {
    const response = NextResponse.next();
    if (request.nextUrl.pathname === "/sw.js") response.headers.set("Cache-Control", NO_STORE);
    return response;
  }
  if (action.type === "redirect") {
    const redirect = NextResponse.redirect(action.location, 307);
    redirect.headers.set("Cache-Control", NO_STORE);
    redirect.headers.set("X-Robots-Tag", "noindex, nofollow");
    redirect.headers.set("Referrer-Policy", "no-referrer");
    return redirect;
  }
  return new NextResponse(action.body, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": NO_STORE,
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy":
        "default-src 'none'; script-src 'unsafe-inline'; style-src 'none'; img-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
