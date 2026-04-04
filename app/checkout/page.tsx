"use client";

import { useState, useEffect } from "react";
import { getCart, getCartTotal, clearCart, CartItem } from "@/lib/cart";
import { supabase } from "@/lib/supabase";

const t = {
  ja: {
    title: "お支払い",
    back: "カートに戻る",
    yen: "¥",
    total: "合計",
    name: "お名前",
    nameEx: "例: 山田太郎",
    address: "お届け先住所",
    addressEx: "例: 東京都渋谷区...",
    phone: "電話番号",
    phoneEx: "例: 090-1234-5678",
    payment: "お支払い方法",
    paypay: "PayPay",
    wechat: "WeChat Pay",
    bank: "銀行振込",
    order: "注文する",
    ordering: "処理中...",
    orderComplete: "注文完了!",
    orderId: "注文番号",
    paypayGuide: "以下のPayPay QRコードを読み取って、上記の金額を送金してください。メッセージ欄に注文番号を入れてください。",
    wechatGuide: "以下のWeChat QRコードを読み取って、上記の金額を送金してください。メッセージ欄に注文番号を入れてください。",
    bankGuide: "以下の口座に上記金額をお振込みください。振込名義に注文番号を入れてください。",
    bankInfo: "三菱UFJ銀行 ○○支店\n普通 1234567\nヤマダ タロウ",
    confirm: "送金完了後、LINEで注文番号をお知らせください。確認後すぐに発送します。",
    lineConfirm: "LINEで注文確認する",
    customerInfo: "お届け先情報",
    required: "* 全て必須",
  },
  zh: {
    title: "支付",
    back: "返回购物车",
    yen: "¥",
    total: "合计",
    name: "姓名",
    nameEx: "例: 张三",
    address: "收货地址",
    addressEx: "例: 东京都�的谷区...",
    phone: "电话号码",
    phoneEx: "例: 090-1234-5678",
    payment: "支付方式",
    paypay: "PayPay",
    wechat: "微信支付",
    bank: "银行转账",
    order: "下单",
    ordering: "处理中...",
    orderComplete: "下单成功!",
    orderId: "订单号",
    paypayGuide: "扫描下方PayPay二维码，发送上述金额。请在留言中填写订单号。",
    wechatGuide: "扫描下方微信二维码，发送上述金额。请在留言中填写订单号。",
    bankGuide: "请将上述金额转账至以下账户。转账备注请填写订单号。",
    bankInfo: "三菱UFJ银行 ○○支店\n普通 1234567\nヤマダ タロウ",
    confirm: "付款后，请通过LINE发送订单号确认。确认后立即发货。",
    lineConfirm: "LINE确认订单",
    customerInfo: "收货信息",
    required: "* 全部必填",
  },
  en: {
    title: "Checkout",
    back: "Back to cart",
    yen: "¥",
    total: "Total",
    name: "Full Name",
    nameEx: "e.g. Taro Yamada",
    address: "Shipping Address",
    addressEx: "e.g. Shibuya, Tokyo...",
    phone: "Phone",
    phoneEx: "e.g. 090-1234-5678",
    payment: "Payment Method",
    paypay: "PayPay",
    wechat: "WeChat Pay",
    bank: "Bank Transfer",
    order: "Place Order",
    ordering: "Processing...",
    orderComplete: "Order Placed!",
    orderId: "Order ID",
    paypayGuide: "Scan the PayPay QR code below and send the amount shown. Please include your order ID in the message.",
    wechatGuide: "Scan the WeChat QR code below and send the amount shown. Please include your order ID in the message.",
    bankGuide: "Please transfer the amount to the account below. Include order ID in the transfer note.",
    bankInfo: "MUFG Bank ○○ Branch\nAccount: 1234567\nYamada Taro",
    confirm: "After payment, send your order ID via LINE. We will ship as soon as payment is confirmed.",
    lineConfirm: "Confirm via LINE",
    customerInfo: "Shipping Info",
    required: "* All required",
  },
};

function generateOrderId() {
  const date = new Date();
  const d = date.toISOString().slice(2, 10).replace(/-/g, "");
  const r = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TS-${d}-${r}`;
}

export default function CheckoutPage() {
  const [lang, setLang] = useState<"ja" | "zh" | "en">("ja");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("paypay");
  const [ordering, setOrdering] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const l = t[lang];

  useEffect(() => {
    setCart(getCart());
  }, []);

  const total = getCartTotal(cart);

  async function handleOrder() {
    if (!name || !address || !phone) {
      setError(l.required);
      return;
    }
    setOrdering(true);
    setError("");

    const id = generateOrderId();

    try {
      const { error: dbError } = await supabase
        .from("orders")
        .insert({
          id,
          items: cart.map((c) => ({ id: c.id, name: c.name, price: c.price, quantity: c.quantity })),
          total,
          payment_method: paymentMethod,
          customer_name: name,
          customer_address: address,
          customer_phone: phone,
        });

      if (dbError) throw dbError;

      // Send LINE notification
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: id,
          total,
          customerName: name,
          paymentMethod,
          items: cart.map((c) => `${c.name} x${c.quantity}`),
        }),
      }).catch(() => {}); // Don't block order if notification fails

      setOrderId(id);
      setDone(true);
      clearCart();
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setOrdering(false);
    }
  }

  // Order Complete Screen
  if (done) {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <div className="text-4xl text-green-500 mb-3">&#10003;</div>
            <h2 className="text-xl font-bold mb-1">{l.orderComplete}</h2>
            <div className="bg-gray-100 rounded-xl py-3 px-4 mt-3 mb-4">
              <p className="text-xs text-gray-400">{l.orderId}</p>
              <p className="text-2xl font-black tracking-wider mt-1">{orderId}</p>
            </div>
            <div className="bg-gray-100 rounded-xl py-3 px-4 mb-4">
              <p className="text-xs text-gray-400">{l.total}</p>
              <p className="text-2xl font-black text-red-600 mt-1">{l.yen}{total.toLocaleString()}</p>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mt-4">
            <h3 className="font-bold text-sm mb-3">{l.payment}: {l[paymentMethod as keyof typeof l]}</h3>

            {paymentMethod === "paypay" && (
              <div className="text-center">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 mb-3">
                  <p className="text-gray-400 text-sm">PayPay QR</p>
                  <p className="text-xs text-gray-300 mt-1">（QR画像をここに設定）</p>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{l.paypayGuide}</p>
              </div>
            )}

            {paymentMethod === "wechat" && (
              <div className="text-center">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 mb-3">
                  <p className="text-gray-400 text-sm">WeChat QR</p>
                  <p className="text-xs text-gray-300 mt-1">（QR画像をここに設定）</p>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{l.wechatGuide}</p>
              </div>
            )}

            {paymentMethod === "bank" && (
              <div>
                <div className="bg-blue-50 rounded-xl p-4 mb-3">
                  <pre className="text-sm whitespace-pre-wrap">{l.bankInfo}</pre>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{l.bankGuide}</p>
              </div>
            )}

            <div className="bg-yellow-50 rounded-xl p-4 mt-4">
              <p className="text-sm text-gray-700 leading-relaxed">{l.confirm}</p>
            </div>

            <a
              href={`https://lin.ee/wuKhILR`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[#06C755] text-white text-center py-4 rounded-xl font-bold text-sm mt-4"
            >
              {l.lineConfirm}
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Cart is empty</p>
        <a href="/" className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm">&#8592;</a>
      </div>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm flex items-center justify-between px-4 py-3">
        <a href="/cart" className="text-sm text-gray-600">&#8592; {l.back}</a>
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

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2">
              <img src={item.image} alt="" className="w-12 h-12 object-cover rounded-lg" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{item.name}</p>
                <p className="text-xs text-gray-400">x{item.quantity}</p>
              </div>
              <p className="text-sm font-bold">{l.yen}{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
          <div className="border-t mt-2 pt-3 flex items-center justify-between">
            <span className="font-bold">{l.total}</span>
            <span className="text-xl font-black text-red-600">{l.yen}{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-sm mb-3">{l.customerInfo}</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder={l.nameEx}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm"
            />
            <textarea
              placeholder={l.addressEx}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full border rounded-xl px-4 py-3 text-sm"
            />
            <input
              type="tel"
              placeholder={l.phoneEx}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-sm mb-3">{l.payment}</h2>
          <div className="space-y-2">
            {[
              { key: "paypay", color: "bg-red-50 border-red-200", icon: "P", accent: "text-red-600" },
              { key: "wechat", color: "bg-green-50 border-green-200", icon: "W", accent: "text-green-600" },
              { key: "bank", color: "bg-blue-50 border-blue-200", icon: "B", accent: "text-blue-600" },
            ].map((pm) => (
              <button
                key={pm.key}
                type="button"
                onClick={() => setPaymentMethod(pm.key)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition ${
                  paymentMethod === pm.key ? pm.color : "border-gray-100"
                }`}
              >
                <span className={`w-8 h-8 rounded-full ${pm.color} flex items-center justify-center font-bold text-sm ${pm.accent}`}>
                  {pm.icon}
                </span>
                <span className="font-medium text-sm">{l[pm.key as keyof typeof l]}</span>
                {paymentMethod === pm.key && (
                  <span className="ml-auto text-green-500">&#10003;</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>

      {/* Fixed Bottom */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg px-4 py-4 z-50">
        <button
          onClick={handleOrder}
          disabled={ordering}
          className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50"
        >
          {ordering ? l.ordering : `${l.order} - ${l.yen}${total.toLocaleString()}`}
        </button>
      </div>
    </main>
  );
}
