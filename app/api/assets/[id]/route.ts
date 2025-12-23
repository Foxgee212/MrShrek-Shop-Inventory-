import { dbConnect } from "@/lib/dbConnect";
import Asset from "@/models/Assets";
import Expense from "@/models/Expense";
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

  await verifyTokenFromReq(req, "admin");

  const { id } = await params; // ✅ REQUIRED FIX
  const updates = await req.json();

  const asset = await Asset.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!asset) {
    return NextResponse.json(
      { error: "Asset not found" },
      { status: 404 }
    );
  }

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

  await verifyTokenFromReq(req, "admin");

  const { id } = await params; // ✅ REQUIRED FIX

  const asset = await Asset.findById(id);

  if (!asset) {
    return NextResponse.json(
      { error: "Asset not found" },
      { status: 404 }
    );
  }

  if (asset.status === "disposed") {
    return NextResponse.json(
      { error: "Cannot delete disposed asset" },
      { status: 400 }
    );
  }

  await asset.deleteOne();

  return new NextResponse(null, { status: 204 });
}
