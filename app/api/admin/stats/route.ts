import Item from "../../../../models/Item";
import User from "../../../../models/User";
import Sale from "../../../../models/Sale";
import Expense from "../../../../models/Expense";
import { dbConnect } from "../../../../lib/dbConnect";

export const dynamic = "force-dynamic"; // ensure live stats

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
        totalCost: { $sum: "$totalCost" },
      },
    },
  ]);

  const todayExpensesAgg = await Expense.aggregate([
    { $match: { createdAt: { $gte: today }, status: "approved" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const todayRevenue = todaySalesAgg[0]?.totalRevenue || 0;
  const todayCOGS = todaySalesAgg[0]?.totalCost || 0;
  const todayProfit = todayRevenue - todayCOGS - (todayExpensesAgg[0]?.total || 0);

  // ------------------- LIFETIME TOTALS -------------------
  const totalRevenueAgg = await Sale.aggregate([
    { $match: { status: "completed" } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalRevenue" },
        totalCost: { $sum: "$totalCost" },
      },
    },
  ]);

  const totalExpensesAgg = await Expense.aggregate([
    { $match: { status: "approved" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;
  const totalCOGS = totalRevenueAgg[0]?.totalCost || 0;
  const totalExpenses = totalExpensesAgg[0]?.total || 0;
  const totalProfit = totalRevenue - totalCOGS - totalExpenses;

  // ------------------- NET BALANCE -------------------
  const balance = totalRevenue - totalExpenses;

  return new Response(
    JSON.stringify({
      totalProducts,
      lowStock,
      totalUsers,

      todayRevenue,
      todayExpenses: todayExpensesAgg[0]?.total || 0,
      todayCOGS,
      todayProfit,

      totalRevenue,
      totalExpenses,
      totalCOGS,
      totalProfit,
      balance,
    }),
    { status: 200 }
  );
}
