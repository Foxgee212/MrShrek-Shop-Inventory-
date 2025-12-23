import { dbConnect } from "@/lib/dbConnect";
import Asset from "@/models/Assets";
import CapitalExpenditure from "@/models/CapitalExpenditure";
import ActivityLog from "@/models/ActivityLog";
import { verifyTokenFromReq } from "@/lib/auth";
import { NextResponse } from "next/server";

/* =========================
   UPDATE ASSET (EDIT)
========================= */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  const admin = await verifyTokenFromReq(req, "admin");

  const { id } = await params;
  const updates = await req.json();

  const asset = await Asset.findById(id);
  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  // Save old total cost to adjust CapitalExpenditure if needed
  const oldTotalCost = asset.purchaseCost * asset.quantity;

  // Update asset
  Object.assign(asset, updates);
  await asset.save();

  // Update corresponding CapitalExpenditure transaction
  const newTotalCost = asset.purchaseCost * asset.quantity;
  await CapitalExpenditure.findOneAndUpdate(
    { referenceType: "Asset", referenceId: asset._id },
    { amount: newTotalCost, description: `Asset purchase: ${asset.name}` }
  );

  // Log activity
  await ActivityLog.create({
    userId: admin.id,
    action: "asset_update",
    entityType: "Asset",
    entityId: asset._id,
    meta: {
      oldTotalCost,
      newTotalCost,
      updates,
    },
  });

  return NextResponse.json(asset);
}

/* =========================
   DELETE ASSET
========================= */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  const admin = await verifyTokenFromReq(req, "admin");

  const { id } = await params;

  const asset = await Asset.findById(id);
  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  if (asset.status === "disposed") {
    return NextResponse.json(
      { error: "Cannot delete disposed asset" },
      { status: 400 }
    );
  }

  // Delete the corresponding CapitalExpenditure transaction
  await CapitalExpenditure.deleteOne({
    referenceType: "Asset",
    referenceId: asset._id,
  });

  await asset.deleteOne();

  // Log activity
  await ActivityLog.create({
    userId: admin.id,
    action: "asset_delete",
    entityType: "Asset",
    entityId: asset._id,
    meta: { name: asset.name, totalCost: asset.purchaseCost * asset.quantity },
  });

  return new NextResponse(null, { status: 204 });
}
