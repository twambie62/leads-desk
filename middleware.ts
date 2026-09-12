import { NextResponse, type NextRequest } from "next/server";
// import { SESSION_COOKIE_NAME } from "@/lib/session";
import { SESSION_COOKIE_NAME } from "@/lib/session-constants";

export function middleware(request: NextRequest) {
  const hasCookie = request.cookies.has(SESSION_COOKIE_NAME);

  if (!hasCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/agent/:path*"],
};