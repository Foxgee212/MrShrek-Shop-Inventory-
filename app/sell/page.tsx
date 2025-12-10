"use client";

import { useEffect, useState } from "react";

type Item = {
  _id: string;
  sku: string;
  brand: string;
  model: string;
  category: string;
  stock: number;
  sellingPrice: number;
};

type CartItem = {
  item: Item;
  quantity: number;
};

export default function SellPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadItems() {
      try {
        const res = await fetch("/api/items");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadItems();
  }, []);

  function addToCart(item: Item) {
    setCart((prev) => {
      const exists = prev.find((c) => c.item._id === item._id);

      if (exists) {
        // Avoid selling more than available
        if (exists.quantity >= item.stock) return prev;

        return prev.map((c) =>
          c.item._id === item._id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }

      return [...prev, { item, quantity: 1 }];
    });
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((c) => c.item._id !== id));
  }

  function updateQty(id: string, qty: number) {
    setCart((prev) =>
      prev.map((c) =>
        c.item._id === id
          ? {
              ...c,
              quantity: qty > c.item.stock ? c.item.stock : qty < 1 ? 1 : qty,
            }
          : c
      )
    );
  }

  const filteredItems = items.filter((i) => {
    const q = search.toLowerCase();
    return (
      i.sku.toLowerCase().includes(q) ||
      i.brand.toLowerCase().includes(q) ||
      i.model.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q)
    );
  });

  const total = cart.reduce(
    (sum, c) => sum + c.item.sellingPrice * c.quantity,
    0
  );

  async function submitSale() {
    if (cart.length === 0) {
      setMessage("Cart is empty.");
      return;
    }

    const saleData = {
      items: cart.map((c) => ({
        itemId: c.item._id,
        quantity: c.quantity,
        priceAtSale: c.item.sellingPrice,
      })),
      totalAmount: total,
    };

    const res = await fetch("/api/sales", {
      method: "POST",
      body: JSON.stringify(saleData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      setMessage("Sale recorded successfully!");
      setCart([]);
    } else {
      setMessage("Error recording sale.");
    }

    setTimeout(() => setMessage(""), 2000);
  }

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Sell Items</h1>

        {message && (
          <div className="p-3 mb-4 rounded bg-green-100 text-green-700 text-sm">
            {message}
          </div>
        )}

        {/* Search */}
        <input
          type="text"
          placeholder="Search by SKU, brand, model, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border rounded-full mb-4"
        />

        {/* Items list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {filteredItems.slice(0, 20).map((item) => (
            <button
              key={item._id}
              onClick={() => addToCart(item)}
              className="p-4 border rounded bg-gray-50 hover:bg-gray-100 text-left"
            >
              <p className="font-semibold">{item.brand} {item.model}</p>
              <p className="text-sm text-gray-500">{item.category}</p>
              <p className="text-sm text-gray-700">₦{item.sellingPrice}</p>
              <p className="text-xs text-gray-500">Stock: {item.stock}</p>
            </button>
          ))}
        </div>

        {/* Cart */}
        <h2 className="text-xl font-semibold mb-3">Cart</h2>
        {cart.length === 0 ? (
          <p className="text-gray-500">Cart is empty.</p>
        ) : (
          <div className="space-y-3 mb-6">
            {cart.map((c) => (
              <div
                key={c.item._id}
                className="flex items-center justify-between border p-3 rounded"
              >
                <div>
                  <p className="font-semibold">{c.item.brand} {c.item.model}</p>
                  <p className="text-sm text-gray-500">₦{c.item.sellingPrice}</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={c.quantity}
                    onChange={(e) =>
                      updateQty(c.item._id, parseInt(e.target.value))
                    }
                    className="w-16 p-1 border rounded"
                  />

                  <button
                    onClick={() => removeFromCart(c.item._id)}
                    className="p-2 text-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            <div className="text-right font-bold text-lg">
              Total: ₦{total}
            </div>

            <button
              onClick={submitSale}
              className="w-full p-3 bg-green-600 text-white rounded mt-3"
            >
              Complete Sale
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
