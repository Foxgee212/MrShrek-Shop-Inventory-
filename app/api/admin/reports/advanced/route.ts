import Item from "../../../../../models/Item";
import Sale from "../../../../../models/Sale";
import Expense from "../../../../../models/Expense";
import { dbConnect } from "../../../../../lib/dbConnect";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();

  const now = new Date();

  // ---------------------- Date helpers ----------------------
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1);

  const today = startOfDay(now);
  const monthStart = startOfMonth(now);
  const yearStart = startOfYear(now);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // ---------------------- Helper functions ----------------------
  const sumSales = async (date: Date) => {
    const data = await Sale.aggregate([
      { $match: { createdAt: { $gte: date }, status: "completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalRevenue" }, totalCost: { $sum: "$totalCost" } } },
    ]);
    return data[0] || { totalRevenue: 0, totalCost: 0 };
  };

  const sumExpenses = async (date: Date) => {
    const data = await Expense.aggregate([
      { 
        $match: { 
          createdAt: { $gte: date }, 
          status: "approved", 
          type: { $ne: "stock_purchase" } // exclude stock purchases
        } 
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    return data[0]?.total || 0;
  };

  // ---------------------- BASIC TOTALS ----------------------
  const todayData = await sumSales(today);
  const todayExpenses = await sumExpenses(today);

  const monthlyData = await sumSales(thirtyDaysAgo);
  const totalData = await sumSales(new Date(0));
  const totalExpenses = await sumExpenses(new Date(0));

  const totalRevenue = totalData.totalRevenue;
  const totalCOGS = totalData.totalCost;
  const netCash = totalRevenue - totalCOGS - totalExpenses;

  // ---------------------- BEST-SELLING ITEMS ----------------------
  // Only show items that are currently out-of-stock
  const bestSellingItems = await Sale.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: "$itemId", totalQty: { $sum: "$quantity" }, totalRevenue: { $sum: "$totalRevenue" } } },
    { $sort: { totalQty: -1 } },
    {
      $lookup: {
        from: "items",
        localField: "_id",
        foreignField: "_id",
        as: "item",
      },
    },
    { $unwind: "$item" },
    { $match: { "item.stock": { $lte: 0 } } }, // only sold-out items
    { $limit: 10 },
  ]);

  // ---------------------- SALES BY CATEGORY ----------------------
  const categorySales = await Sale.aggregate([
    { $match: { status: "completed" } },
    {
      $lookup: {
        from: "items",
        localField: "itemId",
        foreignField: "_id",
        as: "item",
      },
    },
    { $unwind: "$item" },
    {
      $group: {
        _id: "$item.category",
        totalRevenue: { $sum: "$totalRevenue" },
        totalQty: { $sum: "$quantity" },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  // ---------------------- DAILY SALES / EXPENSES (last 30 days) ----------------------
  const dailySales = await Sale.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo }, status: "completed" } },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        totalRevenue: { $sum: "$totalRevenue" },
        totalCost: { $sum: "$totalCost" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  const dailyExpenses = await Expense.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo }, status: "approved", type: { $ne: "stock_purchase" } } },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  const netCashDaily = dailySales.map((saleDay) => {
    const expenseDay = dailyExpenses.find(
      (e) =>
        e._id.day === saleDay._id.day &&
        e._id.month === saleDay._id.month &&
        e._id.year === saleDay._id.year
    );
    return {
      _id: saleDay._id,
      net: saleDay.totalRevenue - saleDay.totalCost - (expenseDay?.total || 0),
    };
  });

  return Response.json({
    today: { revenue: todayData.totalRevenue, COGS: todayData.totalCost, expenses: todayExpenses },
    monthly: { revenue: monthlyData.totalRevenue, COGS: monthlyData.totalCost },
    totalRevenue,
    totalCOGS,
    totalExpenses,
    netCash,
    totalSalesCount: await Sale.countDocuments({ status: "completed" }),

    bestSellingItems,
    categorySales,
    dailySales,
    dailyExpenses,
    netCashDaily,
  });
}
