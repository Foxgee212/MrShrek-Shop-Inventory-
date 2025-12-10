import { dbConnect } from "@/lib/dbConnect";
import Item from "@/models/Item";
import ActivityLog from "@/models/ActivityLog";
import { verifyTokenFromReq } from "@/lib/auth";

export async function GET() {
  await dbConnect();

  const items = await Item.find().sort({ category: 1, brand: 1, model: 1 });

  return new Response(JSON.stringify(items), { status: 200 });
}

export async function POST(req) {
  await dbConnect();

  try {
    // Only admin should create inventory items
    const user = verifyTokenFromReq(req, "admin");

    const body = await req.json();

    const item = await Item.create(body);

    await ActivityLog.create({
      userId: user.id,
      action: "create_item",
      meta: { itemId: item._id }
    });

    return new Response(JSON.stringify(item), { status: 201 });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: err.status || 500 }
    );
  }
}
