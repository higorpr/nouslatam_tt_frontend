import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Redirects incoming requests to the login page
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    // Redirects the following paths to the login page
    "/",
  ],
};
