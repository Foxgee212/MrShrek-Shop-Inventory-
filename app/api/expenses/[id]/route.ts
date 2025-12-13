import { dbConnect } from "../../../../lib/dbConnect";
import Expense from "../../../../models/Expense";
import { verifyTokenFromReq } from "../../../../lib/auth";
import { NextRequest } from "next/server";

interface AuthUser {
  id: string;
  email: string;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // verify token
    const tokenData = await verifyTokenFromReq(req);

    if (!tokenData) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user: AuthUser = {
      id: (tokenData as any).id,
      email: (tokenData as any).email,
    };

    const { id } = params;
    const expense = await Expense.findById(id);
    if (!expense) return new Response("Expense not found", { status: 404 });

    await Expense.findByIdAndDelete(id);

    return new Response(JSON.stringify({ message: "Deleted successfully" }), { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message || "Failed to delete expense" }), { status: 500 });
  }
}
