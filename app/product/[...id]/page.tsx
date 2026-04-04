"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useCart } from "../../context/CartContext";

const t = {
  ja: {
    back: "戻る",
    shipping: "送料込み",
    noPrice: "価格未設定",
    trendTitle: "人気の理由",
    sceneTitle: "こんなシーンに",
    featuresTitle: "商品の特徴",
    reviewTitle: "レビュー",
    concernTitle: "注意点",
    safeTitle: "安心ポイント",
    safe1: "中国製＝高品質。検品済みのみお届け",
    safe2: "安全な梱包材で丁寧に発送",
    safe3: "不良品は返品・交換対応",
    addCart: "カートに追加する",
    added: "カートに追加しました ✓",
    new: "NEW",
    lineBtn: "LINEで質問する",
  },
  zh: {
    back: "返回",
    shipping: "含运费",
    noPrice: "价格待定",
    trendTitle: "为什么受欢迎",
    sceneTitle: "使用场景",
    featuresTitle: "商品特点",
    reviewTitle: "买家评价",
    concernTitle: "注意事项",
    safeTitle: "放心购物",
    safe1: "中国制造=高品质，仅配送经质检商品",
    safe2: "安全包装，精心发货",
    safe3: "明显不良品支持退换货",
    addCart: "加入购物车",
    added: "已加入购物车 ✓",
    new: "新品",
    lineBtn: "LINE咨询",
  },
  en: {
    back: "Back",
    shipping: "Shipping included",
    noPrice: "Price TBD",
    trendTitle: "Why it's popular",
    sceneTitle: "Perfect for",
    featuresTitle: "Details",
    reviewTitle: "Reviews",
    concernTitle: "Note",
    safeTitle: "Our promise",
    safe1: "Made in China = Quality. Inspected items only.",
    safe2: "Safe packaging, carefully shipped",
    safe3: "Defective items: returns & exchanges",
    addCart: "Add to cart",
    added: "Added to cart ✓",
    new: "NEW",
    lineBtn: "Ask via LINE",
  },
};

export default function ProductPage() {
  const params = useParams();
  const idArr = Array.isArray(params.id) ? params.id : [params.id];
  const id = idArr.join("/");

  const [lang, setLang] = useState<"ja" | "zh" | "en">("ja");
  const l = t[lang];
  const [product, setProduct] = useState<any>(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const { addItem, count } = useCart();
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then((list: any[]) => {
        const found = list.find(p => p.slug === id || p.id === id);
        setProduct(found || null);
      });
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addItem({
      id: product.id,
      nameJa: product.name_ja || product.name || product.id,
      salePrice: product.sale_price || product.price || 0,
      image: product.images?.[0] || "",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FDF8F5" }}>
        <div className="w-7 h-7 border-2 border-rose-200 border-t-rose-400 rounded-full animate-spin" />
      </div>
    );
  }

  const images: string[] = product.images || [];
  const price = product.sale_price || product.price;
  const name = product.name_ja || product.name;
  const tr = product.translations?.[lang] || {};
  const trendReason = tr.trend_reason || product.trend_reason;
  const useScene = tr.use_scene || product.use_scene;
  const goodReview = tr.good_review || product.good_review;
  const badReview = product.bad_review;
  const features = tr.features || product.features;

  const isNew = product.created_at &&
    (Date.now() - new Date(product.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000;

  return (
    <main className="max-w-md mx-auto min-h-screen pb-28" style={{ background: "#FDF8F5" }}>

      {/* ヘッダー */}
      <div className="flex justify-between items-center px-4 py-3">
        <a href="/" className="text-sm text-gray-400 hover:text-gray-700 transition">
          ← {l.back}
        </a>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-full p-0.5 text-[10px] shadow-sm border border-gray-100">
            {(["ja", "zh", "en"] as const).map(code => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`px-2.5 py-1 rounded-full font-semibold transition ${lang === code ? "text-white shadow-sm" : "text-gray-400"}`}
                style={lang === code ? { background: "#C9637A" } : {}}
              >
                {code === "ja" ? "JP" : code === "zh" ? "CN" : "EN"}
              </button>
            ))}
          </div>
          <a href="/cart" className="relative">
            <span className="text-xl">🛒</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center" style={{ background: "#C9637A" }}>
                {count}
              </span>
            )}
          </a>
        </div>
      </div>

      {/* メイン画像 */}
      <div className="relative mx-4 rounded-3xl overflow-hidden shadow-md bg-white"
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          if (touchStartX.current === null || images.length < 2) return;
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (diff > 40) setImgIndex(i => (i + 1) % images.length);
          else if (diff < -40) setImgIndex(i => (i - 1 + images.length) % images.length);
          touchStartX.current = null;
        }}
      >
        {images.length > 0 ? (
          <img
            src={images[imgIndex]}
            alt={name}
            className="w-full aspect-square object-cover transition-opacity duration-200"
          />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center text-6xl" style={{ background: "#FDE8F0" }}>🎀</div>
        )}
        {isNew && (
          <span className="absolute top-3 left-3 text-white text-[10px] font-bold px-3 py-1 rounded-full" style={{ background: "#C9637A" }}>
            {l.new}
          </span>
        )}
      </div>

      {/* サムネイル */}
      {images.length > 1 && (
        <div className="flex gap-2 px-4 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setImgIndex(i)}
              className="flex-shrink-0 rounded-xl overflow-hidden transition-all"
              style={{
                width: 60, height: 60,
                border: i === imgIndex ? "2px solid #C9637A" : "2px solid transparent",
                opacity: i === imgIndex ? 1 : 0.6,
              }}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* 商品名・価格 */}
      <div className="mx-4 mt-4 bg-white rounded-3xl p-5 shadow-sm">
        {product.category && (
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#C9637A" }}>
            {product.category}
          </span>
        )}
        <h1 className="text-xl font-bold mt-1 text-gray-900 leading-snug">{name}</h1>
        {price ? (
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black" style={{ color: "#C9637A" }}>
              ¥{price.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400">{l.shipping}</span>
          </div>
        ) : (
          <p className="text-gray-400 mt-2 text-sm">{l.noPrice}</p>
        )}
      </div>

      {/* コンテンツカード群 */}
      <div className="mx-4 mt-3 space-y-3">

        {/* 人気の理由 */}
        {trendReason && (
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🔥</span>
              <h2 className="font-bold text-gray-800 text-sm">{l.trendTitle}</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{trendReason}</p>
          </div>
        )}

        {/* 使用シーン */}
        {useScene && (
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">✨</span>
              <h2 className="font-bold text-gray-800 text-sm">{l.sceneTitle}</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{useScene}</p>
          </div>
        )}

        {/* 特徴 */}
        {features && (
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📦</span>
              <h2 className="font-bold text-gray-800 text-sm">{l.featuresTitle}</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{features}</p>
          </div>
        )}

        {/* 口コミ */}
        {(goodReview || badReview) && (
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💬</span>
              <h2 className="font-bold text-gray-800 text-sm">{l.reviewTitle}</h2>
            </div>
            {goodReview && (
              <div className="rounded-2xl p-4 mb-3" style={{ background: "#FEF0F3" }}>
                <div className="flex gap-0.5 mb-2">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className="text-sm" style={{ color: "#C9637A" }}>★</span>
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{goodReview}</p>
              </div>
            )}
            {badReview && (
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-[11px] font-semibold text-gray-400 mb-1">{l.concernTitle}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{badReview}</p>
              </div>
            )}
          </div>
        )}

        {/* LINEバナー */}
        <a
          href="https://line.me/R/ti/p/@143xkgim"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-white text-sm font-bold shadow-sm"
          style={{ background: "#06C755" }}
        >
          <svg width="20" height="20" viewBox="0 0 40 40" fill="white">
            <path d="M20 4C11.16 4 4 10.27 4 18c0 5.14 3.09 9.64 7.74 12.24-.34 1.27-1.22 4.59-1.4 5.31-.22.89.33.88.69.64.29-.19 4.55-3.01 6.4-4.23.84.12 1.7.19 2.57.19 8.84 0 16-6.27 16-14S28.84 4 20 4z"/>
          </svg>
          {l.lineBtn}
        </a>

        {/* 安心ポイント */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 text-sm mb-3">{l.safeTitle}</h2>
          <div className="space-y-2.5">
            {[l.safe1, l.safe2, l.safe3].map((text, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-sm font-bold mt-0.5" style={{ color: "#4CAF50" }}>✓</span>
                <span className="text-sm text-gray-500 leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 固定CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 py-3 bg-white/95 backdrop-blur border-t border-gray-100">
        <button
          onClick={handleAdd}
          className="w-full py-4 rounded-2xl font-bold text-sm transition-all duration-200 shadow-sm"
          style={{
            background: added ? "#16a34a" : "#1a1a1a",
            color: "#fff",
          }}
        >
          {added ? l.added : l.addCart}
        </button>
      </div>

    </main>
  );
}
