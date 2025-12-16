import { dbConnect } from "../../../lib/dbConnect";
import Expense from "../../../models/Expense";
import { verifyTokenFromReq } from "../../../lib/auth";

// Request body type
interface ExpenseBody {
  type: "withdrawal" | "misc"; // stock_purchase removed
  amount: number;
  description?: string;
  category?: string;
  paymentMethod?: "cash" | "transfer" | "pos";
  reference?: string;
  supplier?: string;
  linkedItemId?: string;
  status?: "approved" | "pending" | "cancelled";
  date?: string;
}

// User type from auth
interface AuthUser {
  id: string;
  email: string;
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const expenses = await Expense.find({ type: { $in: ["withdrawal", "misc"] } })
                                  .sort({ createdAt: -1 });
    return Response.json(expenses);
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message || "Failed to fetch expenses" }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const tokenData = await verifyTokenFromReq(req, "admin");
    if (!tokenData) return new Response("Unauthorized", { status: 401 });

    const user: AuthUser = {
      id: (tokenData as any).id,
      email: (tokenData as any).email,
    };

    const body: ExpenseBody = await req.json();

    // Validate required fields
    if (!body.type || !body.amount) {
      return new Response(JSON.stringify({ error: "Type and amount are required" }), { status: 400 });
    }

    const newExpense = await Expense.create({
      type: body.type,
      amount: body.amount,
      description: body.description || "",
      userId: user.id,
      category: body.category,
      paymentMethod: body.paymentMethod,
      reference: body.reference,
      supplier: body.supplier,
      linkedItemId: body.linkedItemId || undefined,
      status: body.status || "approved",
      date: body.date || new Date(),
    });

    return new Response(JSON.stringify(newExpense), { status: 201 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message || "Failed to create expense" }), { status: 500 });
  }
}
