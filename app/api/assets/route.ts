import { dbConnect } from "@/lib/dbConnect";
import Asset from "@/models/Assets";
import Expense from "@/models/Expense";
import ActivityLog from "@/models/ActivityLog";
import { verifyTokenFromReq } from "@/lib/auth";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const admin = await verifyTokenFromReq(req, "admin");
    if (!admin) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const status = searchParams.get("status") || "active";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;

    const filter: any = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const assets = await Asset.find(filter).sort({ [sortBy]: order });

    const formattedAssets = assets.map((asset) => ({
      _id: asset._id,
      name: asset.name,
      category: asset.category,
      quantity: asset.quantity,
      purchaseCost: asset.PurchaseCost,
      totalValue: asset.PurchaseCost * asset.quantity,
      supplier: asset.supplier,
      location: asset.location,
      status: asset.status,
      createdAt: asset.createdAt,
    }));

    const totalAssetValue = formattedAssets.reduce(
      (sum, a) => sum + a.totalValue,
      0
    );

    return Response.json({
      totalAssets: formattedAssets.length,
      totalAssetValue,
      assets: formattedAssets,
    });
  } catch (err: any) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to fetch assets" }),
      { status: 500 }
    );
  }
}



export async function POST(req: Request) {
  await dbConnect();

  try {
    const admin = await verifyTokenFromReq(req, "admin");
    if (!admin) {
      return new Response("Unauthorized", { status: 401 });
    }

    const {
      name,
      category,
      PurchaseCost,
      quantity = 1,
      supplier,
      location,
      usefulLifeMonths,
      notes,
    } = await req.json();

    if (!name || !category || !PurchaseCost) {
      return new Response(
        JSON.stringify({ error: "Name, category and purchase cost are required" }),
        { status: 400 }
      );
    }

    const totalCost = PurchaseCost * quantity;

    // 1️⃣ Create Asset
    const asset = await Asset.create({
      name,
      category,
      PurchaseCost,
      quantity,
      supplier,
      location,
      usefulLifeMonths,
      createdBy: admin.id,
      notes,
    });

    // 2️⃣ Create Expense (reduces net cash)
    await Expense.create({
      type: "asset_purchase",
      amount: totalCost,
      description: `Asset purchase: ${name}`,
      status: "approved",
      referenceType: "Asset",
      referenceId: asset._id,
      userId: admin.id,
    });

    // 3️⃣ Log activity
    await ActivityLog.create({
      userId: admin.id,
      action: "asset_purchase",
      entityType: "Asset",
      entityId: asset._id,
      meta: {
        name,
        category,
        totalCost,
      },
    });

    return Response.json(
      {
        message: "Asset recorded successfully",
        asset,
        cashReducedBy: totalCost,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to create asset" }),
      { status: 500 }
    );
  }
}
