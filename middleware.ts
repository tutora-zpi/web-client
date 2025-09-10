import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const protectedPaths = ["/dashboard", "/meeting"];
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  const authPaths = ["/login", "/auth/callback"];
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  if (token && isAuthPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/auth/callback", "/meeting/:path*"],
};
