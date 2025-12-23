"use client";

import { useEffect, useState } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";

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

const EMPTY_FORM = {
  name: "",
  category: "",
  quantity: 1,
  purchaseCost: 0,
  supplier: "",
  location: "",
  usefulLifeMonths: "",
  notes: "",
};

export default function AssetManagementPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  /* ================= FETCH ================= */
  async function fetchAssets() {
    setLoading(true);
    const res = await fetch("/api/assets", { cache: "no-store" });
    const data = await res.json();
    console.log(data)
    setAssets(data.assets || []);
    setTotalValue(data.totalAssetValue || 0);
    setLoading(false);
  }

  useEffect(() => {
    fetchAssets();
  }, []);

  /* ================= ADD / EDIT ================= */
  async function submitAsset() {
    if (!form.name || !form.category || !form.location || !form.usefulLifeMonths) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    const method = editingAsset ? "PUT" : "POST";
    const url = editingAsset ? `/api/assets/${editingAsset._id}` : "/api/assets";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        category: form.category,
        purchaseCost: Number(form.purchaseCost),
        quantity: Number(form.quantity),
        supplier: form.supplier || undefined,
        location: form.location,
        usefulLifeMonths: Number(form.usefulLifeMonths),
        salvageValue: 0,
        notes: form.notes,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to save asset");
      setLoading(false);
      return;
    }

    setShowModal(false);
    setEditingAsset(null);
    setForm(EMPTY_FORM);
    fetchAssets();
  }

  /* ================= DELETE ================= */
  async function deleteAsset(asset: Asset) {
    if (!confirm(`Delete "${asset.name}"? This cannot be undone.`)) return;

    setLoading(true);
    const res = await fetch(`/api/assets/${asset._id}`, { method: "DELETE" });

    if (!res.ok) {
      alert("Failed to delete asset");
      setLoading(false);
      return;
    }

    fetchAssets();
  }

  /* ================= HELPERS ================= */
  const currency = (n?: number) =>
    `₦${(n ?? 0).toLocaleString()}`;

  const openEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setForm({
      name: asset.name,
      category: asset.category,
      quantity: asset.quantity,
      purchaseCost: asset.purchaseCost,
      supplier: asset.supplier || "",
      location: asset.location || "",
      usefulLifeMonths: "",
      notes: "",
    });
    setShowModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Asset Management</h1>
        <button
          onClick={() => {
            setEditingAsset(null);
            setForm(EMPTY_FORM);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={16} /> Add Asset
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Summary title="Total Assets" value={assets.length} />
        <Summary title="Total Asset Value" value={currency(totalValue)} />
        <Summary title="Active Assets" value={assets.filter(a => a.status === "active").length} />
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Unit Cost</th>
              <th className="p-3">Total</th>
              <th className="p-3">Location</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
              <th className="p-3">Disposal</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr>
            )}
            {!loading && assets.map(asset => (
              <tr key={asset._id} className="border-t">
                <td className="p-3 font-medium">{asset.name}</td>
                <td className="p-3 text-center">{asset.quantity}</td>
                <td className="p-3 text-center">{currency(asset.purchaseCost)}</td>
                <td className="p-3 text-center">{currency(asset.totalValue)}</td>
                <td className="p-3">{asset.location || "—"}</td>
                <td className="p-3 capitalize">{asset.status}</td>
                <td className="p-3 text-right space-x-3">
                  <button aria-label="edit" onClick={() => openEdit(asset)} className="text-blue-600">
                    <Pencil size={16} />
                  </button>
                  <button aria-label="delete" onClick={() => deleteAsset(asset)} className="text-red-600">
                    <Trash2 size={16} />
                  </button>
                </td>
                <td className="p-3 text-center">
                  <button aria-label="sale">Sell</button>
                </td>
              </tr>
            ))}
            {!loading && assets.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-center text-gray-500">No assets recorded</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingAsset ? "Edit Asset" : "Add Asset"}
              </h2>
              <button aria-label="cancel" onClick={() => setShowModal(false)}><X /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Asset Name" className="border p-2 rounded" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input placeholder="Category" className="border p-2 rounded" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              <input type="number" placeholder="Quantity" className="border p-2 rounded" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} />
              <input type="number" placeholder="Purchase Cost" className="border p-2 rounded" value={form.purchaseCost} onChange={e => setForm({ ...form, purchaseCost: Number(e.target.value) })} />
              <input placeholder="Supplier" className="border p-2 rounded" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
              <input placeholder="Location" className="border p-2 rounded" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              <input type="number" placeholder="Useful Life (months)" className="border p-2 rounded md:col-span-2" value={form.usefulLifeMonths} onChange={e => setForm({ ...form, usefulLifeMonths: e.target.value })} />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="border px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={submitAsset} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
                {loading ? "Saving..." : editingAsset ? "Update Asset" : "Save Asset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */
function Summary({ title, value }: { title: string; value: any }) {
  return (
    <div className="p-4 bg-white rounded shadow">
      <p className="text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
