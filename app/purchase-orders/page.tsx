// app/purchase-orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PO = {
  _id: string;
  supplierName: string;
  status: string;
  totalCost: number;
  createdAt: string;
};

export default function POList() {
  const [pos, setPos] = useState<PO[]>([]);

  useEffect(() => {
    fetch("/api/purchase-orders")
      .then((r) => r.json())
      .then(setPos)
      .catch(console.error);
  }, []);

  async function deletePO(id: string) {
    if (!confirm("Delete PO?")) return;
    const res = await fetch(`/api/purchase-orders/${id}`, { method: "DELETE" });
    if (res.ok) setPos((p) => p.filter((x) => x._id !== id));
  }

  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Purchase Orders</h1>
          <Link href="/purchase-orders/add" className="px-3 py-2 bg-blue-600 text-white rounded">
            + New PO
          </Link>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th>Supplier</th>
              <th>Status</th>
              <th>Total</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pos.map((po) => (
              <tr key={po._id} className="border-b">
                <td className="py-2">{po.supplierName}</td>
                <td>{po.status}</td>
                <td>₦{po.totalCost}</td>
                <td>{new Date(po.createdAt).toLocaleString()}</td>
                <td className="text-right">
                  <Link href={`/purchase-orders/${po._id}`} className="mr-3 text-blue-600">View</Link>
                  <button onClick={() => deletePO(po._id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
            {pos.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-gray-500 text-center">No POs yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
