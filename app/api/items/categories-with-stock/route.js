import { dbConnect } from "@/lib/dbConnect";
import Item from "@/models/Item";

export async function GET() {
  await dbConnect();

  // Get all distinct categories
  const categories = await Item.distinct("category");

  const result = await Promise.all(
    categories.map(async (cat) => {
      // Check if any item in this category is out of stock
      const hasOutOfStock = await Item.exists({ category: cat, stock: { $lte: 0 } });

      // Get one representative item image from this category
      const itemWithPhoto = await Item.findOne({ category: cat, photo: { $exists: true, $ne: "" } });
      const imageUrl = itemWithPhoto?.photo ; // fallback image

      return { name: cat, hasOutOfStock: !!hasOutOfStock, imageUrl };
    })
  );

  return new Response(JSON.stringify(result), { status: 200 });
}
