import Item from "../../../../../models/Item";
import Sale from "../../../../../models/Sale";
import Expense from "../../../../../models/Expense";
import InventoryTransaction from "../../../../../models/InventoryTransaction";
import CapitalExpenditure from "../../../../../models/CapitalExpenditure";
import { dbConnect } from "../../../../../lib/dbConnect";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();

  const now = new Date();

  // ---------------------- Date helpers ----------------------
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const today = startOfDay(now);
  const monthStart = startOfMonth(now);
  const yearStart = startOfYear(now);

  // ---------------------- Helper functions ----------------------
  const sumSales = async (date: Date) => {
    const data = await Sale.aggregate([
      { $match: { createdAt: { $gte: date }, status: "completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalRevenue" }, totalCost: { $sum: "$totalCost" }, count: { $sum: 1 } } },
    ]);
    return data[0] || { totalRevenue: 0, totalCost: 0, count: 0 };
  };

  const sumExpenses = async (date: Date) => {
    const data = await Expense.aggregate([
      { 
        $match: { 
          createdAt: { $gte: date }, 
          status: "approved", 
          type: { $nin: ["stock_purchase", "asset_purchase"] } // exclude stock & CapEx
        } 
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    return data[0]?.total || 0;
  };

  const sumStockPurchases = async (date: Date) => {
    const data = await InventoryTransaction.aggregate([
      { $match: { createdAt: { $gte: date }, type: "purchase" } },
      { $group: { _id: null, total: { $sum: { $multiply: ["$quantity", "$costPrice"] } } } },
    ]);
    return data[0]?.total || 0;
  };

  const sumCapEx = async (date: Date) => {
    const data = await CapitalExpenditure.aggregate([
      { $match: { createdAt: { $gte: date } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    return data[0]?.total || 0;
  };

  // ---------------------- PERIOD AGGREGATES ----------------------
  const periods = {
    today,
    monthStart,
    yearStart,
    all: new Date(0),
  };

  const results: any = {};

  for (const [key, date] of Object.entries(periods)) {
    const sales = await sumSales(date);
    const expenses = await sumExpenses(date);
    const stockPurchases = await sumStockPurchases(date);
    const capEx = await sumCapEx(date);

    results[key] = {
      revenue: sales.totalRevenue,
      COGS: sales.totalCost,
      operatingExpenses: expenses,
      stockPurchases,
      capEx,
      profit: sales.totalRevenue - sales.totalCost - expenses, // P&L profit
      netCash: sales.totalRevenue - sales.totalCost - expenses - stockPurchases - capEx, // Cashflow
      salesCount: sales.count,
    };
  }

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

  // ---------------------- DAILY SALES & EXPENSES (last 30 days) ----------------------
  const dailySales = await Sale.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo }, status: "completed" } },
    { $group: {
        _id: { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        totalRevenue: { $sum: "$totalRevenue" },
        totalCost: { $sum: "$totalCost" },
      } },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  const dailyExpenses = await Expense.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo }, status: "approved", type: { $nin: ["stock_purchase", "asset_purchase"] } } },
    { $group: {
        _id: { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        total: { $sum: "$amount" },
      } },
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
    periods: results,
    bestSellingItems,
    categorySales,
    dailySales,
    dailyExpenses,
    netCashDaily,
  });
}
