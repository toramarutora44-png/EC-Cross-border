"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  items: { id: string; name: string; price: number; quantity: number }[];
  total: number;
  payment_method: string;
  status: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  created_at: string;
};

type Product = {
  id: string;
  name: string;
  price: number | null;
  category: string | null;
  images: string[] | null;
  created_at: string;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "未払い", color: "bg-yellow-100 text-yellow-700" },
  paid: { label: "支払済", color: "bg-blue-100 text-blue-700" },
  shipped: { label: "発送済", color: "bg-green-100 text-green-700" },
  delivered: { label: "配達完了", color: "bg-gray-100 text-gray-700" },
  cancelled: { label: "キャンセル", color: "bg-red-100 text-red-700" },
};

const PAYMENT_LABELS: Record<string, string> = {
  paypay: "PayPay",
  wechat: "WeChat",
  bank: "振込",
};

export default function AdminPage() {
  const [tab, setTab] = useState<"orders" | "products">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [ordersRes, productsRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
    ]);
    if (ordersRes.data) setOrders(ordersRes.data);
    if (productsRes.data) setProducts(productsRes.data);
    setLoading(false);
  }

  async function updateOrderStatus(orderId: string, status: string) {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
  }

  async function deleteProduct(id: string) {
    if (!confirm("この商品を削除しますか？")) return;
    await supabase.from("products").delete().eq("id", id);
    setProducts(products.filter((p) => p.id !== id));
  }

  async function saveProduct(product: Product) {
    const { error } = await supabase
      .from("products")
      .update({
        name: product.name,
        price: product.price,
        category: product.category,
      })
      .eq("id", product.id);
    if (!error) {
      setProducts(products.map((p) => (p.id === product.id ? product : p)));
      setEditingProduct(null);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen pb-10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold">管理画面</h1>
          <a href="/" className="text-xs text-gray-400">サイトを見る</a>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab("orders")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${
              tab === "orders" ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            注文 ({orders.length})
          </button>
          <button
            onClick={() => setTab("products")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${
              tab === "products" ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            商品 ({products.length})
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4">
        {/* Orders Tab */}
        {tab === "orders" && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-center text-gray-400 py-10">注文はまだありません</p>
            ) : (
              orders.map((order) => {
                const st = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
                return (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm p-4">
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                        <p className="font-bold text-sm">{order.id}</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${st.color}`}>
                        {st.label}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-1 mb-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.name} x{item.quantity}</span>
                          <span>¥{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-bold border-t pt-1">
                        <span>合計</span>
                        <span className="text-red-600">¥{order.total.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 mb-3">
                      <p>{order.customer_name} / {order.customer_phone}</p>
                      <p className="mt-1">{order.customer_address}</p>
                      <p className="mt-1">支払: {PAYMENT_LABELS[order.payment_method] || order.payment_method}</p>
                    </div>

                    {/* Status Update */}
                    <div className="flex gap-2 overflow-x-auto">
                      {Object.entries(STATUS_LABELS).map(([key, val]) => (
                        <button
                          key={key}
                          onClick={() => updateOrderStatus(order.id, key)}
                          className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition ${
                            order.status === key
                              ? val.color + " font-bold"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {val.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Products Tab */}
        {tab === "products" && (
          <div className="space-y-3">
            <a
              href="/upload"
              className="block bg-black text-white text-center py-3 rounded-xl font-bold text-sm"
            >
              + 新しい商品を追加
            </a>

            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm p-4">
                {editingProduct?.id === product.id ? (
                  /* Edit Mode */
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={editingProduct.price || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) || null })}
                        placeholder="価格"
                        className="flex-1 border rounded-xl px-3 py-2 text-sm"
                      />
                      <select
                        value={editingProduct.category || "goods"}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="flex-1 border rounded-xl px-3 py-2 text-sm"
                      >
                        <option value="clothes">服</option>
                        <option value="bags">バッグ</option>
                        <option value="dolls">ぬいぐるみ</option>
                        <option value="accessories">アクセサリー</option>
                        <option value="goods">雑貨</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveProduct(editingProduct)}
                        className="flex-1 bg-black text-white py-2 rounded-xl text-sm font-bold"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="flex-1 bg-gray-100 py-2 rounded-xl text-sm"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="flex gap-3">
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} alt="" className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{product.name}</p>
                      <p className="text-xs text-gray-400">
                        {product.price ? `¥${product.price.toLocaleString()}` : "価格未設定"}
                        {" · "}
                        {product.category || "未分類"}
                      </p>
                      <p className="text-xs text-gray-300 mt-1">{formatDate(product.created_at)}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setEditingProduct({ ...product })}
                        className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="text-xs text-red-500 px-3 py-1.5 rounded-lg"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
