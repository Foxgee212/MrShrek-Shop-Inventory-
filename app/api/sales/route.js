import { dbConnect } from "@/lib/db";
import Item from "@/models/Item";
import Sale from "@/models/Sale";
import ActivityLog from "@/models/ActivityLog";
import { verifyTokenFromReq } from "@/lib/auth";

export async function POST(req) {
  await dbConnect();

  try {
    const user = verifyTokenFromReq(req); // staff or admin allowed
    const body = await req.json(); // { itemId, quantity, sellingPrice }
    const { itemId, quantity, sellingPrice } = body;

    const item = await Item.findById(itemId);
    if (!item) throw new Error("Item not found");
    if (item.stock < quantity) {
      return new Response(JSON.stringify({ error: "Not enough stock" }), { status: 400 });
    }

    item.stock -= quantity;
    await item.save();

    const total = sellingPrice * quantity;
    const sale = await Sale.create({
      itemId, userId: user.id, quantity, sellingPrice, total
    });

    await ActivityLog.create({ userId: user.id, action: "create_sale", meta: { saleId: sale._id, itemId } });

    return new Response(JSON.stringify(sale), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: err.status || 500 });
  }
}
