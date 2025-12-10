// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = {
  _id: string;
  category?: string;
  brand?: string;
  model?: string;
  stock?: number;
  sku?: string;
  sellingPrice?: number;
};

export default function HomePage() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [loading, setLoading] = useState(true);
  const LOW_STOCK_THRESHOLD = 5;

  useEffect(() => {
    let mounted = true;
    async function fetchItems() {
      try {
        const res = await fetch("/api/items");
        if (!res.ok) throw new Error("Failed to load items");
        const data = await res.json();
        if (mounted) setItems(data);
      } catch (err) {
        console.error(err);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchItems();
    return () => {
      mounted = false;
    };
  }, []);

  const totalSkus = items?.length ?? 0;
  const lowStockCount = items
    ? items.filter((it) => (typeof it.stock === "number" ? it.stock <= LOW_STOCK_THRESHOLD : false)).length
    : 0;

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* HEADER */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">NaijaShop POS</h1>
            <p className="text-base text-gray-700 mt-1">
              Inventory & sales system — secure, offline-capable, and built for phone accessory shops.
            </p>
          </div>

          <nav className="space-x-3">
            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm shadow">
              Login
            </Link>
            <Link href="/sell" className="px-4 py-2 bg-green-600 text-white rounded-md text-sm shadow">
              Sell
            </Link>
            <Link href="/admin" className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm shadow">
              Admin
            </Link>
          </nav>
        </header>

        {/* STATS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-gray-300 bg-white">
            <h3 className="text-base text-gray-700">Total SKUs</h3>
            <p className="text-3xl font-bold mt-2 text-gray-900">{loading ? "…" : totalSkus}</p>
            <p className="text-sm text-gray-600 mt-1">All inventory items</p>
          </div>

          <div className="p-4 rounded-lg border border-gray-300 bg-white">
            <h3 className="text-base text-gray-700">Low stock</h3>
            <p className="text-3xl font-bold mt-2 text-amber-600">{loading ? "…" : lowStockCount}</p>
            <p className="text-sm text-gray-600 mt-1">Items with stock ≤ {LOW_STOCK_THRESHOLD}</p>
          </div>

          <div className="p-4 rounded-lg border border-gray-300 bg-white">
            <h3 className="text-base text-gray-700">Quick actions</h3>
            <div className="flex flex-col gap-2 mt-3">
              <Link href="/items" className="text-gray-800 text-sm py-2 px-3 border border-gray-300 rounded hover:bg-gray-100">
                Manage Items
              </Link>
              <Link href="/items/add" className="text-gray-800 text-sm py-2 px-3 border border-gray-300 rounded hover:bg-gray-100">
                Add New Item (Admin)
              </Link>
              <Link href="/reports" className="text-gray-800 text-sm py-2 px-3 border border-gray-300 rounded hover:bg-gray-100">
                Reports
              </Link>
            </div>
          </div>
        </section>

        {/* TABLE */}
        <section className="mt-4">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Recent items (preview)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-base">
              <thead className="text-gray-700 border-b border-gray-300">
                <tr>
                  <th className="py-3 pr-4">SKU</th>
                  <th className="py-3 pr-4">Brand / Model</th>
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4">Stock</th>
                  <th className="py-3 pr-4">Price</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-600">
                      Loading items…
                    </td>
                  </tr>
                )}

                {!loading && items && items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-600">
                      No items found. Add items from the Admin page.
                    </td>
                  </tr>
                )}

                {!loading &&
                  items &&
                  items.slice(0, 8).map((it) => (
                    <tr key={it._id} className="border-t border-gray-300">
                      <td className="py-3 pr-4 text-gray-800">{it.sku ?? "—"}</td>
                      <td className="py-3 pr-4 text-gray-800">
                        {it.brand ?? "Unknown"} {it.model ? ` / ${it.model}` : ""}
                      </td>
                      <td className="py-3 pr-4 text-gray-800">{it.category ?? "—"}</td>
                      <td
                        className={`py-3 pr-4 ${
                          typeof it.stock === "number" && it.stock <= LOW_STOCK_THRESHOLD
                            ? "text-amber-600 font-semibold"
                            : "text-gray-800"
                        }`}
                      >
                        {typeof it.stock === "number" ? it.stock : "—"}
                      </td>
                      <td className="py-3 pr-4 text-gray-800">₦{it.sellingPrice ?? "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-6 text-sm text-gray-600">
          <p>
            Tip: Set a low-stock threshold that fits each product. You can customize the threshold or fetch
            per-item settings in the Admin panel.
          </p>
        </footer>
      </div>
    </main>
  );
}
