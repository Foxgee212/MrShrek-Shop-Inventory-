import Item from "../../../../models/Item";
import User from "../../../../models/User";
import Sale from "../../../../models/Sale";
import Expense from "../../../../models/Expense";
import { dbConnect } from "../../../../lib/dbConnect";

export async function GET() {
  await dbConnect();

  const totalProducts = await Item.countDocuments();
  const lowStock = await Item.countDocuments({ stock: { $lt: 2 } });
  const totalUsers = await User.countDocuments();
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // =========================
  // TODAY SALES
  // =========================
  const todaySales = await Sale.aggregate([
    { $match: { createdAt: { $gte: today } } },
    { $group: { _id: null, total: { $sum: "$total" } } }
  ]);

  // =========================
  // TODAY EXPENSES
  // =========================
  const todayExpenses = await Expense.aggregate([
    { $match: { createdAt: { $gte: today } } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  // =========================
  // TOTAL EXPENSES (LIFETIME)
  // =========================
  const totalExpenses = await Expense.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  // =========================
// TOTAL REVENUE (LIFETIME)
// =========================
const totalRevenueAgg = await Sale.aggregate([
  { $group: { _id: null, total: { $sum: "$total" } } },
]);
const totalRevenue = totalRevenueAgg[0]?.total || 0;

// =========================
// NET CASH BALANCE (Lifetime)
// =========================
const balance = totalRevenue - (totalExpenses[0]?.total || 0);


  return new Response(
    JSON.stringify({
      totalProducts,
      lowStock,
      totalUsers,
      todaySales: todaySales[0]?.total || 0,
      todayExpenses: todayExpenses[0]?.total || 0,
      totalExpenses: totalExpenses[0]?.total || 0,
      totalRevenue,
      balance,
    })
  );
}
