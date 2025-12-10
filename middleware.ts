import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // If no token → redirect to login
  if (!token) {
    if (req.nextUrl.pathname !== "/") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  let decoded: any = null;
  try {
    decoded = jwt.decode(token);
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const role = decoded?.role;

  // admin only route
  if (req.nextUrl.pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/sell", req.url));
  }

  // staff only route
  if (req.nextUrl.pathname.startsWith("/inventory") && role !== "staff") {
    return NextResponse.redirect(new URL("/sell", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/inventory/:path*", "/sell/:path*"],
};
