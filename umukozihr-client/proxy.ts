import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/auth", "/_next", "/api", "/assets", "/favicon.ico"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    // If user has token and tries to access /auth, redirect to /search
    if (pathname.startsWith("/auth")) {
      const hasToken = request.cookies.get("has_token")?.value === "1";
      if (hasToken) {
        return NextResponse.redirect(new URL("/search", request.url));
      }
    }
    return NextResponse.next();
  }

  // Allow root page (it handles its own redirect)
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Protected routes: check for token cookie
  const hasToken = request.cookies.get("has_token")?.value === "1";
  if (!hasToken) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and _next internals
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
