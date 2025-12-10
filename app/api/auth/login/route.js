import { dbConnect } from "../../../../lib/dbConnect";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export async function POST(req) {
  await dbConnect();

  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  const cookie = serialize("token", token, {
    httpOnly: false,   // allow browser to read
    path: "/",
    maxAge: 8 * 60 * 60,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return new Response(JSON.stringify({
    message: "Login successful",
    user: { role: user.role }
  }), {
    status: 200,
    headers: {
      "Set-Cookie": cookie,
      "Content-Type": "application/json"
    }
  });
}
