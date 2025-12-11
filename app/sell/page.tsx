"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Category = {
  name: string;
  hasOutOfStock: boolean;
  imageUrl: string;
};

export default function SellPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  async function fetchCategories() {
    const res = await fetch("/api/items/categories-with-stock");
    const data: Category[] = await res.json();
    setCategories(data);
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
