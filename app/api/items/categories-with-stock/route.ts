import { dbConnect } from "@/lib/dbConnect";
import Item from "@/models/Item";

export async function GET() {
  await dbConnect();

  const categories = await Item.distinct("category", {
    category: { $type: "string", $ne: "" }
  });

  const categoryResults = await Promise.all(
    categories
      .filter((c): c is string => typeof c === "string" && c.trim() !== "")
      .map(async (category) => {
        const hasOutOfStock = await Item.exists({
          category,
          stock: { $lte: 0 }
        });

        const itemWithPhoto = await Item.findOne({
          category,
          photo: { $exists: true, $ne: "" }
        });

        const brands = await Item.distinct("brand", {
          category,
          brand: { $type: "string", $ne: "" }
        });

        const brandResults = await Promise.all(
          brands
            .filter(
              (b): b is string =>
                typeof b === "string" && b.trim().length > 0
            )
            .map(async (brand) => {
              const brandHasOutOfStock = await Item.exists({
                category,
                brand,
                stock: { $lte: 0 }
              });

              return {
                name: brand.trim(),
                hasOutOfStock: !!brandHasOutOfStock
              };
            })
        );

        return {
          name: category.trim(),
          hasOutOfStock: !!hasOutOfStock,
          imageUrl: itemWithPhoto?.photo ?? "",
          brands: brandResults
        };
      })
  );

  return new Response(
    JSON.stringify({ categories: categoryResults }),
    { status: 200 }
  );
}
