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
  { value: "all",         ja: "すべて",     zh: "全部",   en: "All" },
  { value: "clothes",     ja: "服",          zh: "服装",   en: "Clothes" },
  { value: "bags",        ja: "バッグ",      zh: "包包",   en: "Bags" },
  { value: "dolls",       ja: "ぬいぐるみ",  zh: "玩偶",   en: "Dolls" },
  { value: "accessories", ja: "アクセサリー", zh: "饰品",   en: "Accessories" },
  { value: "goods",       ja: "雑貨",        zh: "杂货",   en: "Goods" },
];

const t = {
  ja: {
    brand: "好好",
    brandSub: "HaoHao",
    tagline: "中国発のかわいいを、あなたへ",
    heroSub: "現地スタッフが厳選・検品済み",
    new: "NEW",
    yen: "¥",
    noProducts: "商品を準備中です...",
    line: "LINEで相談する",
    lineDesc: "在庫確認・ご質問はお気軽に",
    whyTitle: "安心してお買い物できる理由",
    why1title: "現地の可愛いを日本へ",
    why1desc: "日本ではなかなか手に入らない、中国の文化や日常に根ざした可愛いアイテムを現地から直接お届けします。",
    why2title: "現地メンバーが厳選した本物だけをお届け",
    why2desc: "低価格競争に巻き込まれた粗悪品とは一線を画す、品質・梱包・配送にこだわった商品だけを取り扱っています。",
    why3title: "中国製＝高品質",
    why3desc: "世界の名だたるブランドも中国で製造されています。私たちは品質を確認した検品済みの商品のみをお届けします。",
    sold: "人が購入",
    fewLeft: "残りわずか",
    pickup: "おすすめ",
    viewAll: "もっと見る",
    cart: "カート",
    cuteFromChina: "Cute from China",
  },
  zh: {
    brand: "好好",
    brandSub: "HaoHao",
    tagline: "中国好物，精选直达日本",
    heroSub: "当地员工精选・已质检",
    new: "新品",
    yen: "¥",
    noProducts: "商品准备中...",
    line: "LINE咨询",
    lineDesc: "库存确认·问题咨询",
    whyTitle: "放心购物的理由",
    why1title: "将中国可爱带到日本",
    why1desc: "日本难以入手的、根植于中国文化与日常的可爱单品，由当地直接为您配送。",
    why2title: "当地成员精选，只配送真品",
    why2desc: "我们与低价竞争的劣质品划清界限，只精选品质、包装、配送均有保障的商品。",
    why3title: "中国制造=高品质",
    why3desc: "众多世界知名品牌也在中国生产。我们只配送经过质检、品质有保障的商品。",
    sold: "人已购买",
    fewLeft: "库存紧张",
    pickup: "精选",
    viewAll: "查看全部",
    cart: "购物车",
    cuteFromChina: "Cute from China",
  },
  en: {
    brand: "好好",
    brandSub: "HaoHao",
    tagline: "Cute finds from China, just for you",
    heroSub: "Handpicked & inspected by our local staff",
    new: "NEW",
    yen: "¥",
    noProducts: "Products coming soon...",
    line: "Contact via LINE",
    lineDesc: "Stock check & inquiries welcome",
    whyTitle: "Why shop with us",
    why1title: "Cute from China, to you",
    why1desc: "Hard-to-find items rooted in Chinese culture and daily life — delivered straight from the source to Japan.",
    why2title: "Handpicked by locals. Only the real thing.",
    why2desc: "We're not competing on price — we're competing on quality. Every item is carefully selected for quality, packaging, and reliable delivery.",
    why3title: "Made in China = Quality",
    why3desc: "The world's top brands manufacture in China. We deliver only inspected, quality-verified products.",
    sold: "sold",
    fewLeft: "Few left",
    pickup: "PICK UP",
    viewAll: "View all",
    cart: "Cart",
    cuteFromChina: "Cute from China",
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
  function getSoldCount(id: string) { return (seededRandom(id) % 180) + 20; }
  function getRating(id: string) { return (4.0 + (seededRandom(id + "r") % 10) / 10).toFixed(1); }
  function isFewLeft(id: string) { return seededRandom(id + "stock") % 5 === 0; }

  if (loading) {
    return (
      <main className="min-h-screen" style={{ background: "linear-gradient(135deg, #FDF0F5 0%, #F5EEF8 100%)" }}>
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur px-4 py-3">
          <div className="h-6 bg-pink-100 rounded-full w-24 animate-pulse" />
        </header>
        <div className="px-4 pt-4 grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden animate-pulse">
              <div className="w-full aspect-square bg-pink-50" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-pink-50 rounded-full w-3/4" />
                <div className="h-3 bg-pink-50 rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24 text-gray-800" style={{ background: "linear-gradient(135deg, #FDF0F5 0%, #F5EEF8 100%)" }}>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100">
        <div className="flex items-center justify-between px-4 py-3">

          {/* Logo */}
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black" style={{ color: "#C9637A" }}>好好</span>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 leading-none">HAOHAO</p>
              <p className="text-[8px] text-gray-300 leading-none">Cute from China</p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <a href="/cart" className="relative flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-pink-200 text-pink-500">
              🛒 {l.cart}
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold" style={{ background: "#C9637A" }}>
                  {cartCount}
                </span>
              )}
            </a>
            <div className="flex gap-0.5 text-[10px] bg-pink-50 px-0.5 py-0.5 rounded-full">
              {(["ja", "zh", "en"] as const).map(code => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className="px-2 py-1 rounded-full transition font-bold"
                  style={lang === code ? { background: "#C9637A", color: "white" } : { color: "#aaa" }}
                >
                  {code === "ja" ? "JP" : code === "zh" ? "CN" : "EN"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition"
              style={activeCategory === cat.value
                ? { background: "#C9637A", color: "white" }
                : { background: "white", color: "#C9637A", border: "1px solid #f0b8c8" }}
            >
              {cat[lang]}
            </button>
          ))}
        </div>
      </header>

      {/* ブランドバナー（常時表示） */}
      <section className="px-4 pt-4">
        <div className="relative rounded-3xl overflow-hidden shadow-lg">
          <img
            src="/hero-bg.png"
            alt="HaoHao"
            className="w-full object-cover object-top"
            style={{ maxHeight: 200 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <p className="text-lg font-black">{l.tagline}</p>
            <p className="text-xs opacity-75 mt-0.5">{l.heroSub}</p>
          </div>
        </div>
      </section>

      {/* おすすめ商品ヒーロー */}
      {featured && featured.images?.[0] && (
        <section className="px-4 pt-3">
          <a href={`/product/${featured.slug || featured.id}`} className="block relative rounded-3xl overflow-hidden shadow-md">
            <img src={featured.images[0]} alt={featured.name_ja || featured.name} className="w-full aspect-[4/3] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span className="text-white text-[10px] font-bold px-3 py-1 rounded-full" style={{ background: "rgba(201,99,122,0.8)" }}>
                ✨ {l.pickup}
              </span>
              <h2 className="text-white text-xl font-bold mt-2">{featured.name_ja || featured.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                {(featured.sale_price || featured.price) && (
                  <span className="text-white text-lg font-black">¥{(featured.sale_price || featured.price).toLocaleString()}</span>
                )}
                <span className="text-white/70 text-xs">★ {getRating(featured.id)} · {getSoldCount(featured.id)}{l.sold}</span>
              </div>
            </div>
          </a>
        </section>
      )}

      {/* Trust bar */}
      <section className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {[
            { icon: "✅", text: l.why1title },
            { icon: "🌸", text: l.why2title },
            { icon: "⭐", text: l.why3title },
          ].map((item, i) => (
            <div key={i} className="flex-shrink-0 flex items-center gap-1.5 bg-white rounded-full px-3 py-2 shadow-sm text-xs border border-pink-100">
              <span>{item.icon}</span>
              <span className="text-gray-600">{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      {filtered.length > 0 ? (
        <section className="px-4 pt-5">
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p, index) => {
              if (index === 0 && activeCategory === "all" && featured) return null;
              const fewLeft = isFewLeft(p.id);
              return (
                <a
                  key={p.id}
                  href={`/product/${p.slug || p.id}`}
                  className="block bg-white rounded-3xl overflow-hidden shadow-sm active:scale-[0.97] transition border border-pink-50"
                >
                  <div className="relative">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name_ja || p.name} className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center text-4xl" style={{ background: "linear-gradient(135deg, #FDE8F0, #EDE8F8)" }}>
                        🎀
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {isNew(p.created_at) && (
                        <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#C9637A" }}>NEW</span>
                      )}
                      {fewLeft && (
                        <span className="bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">残りわずか</span>
                      )}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold truncate text-gray-700">{p.name_ja || p.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs" style={{ color: "#f0a0b8" }}>★</span>
                      <span className="text-xs text-gray-400">{getRating(p.id)}</span>
                      <span className="text-xs text-gray-200 mx-0.5">|</span>
                      <span className="text-xs text-gray-400">{getSoldCount(p.id)}{l.sold}</span>
                    </div>
                    {(p.sale_price || p.price) && (
                      <p className="text-base font-black mt-1" style={{ color: "#C9637A" }}>
                        ¥{(p.sale_price || p.price).toLocaleString()}
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
          <p className="text-4xl mb-3">🎀</p>
          <p className="text-gray-400 text-sm">{l.noProducts}</p>
        </div>
      )}

      {/* Why Us */}
      <section className="px-4 pt-10">
        <h2 className="text-base font-bold mb-4 text-gray-700">{l.whyTitle}</h2>
        <div className="space-y-3">
          {[
            { icon: "✅", color: "#E8F5E9", textColor: "#4CAF50", title: l.why1title, desc: l.why1desc },
            { icon: "🌸", color: "#FDE8F0", textColor: "#C9637A", title: l.why2title, desc: l.why2desc },
            { icon: "⭐", color: "#EDE8F8", textColor: "#8B6DB5", title: l.why3title, desc: l.why3desc },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-pink-50">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-base"
                  style={{ background: item.color }}>
                  {item.icon}
                </span>
                <div>
                  <p className="font-bold text-sm text-gray-700">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SNS Links */}
      <section className="px-4 pt-8 space-y-3">
        <a href="https://line.me/R/ti/p/@143xkgim" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-2xl p-4 text-white shadow-md"
          style={{ background: "#06C755" }}>
          <span className="text-2xl">💬</span>
          <div>
            <p className="font-bold text-sm">{l.line}</p>
            <p className="text-xs opacity-80">{l.lineDesc}</p>
          </div>
        </a>

        <div className="grid grid-cols-4 gap-2">
          {[
            { href: "https://www.instagram.com/haohao_cute_from_china/", icon: "📷", label: "Instagram" },
            { href: "https://www.tiktok.com/@haohaoselect", icon: "🎵", label: "TikTok" },
            { href: "https://www.threads.com/@haohao_cute_from_china", icon: "🧵", label: "Threads" },
            { href: "https://x.com/YuHa583836", icon: "𝕏", label: "X" },
          ].map(sns => (
            <a key={sns.label} href={sns.href} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 bg-white rounded-2xl py-3 shadow-sm border border-pink-50">
              <span className="text-xl">{sns.icon}</span>
              <span className="text-[10px] text-gray-400">{sns.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="text-center mt-10 pb-4">
        <p className="text-xl font-black" style={{ color: "#C9637A" }}>好好</p>
        <p className="text-xs text-gray-300 tracking-widest">HAOHAO · Cute from China</p>
      </div>
    </main>
  );
}
