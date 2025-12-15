import Item from "@/models/Item.js";
import { dbConnect } from "@/lib/dbConnect";


export async function GET() {
    await dbConnect();

    // ---------------- CATEGORY VALUATION ----------------
  const categoryValuation = await Item.aggregate([
    {
      $project: {
        category: 1,
        stock: 1,
        costPrice: { $ifNull: ["$costPrice", 0] },
        itemValue: {
          $multiply: ["$stock", { $ifNull: ["$costPrice", 0] }],
        },
      },
    },
    {
      $group: {
        _id: "$category",
        totalStock: { $sum: "$stock" },
        totalValue: { $sum: "$itemValue" },
        itemCount: { $sum: 1 },
      },
    },
    { $sort: { totalValue: -1 } },
  ]);

  // ---------------- TOTAL INVENTORY VALUE ----------------
  const totalAgg = await Item.aggregate([
    {
      $project: {
        value: {
          $multiply: ["$stock", { $ifNull: ["$costPrice", 0] }],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalInventoryValue: { $sum: "$value" },
      },
    },
  ]);

  const totalInventoryValue = totalAgg[0]?.totalInventoryValue || 0;

  return Response.json({
    totalInventoryValue,
    categoryValuation,
  });
}
