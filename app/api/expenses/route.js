import { dbConnect } from "../../../lib/dbConnect";
import Expense from "../../../models/Expense";
import { verifyTokenFromReq } from "../../../lib/auth";

export async function GET(req) {
  try {
    await dbConnect();
    const expenses = await Expense.find().sort({ createdAt: -1 });
    return Response.json(expenses);
  } catch (err) {
    return new Response("Failed to fetch expenses", { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const user = await verifyTokenFromReq(req);

    if (!user)
      return new Response("Unauthorized", { status: 401 });

    const body = await req.json();

    const newExpense = await Expense.create({
      type: body.type,
      amount: body.amount,
      description: body.description,
      createdBy: user.id,
    });

    return Response.json(newExpense, { status: 201 });
  } catch (err) {
    return new Response("Failed to create expense", { status: 500 });
  }
}
