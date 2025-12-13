"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type Brand = {
  name: string;
  hasOutOfStock: boolean;
  categories: string[];
};

type CategoriesResponse = {
  brands: Brand[];
};

export default function BrandPage() {
  const { category } = useParams<{ category: string }>();
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    async function loadBrands() {
      const res = await fetch("/api/items/categories-with-stock");
      const data: CategoriesResponse = await res.json();

      // Only brands that belong to this category
      const filtered = data.brands.filter((b) =>
        b.categories.includes(category)
      );

      setBrands(filtered);
    }

    loadBrands();
  }, [category]);

  return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
      {brands.map((brand) => (
        <Link
            key={`${category}-${brand.name}`}
            href={`/store/${category}/${brand.name}`}
            className="relative bg-white rounded-lg shadow p-6 text-lg font-bold text-center hover:bg-gray-100"
        >
          {/* 🔴 Stock warning */}
          {brand.hasOutOfStock && (
            <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-red-600 animate-pulse" />
          )}

          {brand.name}
        </Link>
      ))}
    </div>
  );
}
