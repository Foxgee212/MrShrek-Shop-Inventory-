"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

interface Asset {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  purchaseCost: number;
  totalValue: number;
  supplier?: string;
  location?: string;
  status: string;
  createdAt: string;
}

export default function AssetManagementPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: 1,
    purchaseCost: 0,
    supplier: "",
    location: "",
    usefulLifeMonths: "",
    notes: "",
  });

  async function fetchAssets() {
    setLoading(true);
    const res = await fetch("/api/assets", { cache: "no-store" });
    const data = await res.json();
    setAssets(data.assets || []);
    setTotalValue(data.totalAssetValue || 0);
    setLoading(false);
  }

  useEffect(() => {
    fetchAssets();
  }, []);

  async function submitAsset() {
    const res = await fetch("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        quantity: Number(form.quantity),
        purchaseCost: Number(form.purchaseCost),
        usefulLifeMonths: form.usefulLifeMonths ? Number(form.usefulLifeMonths) : undefined,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to add asset");
      return;
    }

    setShowModal(false);
    setForm({
      name: "",
      category: "",
      quantity: 1,
      purchaseCost: 0,
      supplier: "",
      location: "",
      usefulLifeMonths: "",
      notes: "",
    });
    fetchAssets();
  }

  const currency = (n: number) => `₦${n.toLocaleString()}`;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Asset Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={16} /> Add Asset
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-500">Total Assets</p>
          <p className="text-2xl font-bold">{assets.length}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-500">Total Asset Value</p>
          <p className="text-2xl font-bold">{currency(totalValue)}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-500">Active Assets</p>
          <p className="text-2xl font-bold">{assets.filter(a => a.status === "active").length}</p>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Unit Cost</th>
              <th className="p-3">Total Value</th>
              <th className="p-3">Location</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr>
            )}
            {!loading && assets.map(asset => (
              <tr key={asset._id} className="border-t">
                <td className="p-3 font-medium">{asset.name}</td>
                <td className="p-3">{asset.category}</td>
                <td className="p-3 text-center">{asset.quantity}</td>
                <td className="p-3 text-center">{currency(asset.purchaseCost)}</td>
                <td className="p-3 text-center">{currency(asset.totalValue)}</td>
                <td className="p-3">{asset.location || "—"}</td>
                <td className="p-3 capitalize">{asset.status}</td>
              </tr>
            ))}
            {!loading && assets.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-center text-gray-500">No assets recorded</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Asset Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Add Asset</h2>
              <button onClick={() => setShowModal(false)} aria-label="Close modal"><X /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Asset Name" className="border p-2 rounded" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input placeholder="Category" className="border p-2 rounded" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              <input type="number" placeholder="Quantity" className="border p-2 rounded" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} />
              <input type="number" placeholder="Purchase Cost" className="border p-2 rounded" value={form.purchaseCost} onChange={e => setForm({ ...form, purchaseCost: Number(e.target.value) })} />
              <input placeholder="Supplier" className="border p-2 rounded" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
              <input placeholder="Location" className="border p-2 rounded" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              <input type="number" placeholder="Useful Life (months)" className="border p-2 rounded md:col-span-2" value={form.usefulLifeMonths} onChange={e => setForm({ ...form, usefulLifeMonths: e.target.value })} />
              <textarea placeholder="Notes" className="border p-2 rounded md:col-span-2" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={submitAsset} className="px-4 py-2 bg-blue-600 text-white rounded">Save Asset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
