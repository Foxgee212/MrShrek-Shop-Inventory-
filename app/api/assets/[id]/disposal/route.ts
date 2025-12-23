import { dbConnect } from "@/lib/dbConnect";
import Asset from "@/models/Assets";
import CapitalExpenditure from "@/models/CapitalExpenditure";
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

  // Record cash inflow
  await CapitalExpenditure.create({
    type: "asset_disposal", // or "inflow"
    amount: amount, // cash received
    description: `Asset disposal: ${asset.name}`,
    referenceType: "Asset",
    referenceId: asset._id,
    createdBy: admin.id,
  });

  // Log activity
  await ActivityLog.create({
    userId: admin.id,
    action: "asset_disposal",
    entityType: "Asset",
    entityId: asset._id,
    meta: { disposalAmount: amount },
  });

  return new Response(JSON.stringify({ message: "Asset disposed successfully" }), { status: 200 });
}
