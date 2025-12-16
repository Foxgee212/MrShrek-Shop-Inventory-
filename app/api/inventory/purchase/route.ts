import { dbConnect } from "@/lib/dbConnect";
import Item from "@/models/Item";
import InventoryTransaction from "@/models/InventoryTransaction";
import ActivityLog from "@/models/ActivityLog";
import { verifyTokenFromReq } from "@/lib/auth";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const admin = verifyTokenFromReq(req);
    const purchaseList = await req.json(); // Expect an array of items

    if (!Array.isArray(purchaseList) || purchaseList.length === 0) {
      return new Response(JSON.stringify({ error: "Purchase list is empty" }), { status: 400 });
    }

    const results = [];

    for (const itemData of purchaseList) {
      const { name, category, brand, model, purchaseQty, costPrice, sellingPrice } = itemData;

      if (!name || !category || !brand || !purchaseQty || !costPrice || !sellingPrice) {
        return new Response(
          JSON.stringify({ error: "Missing required fields in one of the items" }),
          { status: 400 }
        );
      }

      // Check if item already exists
      let item = await Item.findOne({ name, category, brand, model });

      if (item) {
        // Update existing stock and optionally costPrice
        item.stock += purchaseQty;
        item.costPrice = costPrice;
        item.sellingPrice = sellingPrice;
        await item.save();
      } else {
        // Create new item and implicitly handle new category
        item = await Item.create({
          name,
          category, // new category is handled automatically
          brand,
          model,
          stock: purchaseQty,
          costPrice,
          sellingPrice,
        });
      }

      // Record inventory transaction
      await InventoryTransaction.create({
        itemId: item._id,
        type: "purchase",
        quantity: purchaseQty,
        unitCost: costPrice,
        userId: admin.id,
      });

      // Log admin activity
      await ActivityLog.create({
        userId: admin.id,
        action: "inventory_purchase",
        entityType: "Item",
        entityId: item._id,
        meta: { purchaseQty, costPrice, category },
      });

      results.push({ itemId: item._id, name: item.name, category: item.category, stock: item.stock });
    }

return Response.json(results);


  } catch (err: any) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal Server Error" }),
      { status: err.status || 500 }
    );
  }
}
