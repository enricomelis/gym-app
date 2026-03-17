import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let hasSession = false;
  try {
    const sessionUrl = new URL("/api/auth/get-session", request.url);
    const response = await fetch(sessionUrl, {
      headers: { cookie: request.headers.get("cookie") || "" },
      cache: "no-store",
    });
    if (response.ok) {
      const data = await response.json();
      hasSession = data?.user != null;
    }
  } catch {
    hasSession = false;
  }

  if (pathname.startsWith("/dashboard") && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/login" || pathname === "/register") && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
