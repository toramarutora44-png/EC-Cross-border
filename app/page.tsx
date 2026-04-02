"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getCart, getCartCount } from "@/lib/cart";

type Product = {
  id: string;
  name: string;
  price: number | null;
  images: string[] | null;
  category: string | null;
  created_at: string;
};

const CATEGORIES = [
  { value: "all", ja: "すべて", zh: "全部", en: "All" },
  { value: "clothes", ja: "服", zh: "服装", en: "Clothes" },
  { value: "bags", ja: "バッグ", zh: "包包", en: "Bags" },
  { value: "dolls", ja: "ぬいぐるみ", zh: "玩偶", en: "Dolls" },
  { value: "accessories", ja: "アクセサリー", zh: "饰品", en: "Accessories" },
  { value: "goods", ja: "雑貨", zh: "杂货", en: "Goods" },
];

const t = {
  ja: {
    brand: "Trend Select",
    tagline: "中国で話題のアイテムを、日本へ",
    new: "NEW",
    hot: "人気",
    yen: "¥",
    noProducts: "商品を準備中です...",
    line: "LINEで問い合わせ",
    lineDesc: "在庫確認・ご質問はこちら",
    whyTitle: "なぜTrend Selectなのか",
    why1title: "現地で検品済み",
    why1desc: "中国在住のスタッフが一点ずつ実物を確認。不良品はその場で返品するから、届くのは合格品だけ。",
    why2title: "格安通販との違い",
    why2desc: "格安サイトで問題になっている粗悪品や危険な梱包材。私たちは信頼できる店舗からのみ仕入れ、品質を保証します。",
    why3title: "中国製＝高品質",
    why3desc: "世界の一流ブランドも中国で製造。良い工場の製品は品質が高い。私たちはその\"良い店\"だけを厳選しています。",
    sold: "人が購入",
    fewLeft: "残りわずか",
    viewDetail: "詳細を見る",
  },
  zh: {
    brand: "Trend Select",
    tagline: "中国热门好物，直达日本",
    new: "新品",
    hot: "热卖",
    yen: "¥",
    noProducts: "商品准备中...",
    line: "LINE咨询",
    lineDesc: "库存确认·问题咨询",
    whyTitle: "为什么选择Trend Select",
    why1title: "当地验货",
    why1desc: "中国当地员工逐件检查实物，不良品当场退货，只发合格商品。",
    why2title: "与廉价平台的区别",
    why2desc: "廉价平台常出现劣质品和危险包装。我们只从可信店铺进货，保证品质。",
    why3title: "中国制造=高品质",
    why3desc: "世界一线品牌也在中国生产。好工厂的产品质量很高，我们只精选\"好店\"。",
    sold: "人已购买",
    fewLeft: "库存紧张",
    viewDetail: "查看详情",
  },
  en: {
    brand: "Trend Select",
    tagline: "Trending from China, delivered to Japan",
    new: "NEW",
    hot: "HOT",
    yen: "¥",
    noProducts: "Products coming soon...",
    line: "Contact via LINE",
    lineDesc: "Stock check & inquiries",
    whyTitle: "Why Trend Select?",
    why1title: "Inspected on-site",
    why1desc: "Our staff in China checks every item in person. Defective products are returned on the spot — only approved items are shipped.",
    why2title: "Unlike cheap platforms",
    why2desc: "Cheap platforms are known for poor quality and unsafe packaging. We source only from trusted suppliers with guaranteed quality.",
    why3title: "Made in China = Quality",
    why3desc: "Top global brands manufacture in China. Good factories produce great products — we handpick only the best.",
    sold: "sold",
    fewLeft: "Few left",
    viewDetail: "View details",
  },
};

// Seed-based pseudo random for consistent display per product
function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export default function Home() {
  const [lang, setLang] = useState<"ja" | "zh" | "en">("ja");
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const l = t[lang];

  useEffect(() => {
    setCartCount(getCartCount(getCart()));
    function onUpdate() { setCartCount(getCartCount(getCart())); }
    window.addEventListener("cart-update", onUpdate);
    return () => window.removeEventListener("cart-update", onUpdate);
  }, []);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, images, category, created_at")
        .order("created_at", { ascending: false });
      if (data) setProducts(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  function isNew(dateStr: string) {
    return Date.now() - new Date(dateStr).getTime() < 3 * 24 * 60 * 60 * 1000;
  }

  function getSoldCount(id: string) {
    return (seededRandom(id) % 180) + 20;
  }

  function getRating(id: string) {
    const base = (seededRandom(id + "r") % 10);
    return (4.0 + base / 10).toFixed(1);
  }

  function isFewLeft(id: string) {
    return seededRandom(id + "stock") % 5 === 0;
  }

  return (
    <main className="bg-gray-50 text-black min-h-screen pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-black tracking-tight">{l.brand}</h1>
          <div className="flex items-center gap-2">
            <a href="/cart" className="relative text-xs bg-gray-100 px-3 py-1.5 rounded-full">
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </a>
          <div className="flex gap-0.5 text-[10px] bg-gray-100 px-0.5 py-0.5 rounded-full">
            {(["ja", "zh", "en"] as const).map((code) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`px-2 py-1 rounded-full transition ${
                  lang === code ? "bg-black text-white" : ""
                }`}
              >
                {code === "ja" ? "JP" : code === "zh" ? "CN" : "EN"}
              </button>
            ))}
          </div>
          </div>
        </div>
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm transition ${
                activeCategory === cat.value
                  ? "bg-black text-white font-bold"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {cat[lang]}
            </button>
          ))}
        </div>
      </header>

      {/* Hero Banner */}
      <section className="px-4 pt-4">
        <div className="relative bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400 rounded-2xl p-6 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-8 -translate-x-8" />
          <p className="text-[10px] font-bold tracking-widest opacity-70 mb-2">TREND SELECT</p>
          <p className="text-xl font-bold leading-tight">{l.tagline}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="bg-white/20 text-xs px-3 py-1 rounded-full">&#9733; 4.8</span>
            <span className="bg-white/20 text-xs px-3 py-1 rounded-full">500+ {l.sold}</span>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      {loading ? (
        <section className="px-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="w-full aspect-square bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : filtered.length > 0 ? (
        <section className="px-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p) => {
              const sold = getSoldCount(p.id);
              const rating = getRating(p.id);
              const fewLeft = isFewLeft(p.id);
              return (
                <a
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="block bg-white rounded-2xl overflow-hidden shadow-sm active:scale-[0.98] transition"
                >
                  <div className="relative">
                    {p.images && p.images[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full aspect-square object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-300 text-sm">
                        No Image
                      </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {isNew(p.created_at) && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {l.new}
                        </span>
                      )}
                      {fewLeft && (
                        <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {l.fewLeft}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    {/* Rating + Sold */}
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500 text-xs">&#9733;</span>
                      <span className="text-xs text-gray-500">{rating}</span>
                      <span className="text-xs text-gray-300 mx-1">|</span>
                      <span className="text-xs text-gray-400">{sold}{l.sold}</span>
                    </div>
                    {p.price && (
                      <p className="text-base font-black text-red-600 mt-1">
                        {l.yen}{p.price.toLocaleString()}
                      </p>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">{l.noProducts}</p>
        </div>
      )}

      {/* Why Us */}
      <section className="px-4 pt-10">
        <h2 className="text-base font-bold mb-4">{l.whyTitle}</h2>
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start gap-3">
              <span className="bg-green-100 text-green-700 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">&#10003;</span>
              <div>
                <p className="font-bold text-sm">{l.why1title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{l.why1desc}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start gap-3">
              <span className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">!</span>
              <div>
                <p className="font-bold text-sm">{l.why2title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{l.why2desc}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start gap-3">
              <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">&#9733;</span>
              <div>
                <p className="font-bold text-sm">{l.why3title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{l.why3desc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LINE CTA */}
      <section className="px-4 pt-8">
        <a
          href="https://lin.ee/wuKhILR"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 bg-[#06C755] text-white rounded-2xl p-4"
        >
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
            L
          </div>
          <div>
            <p className="font-bold">{l.line}</p>
            <p className="text-xs opacity-80">{l.lineDesc}</p>
          </div>
        </a>
      </section>
    </main>
  );
}
