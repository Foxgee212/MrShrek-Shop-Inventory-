"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Edit2, Trash2, Search, X } from "lucide-react";
import jwt from "jsonwebtoken";

export default function ItemsPage() {
  const { category, brand } = useParams();
  const [items, setItems] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"admin" | "staff" | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [model, setModel] = useState("");
  const [stock, setStock] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  // Detect role
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((c) => c.startsWith("token="))
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

  // Load items
  useEffect(() => {
    fetch(`/api/items?category=${category}&brand=${brand}`)
      .then((r) => r.json())
      .then(setItems);
  }, [category, brand]);

  const filtered = items.filter((i) =>
    `${i.name} ${i.model} ${i.type}`.toLowerCase().includes(query.toLowerCase())
  );

  // Start editing
  function handleEdit(item: any) {
    setEditingItem(item);
    setIsEditing(true);
    setShowModal(true);

    setName(item.name);
    setType(item.type);
    setModel(item.model);
    setStock(item.stock);
    setSellingPrice(item.sellingPrice);
  }

  // Update item
 async function handleUpdate(e: any) {
  e.preventDefault();
  if (role !== "admin") return;

  const token = document.cookie
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  const formData = new FormData();
  formData.append("name", name);
  formData.append("type", type);
  formData.append("model", model);
  formData.append("stock", stock.toString());
  formData.append("sellingPrice", sellingPrice.toString());

  const res = await fetch(`/api/items/${editingItem._id}`, {
    method: "PUT",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.ok) {
    setShowModal(false);
    setEditingItem(null);
    setIsEditing(false);

    fetch(`/api/items?category=${category}&brand=${brand}`)
      .then((r) => r.json())
      .then(setItems);
  } else {
    const err = await res.json();
    alert(err.error);
  }
}

  // Delete item
  async function handleDelete(id: string) {
    if (role !== "admin") return;
    if (!confirm("Delete this item?")) return;

    const token = document.cookie
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    const res = await fetch(`/api/items/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setItems((prev) => prev.filter((i) => i._id !== id));
    } else {
      const err = await res.json();
      alert(err.error);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Search Field */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 opacity-60" size={18} />
        <input
          placeholder="Search name, model or type..."
          className="border p-2 pl-10 w-full rounded focus:ring-2 focus:ring-blue-400"
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.map((item) => (
        <div
          key={item._id}
          className={`flex items-center justify-between p-4 mb-3 rounded-xl border shadow-sm transition-all 
            ${item.stock === 0 ? "bg-red-100 border-red-500" : "bg-white hover:shadow-md"}
          `}
        >
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              {item.name} — {item.model}
            </div>
            <div className="mt-1 text-sm text-gray-600 flex flex-col gap-1">
              <div>Type: {item.type}</div>
              <div>Stock: {item.stock}</div>
              <div className="font-bold text-green-700 text-lg">
                ₦{item.sellingPrice.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Edit / Delete Buttons */}
          {role === "admin" && (
            <div className="flex gap-2">
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
            </div>
          )}
        </div>
      ))}

      {/* Edit Modal */}
      {showModal && role === "admin" && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Edit2 size={20} /> Edit Item
            </h2>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-4">
              <input
                className="border p-2 rounded"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="border p-2 rounded"
                placeholder="Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
              <input
                className="border p-2 rounded"
                placeholder="Model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
              <input
                className="border p-2 rounded"
                placeholder="Stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
              <input
                className="border p-2 rounded"
                placeholder="Selling Price"
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
              />

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1 border rounded flex items-center gap-1"
                >
                  <X size={16} /> Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-1 rounded flex items-center gap-1"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
