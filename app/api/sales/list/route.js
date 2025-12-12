import { dbConnect } from "@/lib/dbConnect";
import Sale from "@/models/Sale";

export async function GET() {
  await dbConnect();
  const sales = await Sale.find().sort({ createdAt: -1 });
  return new Response(JSON.stringify(sales), { status: 200 });
}
