import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const session = request.cookies.get("firebase_session");

  // Protect /admin and /api routes (except /api/auth or similar if exists)
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect from login to admin if already authenticated
  if (request.nextUrl.pathname.startsWith("/login")) {
    if (session) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
