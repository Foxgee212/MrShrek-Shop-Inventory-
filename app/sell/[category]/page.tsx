"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function BrandPage() {
  const { category } = useParams();
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/items/brands?category=${category}`)
      .then(r => r.json())
      .then(setBrands);
  }, [category]);

  return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
      {brands.map(brand => (
        <Link
          key={brand}
          href={`/sell/${category}/${brand}`}
          className="bg-white rounded-lg shadow p-6 text-lg font-bold text-center hover:bg-gray-100"
        >
          {brand}
        </Link>
      ))}
    </div>
  );
}
