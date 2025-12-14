import Item from "../../../../../models/Item";
import Sale from "../../../../../models/Sale";
import Expense from "../../../../../models/Expense";
import { dbConnect } from "../../../../../lib/dbConnect";

export const dynamic = "force-dynamic"; // live stats

export async function GET() {
  await dbConnect();

  const now = new Date();

  // ---------------------- Date Helpers ----------------------
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const startOfWeek = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());
  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1);

  const today = startOfDay(now);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const monthStart = startOfMonth(now);
  const yearStart = startOfYear(now);

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
      { $match: { createdAt: { $gte: date }, status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    return data[0]?.total || 0;
  };

  // ---------------------- BASIC TOTALS ----------------------
  const todayData = await sumSales(today);
  const todayExpenses = await sumExpenses(today);
  const yesterdayData = await sumSales(yesterday);
  const weeklyData = await sumSales(sevenDaysAgo);
  const monthlyData = await sumSales(thirtyDaysAgo);
  const thisMonthData = await sumSales(monthStart);
  const thisYearData = await sumSales(yearStart);

  const totalData = await sumSales(new Date(0)); // all-time
  const totalExpenses = await sumExpenses(new Date(0));

  const totalRevenue = totalData.totalRevenue;
  const totalCOGS = totalData.totalCost;
  const netCash = totalRevenue - totalCOGS - totalExpenses;

  // ---------------------- BEST-SELLING ITEMS ----------------------
  const bestSellingItems = await Sale.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: "$itemId", totalQty: { $sum: "$quantity" }, totalRevenue: { $sum: "$totalRevenue" } } },
    { $sort: { totalQty: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "items",
        localField: "_id",
        foreignField: "_id",
        as: "item",
      },
    },
    { $unwind: "$item" },
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

  // ---------------------- HOURLY SALES (today) ----------------------
  const hourlySales = await Sale.aggregate([
    { $match: { createdAt: { $gte: today }, status: "completed" } },
    { $group: { _id: { $hour: "$createdAt" }, totalRevenue: { $sum: "$totalRevenue" } } },
    { $sort: { "_id": 1 } },
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
    { $match: { createdAt: { $gte: thirtyDaysAgo }, status: "approved" } },
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
    yesterday: { revenue: yesterdayData.totalRevenue, COGS: yesterdayData.totalCost },
    weekly: { revenue: weeklyData.totalRevenue, COGS: weeklyData.totalCost },
    monthly: { revenue: monthlyData.totalRevenue, COGS: monthlyData.totalCost },
    thisMonth: { revenue: thisMonthData.totalRevenue, COGS: thisMonthData.totalCost },
    thisYear: { revenue: thisYearData.totalRevenue, COGS: thisYearData.totalCost },
    totalRevenue,
    totalCOGS,
    totalExpenses,
    netCash,
    totalSalesCount: await Sale.countDocuments({ status: "completed" }),

    bestSellingItems,
    categorySales,
    hourlySales,
    dailySales,
    dailyExpenses,
    netCashDaily,
  });
}
