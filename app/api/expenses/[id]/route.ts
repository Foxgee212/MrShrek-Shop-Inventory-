import { dbConnect } from "../../../../lib/dbConnect";
import Expense from "../../../../models/Expense";
import { verifyTokenFromReq } from "../../../../lib/auth";
import { NextRequest, NextResponse } from "next/server";

interface AuthUser {
  id: string;
  email: string;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    // verify token
    const tokenData = await verifyTokenFromReq(req);
    if (!tokenData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user: AuthUser = {
      id: (tokenData as any).id,
      email: (tokenData as any).email,
    };

    // ✅ await params
    const { id } = await params;

    const expense = await Expense.findById(id);
    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    await Expense.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Deleted successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Failed to delete expense" },
      { status: 500 }
    );
  }
}
