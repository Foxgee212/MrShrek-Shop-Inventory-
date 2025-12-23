import Item from "@/models/Item";
import User from "@/models/User";
import Sale from "@/models/Sale";
import Assets from "@/models/Assets";
import Expense from "@/models/Expense";
import InventoryTransaction from "@/models/InventoryTransaction";
import CapitalExpenditure from "@/models/CapitalExpenditure";
import CapitalTransaction from "@/models/CapitalTransaction";
import { dbConnect } from "../../../../lib/dbConnect";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();

  const totalProducts = await Item.countDocuments();
  const lowStock = await Item.countDocuments({ stock: { $lt: 2 } });
  const totalUsers = await User.countDocuments();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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

  // ------------------- TODAY OPERATING EXPENSES (exclude stock & capex) -------------------
  const todayExpensesAgg = await Expense.aggregate([
    {
      $match: {
        createdAt: { $gte: today },
        status: "approved",
        type: { $nin: ["stock_purchase", "asset_purchase"] },
      },
    },
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

  // ------------------- TOTAL OPERATING EXPENSES -------------------
  const totalExpensesAgg = await Expense.aggregate([
    { $match: { status: "approved", type: { $nin: ["stock_purchase", "asset_purchase"] } } },
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

  // ------------------- CAPITAL EXPENDITURES -------------------
  const capExAgg = await CapitalExpenditure.aggregate([
    {
      $group: {
        _id: null,
        totalCapEx: { $sum: "$amount" },
      },
    },
  ]);
  const totalCapEx = capExAgg[0]?.totalCapEx || 0;

  // ------------------- ASSETS (BALANCE SHEET) -------------------
const assetAgg = await Assets.aggregate([
  { $match: { status: "active" } },
  {
    $group: {
      _id: null,
      totalAssetValue: {
        $sum: { $multiply: ["$purchaseCost", "$quantity"] },
      },
      totalAssets: { $sum: 1 },
    },
  },
]);

const totalAssetValue = assetAgg[0]?.totalAssetValue || 0;
const totalAssets = assetAgg[0]?.totalAssets || 0;


  // ------------------- CAPITAL TRANSACTIONS -------------------
  const capitalAgg = await CapitalTransaction.aggregate([
    {
      $group: {
        _id: null,
        totalInjections: { $sum: { $cond: [{ $eq: ["$type", "injection"] }, "$amount", 0] } },
        totalWithdrawals: { $sum: { $cond: [{ $eq: ["$type", "withdrawal"] }, "$amount", 0] } },
      },
    },
  ]);
  const totalInjections = capitalAgg[0]?.totalInjections || 0;
  const totalWithdrawals = capitalAgg[0]?.totalWithdrawals || 0;
  const totalCapital = totalInjections - totalWithdrawals;

  // ------------------- NET CASH / BALANCE -------------------
  const balance = totalCapital - totalCapEx;

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

      totalAssets,
      totalAssetValue,
      totalCapital,
      totalCapEx,
      balance,
    }),
    { status: 200 }
  );
}
