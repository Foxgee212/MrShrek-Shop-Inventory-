"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ItemsPage() {
  const { category, brand } = useParams();
  const [items, setItems] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch(`/api/items?category=${category}&brand=${brand}`)
      .then(r => r.json())
      .then(setItems);
  }, [category, brand]);

  const filtered = items.filter(i =>
    `${i.name} ${i.model} ${i.type}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  function sell(item: any) {
    if (!confirm(`Sell ${item.name}?`)) return;

    fetch("/api/sales", {
      method: "POST",
      body: JSON.stringify({ itemId: item._id, qty: 1 }),
      headers: { "Content-Type": "application/json" }
    });
  }

  return (
    <div className="p-6">
      <input
        placeholder="Search name, model or type..."
        className="border p-2 mb-4 w-full rounded"
        onChange={e => setQuery(e.target.value)}
      />

      {filtered.map(item => (
        <div
          key={item._id}
          className="flex justify-between items-center border p-3 mb-2 rounded"
        >
          <div>
            <strong>{item.name}</strong> — {item.model}<br />
            Stock: {item.stock} | ₦{item.sellingPrice}
          </div>

          <button
            onClick={() => sell(item)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            SELL
          </button>
        </div>
      ))}
    </div>
  );
}
