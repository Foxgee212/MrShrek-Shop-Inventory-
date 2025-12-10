import Item from "../../../../models/Item";
import User from "../../../../models/User";
import Sale from "../../../../models/Sale";
import { dbConnect } from "../../../../lib/dbConnect";

export async function GET() {
  await dbConnect();

  const totalItem = await Item.countDocuments();
  const lowStock = await Item.countDocuments({ stock: { $lt: 5 } });
  const totalUsers = await User.countDocuments();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySales = await Sale.aggregate([
    { $match: { createdAt: { $gte: today } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } }
  ]);

  return new Response(JSON.stringify({
    totalItem,
    lowStock,
    totalUsers,
    todaySales: todaySales[0]?.total || 0
  }));
}
