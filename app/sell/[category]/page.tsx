import Link from "next/link";
import { getCategories, normalize } from "@/lib/categories";
import { notFound } from "next/navigation";

interface BrandPageProps {
  params: Promise<{ category: string }>;
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { category } = await params;

  const categoryParam = category ? decodeURIComponent(category) : null;

  if (!categoryParam) {
    notFound();
  }

  const categories = await getCategories();

  const selectedCategory = categories.find(
    (c) => normalize(c.name) === normalize(categoryParam)
  );

  if (!selectedCategory) notFound();

  const brands = selectedCategory.brands ?? [];

  return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
      {brands.map((brand) => (
        <Link
          key={brand.name}
          href={`/sell/${encodeURIComponent(categoryParam)}/${encodeURIComponent(brand.name)}`}
          className="relative bg-white rounded-lg shadow p-6 text-center hover:bg-gray-100 transition"
        >
          {brand.hasOutOfStock && (
            <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-red-600 animate-pulse" />
          )}
          <div className="text-lg font-bold">{brand.name}</div>
        </Link>
      ))}
    </div>
  );
}
