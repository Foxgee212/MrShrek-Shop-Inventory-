"use client";

import { useEffect, useState } from "react";

// ----------------------
// Types
// ----------------------
type CategoryValuation = {
  _id: string;
  totalStock: number;
  totalValue: number;
  itemCount: number;
};

export default function InventoryValuationReport() {
  const [categories, setCategories] = useState<CategoryValuation[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports/inventory-valuation")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categoryValuation || []);
        setTotalValue(data.totalInventoryValue || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="p-6 text-gray-500">Loading inventory valuation…</p>;
  }

  return (
    <main className="p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-1">Inventory Valuation Report</h1>
        <p className="text-sm text-gray-500 mb-6">
          Current stock value based on cost price
        </p>

        {/* TOTAL VALUE */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-500">Total Inventory Value</p>
          <p className="text-3xl font-bold">₦{totalValue.toLocaleString()}</p>
        </div>

        {/* CATEGORY TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr className="text-left">
                <th className="p-3 border">Category</th>
                <th className="p-3 border">Items</th>
                <th className="p-3 border">Total Stock</th>
                <th className="p-3 border">Valuation</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} className="border-b">
                  <td className="p-3 font-medium">{cat._id}</td>
                  <td className="p-3">{cat.itemCount}</td>
                  <td className="p-3">{cat.totalStock}</td>
                  <td className="p-3 font-semibold">
                    ₦{cat.totalValue.toLocaleString()}
                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    No inventory data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
