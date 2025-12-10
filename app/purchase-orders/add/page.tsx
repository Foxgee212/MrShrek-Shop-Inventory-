// app/purchase-orders/add/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Item = { _id: string; sku: string; brand: string; model: string; sellingPrice: number };

export default function AddPO() {
  const [items, setItems] = useState<Item[]>([]);
  const [lines, setLines] = useState<any[]>([]);
  const [supplierName, setSupplierName] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/items").then(r => r.json()).then(setItems).catch(console.error);
  }, []);

  function addLine() {
    setLines(prev => [...prev, { itemId: "", qtyOrdered: 1, unitCost: 0 }]);
  }

  function updateLine(idx: number, key: string, value: any) {
    setLines(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: value };
      // try to populate sku/brand/model if item selected
      if (key === "itemId") {
        const it = items.find(i => i._id === value);
        if (it) {
          copy[idx].sku = it.sku;
          copy[idx].brand = it.brand;
          copy[idx].model = it.model;
        }
      }
      return copy;
    });
  }

  async function createPO() {
    const body = { supplierName, supplierContact, lines, notes: "" };
    const res = await fetch("/api/purchase-orders", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) {
      router.push("/purchase-orders");
    } else {
      alert("Failed to create PO");
    }
  }

  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Create Purchase Order</h1>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <input className="p-2 border" placeholder="Supplier name" value={supplierName} onChange={e => setSupplierName(e.target.value)} />
          <input className="p-2 border" placeholder="Supplier contact" value={supplierContact} onChange={e => setSupplierContact(e.target.value)} />
        </div>

        <div className="space-y-3">
          {lines.map((ln, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select className="p-2 border flex-1" value={ln.itemId} onChange={e => updateLine(i, "itemId", e.target.value)}>
                <option value="">Select item</option>
                {items.map(it => <option key={it._id} value={it._id}>{it.brand} {it.model} ({it.sku})</option>)}
              </select>

              <input className="w-24 p-2 border" type="number" value={ln.qtyOrdered} onChange={e => updateLine(i, "qtyOrdered", Number(e.target.value))} />
              <input className="w-28 p-2 border" type="number" value={ln.unitCost} onChange={e => updateLine(i, "unitCost", Number(e.target.value))} placeholder="Unit cost" />
              <button onClick={() => setLines(prev => prev.filter((_, idx) => idx !== i))} className="text-red-600 px-2">Remove</button>
            </div>
          ))}

          <div className="flex gap-3">
            <button onClick={addLine} className="px-3 py-2 bg-blue-600 text-white rounded">+ Add line</button>
            <button onClick={createPO} className="px-3 py-2 bg-green-600 text-white rounded">Create PO</button>
          </div>
        </div>
      </div>
    </main>
  );
}
