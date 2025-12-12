"use client";

import { useState, useEffect } from "react";
import jwt from "jsonwebtoken";
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, Box, X } from "lucide-react";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState<"admin" | "staff" | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

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
    const token = document.cookie
      .split("; ")
      .find(c => c.startsWith("token="))
      ?.split("=")[1];
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

  // Start editing
  function handleEdit(item: any) {
    setEditingItem(item);
    setIsEditing(true);
    setShowModal(true);

    setName(item.name);
    setCategory(item.category);
    setBrand(item.brand);
    setType(item.type);
    setModel(item.model);
    setStock(item.stock);
    setCostPrice(item.costPrice);
    setSellingPrice(item.sellingPrice);
    setDescription(item.description);
    setPreview(item.imageUrl || null);
  }

  // Add new item
  async function handleAdd(e: any) {
    e.preventDefault();
    if (role !== "admin") return;

    const token = document.cookie
      .split("; ")
      .find(c => c.startsWith("token="))
      ?.split("=")[1];

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("brand", brand);
    formData.append("type", type);
    formData.append("model", model);
    formData.append("stock", stock);
    formData.append("costPrice", costPrice);
    formData.append("sellingPrice", sellingPrice);
    formData.append("description", description);
    if (image) formData.append("image", image);

    const res = await fetch("/api/items", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      resetForm();
      loadInventory();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  }

  // Update item
  async function handleUpdate(e: any) {
    e.preventDefault();
    if (role !== "admin") return;

    const token = document.cookie
      .split("; ")
      .find(c => c.startsWith("token="))
      ?.split("=")[1];

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("brand", brand);
    formData.append("type", type);
    formData.append("model", model);
    formData.append("stock", stock);
    formData.append("costPrice", costPrice);
    formData.append("sellingPrice", sellingPrice);
    formData.append("description", description);
    if (image) formData.append("image", image);

    const res = await fetch(`/api/items/${editingItem._id}`, {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      resetForm();
      loadInventory();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  }

  // Delete item
  async function handleDelete(id: string) {
    if (role !== "admin") return;
    if (!confirm("Delete this item?")) return;

    await fetch(`/api/items/${id}`, { method: "DELETE", credentials: "include" });
    loadInventory();
  }

  // Reset form
  function resetForm() {
    setShowModal(false);
    setIsEditing(false);
    setEditingItem(null);
    setImage(null);
    setPreview(null);
    setName("");
    setCategory("");
    setBrand("");
    setType("");
    setModel("");
    setStock("");
    setCostPrice("");
    setSellingPrice("");
    setDescription("");
  }

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 text-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Box size={24} /> Inventory
        </h1>

        {role === "admin" && (
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-1"
          >
            <Plus size={16} /> Add Item
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-2 top-2 text-gray-400" />
        <input
          type="text"
          placeholder="Search item..."
          className="border p-2 pl-8 w-full rounded"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Inventory table */}
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
                  <td className="p-3 flex gap-2">
                    <button
                      className="text-blue-600 flex items-center gap-1"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                    <button
                      className="text-red-600 flex items-center gap-1"
                      onClick={() => handleDelete(item._id)}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td
                  className="p-4 text-center text-gray-400"
                  colSpan={role === "admin" ? 9 : 8}
                >
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && role === "admin" && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              {isEditing ? <Edit2 size={20} /> : <Plus size={20} />}{" "}
              {isEditing ? "Edit Item" : "Add New Item"}
            </h2>

            <form
              onSubmit={isEditing ? handleUpdate : handleAdd}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <input className="border p-2 rounded" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
              <input className="border p-2 rounded" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
              <input className="border p-2 rounded" placeholder="Brand" value={brand} onChange={e => setBrand(e.target.value)} />
              <input className="border p-2 rounded" placeholder="Type" value={type} onChange={e => setType(e.target.value)} />
              <input className="border p-2 rounded" placeholder="Model" value={model} onChange={e => setModel(e.target.value)} />
              <input className="border p-2 rounded" placeholder="Stock" type="number" value={stock} onChange={e => setStock(e.target.value)} />
              <input className="border p-2 rounded" placeholder="Cost Price" type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} />
              <input className="border p-2 rounded" placeholder="Selling Price" type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} />

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label htmlFor="item-image" className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <ImageIcon size={16} /> Image Upload
                </label>
                <input
                  id="item-image"
                  type="file"
                  accept="image/*"
                  className="border p-2 w-full rounded mb-2"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImage(file);
                    if (file) setPreview(URL.createObjectURL(file));
                  }}
                />
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded mb-2" />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded mb-2 text-gray-400">
                    <ImageIcon size={32} />
                  </div>
                )}
              </div>

              <textarea className="border p-2 w-full rounded md:col-span-2" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />

              <div className="flex justify-end gap-2 md:col-span-2 mt-2">
                <button type="button" onClick={resetForm} className="px-3 py-1 border rounded flex items-center gap-1">
                  <X size={16} /> Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded flex items-center gap-1">
                  {isEditing ? "Update" : <> <Plus size={16} /> Add </>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
