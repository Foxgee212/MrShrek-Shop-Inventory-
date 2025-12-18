import { dbConnect } from "../../../../lib/dbConnect.js";
import User from "../../../../models/User.js";
import bcrypt from "bcryptjs";
import { verifyTokenFromReq } from "@/lib/auth";

export async function POST(req) {
     await dbConnect();
    
     const requester = verifyTokenFromReq(req, "admin");
     const { name, email, password, role } = await req.json();

     // check if user already exissts
     const exixting = await User.findOne({ email });
        if (exixting) return new Response(JSON.stringify({ error: "User already exist"}), { status: 400 });
    
        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
            });

return new Response(
  JSON.stringify({ message: "User registered successfully", userId: user._id }),
  { status: 201 }
);
}
