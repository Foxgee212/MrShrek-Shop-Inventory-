import Item from "../../../../models/Item";
import User from "../../../../models/User";
import Sale from "../../../../models/Sale";
import Expense from "../../../../models/Expense";
import InventoryTransaction from "../../../../models/InventoryTransaction";
import Assets from "@/models/Assets";
import CapitalTransaction from "@/models/CapitalTransaction"; // <--- new
import { dbConnect } from "../../../../lib/dbConnect";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();

  const totalProducts = await Item.countDocuments();
  const lowStock = await Item.countDocuments({ stock: { $lt: 2 } });
  const totalUsers = await User.countDocuments();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // ------------------- Assets -------------------
  const assets = await Assets.find({ status: "active" });
  const totalAssets = assets.length;
  const totalAssetValue = assets.reduce((sum, a) => sum + a.PurchaseCost * a.quantity, 0);

  // ------------------- Capital Injections -------------------
  const capitalAgg = await CapitalTransaction.aggregate([
  {
    $group: {
      _id: null,
      totalInjections: {
        $sum: {
          $cond: [{ $eq: ["$type", "injection"] }, "$amount", 0]
        }
      },
      totalWithdrawals: {
        $sum: {
          $cond: [{ $eq: ["$type", "withdrawal"] }, "$amount", 0]
        }
      }
    }
  }
]);

const totalInjections = capitalAgg[0]?.totalInjections || 0;
const totalWithdrawals = capitalAgg[0]?.totalWithdrawals || 0;
const totalCapital = totalInjections - totalWithdrawals;


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

  // ------------------- TODAY EXPENSES (exclude stock purchases) -------------------
  const todayExpensesAgg = await Expense.aggregate([
    { $match: { createdAt: { $gte: today }, status: "approved", type: { $ne: "stock_purchase" } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const todayExpenses = todayExpensesAgg[0]?.total || 0;

  // ------------------- TODAY STOCK PURCHASES -------------------
  const todayStockPurchasesAgg = await InventoryTransaction.aggregate([
    { $match: { createdAt: { $gte: today }, type: "purchase" } },
    { $group: { _id: null, total: { $sum: { $multiply: ["$quantity", "$costPrice"] } } } },
  ]);
  const todayStockPurchases = todayStockPurchasesAgg[0]?.total || 0;

  const todayProfit = todayRevenue - todayCOGS - todayExpenses - todayStockPurchases;

  // ------------------- TOTAL SALES -------------------
  const totalSalesAgg = await Sale.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, totalRevenue: { $sum: "$totalRevenue" }, totalCOGS: { $sum: "$totalCost" } } },
  ]);
  const totalRevenue = totalSalesAgg[0]?.totalRevenue || 0;
  const totalCOGS = totalSalesAgg[0]?.totalCOGS || 0;

  // ------------------- TOTAL EXPENSES -------------------
  const totalExpensesAgg = await Expense.aggregate([
    { $match: { status: "approved", type: { $ne: "stock_purchase" } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalExpenses = totalExpensesAgg[0]?.total || 0;

  // ------------------- TOTAL STOCK PURCHASES -------------------
  const totalStockPurchasesAgg = await InventoryTransaction.aggregate([
    { $match: { type: "purchase" } },
    { $group: { _id: null, total: { $sum: { $multiply: ["$quantity", "$costPrice"] } } } },
  ]);
  const totalStockPurchases = totalStockPurchasesAgg[0]?.total || 0;

  const totalProfit = totalRevenue - totalCOGS - totalExpenses - totalStockPurchases;

  // ------------------- NET BALANCE -------------------
  // include totalCapital here
  const balance = totalCapital + totalRevenue - totalExpenses - totalStockPurchases;

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
      totalCapital,
    }),
    { status: 200 }
  );
}
