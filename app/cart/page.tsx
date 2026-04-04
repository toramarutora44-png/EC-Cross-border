"use client";
import { useState } from "react";
import { useCart } from "../context/CartContext";

const PAYPAY_URL = "https://qr.paypay.ne.jp/p2p01_gMJsV0ljRMc6NioB";

export default function CartPage() {
  const { items, removeItem, total, clear } = useCart();
  const [step, setStep] = useState<"cart" | "form" | "payment">("cart");
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    name: "", zip: "", address: "", phone: "",
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(total.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOrder = async (e: any) => {
    e.preventDefault();
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, total, ...form }),
    });
    setStep("payment");
  };

  // カートが空
  if (items.length === 0 && step === "cart") {
    return (
      <main className="max-w-md mx-auto p-6 text-center">
        <p className="text-gray-500 mt-20">カートは空です</p>
        <a href="/" className="block mt-4 underline text-sm">トップへ戻る</a>
      </main>
    );
  }

  // STEP1: カート確認
  if (step === "cart") return (
    <main className="max-w-md mx-auto p-6 bg-white text-black">
      <h1 className="text-xl font-bold mb-6">カート</h1>

      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-4 border-b pb-4">
            <img src={item.image} className="w-16 h-16 object-cover rounded" />
            <div className="flex-1">
              <p className="font-bold text-sm">{item.nameJa}</p>
              <p className="text-rose-600">¥{item.salePrice.toLocaleString()}</p>
              <p className="text-xs text-gray-400">×{item.qty}</p>
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="text-gray-400 text-sm"
            >削除</button>
          </div>
        ))}
      </div>

      <div className="mt-6 text-right">
        <p className="text-lg font-bold">合計: ¥{total.toLocaleString()}</p>
        <p className="text-xs text-gray-400">（送料込み）</p>
      </div>

      <button
        onClick={() => setStep("form")}
        className="w-full mt-6 bg-black text-white py-3 rounded font-bold"
      >
        注文情報を入力する
      </button>
    </main>
  );

  // STEP2: 注文フォーム
  if (step === "form") return (
    <main className="max-w-md mx-auto p-6 bg-white text-black">
      <h1 className="text-xl font-bold mb-6">お届け先</h1>

      <form onSubmit={handleOrder} className="space-y-4">
        <div>
          <label className="text-sm font-bold block mb-1">お名前</label>
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="山田 花子"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="text-sm font-bold block mb-1">郵便番号</label>
          <input
            value={form.zip}
            onChange={e => setForm({ ...form, zip: e.target.value })}
            placeholder="123-4567"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="text-sm font-bold block mb-1">住所</label>
          <input
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder="東京都渋谷区..."
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="text-sm font-bold block mb-1">電話番号</label>
          <input
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="090-1234-5678"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div className="bg-gray-50 rounded p-4 text-right">
          <p className="font-bold">合計: ¥{total.toLocaleString()}</p>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded font-bold"
        >
          支払いへ進む
        </button>
      </form>
    </main>
  );

  // STEP3: PayPay支払い
  return (
    <main className="max-w-md mx-auto p-6 bg-white text-black text-center">
      <h1 className="text-xl font-bold mb-2">PayPayで支払う</h1>
      <p className="text-gray-500 text-sm mb-6">以下の金額をPayPayで送金してください</p>

      {/* 金額 */}
      <div className="bg-rose-50 rounded-xl p-6 mb-4">
        <p className="text-4xl font-bold text-rose-600">
          ¥{total.toLocaleString()}
        </p>
      </div>

      {/* コピーボタン */}
      <button
        onClick={handleCopy}
        className="w-full border-2 border-black py-3 rounded font-bold mb-4"
      >
        {copied ? "✓ コピーしました" : "金額をコピーする"}
      </button>

      {/* PayPayへ */}
      <a
        href={PAYPAY_URL}
        target="_blank"
        className="block w-full bg-red-500 text-white py-3 rounded font-bold mb-6"
      >
        PayPayアプリで支払う
      </a>

      <div className="text-sm text-gray-500 space-y-1 text-left bg-gray-50 rounded p-4">
        <p className="font-bold text-black mb-2">支払い手順</p>
        <p>1. 「金額をコピーする」をタップ</p>
        <p>2. 「PayPayアプリで支払う」をタップ</p>
        <p>3. 金額欄に貼り付けて送金</p>
        <p>4. 支払い完了後、LINEにてご連絡ください</p>
      </div>

      <a
        href="https://line.me/R/ti/p/@143xkgim"
        target="_blank"
        className="block mt-4 w-full bg-green-500 text-white py-3 rounded font-bold"
      >
        LINEで連絡する
      </a>
    </main>
  );
}
