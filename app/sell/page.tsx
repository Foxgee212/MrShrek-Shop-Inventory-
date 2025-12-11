"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Category = string;

export default function SellPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/items/categories").then(r => r.json()).then(setCategories);
  }, []);

  return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map(cat => (
        <Link
          key={cat}
          href={`/sell/${cat.toLowerCase()}`}
          className="bg-white rounded-xl shadow p-4 hover:scale-105 transition text-center"
        >
          <div className="text-lg font-bold">{cat}</div>
        </Link>
      ))}
    </div>
  );
}
