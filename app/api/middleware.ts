import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const adminRoutes = ["/admin", "/inventory", "/users"];
  const staffRoutes = ["/sales"];

  const url = req.nextUrl.pathname;

  // Login page is always allowed
  if (url.startsWith("/login")) return NextResponse.next();

  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    const user: any = jwt.verify(token, process.env.JWT_SECRET!);

    // Admin restricted areas
    if (adminRoutes.some(r => url.startsWith(r))) {
      if (user.role !== "admin") {
        return NextResponse.redirect(new URL("/sales", req.url));
      }
    }

    return NextResponse.next();
  } catch (e) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/inventory/:path*", "/users/:path*", "/sales/:path*"]
};
