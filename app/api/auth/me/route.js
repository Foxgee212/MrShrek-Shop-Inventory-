import { dbConnect } from "../../../../lib/dbConnect";
import User from "../../../../models/User";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

export async function GET(req) {
  await dbConnect();

  try {
    // Parse cookies
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = parse(cookieHeader);
    const token = cookies.token;

    if (!token) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in DB
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ user: { id: user._id, role: user.role, email: user.email } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid or expired token" }), { status: 401 });
  }
}
