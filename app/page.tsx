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
  features: string | null;
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
    heroSub: "現地スタッフが厳選・検品済み",
    new: "NEW",
    yen: "¥",
    noProducts: "商品を準備中です...",
    line: "LINEで問い合わせ",
    lineDesc: "在庫確認・ご質問はこちら",
    whyTitle: "安心してお買い物できる理由",
    why1title: "現地で検品済み",
    why1desc: "中国在住のスタッフが一点ずつ実物を確認。不良品はその場で返品するから、届くのは合格品だけ。",
    why2title: "格安通販との違い",
    why2desc: "格安サイトで問題になっている粗悪品や危険な梱包材。私たちは信頼できる店舗からのみ仕入れ、品質を保証します。",
    why3title: "中国製＝高品質",
    why3desc: "世界の一流ブランドも中国で製造。良い工場の製品は品質が高い。私たちはその\"良い店\"だけを厳選しています。",
    sold: "人が購入",
    fewLeft: "残りわずか",
    pickup: "PICK UP",
    viewAll: "すべて見る",
  },
  zh: {
    brand: "Trend Select",
    tagline: "中国热门好物，直达日本",
    heroSub: "当地员工精选・已质检",
    new: "新品",
    yen: "¥",
    noProducts: "商品准备中...",
    line: "LINE咨询",
    lineDesc: "库存确认·问题咨询",
    whyTitle: "放心购物的理由",
    why1title: "当地验货",
    why1desc: "中国当地员工逐件检查实物，不良品当场退货，只发合格商品。",
    why2title: "与廉价平台的区别",
    why2desc: "廉价平台常出现劣质品和危险包装。我们只从可信店铺进货，保证品质。",
    why3title: "中国制造=高品质",
    why3desc: "世界一线品牌也在中国生产。好工厂的产品质量很高，我们只精选\"好店\"。",
    sold: "人已购买",
    fewLeft: "库存紧张",
    pickup: "精选",
    viewAll: "查看全部",
  },
  en: {
    brand: "Trend Select",
    tagline: "Trending from China, delivered to Japan",
    heroSub: "Handpicked & inspected by our local staff",
    new: "NEW",
    yen: "¥",
    noProducts: "Products coming soon...",
    line: "Contact via LINE",
    lineDesc: "Stock check & inquiries",
    whyTitle: "Why you can shop with confidence",
    why1title: "Inspected on-site",
    why1desc: "Our staff in China checks every item in person. Defective products are returned on the spot — only approved items are shipped.",
    why2title: "Unlike cheap platforms",
    why2desc: "Cheap platforms are known for poor quality and unsafe packaging. We source only from trusted suppliers with guaranteed quality.",
    why3title: "Made in China = Quality",
    why3desc: "Top global brands manufacture in China. Good factories produce great products — we handpick only the best.",
    sold: "sold",
    fewLeft: "Few left",
    pickup: "PICK UP",
    viewAll: "View all",
  },
};

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
        .select("id, name, price, images, category, features, created_at")
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

  const featured = products.length > 0 ? products[0] : null;

  function isNew(dateStr: string) {
    return Date.now() - new Date(dateStr).getTime() < 3 * 24 * 60 * 60 * 1000;
  }

  function getSoldCount(id: string) {
    return (seededRandom(id) % 180) + 20;
  }

  function getRating(id: string) {
    return (4.0 + (seededRandom(id + "r") % 10) / 10).toFixed(1);
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

      {/* Hero: Featured Product */}
      {featured && featured.images && featured.images[0] ? (
        <section className="px-4 pt-4">
          <a href={`/product/${featured.id}`} className="block relative rounded-2xl overflow-hidden">
            <img
              src={featured.images[0]}
              alt={featured.name}
              className="w-full aspect-[4/3] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span className="bg-white/20 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full">
                {l.pickup}
              </span>
              <h2 className="text-white text-xl font-bold mt-2">{featured.name}</h2>
              {featured.features && (
                <p className="text-white/80 text-xs mt-1 line-clamp-1">{featured.features}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                {featured.price && (
                  <span className="text-white text-lg font-black">
                    {l.yen}{featured.price.toLocaleString()}
                  </span>
                )}
                <span className="text-white/60 text-xs">
                  &#9733; {getRating(featured.id)} · {getSoldCount(featured.id)}{l.sold}
                </span>
              </div>
            </div>
          </a>
        </section>
      ) : (
        <section className="px-4 pt-4">
          <div className="relative bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400 rounded-2xl p-6 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
            <p className="text-[10px] font-bold tracking-widest opacity-70 mb-2">TREND SELECT</p>
            <p className="text-xl font-bold leading-tight">{l.tagline}</p>
            <p className="text-sm opacity-80 mt-1">{l.heroSub}</p>
          </div>
        </section>
      )}

      {/* Trust Bar (compact, before products) */}
      <section className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <div className="flex-shrink-0 flex items-center gap-1.5 bg-white rounded-full px-3 py-2 shadow-sm text-xs">
            <span className="text-green-500 font-bold">&#10003;</span>
            <span className="text-gray-600">{l.why1title}</span>
          </div>
          <div className="flex-shrink-0 flex items-center gap-1.5 bg-white rounded-full px-3 py-2 shadow-sm text-xs">
            <span className="text-green-500 font-bold">&#10003;</span>
            <span className="text-gray-600">{l.why2title}</span>
          </div>
          <div className="flex-shrink-0 flex items-center gap-1.5 bg-white rounded-full px-3 py-2 shadow-sm text-xs">
            <span className="text-green-500 font-bold">&#10003;</span>
            <span className="text-gray-600">{l.why3title}</span>
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
            {filtered.map((p, index) => {
              // Skip first product if it's featured and showing "all"
              if (index === 0 && activeCategory === "all" && featured) return null;
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
                      <img src={p.images[0]} alt={p.name} className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-300 text-sm">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {isNew(p.created_at) && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{l.new}</span>
                      )}
                      {fewLeft && (
                        <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{l.fewLeft}</span>
                      )}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500 text-xs">&#9733;</span>
                      <span className="text-xs text-gray-500">{rating}</span>
                      <span className="text-xs text-gray-300 mx-0.5">|</span>
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
        <a href="/about" className="block text-center text-sm text-blue-500 mt-4">{l.viewAll} &#8594;</a>
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
