"use client";

import { useState, useEffect } from "react";
import jwt from "jsonwebtoken";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState<"admin" | "staff" | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [model, setModel] = useState("");
  const [stock, setStock] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [description, setDescription] = useState("");

  // Detect role from token
  useEffect(() => {
    const token = document.cookie.split("; ").find(c => c.startsWith("token="))?.split("=")[1];
    if (token) {
      try {
        const decoded: any = jwt.decode(token);
        setRole(decoded?.role ?? null);
      } catch {
        setRole(null);
      }
    }
  }, []);

  // Load inventory
  async function loadInventory() {
    const res = await fetch("/api/items", { credentials: "include" });
    const data = await res.json();
    setItems(data);
  }

  useEffect(() => {
    loadInventory();
  }, []);

  // Add item (admins only)
  async function handleAdd(e: any) {
    e.preventDefault();
    if (role !== "admin") return;

    const token = document.cookie.split("; ").find(c => c.startsWith("token="))?.split("=")[1];

    const res = await fetch("/api/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        category,
        brand,
        type,
        model,
        stock: Number(stock),
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        description
      })
    });

    if (res.ok) {
      setShowModal(false);
      setName(""); setCategory(""); setBrand(""); setType(""); setModel("");
      setStock(""); setCostPrice(""); setSellingPrice(""); setDescription("");
      loadInventory();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  }

  // Delete item (admins only)
  async function handleDelete(id: string) {
    if (role !== "admin") return;
    if (!confirm("Delete this item?")) return;

    await fetch(`/api/items/${id}`, { method: "DELETE", credentials: "include" });
    loadInventory();
  }

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📦 Inventory</h1>

        {role === "admin" && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Add Item
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Search item..."
        className="border p-2 w-full mb-4 rounded"
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Brand</th>
              <th className="p-3">Model</th>
              <th className="p-3">Category</th>
              <th className="p-3">Type</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Cost</th>
              <th className="p-3">Selling</th>
              {role === "admin" && <th className="p-3">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {filteredItems.map((item) => (
              <tr key={item._id} className="border-b">
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.brand}</td>
                <td className="p-3">{item.model}</td>
                <td className="p-3">{item.category}</td>
                <td className="p-3">{item.type}</td>
                <td className="p-3">{item.stock}</td>
                <td className="p-3">₦{item.costPrice}</td>
                <td className="p-3">₦{item.sellingPrice}</td>
                {role === "admin" && (
                  <td className="p-3">
                    <button className="text-blue-600 mr-3">Edit</button>
                    <button
                      className="text-red-600"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}

            {filteredItems.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-400" colSpan={role === "admin" ? 9 : 8}>
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal (admin only) */}
      {showModal && role === "admin" && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add New Item</h2>

            <form onSubmit={handleAdd}>
              <input className="border p-2 w-full mb-2 rounded" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="border p-2 w-full mb-2 rounded" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
              <input className="border p-2 w-full mb-2 rounded" placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
              <input className="border p-2 w-full mb-2 rounded" placeholder="Type" value={type} onChange={(e) => setType(e.target.value)} />
              <input className="border p-2 w-full mb-2 rounded" placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} />
              <input className="border p-2 w-full mb-2 rounded" placeholder="Stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
              <input className="border p-2 w-full mb-2 rounded" placeholder="Cost Price" type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
              <input className="border p-2 w-full mb-4 rounded" placeholder="Selling Price" type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
              <textarea className="border p-2 w-full mb-4 rounded" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1 border rounded">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
