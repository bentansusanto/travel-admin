import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("travel_token")?.value;

  const guestPaths = ["/login", "/register", "/verify-account"];
  const isGuestPath = guestPaths.some((path) => pathname.startsWith(path));

  // If user is logged in and tries to access guest paths, redirect to dashboard
  if (token && isGuestPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is NOT logged in and tries to access dashboard, redirect to login
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect root to dashboard
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"]
};
