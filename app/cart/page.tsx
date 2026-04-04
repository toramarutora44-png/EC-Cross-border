"use client";

import { useState, useEffect } from "react";
import { getCart, updateQuantity, getCartTotal, clearCart, CartItem } from "@/lib/cart";

const t = {
  ja: {
    title: "カート",
    empty: "カートに商品がありません",
    back: "買い物を続ける",
    total: "合計",
    checkout: "注文に進む",
    yen: "¥",
    remove: "削除",
  },
  zh: {
    title: "购物车",
    empty: "购物车是空的",
    back: "继续购物",
    total: "合计",
    checkout: "去结算",
    yen: "¥",
    remove: "删除",
  },
  en: {
    title: "Cart",
    empty: "Your cart is empty",
    back: "Continue shopping",
    total: "Total",
    checkout: "Checkout",
    yen: "¥",
    remove: "Remove",
  },
};

export default function CartPage() {
  const [lang, setLang] = useState<"ja" | "zh" | "en">("ja");
  const [cart, setCart] = useState<CartItem[]>([]);
  const l = t[lang];

  useEffect(() => {
    setCart(getCart());
    function onUpdate() { setCart(getCart()); }
    window.addEventListener("cart-update", onUpdate);
    return () => window.removeEventListener("cart-update", onUpdate);
  }, []);

  const total = getCartTotal(cart);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-gray-400">{l.empty}</p>
        <a href="/" className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm">
          {l.back}
        </a>
      </div>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm flex items-center justify-between px-4 py-3">
        <a href="/" className="text-sm text-gray-600">&#8592;</a>
        <h1 className="font-bold">{l.title}</h1>
        <div className="flex gap-0.5 text-[10px] bg-gray-100 px-0.5 py-0.5 rounded-full">
          {(["ja", "zh", "en"] as const).map((code) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={`px-2 py-1 rounded-full transition ${lang === code ? "bg-black text-white" : ""}`}
            >
              {code === "ja" ? "JP" : code === "zh" ? "CN" : "EN"}
            </button>
          ))}
        </div>
      </header>

      {/* Cart Items */}
      <div className="px-4 pt-4 space-y-3">
        {cart.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-3 flex gap-3 shadow-sm">
            <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-red-600 font-bold text-sm mt-1">
                {l.yen}{item.price.toLocaleString()}
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-sm"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-sm"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => updateQuantity(item.id, 0)}
                  className="text-xs text-gray-400"
                >
                  {l.remove}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fixed Bottom */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg px-4 py-4 z-50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">{l.total}</span>
          <span className="text-2xl font-black text-red-600">{l.yen}{total.toLocaleString()}</span>
        </div>
        <a
          href="/checkout"
          className="block w-full bg-black text-white text-center py-4 rounded-xl font-bold text-lg"
        >
          {l.checkout}
        </a>
      </div>
    </main>
  );
}
