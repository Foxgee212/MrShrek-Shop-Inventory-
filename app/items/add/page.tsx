"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditItemPage() {
  const router = useRouter();
  const { id } = useParams();

  const [form, setForm] = useState({
    sku: "",
    brand: "",
    model: "",
    category: "",
    stock: 0,
    sellingPrice: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItem() {
      const res = await fetch(`/api/items/${id}`);
      const data = await res.json();
      setForm(data);
      setLoading(false);
    }
    loadItem();
  }, [id]);

  function updateField(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveChanges() {
    const res = await fetch(`/api/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(form),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) router.push("/items");
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <main className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4">Edit Item</h1>

        <div className="space-y-3">
          {Object.entries(form).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm capitalize">{key}</label>
              <input
                type={typeof value === "number" ? "number" : "text"}
                value={value as any}
                onChange={(e) => updateField(key, e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          ))}

          <button
            onClick={saveChanges}
            className="w-full p-3 bg-green-600 text-white rounded"
          >
            Save Changes
          </button>
        </div>
      </div>
    </main>
  );
}
