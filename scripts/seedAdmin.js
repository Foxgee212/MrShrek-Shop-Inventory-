// scripts/seedAdmin.js
import dotenv from "dotenv";
dotenv.config();
import { dbConnect } from "../lib/dbConnect.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

async function main() {
  await dbConnect();
  const email = "ibrahymabdullahi2018@gmail.com";
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const hashed = await bcrypt.hash("Teem@t212", 10);
  const user = await User.create({ name: "Admin", email, password: hashed, role: "admin" });
  console.log("Created admin:", user.email);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
