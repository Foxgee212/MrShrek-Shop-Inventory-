import Item from "../../../../../models/Item";
import Sale from "../../../../../models/Sale";
import Expense from "../../../../../models/Expense";
import { dbConnect } from "../../../../../lib/dbConnect";

export async function GET() {
  await dbConnect();

  const now = new Date();

  // Helpers
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

  // Helper to sum totals
  const sumSales = async (date: Date) => {
    const data = await Sale.aggregate([
      { $match: { createdAt: { $gte: date } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    return data[0]?.total || 0;
  };


  // ==== BASIC TOTALS ====
  const todaySales = await sumSales(today);
  const yesterdaySales = await Sale.aggregate([
    { $match: { createdAt: { $gte: yesterday, $lt: today } } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  const weeklySales = await sumSales(sevenDaysAgo);
  const monthlySales = await sumSales(thirtyDaysAgo);
  const thisMonthSales = await sumSales(monthStart);
  const thisYearSales = await sumSales(yearStart);

  const totalRevenue = await sumSales(new Date(0));
  const totalSalesCount = await Sale.countDocuments();

  // ==== BEST-SELLING ITEMS ====
  const bestSellingItems = await Sale.aggregate([
    {
      $group: {
        _id: "$itemId",
        totalQty: { $sum: "$quantity" },
        totalRevenue: { $sum: "$total" },
      },
    },
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
    { $unwind: "$item" }
  ]);

  // ==== SALES BY CATEGORY ====
  const categorySales = await Sale.aggregate([
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
        totalRevenue: { $sum: "$total" },
        totalQty: { $sum: "$quantity" },
      },
    },
    { $sort: { totalRevenue: -1 } }
  ]);

  // ==== HOURLY SALES (for today's POS chart) ====
  const hourlySales = await Sale.aggregate([
    { $match: { createdAt: { $gte: today } } },
    {
      $group: {
        _id: { $hour: "$createdAt" },
        total: { $sum: "$total" },
      },
    },
    { $sort: { "_id": 1 } }
  ]);
// ==== TOTAL EXPENSES ====
const expenseAgg = await Expense.aggregate([
  {
    $group: {
      _id: null,
      total: { $sum: "$amount" }
    }
  }
]);

const totalExpenses = expenseAgg[0]?.total || 0;

// ==== NET CASH ====
const netCash = totalRevenue - totalExpenses;




  // ==== DAILY SALES (last 30 days chart) ====
  const dailySales = await Sale.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        },
        total: { $sum: "$total" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
  ]);


  // ==== DAILY EXPENSES (last 30 days) ====
const dailyExpenses = await Expense.aggregate([
  { $match: { createdAt: { $gte: thirtyDaysAgo } } },
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
// ==== NET CASH PER DAY ====
const netCashDaily = dailySales.map((saleDay) => {
  const expenseDay = dailyExpenses.find(
    (e) =>
      e._id.day === saleDay._id.day &&
      e._id.month === saleDay._id.month &&
      e._id.year === saleDay._id.year
  );

  return {
    _id: saleDay._id,
    net: saleDay.total - (expenseDay?.total || 0),
  };
});

  return Response.json({
    todaySales,
    yesterdaySales: yesterdaySales[0]?.total || 0,
    weeklySales,
    monthlySales,
    thisMonthSales,
    thisYearSales,
    totalRevenue,
    totalSalesCount,

    totalExpenses,
    netCash,

    bestSellingItems,
    categorySales,
    hourlySales,
    dailySales,
    netCashDaily,
    dailyExpenses,
  });
}
