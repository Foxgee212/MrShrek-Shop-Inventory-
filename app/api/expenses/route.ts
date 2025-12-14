import { dbConnect } from "../../../lib/dbConnect";
import Expense from "../../../models/Expense";
import { verifyTokenFromReq } from "../../../lib/auth";

// Define the expected request body shape
interface ExpenseBody {
  type:  "withdrawal" | "misc";
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

// Define the user type returned by your auth
interface AuthUser {
  id: string;
  email: string;
  // add more if your auth returns more fields
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const expenses = await Expense.find().sort({ createdAt: -1 });
    return Response.json(expenses);
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message || "Failed to fetch expenses" }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const tokenData = await verifyTokenFromReq(req);

    // Ensure tokenData exists and has id/email
    if (!tokenData) return new Response("Unauthorized", { status: 401 });

    const user: AuthUser = {
      id: (tokenData as any).id,
      email: (tokenData as any).email,
    };


    const body: ExpenseBody = await req.json();

   const newExpense = await Expense.create({
    type: body.type,
    amount: body.amount,
    description: body.description || "",
    userId: user.id,
    category: body.category,
    paymentMethod: body.paymentMethod,
    reference: body.reference,
    supplier: body.supplier,
    linkedItemId: body.linkedItemId || undefined, // <-- convert empty string to undefined
    status: body.status,
    date: body.date,
  });


    return new Response(JSON.stringify(newExpense), { status: 201 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message || "Failed to create expense" }), { status: 500 });
  }
}
