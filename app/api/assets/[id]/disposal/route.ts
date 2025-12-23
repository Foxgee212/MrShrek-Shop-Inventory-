import { dbConnect } from "@/lib/dbConnect";
import Asset from "@/models/Assets";
import Expense from "@/models/Expense";
import ActivityLog from "@/models/ActivityLog";
import { verifyTokenFromReq } from "@/lib/auth";


export async function POST(req: Request, { params }: any) {
  await dbConnect();

  const admin = await verifyTokenFromReq(req, "admin");
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const { amount } = await req.json();

  const asset = await Asset.findById(params.id);
  if (!asset || asset.status === "disposed") {
    return new Response("Invalid asset", { status: 400 });
  }

  asset.status = "disposed";
  asset.disposedAt = new Date();
  asset.disposalAmount = amount;
  await asset.save();

  await Expense.create({
    type: "asset_disposal",
    amount: -amount, // cash inflow
    description: `Asset disposal: ${asset.name}`,
    status: "approved",
    userId: admin.id,
  });

  return Response.json({ message: "Asset disposed successfully" });
}
