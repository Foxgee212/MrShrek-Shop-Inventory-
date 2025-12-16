import { dbConnect } from "@/lib/dbConnect";
import Item from "@/models/Item";
import InventoryTransaction from "@/models/InventoryTransaction";
import ActivityLog from "@/models/ActivityLog";
import { verifyTokenFromReq } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload helper
async function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "inventory" },
      (err, result) => {
        if (err) return reject(err);
        resolve(result!.secure_url);
      }
    );
    stream.end(buffer);
  });
}
export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");

    if (!category || !brand) {
      return Response.json(
        { error: "category and brand are required" },
        { status: 400 }
      );
    }

    const items = await Item.find({
      category: decodeURIComponent(category),
      brand: decodeURIComponent(brand),
    });

    return Response.json(items);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}


export async function POST(req: Request) {
  await dbConnect();

  try {
    const user = await verifyTokenFromReq(req, "admin"); // Only admin can add

    const form = await req.formData();
    const file = form.get("image") as File | null;

    // Collect required fields
    const name = form.get("name")?.toString();
    const category = form.get("category")?.toString();
    const brand = form.get("brand")?.toString();
    const type = form.get("type")?.toString();
    const model = form.get("model")?.toString();
    const stock = form.get("stock") ? Number(form.get("stock")) : 0;
    const costPrice = form.get("costPrice") ? Number(form.get("costPrice")) : 0;
    const sellingPrice = form.get("sellingPrice") ? Number(form.get("sellingPrice")) : 0;
    const description = form.get("description")?.toString() || "";

    if (!name || !category || !brand || !type || !model) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upload image if provided
    let photo = "";
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      photo = await uploadToCloudinary(buffer);
    }

    const newItem = await Item.create({
      name,
      category,
      brand,
      type,
      model,
      stock,
      costPrice,
      sellingPrice,
      description,
      photo,
    });

    // ------------------- Record Inventory Transaction -------------------
    if (stock > 0 && costPrice > 0) {
      await InventoryTransaction.create({
        itemId: newItem._id,
        type: "purchase",
        quantity: stock,
        unitCost: costPrice,
        userId: user.id,
      });
    }

    // Log activity
    await ActivityLog.create({
      userId: user.id,
      action: "add_item",
      meta: { itemId: newItem._id, name: newItem.name },
    });

    return Response.json(newItem, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
