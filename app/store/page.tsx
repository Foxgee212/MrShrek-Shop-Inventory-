"use client";

import { useState, useEffect } from "react";
import Link from "next/link"
import jwt from "jsonwebtoken";
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, Box, X } from "lucide-react";

type Category = {
  name: string;
  hasOutOfStock: boolean;
  imageUrl: string;
};
type CategoriesResponse = {
  categories: Category[];
  brands: {
    name: string;
    hasOutOfStock: boolean;
  }[];
};


export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState<"admin" | "staff" | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

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
      fetchCategories();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  }

  // Reset form
  function resetForm() {
    setShowModal(false);
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
  async function fetchCategories() {
  const res = await fetch("/api/items/categories-with-stock");
  const data: CategoriesResponse = await res.json();

  setCategories(Array.isArray(data.categories) ? data.categories : []);
}

  
    useEffect(() => {
      fetchCategories();
  
      // Poll every 10 seconds
      const interval = setInterval(fetchCategories, 10000);
      return () => clearInterval(interval);
    }, []);
    console.log("Categories Page", categories);
  

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
      <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((cat) => (
        <Link
          key={cat.name}
          href={`/store/${cat.name.toLowerCase()}`}
          className="relative bg-white rounded-xl shadow hover:scale-105 transition overflow-hidden"
        >
          {/* Category Image */}
          <div className="h-32 w-full overflow-hidden rounded-t-xl">
            <img
              src={cat.imageUrl}
              alt={cat.name}
              className="w-full h-full object-scale-down"
            />
          </div>

          {/* Red alert for out-of-stock */}
          {cat.hasOutOfStock && (
            <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-red-600 animate-pulse" />
          )}

          {/* Category Name */}
          <div className="text-lg font-bold p-4">{cat.name}</div>
        </Link>
      ))}
    </div>
      {filteredItems.length === 0 && (
        <div className="p-4 text-center text-gray-400">
          No items found
        </div>
)}

      {/* Add/Edit Modal */}
      {showModal && role === "admin" && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
               <Plus size={20} /> Add New Item
            </h2>

            <form
              onSubmit={ handleAdd}
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
                  <Plus size={16} /> Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
