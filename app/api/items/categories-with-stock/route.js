import { dbConnect } from "@/lib/dbConnect";
import Item from "@/models/Item";

export async function GET() {
  await dbConnect();

  // Get all distinct categories
  const categories = await Item.distinct("category");
  const brands = await Item.distinct("brand");

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

  const brandResult = await Promise.all(
    brands.map(async (brand) => {
      // Check if any item in this brand is out of stock
      const brandhasOutOfStock = await Item.exists({ brand: brand, stock: { $lte: 0 } });

      // Also get categories this brand belongs to
      const categoriesForBrand = await Item.distinct("category", { brand: brand });

        return { name: brand, hasOutOfStock: !!brandhasOutOfStock, categories: categoriesForBrand };  
      })
  );

  return new Response(JSON.stringify({ categories: result, brands: brandResult }), { status: 200 });
}
