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

/* =====================================
   PUT (UPDATE ITEM — MANUAL SAFE UPDATE)
===================================== */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  try {
    const { id } = await context.params;
    const user = await verifyTokenFromReq(req, "admin");

    const form = await req.formData();
    const file = form.get("image") as File | null;

    const updateData: Record<string, any> = {};

    // ------------------- Update fields only if sent -------------------
    if (form.has("name")) updateData.name = form.get("name")?.toString();
    if (form.has("category")) updateData.category = form.get("category")?.toString();
    if (form.has("brand")) updateData.brand = form.get("brand")?.toString();
    if (form.has("type")) updateData.type = form.get("type")?.toString();
    if (form.has("model")) updateData.model = form.get("model")?.toString();
    if (form.has("sellingPrice"))
      updateData.sellingPrice = Number(form.get("sellingPrice"));
    if (form.has("costPrice"))
      updateData.costPrice = Number(form.get("costPrice"));
    if (form.has("description"))
      updateData.description = form.get("description")?.toString();

    // ------------------- Handle stock adjustment -------------------
    const currentItem = await Item.findById(id);
    if (!currentItem) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    if (form.has("stock")) {
      const newStock = Number(form.get("stock"));
      const diff = newStock - currentItem.stock;

      if (diff !== 0) {
        updateData.stock = newStock;

        // Record inventory transaction
        await InventoryTransaction.create({
          itemId: id,
          type: diff > 0 ? "purchase" : "adjustment", // increase = purchase, decrease = adjustment
          quantity: Math.abs(diff),
          costPrice: Number(form.get("costPrice")) || currentItem.costPrice,
          userId: user.id,
          notes: `Manual stock ${diff > 0 ? "increase" : "decrease"} by admin`,
        });
      }
    }

    // ------------------- Handle image upload -------------------
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      updateData.photo = await uploadToCloudinary(buffer);
    }

    // ------------------- Update Item -------------------
    const updatedItem = await Item.findByIdAndUpdate(id, { $set: updateData }, { new: true });

    // ------------------- Log Activity -------------------
    await ActivityLog.create({
      userId: user.id,
      action: "update_item",
      meta: {
        itemId: id,
        updatedFields: Object.keys(updateData),
        stockChange: updateData.stock ? updateData.stock - currentItem.stock : 0,
      },
    });

    return Response.json(updatedItem);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}