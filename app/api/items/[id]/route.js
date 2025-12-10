import Item from "@/models/Item";
import { dbConnect } from "../../../../lib/dbConnect";

export async function PUT(req) {
    await dbConnect();
    const user = await getUserFromToken(req);

    if(!user || user.role !== "admin") {
        return new Response(JSON.stringigy)
    }
}

export async function DELETE(req){
    await dbConnect();

    const user = await getUserFromToken(req);
    if(!user || user.role) {
        return new Response(JSON.stringify({error: "Unauthorized"}))
    }
}