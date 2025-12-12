import { dbConnect } from "../../../lib/dbConnect";
import Item from "../../../models/Item";
import Sale from "../../../models/Sale";
import ActivityLog from "../../../models/ActivityLog";
import { verifyTokenFromReq } from "../../../lib/auth";

export async function POST(req) {
  await dbConnect();

  try {
    const user = verifyTokenFromReq(req);

    const { itemId, quantity, sellingPrice } = await req.json();

    const item = await Item.findById(itemId);
    if (!item) {
      return new Response(JSON.stringify({ error: "Item not found" }), { status: 404 });
    }

    if (quantity <= 0) {
      return new Response(JSON.stringify({ error: "Quantity must be greater than zero" }), { status: 400 });
    }

    if (item.stock < quantity) {
      return new Response(JSON.stringify({ error: "Not enough stock" }), { status: 400 });
    }

    // Update stock
    item.stock -= quantity;
    await item.save();

    // Create sale
    const total = sellingPrice * quantity;
    const sale = await Sale.create({
      itemId,
      userId: user.id,
      quantity,
      sellingPrice,
      total,
    });

    // Log activity
    await ActivityLog.create({
      userId: user.id,
      action: "create_sale",
      meta: { saleId: sale._id, itemId },
    });

    return new Response(JSON.stringify(sale), { status: 201 });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: err.status || 500 }
    );
  }
}
