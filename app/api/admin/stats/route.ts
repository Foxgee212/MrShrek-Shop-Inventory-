import Item from "../../../../models/Item";
import User from "../../../../models/User";
import Sale from "../../../../models/Sale";
import Expense from "../../../../models/Expense";
import InventoryTransaction from "../../../../models/InventoryTransaction";
import Assets from "@/models/Assets";
import { dbConnect } from "../../../../lib/dbConnect";


export const dynamic = "force-dynamic"; // ensure live stats

export async function GET() {
  await dbConnect();

  const totalProducts = await Item.countDocuments();
  const lowStock = await Item.countDocuments({ stock: { $lt: 2 } });
  const totalUsers = await User.countDocuments();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const assets = await Assets.find({ status: "active" });

  const totalAssets = assets.length;
  const totalAssetValue = assets.reduce(
    (sum, a) => sum + a.PurchaseCost * a.quantity,
    0
  );


  // ------------------- TODAY SALES -------------------
  const todaySalesAgg = await Sale.aggregate([
    { $match: { createdAt: { $gte: today }, status: "completed" } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalRevenue" },
        totalCOGS: { $sum: "$totalCost" },
      },
    },
  ]);

  const todayRevenue = todaySalesAgg[0]?.totalRevenue || 0;
  const todayCOGS = todaySalesAgg[0]?.totalCOGS || 0;

  // ------------------- TODAY EXPENSES (Exclude stock purchases) -------------------
  const todayExpensesAgg = await Expense.aggregate([
    {
      $match: {
        createdAt: { $gte: today },
        status: "approved",
        type: { $ne: "stock_purchase" }, // exclude stock purchases
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const todayExpenses = todayExpensesAgg[0]?.total || 0;

  // ------------------- TODAY STOCK PURCHASES -------------------
  const todayStockPurchasesAgg = await InventoryTransaction.aggregate([
    {
      $match: { createdAt: { $gte: today }, type: "purchase" },
    },
    {
      $group: { _id: null, total: { $sum: { $multiply: ["$quantity", "$unitCost"] } } },
    },
  ]);
  const todayStockPurchases = todayStockPurchasesAgg[0]?.total || 0;

  const todayProfit = todayRevenue - todayCOGS - todayExpenses - todayStockPurchases;

  // ------------------- LIFETIME TOTALS -------------------
  const totalSalesAgg = await Sale.aggregate([
    { $match: { status: "completed" } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalRevenue" },
        totalCOGS: { $sum: "$totalCost" },
      },
    },
  ]);

  const totalRevenue = totalSalesAgg[0]?.totalRevenue || 0;
  const totalCOGS = totalSalesAgg[0]?.totalCOGS || 0;

  const totalExpensesAgg = await Expense.aggregate([
    { 
      $match: { 
        status: "approved",
        type: { $ne: "stock_purchase" }, // exclude stock purchases
      } 
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalExpenses = totalExpensesAgg[0]?.total || 0;

  const totalStockPurchasesAgg = await InventoryTransaction.aggregate([
    { $match: { type: "purchase" } },
    { $group: { _id: null, total: { $sum: { $multiply: ["$quantity", "$costPrice"] } } } },
  ]);
  const totalStockPurchases = totalStockPurchasesAgg[0]?.total || 0;

  const totalProfit = totalRevenue - totalCOGS - totalExpenses - totalStockPurchases;

  // ------------------- NET BALANCE -------------------
  const balance = totalRevenue - totalExpenses - totalStockPurchases;

  return new Response(
    JSON.stringify({
      totalProducts,
      lowStock,
      totalUsers,

      todayRevenue,
      todayExpenses,
      todayCOGS,
      todayStockPurchases,
      todayProfit,

      totalRevenue,
      totalExpenses,
      totalCOGS,
      totalStockPurchases,
      totalProfit,
      balance,

      totalAssets,
      totalAssetValue,
    }),
    { status: 200 }
  );
}
