import { dbConnect } from "../../../../lib/dbConnect";
import Sale from "../../../../models/Sale";

export async function GET() {
  await dbConnect();

  // ------------------------
  // DATE RANGES
  // ------------------------
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date();
  weekStart.setDate(today.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  // ------------------------
  // DAILY SALES
  // ------------------------
  const daily = await Sale.aggregate([
    { $match: { createdAt: { $gte: today } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
  ]);

  // ------------------------
  // WEEKLY SALES
  // ------------------------
  const weekly = await Sale.aggregate([
    { $match: { createdAt: { $gte: weekStart } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
  ]);

  // ------------------------
  // MONTHLY SALES
  // ------------------------
  const monthly = await Sale.aggregate([
    { $match: { createdAt: { $gte: monthStart } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
  ]);

  // ------------------------
  // TOTAL SALES (LIFETIME)
  // ------------------------
  const lifetime = await Sale.aggregate([
    { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
  ]);

  // ------------------------
  // RECENT TRANSACTIONS
  // ------------------------
  const recentTransactions = await Sale.find()
    .sort({ createdAt: -1 })
    .limit(20)   // adjust as you need
    .lean();

  // ------------------------
  // SALES BY DAY (FOR CHART)
  // ------------------------
  const salesByDay = await Sale.aggregate([
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        },
        total: { $sum: "$totalAmount" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
  ]);

  return Response.json({
    dailySales: {
      total: daily[0]?.total || 0,
      count: daily[0]?.count || 0
    },
    weeklySales: {
      total: weekly[0]?.total || 0,
      count: weekly[0]?.count || 0
    },
    monthlySales: {
      total: monthly[0]?.total || 0,
      count: monthly[0]?.count || 0
    },
    lifetimeSales: {
      total: lifetime[0]?.total || 0,
      count: lifetime[0]?.count || 0
    },
    recentTransactions,
    salesByDay
  });
}
