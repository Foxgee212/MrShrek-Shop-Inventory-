// app/purchase-orders/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function POView() {
  const { id } = useParams();
  const [po, setPo] = useState<any>(null);
  const [linesReceive, setLinesReceive] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/purchase-orders/${id}`).then(r => r.json()).then(data => {
      setPo(data);
      setLinesReceive(data.lines.map(l => ({ qtyReceived: 0 })));
    });
  }, [id]);

  async function receive() {
    const payload = {
      action: "receive",
      lines: linesReceive.map((l, idx) => ({ lineIdx: idx, qtyReceived: l.qtyReceived }))
    };

    const res = await fetch(`/api/purchase-orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    if (res.ok) {
      alert("Received");
      router.push("/purchase-orders");
    } else {
      alert("Receive failed");
    }
  }

  if (!po) return <p className="p-6">Loading...</p>;

  return (
    <main className="p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-2">PO: {po._id}</h1>
        <p className="text-sm text-gray-500 mb-4">Supplier: {po.supplierName}</p>

        <div className="space-y-2 mb-4">
          {po.lines.map((ln: any, i: number) => (
            <div key={i} className="flex items-center justify-between border p-2 rounded">
              <div>
                <div className="font-semibold">{ln.brand} {ln.model} ({ln.sku})</div>
                <div className="text-sm text-gray-500">Ordered: {ln.qtyOrdered} — Received: {ln.qtyReceived || 0}</div>
                <div className="text-sm text-gray-500">Unit cost: ₦{ln.unitCost}</div>
              </div>

              <div>
                <input type="number" className="w-20 p-1 border" min={0} max={ln.qtyOrdered - (ln.qtyReceived || 0)} defaultValue={0}
                  onChange={(e) => {
                    const v = Number(e.target.value || 0);
                    setLinesReceive(prev => {
                      const copy = [...prev]; copy[i] = { qtyReceived: v }; return copy;
                    });
                  }} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={receive} className="px-4 py-2 bg-green-600 text-white rounded">Receive Selected</button>
        </div>
      </div>
    </main>
  );
}
