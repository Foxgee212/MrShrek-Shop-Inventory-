"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Brand = {
  name: string;
  hasOutOfStock: boolean;
};

type Category = {
  name: string;
  hasOutOfStock: boolean;
  imageUrl: string;
  brands: Brand[];
};

type CategoriesResponse = {
  categories: Category[];
};

export default function SellPage() {
  const [categories, setCategories] = useState<Category[]>([]);

async function fetchCategories() {
  try {
    const res = await fetch("/api/items/categories-with-stock");

    if (!res.ok) {
      console.error("Failed to fetch categories");
      return;
    }

    const data: CategoriesResponse = await res.json();

    setCategories(Array.isArray(data.categories) ? data.categories : []);
  } catch (err) {
    console.error("Fetch error:", err);
    setCategories([]);
  }
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
            {cat.imageUrl && (
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-full h-full object-scale-down"
              />
            )}
          </div>

          {/* Category out-of-stock indicator */}
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
