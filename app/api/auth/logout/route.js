import { serialize } from "cookie";

export async function POST(){
    const cookieSerialized = serialize("token", "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    });
    return new Response(JSON.stringify({ message: "Logout successful"}), { status: 200, headers: { "set-Cookie": cookieSerialized } });
}