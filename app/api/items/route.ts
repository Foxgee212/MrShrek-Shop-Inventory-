import { dbConnect } from "../../../lib/dbConnect";
import Item from "../../../models/Item";
import ActivityLog from "../../../models/ActivityLog";
import { verifyTokenFromReq } from "../../../lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload helper
async function uploadToCloudinary(buffer: Buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "inventory" },
      (err, result) => {
        if (err) return reject(err);
        resolve(result?.secure_url);
      }
    );
    stream.end(buffer);
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");

  await dbConnect();

  const filter: any = {};
  if (category) filter.category = category;
  if (brand) filter.brand = brand;

  const items = await Item.find(filter).sort({
    category: 1,
    brand: 1,
    model: 1,
  });

  return Response.json(items);
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const user = verifyTokenFromReq(req, "admin");

    const form = await req.formData();
    const file = form.get("image") as File | null;

    const itemData: any = {
      name: form.get("name") || "",
      category: form.get("category") || "",
      brand: form.get("brand") || "",
      type: form.get("type") || "",
      model: form.get("model") || "",
      stock: Number(form.get("stock") || 0),
      costPrice: Number(form.get("costPrice") || 0),
      sellingPrice: Number(form.get("sellingPrice") || 0),
      description: form.get("description") || "",
    };

    // Handle image upload
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      itemData.photo = await uploadToCloudinary(buffer);
    }

    const item = await Item.create(itemData);

    await ActivityLog.create({
      userId: user.id,
      action: "create_item",
      meta: { itemId: item._id },
    });

    return Response.json(item, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
