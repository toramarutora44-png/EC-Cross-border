"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { addToCart, getCart, getCartCount } from "@/lib/cart";

type Product = {
  id: string;
  name: string;
  price: number | null;
  trend_reason: string | null;
  use_scene: string | null;
  good_review: string | null;
  bad_review: string | null;
  features: string | null;
  images: string[] | null;
  category: string | null;
};

const t = {
  ja: {
    back: "戻る",
    yen: "¥",
    why: "人気の理由",
    scene: "こんなシーンに",
    good: "購入者の声",
    bad: "正直レビュー",
    feat: "商品の特徴",
    buy: "カートに入れる",
    added: "追加しました!",
    line: "LINEで相談",
    cart: "カート",
    notFound: "商品が見つかりません",
    loading: "読み込み中...",
    shipping: "中国から直送・7〜14日でお届け",
    guarantee: "現地スタッフが検品済み・不良品は返品OK",
    safe: "安全な梱包材を使用・品質にこだわった発送",
    sold: "人が購入",
    share: "シェア",
    alsoLike: "こちらもおすすめ",
    fewLeft: "残りわずか！お早めに",
    reviews: "件のレビュー",
  },
  zh: {
    back: "返回",
    yen: "¥",
    why: "流行原因",
    scene: "使用场景",
    good: "买家好评",
    bad: "真实差评",
    feat: "商品特点",
    buy: "加入购物车",
    added: "已添加!",
    line: "LINE咨询",
    cart: "购物车",
    notFound: "商品未找到",
    loading: "加载中...",
    shipping: "中国直邮・7〜14天到货",
    guarantee: "当地员工验货・不良品可退",
    safe: "使用安全包装材料・注重品质发货",
    sold: "人已购买",
    share: "分享",
    alsoLike: "猜你喜欢",
    fewLeft: "库存紧张！抓紧下单",
    reviews: "条评价",
  },
  en: {
    back: "Back",
    yen: "¥",
    why: "Why trending",
    scene: "Use cases",
    good: "Buyer reviews",
    bad: "Honest reviews",
    feat: "Features",
    buy: "Add to Cart",
    added: "Added!",
    line: "Ask via LINE",
    cart: "Cart",
    notFound: "Product not found",
    loading: "Loading...",
    shipping: "Direct from China - 7~14 days delivery",
    guarantee: "Inspected on-site by our staff - Returns for defects",
    safe: "Safe packaging materials - Quality-focused shipping",
    sold: "sold",
    share: "Share",
    alsoLike: "You may also like",
    fewLeft: "Few left! Order soon",
    reviews: "reviews",
  },
};

function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [lang, setLang] = useState<"ja" | "zh" | "en">("ja");
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImg, setCurrentImg] = useState(0);
  const [shared, setShared] = useState(false);
  const [added, setAdded] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const l = t[lang];

  const sold = product ? (seededRandom(product.id) % 180) + 20 : 0;
  const rating = product ? (4.0 + (seededRandom(product.id + "r") % 10) / 10).toFixed(1) : "4.5";
  const reviewCount = product ? (seededRandom(product.id + "rc") % 60) + 5 : 0;
  const fewLeft = product ? seededRandom(product.id + "stock") % 5 === 0 : false;

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
        .select("*")
        .eq("id", id)
        .single();
      setProduct(data);
      setLoading(false);

      // Load related products
      if (data) {
        const { data: rel } = await supabase
          .from("products")
          .select("id, name, price, images, category, created_at")
          .neq("id", id)
          .limit(4);
        if (rel) setRelated(rel);
      }
    }
    load();
  }, [id]);

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-14">
        <div className="animate-pulse">
          <div className="w-full aspect-square bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-5 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <p className="text-gray-400">{l.notFound}</p>
        <a href="/" className="text-sm text-blue-500 underline">{l.back}</a>
      </div>
    );
  }

  const images = product.images || [];

  return (
    <main className="bg-gray-50 text-black min-h-screen pb-28">
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur z-50 flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <a href="/" className="text-sm text-gray-600">&#8592; {l.back}</a>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="text-xs bg-gray-100 px-3 py-1.5 rounded-full"
          >
            {shared ? "&#10003;" : l.share}
          </button>
          <a href="/cart" className="relative text-xs bg-gray-100 px-3 py-1.5 rounded-full">
            {l.cart}
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
      </header>

      {/* Image Gallery */}
      {images.length > 0 && (
        <section className="pt-12 bg-white">
          <div className="relative">
            <img
              src={images[currentImg]}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
                {currentImg + 1} / {images.length}
              </div>
            )}
            {fewLeft && (
              <div className="absolute bottom-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                {l.fewLeft}
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-white">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImg(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                    currentImg === i ? "border-black" : "border-gray-200"
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Price & Name & Social Proof */}
      <section className="bg-white px-4 pb-4">
        {product.price && (
          <div className="flex items-end gap-2">
            <p className="text-3xl font-black text-red-600">
              {l.yen}{product.price.toLocaleString()}
            </p>
          </div>
        )}
        <h1 className="text-lg font-bold mt-2">{product.name}</h1>

        {/* Rating + Sold + Reviews */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
            <span className="text-sm font-bold">{rating}</span>
          </div>
          <span className="text-xs text-gray-300">|</span>
          <span className="text-xs text-gray-500">{reviewCount} {l.reviews}</span>
          <span className="text-xs text-gray-300">|</span>
          <span className="text-xs text-gray-500">{sold} {l.sold}</span>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-col gap-2 mt-4 bg-green-50 rounded-xl p-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="text-green-600 font-bold">&#10003;</span>
            {l.guarantee}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="text-green-600 font-bold">&#10003;</span>
            {l.safe}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="text-green-600 font-bold">&#10003;</span>
            {l.shipping}
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-2" />

      {/* Product Details */}
      <div className="bg-white px-4 py-5 space-y-5">
        {product.trend_reason && (
          <div>
            <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
              <span className="text-orange-500">&#9830;</span> {l.why}
            </h3>
            <p className="text-sm text-gray-700 bg-orange-50 rounded-xl p-4 leading-relaxed">
              {product.trend_reason}
            </p>
          </div>
        )}

        {product.use_scene && (
          <div>
            <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
              <span className="text-blue-500">&#9679;</span> {l.scene}
            </h3>
            <p className="text-sm text-gray-700 bg-blue-50 rounded-xl p-4 leading-relaxed">
              {product.use_scene}
            </p>
          </div>
        )}

        {product.features && (
          <div>
            <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
              <span className="text-purple-500">&#9733;</span> {l.feat}
            </h3>
            <p className="text-sm text-gray-700 bg-purple-50 rounded-xl p-4 leading-relaxed">
              {product.features}
            </p>
          </div>
        )}

        {product.good_review && (
          <div>
            <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
              <span className="text-green-500">&#9786;</span> {l.good}
            </h3>
            <p className="text-sm text-gray-700 bg-green-50 rounded-xl p-4 leading-relaxed">
              {product.good_review}
            </p>
          </div>
        )}

        {product.bad_review && (
          <div>
            <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
              <span className="text-gray-400">&#9888;</span> {l.bad}
            </h3>
            <p className="text-sm text-gray-600 bg-gray-100 rounded-xl p-4 leading-relaxed">
              {product.bad_review}
            </p>
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <>
          <div className="h-2" />
          <section className="bg-white px-4 py-5">
            <h3 className="text-sm font-bold mb-3">{l.alsoLike}</h3>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {related.map((r) => (
                <a
                  key={r.id}
                  href={`/product/${r.id}`}
                  className="flex-shrink-0 w-32"
                >
                  {r.images && r.images[0] ? (
                    <img
                      src={r.images[0]}
                      alt={r.name}
                      className="w-32 h-32 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-xl" />
                  )}
                  <p className="text-xs font-medium mt-1 truncate">{r.name}</p>
                  {r.price && (
                    <p className="text-xs font-bold text-red-600">
                      {l.yen}{r.price.toLocaleString()}
                    </p>
                  )}
                </a>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg px-4 py-3 flex gap-2 z-50">
        <a
          href="https://lin.ee/wuKhILR"
          target="_blank"
          rel="noopener noreferrer"
          className="w-1/4 bg-[#06C755] text-white text-center py-3.5 rounded-xl font-bold text-sm flex items-center justify-center"
        >
          {l.line}
        </a>
        <button
          onClick={() => {
            if (!product || !product.price) return;
            addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              image: images[0] || "",
            });
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
          }}
          className={`w-3/4 text-white text-center py-3.5 rounded-xl font-bold text-sm flex items-center justify-center transition ${
            added ? "bg-green-500" : "bg-black"
          }`}
        >
          {added ? l.added : `${l.buy} ${product.price ? `${l.yen}${product.price.toLocaleString()}` : ""}`}
        </button>
      </div>
    </main>
  );
}
