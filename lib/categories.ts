import { dbConnect } from "@/lib/dbConnect";
import Item from "@/models/Item";

export type Brand = {
  name: string;
  hasOutOfStock: boolean;
};

export type Category = {
  name: string;
  hasOutOfStock: boolean;
  imageUrl: string;
  brands: Brand[];
};

export async function getCategories(): Promise<Category[]> {
  await dbConnect();

  // 1. Get valid categories
  const categories = await Item.distinct("category", {
    category: { $type: "string", $ne: "" }
  });

  const results: Category[] = [];

  for (const category of categories.filter(Boolean)) {
    // 2. Category out-of-stock check
    const hasOutOfStock = await Item.exists({
      category,
      stock: { $lte: 0 }
    });

    // 3. Category image
    const itemWithPhoto = await Item.findOne({
      category,
      photo: { $exists: true, $ne: "" }
    }).select("photo");

    // 4. Brands under category
    const brands = await Item.distinct("brand", {
      category,
      brand: { $type: "string", $ne: "" }
    });

    const brandResults: Brand[] = [];

    for (const brand of brands.filter(Boolean)) {
      const brandHasOutOfStock = await Item.exists({
        category,
        brand,
        stock: { $lte: 0 }
      });

      brandResults.push({
        name: brand.trim(),
        hasOutOfStock: Boolean(brandHasOutOfStock)
      });
    }

    results.push({
      name: category.trim(),
      hasOutOfStock: Boolean(hasOutOfStock),
      imageUrl: itemWithPhoto?.photo ?? "",
      brands: brandResults
    });
  }

  return results;
}
// Normalize strings for comparison
export function normalize(str: string) {
  return str.replace(/\s+/g, " ").trim().toLowerCase();
}