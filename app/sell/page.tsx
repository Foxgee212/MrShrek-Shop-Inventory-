export const dynamic = "force-dynamic";

import Link from "next/link";
import { getCategories, Category } from "@/lib/categories";

export default async function SellPage() {
  const categories: Category[] = await getCategories();

  return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((cat) => (
        <Link
          key={cat.name}
          href={`/sell/${encodeURIComponent(cat.name)}`}
          className="relative bg-white rounded-xl shadow hover:scale-105 transition overflow-hidden"
        >
          <div className="h-32 w-full overflow-hidden rounded-t-xl">
            {cat.imageUrl && (
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-full h-full object-scale-down"
              />
            )}
          </div>

          {cat.hasOutOfStock && (
            <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-red-600 animate-pulse" />
          )}

          <div className="text-lg font-bold p-4">{cat.name}</div>
        </Link>
      ))}
    </div>
  );
}
