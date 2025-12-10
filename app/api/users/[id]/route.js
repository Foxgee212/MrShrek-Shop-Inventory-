import { dbConnect } from "../../../../lib/dbConnect";
import User from "../../../../models/User"

export async function DELETE(req, {params}) {
    await dbConnect();

    await User.findByIdAndDelete(params.id);
    return new Response(JSON.stringify({ message: "Deleted"}))
}