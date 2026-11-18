import { NextResponse, type NextRequest } from "next/server";
import { destroySession } from "@/lib/session";

export async function POST(request: NextRequest) {
  await destroySession();
  // Build the redirect from the incoming request so it works on any host
  // (localhost, Vercel preview, production). 303 makes the browser follow
  // with a GET instead of re-POSTing to /login.
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
