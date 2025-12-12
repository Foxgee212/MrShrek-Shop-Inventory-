import { dbConnect } from "../../../../lib/dbConnect";
import Expense from "../../../../models/Expense";
import { verifyTokenFromReq } from "../../../../lib/auth";

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const user = await verifyTokenFromReq(req);

    if (!user)
      return new Response("Unauthorized", { status: 401 });

    await Expense.findByIdAndDelete(params.id);

    return new Response("Deleted", { status: 200 });
  } catch (err) {
    return new Response("Failed to delete", { status: 500 });
  }
}
