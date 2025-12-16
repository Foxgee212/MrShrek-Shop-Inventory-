import jwt, { JwtPayload } from "jsonwebtoken";

// lib/auth.ts
export type AuthUser = {
  id: string;
  role: "admin" | "staff";
  email?: string;
};


export function parseCookiesFromHeader(req: Request): Record<string, string> {
  const cookieHeader =
    req.headers.get("cookie") || (req as any).headers?.cookie || "";

  return Object.fromEntries(
    cookieHeader
      .split(";")
      .filter(Boolean)
      .map((s: string) => {
        const [k, ...v] = s.trim().split("=");
        return [k, decodeURIComponent(v.join("="))];
      })
  );
}


export function verifyTokenFromReq(
  req: Request,
  requiredRole?: "admin" | "staff"
): AuthUser {
  let token: string | undefined;

  // Authorization header
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // Cookie fallback
  if (!token) {
    const cookies = parseCookiesFromHeader(req);
    token = cookies.token;
  }

  if (!token) {
    const err: any = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET!
  ) as JwtPayload & AuthUser;

  if (!decoded.id || !decoded.role) {
    const err: any = new Error("Invalid token");
    err.status = 401;
    throw err;
  }

  if (requiredRole && decoded.role !== requiredRole) {
    const err: any = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  return {
    id: decoded.id,
    role: decoded.role,
    email: decoded.email,
  };
}
