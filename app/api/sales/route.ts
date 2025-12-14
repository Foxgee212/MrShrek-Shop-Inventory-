import { dbConnect } from "../../../lib/dbConnect";
import Item from "../../../models/Item";
import Sale from "../../../models/Sale";
import ActivityLog from "../../../models/ActivityLog";
import { verifyTokenFromReq } from "../../../lib/auth";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const user = verifyTokenFromReq(req);

    const {
      itemId,
      quantity,
      sellingPrice,
      paymentMethod = "cash",
      reference,
    } = await req.json();

    /* ---------------- Validation ---------------- */
    if (!itemId || !quantity || !sellingPrice) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return new Response(
        JSON.stringify({ error: "Quantity must be greater than zero" }),
        { status: 400 }
      );
    }

    /* ---------------- Fetch Item ---------------- */
    const item = await Item.findById(itemId);
    if (!item) {
      return new Response(
        JSON.stringify({ error: "Item not found" }),
        { status: 404 }
      );
    }

    if (item.stock < quantity) {
      return new Response(
        JSON.stringify({ error: "Not enough stock" }),
        { status: 400 }
      );
    }

    /* ---------------- Financial Calculations ---------------- */
    const totalRevenue = sellingPrice * quantity;
    const totalCost = (item.costPrice || 0) * quantity;
    const netCash = totalRevenue - totalCost;

    /* ---------------- Update Stock ---------------- */
    item.stock -= quantity;
    await item.save();

    /* ---------------- Create Sale ---------------- */
    const sale = await Sale.create({
      /* Relations */
      itemId: item._id,
      userId: user.id,

      /* Snapshot (IMMUTABLE) */
      itemName: item.name,
      category: item.category,
      brand: item.brand,
      model: item.model,

      /* Quantity & Pricing */
      quantity,
      costPrice: item.costPrice,
      sellingPrice,

      /* Financial Totals */
      totalRevenue,
      totalCost,
      netCash,

      /* Payment */
      paymentMethod : paymentMethod || "cash",
      reference,

      /* Status & Date handled by schema */
    });

    /* ---------------- Activity Log ---------------- */
    await ActivityLog.create({
      userId: user.id,
      action: "create_sale",
      entityType: "Sale",
      entityId: sale._id,
      meta: { itemId, quantity, totalRevenue, netCash },
      
    });

    return new Response(JSON.stringify(sale), { status: 201 });

  } catch (err: any) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal Server Error" }),
      { status: err.status || 500 }
    );
  }
}
