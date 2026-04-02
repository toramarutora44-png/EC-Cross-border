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

const STATUS = {
  pending: { ja: "未払い", zh: "待付款", en: "Unpaid", color: "bg-yellow-100 text-yellow-700" },
  paid: { ja: "支払済", zh: "已付款", en: "Paid", color: "bg-blue-100 text-blue-700" },
  shipped: { ja: "発送済", zh: "已发货", en: "Shipped", color: "bg-green-100 text-green-700" },
  delivered: { ja: "配達完了", zh: "已送达", en: "Delivered", color: "bg-gray-100 text-gray-700" },
  cancelled: { ja: "キャンセル", zh: "已取消", en: "Cancelled", color: "bg-red-100 text-red-700" },
};

const PAYMENT_LABELS: Record<string, string> = {
  paypay: "PayPay",
  wechat: "WeChat",
  bank: "Bank",
};

const CATEGORIES = [
  { value: "clothes", ja: "服", zh: "服装", en: "Clothes" },
  { value: "bags", ja: "バッグ", zh: "包包", en: "Bags" },
  { value: "dolls", ja: "ぬいぐるみ", zh: "玩偶", en: "Dolls" },
  { value: "accessories", ja: "アクセサリー", zh: "饰品", en: "Accessories" },
  { value: "goods", ja: "雑貨", zh: "杂货", en: "Goods" },
];

const t = {
  ja: {
    title: "管理画面",
    viewSite: "サイトを見る",
    orders: "注文",
    products: "商品",
    noOrders: "注文はまだありません",
    total: "合計",
    payment: "支払",
    addProduct: "+ 新しい商品を追加",
    noPrice: "価格未設定",
    noCategory: "未分類",
    edit: "編集",
    delete: "削除",
    save: "保存",
    cancel: "キャンセル",
    price: "価格",
    loading: "読み込み中...",
    confirmDelete: "この商品を削除しますか？",
  },
  zh: {
    title: "管理后台",
    viewSite: "查看网站",
    orders: "订单",
    products: "商品",
    noOrders: "暂无订单",
    total: "合计",
    payment: "支付",
    addProduct: "+ 添加新商品",
    noPrice: "未定价",
    noCategory: "未分类",
    edit: "编辑",
    delete: "删除",
    save: "保存",
    cancel: "取消",
    price: "价格",
    loading: "加载中...",
    confirmDelete: "确定要删除这个商品吗？",
  },
  en: {
    title: "Admin",
    viewSite: "View Site",
    orders: "Orders",
    products: "Products",
    noOrders: "No orders yet",
    total: "Total",
    payment: "Payment",
    addProduct: "+ Add New Product",
    noPrice: "No price",
    noCategory: "No category",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    price: "Price",
    loading: "Loading...",
    confirmDelete: "Delete this product?",
  },
};

export default function AdminPage() {
  const [lang, setLang] = useState<"ja" | "zh" | "en">("ja");
  const [tab, setTab] = useState<"orders" | "products">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const l = t[lang];

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
    if (!confirm(l.confirmDelete)) return;
    await supabase.from("products").delete().eq("id", id);
    setProducts(products.filter((p) => p.id !== id));
  }

  async function saveProduct(product: Product) {
    const { error } = await supabase
      .from("products")
      .update({ name: product.name, price: product.price, category: product.category })
      .eq("id", product.id);
    if (!error) {
      setProducts(products.map((p) => (p.id === product.id ? product : p)));
      setEditingProduct(null);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("ja-JP", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">{l.loading}</p>
      </div>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen pb-10">
      <header className="sticky top-0 z-50 bg-white shadow-sm px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold">{l.title}</h1>
          <div className="flex items-center gap-2">
            <a href="/" className="text-xs text-gray-400">{l.viewSite}</a>
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
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab("orders")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${
              tab === "orders" ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            {l.orders} ({orders.length})
          </button>
          <button
            onClick={() => setTab("products")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${
              tab === "products" ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            {l.products} ({products.length})
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4">
        {tab === "orders" && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-center text-gray-400 py-10">{l.noOrders}</p>
            ) : (
              orders.map((order) => {
                const st = STATUS[order.status as keyof typeof STATUS] || STATUS.pending;
                return (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                        <p className="font-bold text-sm">{order.id}</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${st.color}`}>
                        {st[lang]}
                      </span>
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.name} x{item.quantity}</span>
                          <span>¥{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-bold border-t pt-1">
                        <span>{l.total}</span>
                        <span className="text-red-600">¥{order.total.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 mb-3">
                      <p>{order.customer_name} / {order.customer_phone}</p>
                      <p className="mt-1">{order.customer_address}</p>
                      <p className="mt-1">{l.payment}: {PAYMENT_LABELS[order.payment_method] || order.payment_method}</p>
                    </div>
                    <div className="flex gap-2 overflow-x-auto">
                      {Object.entries(STATUS).map(([key, val]) => (
                        <button
                          key={key}
                          onClick={() => updateOrderStatus(order.id, key)}
                          className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition ${
                            order.status === key ? val.color + " font-bold" : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {val[lang]}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === "products" && (
          <div className="space-y-3">
            <a href="/upload" className="block bg-black text-white text-center py-3 rounded-xl font-bold text-sm">
              {l.addProduct}
            </a>
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm p-4">
                {editingProduct?.id === product.id ? (
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
                        placeholder={l.price}
                        className="flex-1 border rounded-xl px-3 py-2 text-sm"
                      />
                      <select
                        value={editingProduct.category || "goods"}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="flex-1 border rounded-xl px-3 py-2 text-sm"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>{c[lang]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveProduct(editingProduct)} className="flex-1 bg-black text-white py-2 rounded-xl text-sm font-bold">{l.save}</button>
                      <button onClick={() => setEditingProduct(null)} className="flex-1 bg-gray-100 py-2 rounded-xl text-sm">{l.cancel}</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} alt="" className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{product.name}</p>
                      <p className="text-xs text-gray-400">
                        {product.price ? `¥${product.price.toLocaleString()}` : l.noPrice}
                        {" · "}
                        {CATEGORIES.find((c) => c.value === product.category)?.[lang] || l.noCategory}
                      </p>
                      <p className="text-xs text-gray-300 mt-1">{formatDate(product.created_at)}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => setEditingProduct({ ...product })} className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg">{l.edit}</button>
                      <button onClick={() => deleteProduct(product.id)} className="text-xs text-red-500 px-3 py-1.5 rounded-lg">{l.delete}</button>
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
