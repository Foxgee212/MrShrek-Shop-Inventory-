"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Category = {
  name: string;
  hasOutOfStock: boolean;
  imageUrl: string;
};
type Brand = {
  name: string;
  hasOutOfStock: boolean;
  categories: string[];
};
type CategoriesResponse = {
  categories: Category[];
  brands: Brand[];
};

export default function SellPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  async function fetchCategories() {
    const res = await fetch("/api/items/categories-with-stock");
    const data: CategoriesResponse = await res.json();
    setCategories(data.categories);
    setBrands(data.brands);
  }

  useEffect(() => {
    fetchCategories();

    // Poll every 10 seconds
    const interval = setInterval(fetchCategories, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((cat) => (
        <Link
          key={cat.name}
          href={`/sell/${cat.name.toLowerCase()}`}
          className="relative bg-white rounded-xl shadow hover:scale-105 transition overflow-hidden"
        >
          {/* Category Image */}
          <div className="h-32 w-full overflow-hidden rounded-t-xl">
            <img
              src={cat.imageUrl}
              alt={cat.name}
              className="w-full h-full object-scale-down"
            />
          </div>

          {/* Red alert for out-of-stock */}
          {cat.hasOutOfStock && (
            <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-red-600 animate-pulse" />
          )}

          {/* Category Name */}
          <div className="text-lg font-bold p-4">{cat.name}</div>
        </Link>
      ))}
    </div>
  );
}
