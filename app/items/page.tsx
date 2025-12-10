"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = {
  _id: string;
  sku: string;
  brand: string;
  model: string;
  category: string;
  stock: number;
  sellingPrice: number;
};

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchItems() {
      const res = await fetch("/api/items");
      const data = await res.json();
      setItems(data);
    }
    fetchItems();
  }, []);

  async function deleteItem(id: string) {
    if (!confirm("Delete this item?")) return;

    const res = await fetch(`/api/items/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setItems((prev) => prev.filter((i) => i._id !== id));
    }
  }

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    return (
      i.brand.toLowerCase().includes(q) ||
      i.model.toLowerCase().includes(q) ||
      i.sku.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">Inventory Items</h1>
          <Link
            href="/items/add"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            + Add Item
          </Link>
        </div>

        <input
          type="text"
          placeholder="Search item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border rounded mb-4"
        />

        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="py-2 text-left">Name</th>
              <th className="text-left">SKU</th>
              <th className="text-left">Category</th>
              <th className="text-left">Stock</th>
              <th className="text-left">Price</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => (
              <tr key={item._id} className="border-b">
                <td className="py-2">
                  {item.brand} {item.model}
                </td>
                <td>{item.sku}</td>
                <td>{item.category}</td>
                <td>{item.stock}</td>
                <td>₦{item.sellingPrice}</td>
                <td className="text-right">
                  <Link
                    href={`/items/${item._id}/edit`}
                    className="px-2 text-blue-600"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => deleteItem(item._id)}
                    className="px-2 text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-gray-500">
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
