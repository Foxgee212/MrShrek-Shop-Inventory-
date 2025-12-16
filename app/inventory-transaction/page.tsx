"use client";

import { useEffect, useState } from "react";

type InventoryItem = {
  _id: string;
  name: string;
  category: string;
  brand: string;
  model?: string;
  stock: number;
  costPrice: number;
  sellingPrice: number;
};

type PurchaseFormItem = {
  name: string;
  category: string;
  brand: string;
  model?: string;
  purchaseQty: number;
  costPrice: number;
  sellingPrice: number;
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [formList, setFormList] = useState<PurchaseFormItem[]>([
    { name: "", category: "", brand: "", model: "", purchaseQty: 0, costPrice: 0, sellingPrice: 0 },
  ]);
  const [netCash, setNetCash] = useState<number>(0);

  // Load current inventory
  async function loadItems() {
    const res = await fetch("/api/items", { credentials: "include" });
    if (!res.ok) return setItems([]);
    const data = await res.json();
    setItems(Array.isArray(data) ? data : data.items || []);
  }

  // Load net cash from admin stats
  async function fetchNetCash() {
    const res = await fetch("/api/admin/stats", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setNetCash(data.balance || 0);
  }

  useEffect(() => {
    loadItems();
    fetchNetCash();
  }, []);

  // Handle form changes
  function handleFormChange(index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const newFormList = [...formList];
    newFormList[index] = { ...newFormList[index], [e.target.name]: e.target.value };
    setFormList(newFormList);
  }

  function addFormRow() {
    setFormList([...formList, { name: "", category: "", brand: "", model: "", purchaseQty: 0, costPrice: 0, sellingPrice: 0 }]);
  }

  function removeFormRow(index: number) {
    setFormList(formList.filter((_, i) => i !== index));
  }

  // Submit inventory purchase
  async function submitPurchase() {
    const res = await fetch("/api/inventory/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formList),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to process purchase");
      return;
    }

    await res.json();
    alert("Stock updated successfully!");
    setFormList([{ name: "", category: "", brand: "", model: "", purchaseQty: 0, costPrice: 0, sellingPrice: 0 }]);
    loadItems();      // refresh inventory
    fetchNetCash();   // refresh net cash
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      {/* Net Cash Display */}
      <div className="mb-6 p-4 bg-yellow-100 rounded-xl">
        <p className="font-semibold text-lg">
          Net Cash: <span className="text-green-600">₦{netCash.toLocaleString()}</span>
        </p>
      </div>

      {/* Add / Update Inventory */}
      <div className="bg-white rounded-2xl p-6 shadow">
        <h2 className="font-semibold text-xl mb-4">Add / Update Stock</h2>
        {formList.map((form, index) => (
          <div key={index} className="grid gap-3 mb-4 border-b pb-4">
            <input name="name" placeholder="Item Name" value={form.name} onChange={(e) => handleFormChange(index, e)} className="p-3 border rounded-xl" />
            <input name="category" placeholder="Category" value={form.category} onChange={(e) => handleFormChange(index, e)} className="p-3 border rounded-xl" />
            <input name="brand" placeholder="Brand" value={form.brand} onChange={(e) => handleFormChange(index, e)} className="p-3 border rounded-xl" />
            <input name="model" placeholder="Model (optional)" value={form.model} onChange={(e) => handleFormChange(index, e)} className="p-3 border rounded-xl" />
            <input name="purchaseQty" type="number" placeholder="Quantity" value={form.purchaseQty} onChange={(e) => handleFormChange(index, e)} className="p-3 border rounded-xl" />
            <input name="costPrice" type="number" placeholder="Cost Price" value={form.costPrice} onChange={(e) => handleFormChange(index, e)} className="p-3 border rounded-xl" />
            <input name="sellingPrice" type="number" placeholder="Selling Price" value={form.sellingPrice} onChange={(e) => handleFormChange(index, e)} className="p-3 border rounded-xl" />
            <button type="button" onClick={() => removeFormRow(index)} className="text-red-600 hover:text-red-800 self-start">
              Remove Item
            </button>
          </div>
        ))}

        <div className="flex gap-4">
          <button onClick={addFormRow} className="bg-gray-200 p-3 rounded-xl hover:bg-gray-300">Add Another Item</button>
          <button onClick={submitPurchase} className="bg-black text-white p-3 rounded-xl hover:bg-gray-800">Submit Purchase</button>
        </div>
      </div>

      {/* Current Inventory */}
      <div>
        <h2 className="font-semibold text-xl mb-4">Current Inventory</h2>
        {items.length === 0 && <p className="text-gray-500">No items yet...</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item._id} className="p-4 border rounded-2xl bg-white shadow">
              <p className="font-semibold">{item.name}</p>
              <p className="text-gray-600">Category: {item.category}</p>
              <p className="text-gray-600">Brand: {item.brand}</p>
              {item.model && <p className="text-gray-600">Model: {item.model}</p>}
              <p className="text-gray-600">Stock: {item.stock}</p>
              <p className="text-gray-600">Cost Price: ₦{item.costPrice.toLocaleString()}</p>
              <p className="text-gray-600">Selling Price: ₦{item.sellingPrice.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
