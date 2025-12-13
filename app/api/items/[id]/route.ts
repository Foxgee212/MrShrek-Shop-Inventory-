import { dbConnect } from "@/lib/dbConnect";
import Item from "@/models/Item";
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
   PUT (UPDATE ITEM — PARTIAL SAFE UPDATE)
====================================== */
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

    // ✅ Only update fields that were sent
    if (form.has("name")) updateData.name = form.get("name");
    if (form.has("type")) updateData.type = form.get("type");
    if (form.has("model")) updateData.model = form.get("model");
    if (form.has("stock")) updateData.stock = Number(form.get("stock"));
    if (form.has("sellingPrice"))
      updateData.sellingPrice = Number(form.get("sellingPrice"));

    // 🚫 category, brand, costPrice, description NOT overwritten
    // unless explicitly sent in the future

    // Image upload (optional)
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      updateData.photo = await uploadToCloudinary(buffer);
    }

    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedItem) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    await ActivityLog.create({
      userId: user.id,
      action: "update_item",
      meta: { itemId: id, updatedFields: Object.keys(updateData) },
    });

    return Response.json(updatedItem);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

/* =====================================
   DELETE ITEM
====================================== */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  try {
    const { id } = await context.params;
    const user = await verifyTokenFromReq(req, "admin");

    const item = await Item.findByIdAndDelete(id);

    if (!item) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    await ActivityLog.create({
      userId: user.id,
      action: "delete_item",
      meta: {
        itemId: id,
        name: item.name,
        category: item.category,
        brand: item.brand,
      },
    });

    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
