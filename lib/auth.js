// lib/auth.js
import jwt from "jsonwebtoken";

export function parseCookiesFromHeader(req) {
  const cookieHeader = req.headers.get?.("cookie") || req.headers.cookie || "";
  // handle both Request and Node.js style
  return Object.fromEntries(
    cookieHeader.split(";").filter(Boolean).map(s => {
      const [k, ...v] = s.trim().split("=");
      return [k, decodeURIComponent(v.join("="))];
    })
  );
}

export function verifyTokenFromReq(req, requiredRole) {
  let token = null;

  // Check Authorization header first
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    const cookies = parseCookiesFromHeader(req);
    token = cookies.token;
  }

  if (!token) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (requiredRole && decoded.role !== requiredRole) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  return decoded;
}
