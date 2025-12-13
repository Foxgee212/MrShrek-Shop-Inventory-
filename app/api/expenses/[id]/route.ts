import { dbConnect } from "../../../../lib/dbConnect";
import Expense from "../../../../models/Expense";
import { verifyTokenFromReq } from "../../../../lib/auth";

interface AuthUser {
  id: string;
  email: string;
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    // verify token
    const tokenData = await verifyTokenFromReq(req);

    // make sure tokenData is not undefined and has id/email
    if (!tokenData || typeof tokenData === "undefined") {
      return new Response("Unauthorized", { status: 401 });
    }

    const user: AuthUser = {
      id: (tokenData as any).id,
      email: (tokenData as any).email,
    };

    const expense = await Expense.findById(params.id);
    if (!expense) return new Response("Expense not found", { status: 404 });

    await Expense.findByIdAndDelete(params.id);

    return new Response(JSON.stringify({ message: "Deleted successfully" }), { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message || "Failed to delete expense" }), { status: 500 });
  }
}
