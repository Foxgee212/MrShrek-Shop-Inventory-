"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Package, Layers, Tag, ShoppingCart, Search } from "lucide-react";

export default function ItemsPage() {
  const { category, brand } = useParams();
  const [items, setItems] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch(`/api/items?category=${category}&brand=${brand}`)
      .then((r) => r.json())
      .then(setItems);
  }, [category, brand]);

  const filtered = items.filter((i) =>
    `${i.name} ${i.model} ${i.type}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  async function sell(item: any) {
    if (!confirm(`Sell ${item.name}?`)) return;

    const res = await fetch("/api/sales", {
      method: "POST",
      body: JSON.stringify({
        itemId: item._id,
        quantity: 1,
        sellingPrice: item.sellingPrice,
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to sell item");
      return;
    }

    // update UI instantly
    setItems((prev) =>
      prev.map((i) =>
        i._id === item._id ? { ...i, stock: i.stock - 1 } : i
      )
    );

    // alert if stock hits zero
    if (item.stock - 1 === 0) {
      alert(`⚠️ ${item.name} is now OUT OF STOCK — please refill!`);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Search Field */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 opacity-60" size={18} />
        <input
          placeholder="Search name, model or type..."
          className="border p-2 pl-10 w-full rounded focus:ring-2 focus:ring-blue-400"
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.map((item) => (
        <div
          key={item._id}
          className={`flex items-center justify-between p-4 mb-3 rounded-xl border shadow-sm transition-all 
            ${
              item.stock === 0
                ? "bg-red-100 border-red-500"
                : "bg-white hover:shadow-md"
            }
          `}
        >
          {/* Left Section */}
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Package size={20} className="text-blue-600" />
              {item.name} — {item.model}
            </div>

            {/* Stock + Price */}
            <div className="mt-1 text-sm text-gray-600 flex flex-col gap-1">
              <div className="flex items-center gap-1 font-bold">
                <Layers size={16} /> Stock: {item.stock}
              </div>
              <div className="flex items-center gap-1">
                <Layers size={16} /> Type: {item.type}
              </div>
              <div className="flex items-center gap-1 font-bold text-green-700 text-2xl">
                <Tag size={16} /> ₦{item.sellingPrice.toLocaleString()}
              </div>

              {/* Refill Needed Badge */}
              {item.stock === 0 && (
                <span className="inline-block mt-1 px-2 py-1 bg-red-600 text-white text-xs rounded">
                  Refill Needed
                </span>
              )}
            </div>
          </div>

          {/* Sell Button */}
          <button
            onClick={() => sell(item)}
            disabled={item.stock === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow transition-all text-white
              ${
                item.stock === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }
            `}
          >
            <ShoppingCart size={18} />
            Sell
          </button>
        </div>
      ))}
    </div>
  );
}
