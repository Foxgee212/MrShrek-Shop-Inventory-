import { dbConnect } from "@/lib/dbConnect";
import CapitalTransaction from "@/models/CapitalTransaction";
import ActivityLog from "@/models/ActivityLog";
import { verifyTokenFromReq } from "@/lib/auth";

// GET: List all capital transactions with optional filters
export async function GET(req: Request) {
  await dbConnect();

  try {
    const admin = await verifyTokenFromReq(req, "admin");
    if (!admin) return new Response("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // injection or withdrawal
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;

    const filter: any = {};
    if (type) filter.type = type;

    const transactions = await CapitalTransaction.find(filter).sort({ [sortBy]: order });

    const totalInjections = transactions
      .filter(t => t.type === "injection")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawals = transactions
      .filter(t => t.type === "withdrawal")
      .reduce((sum, t) => sum + t.amount, 0);

    return Response.json({
      transactions,
      totalInjections,
      totalWithdrawals,
      netCapital: totalInjections - totalWithdrawals,
    });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message || "Failed to fetch transactions" }), { status: 500 });
  }
}

// POST: Add a new capital injection or withdrawal
export async function POST(req: Request) {
  await dbConnect();

  try {
    const admin = await verifyTokenFromReq(req, "admin");
    if (!admin) return new Response("Unauthorized", { status: 401 });

    const { type, amount, source, description } = await req.json();

    if (!type || !["injection", "withdrawal"].includes(type)) {
      return new Response(JSON.stringify({ error: "Type must be 'injection' or 'withdrawal'" }), { status: 400 });
    }

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: "Amount must be greater than 0" }), { status: 400 });
    }

    // 1️⃣ Record capital transaction
    const transaction = await CapitalTransaction.create({
      type,
      amount,
      source,
      description,
      createdBy: admin.id,
    });

    // 2️⃣ Log admin activity
    await ActivityLog.create({
      userId: admin.id,
      action: type === "injection" ? "capital_injection" : "capital_withdrawal",
      entityType: "CapitalTransaction",
      entityId: transaction._id,
      meta: { amount, source, description },
    });

    return Response.json({ message: "Capital transaction recorded", transaction }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message || "Failed to create transaction" }), { status: 500 });
  }
}
