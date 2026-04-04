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
    added: "追加しました ✓",
    new: "NEW",
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
    added: "已加入 ✓",
    new: "新品",
  },
  en: {
    back: "Back",
    shipping: "Free shipping",
    noPrice: "Price TBD",
    trendTitle: "Why it's trending",
    sceneTitle: "Perfect for",
    featuresTitle: "Details",
    reviewTitle: "Reviews",
    concernTitle: "Note",
    safeTitle: "Our promise",
    safe1: "Made in China = Quality. Inspected items only.",
    safe2: "Safe packaging, carefully shipped",
    safe3: "Defective items: returns & exchanges",
    addCart: "Add to cart",
    added: "Added ✓",
    new: "NEW",
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
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
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

  const prevImg = () => setImgIndex(i => (i - 1 + images.length) % images.length);
  const nextImg = () => setImgIndex(i => (i + 1) % images.length);

  return (
    <main className="max-w-md mx-auto bg-white min-h-screen pb-28">

      {/* ヘッダー */}
      <div className="flex justify-between items-center px-4 py-3 bg-white">
        <a href="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-black transition">
          ← {l.back}
        </a>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-full p-0.5 text-[11px]">
            {(["ja", "zh", "en"] as const).map(code => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`px-2.5 py-1 rounded-full font-medium transition ${lang === code ? "bg-white text-black shadow-sm" : "text-gray-400"}`}
              >
                {code === "ja" ? "JP" : code === "zh" ? "CN" : "EN"}
              </button>
            ))}
          </div>
          <a href="/cart" className="relative">
            <span className="text-xl">🛒</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </a>
        </div>
      </div>

      {/* 画像スライダー */}
      <div className="relative bg-gray-50"
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          if (touchStartX.current === null) return;
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (diff > 40) nextImg();
          else if (diff < -40) prevImg();
          touchStartX.current = null;
        }}
      >
        {images.length > 0 ? (
          <img src={images[imgIndex]} alt={name} className="w-full aspect-square object-cover" />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center text-6xl">🎀</div>
        )}

        {isNew && (
          <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            {l.new}
          </span>
        )}

        {images.length > 1 && (
          <>
            <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full w-9 h-9 flex items-center justify-center shadow-md text-gray-700 text-lg font-light">‹</button>
            <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full w-9 h-9 flex items-center justify-center shadow-md text-gray-700 text-lg font-light">›</button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={() => setImgIndex(i)}
                  className={`rounded-full transition-all ${i === imgIndex ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 商品名・価格ブロック */}
      <div className="px-4 pt-5 pb-4 border-b border-gray-100">
        {product.category && (
          <span className="inline-block text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-2">
            {product.category}
          </span>
        )}
        <h1 className="text-xl font-bold leading-tight text-gray-900">{name}</h1>

        <div className="mt-3 flex items-center justify-between">
          {price ? (
            <div>
              <span className="text-3xl font-black" style={{ color: "#C9637A" }}>
                ¥{price.toLocaleString()}
              </span>
              <span className="text-xs text-gray-400 ml-2">{l.shipping}</span>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">{l.noPrice}</span>
          )}
        </div>
      </div>

      {/* コンテンツセクション */}
      <div className="divide-y divide-gray-100">

        {/* 人気の理由 */}
        {trendReason && (
          <div className="px-4 py-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">🔥</span>
              <h2 className="text-sm font-bold text-gray-800">{l.trendTitle}</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{trendReason}</p>
          </div>
        )}

        {/* 使用シーン */}
        {useScene && (
          <div className="px-4 py-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">✨</span>
              <h2 className="text-sm font-bold text-gray-800">{l.sceneTitle}</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{useScene}</p>
          </div>
        )}

        {/* 商品の特徴 */}
        {features && (
          <div className="px-4 py-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">📦</span>
              <h2 className="text-sm font-bold text-gray-800">{l.featuresTitle}</h2>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{features}</p>
          </div>
        )}

        {/* 口コミ */}
        {(goodReview || badReview) && (
          <div className="px-4 py-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">💬</span>
              <h2 className="text-sm font-bold text-gray-800">{l.reviewTitle}</h2>
            </div>
            {goodReview && (
              <div className="bg-rose-50 rounded-2xl p-4 mb-3">
                <div className="flex gap-0.5 mb-2">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} style={{ color: "#C9637A" }}>★</span>
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{goodReview}</p>
              </div>
            )}
            {badReview && (
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs font-semibold text-gray-400 mb-1">{l.concernTitle}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{badReview}</p>
              </div>
            )}
          </div>
        )}

        {/* 安心ポイント */}
        <div className="px-4 py-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🛡️</span>
            <h2 className="text-sm font-bold text-gray-800">{l.safeTitle}</h2>
          </div>
          <div className="space-y-2.5">
            {[l.safe1, l.safe2, l.safe3].map((text, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-green-500 text-sm mt-0.5">✓</span>
                <span className="text-sm text-gray-500 leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 固定CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-4 py-3">
        <button
          onClick={handleAdd}
          className="w-full py-4 rounded-2xl font-bold text-sm transition-all duration-200"
          style={{
            background: added ? "#16a34a" : "#111111",
            color: "#fff",
            transform: added ? "scale(0.98)" : "scale(1)",
          }}
        >
          {added ? l.added : l.addCart}
        </button>
      </div>

    </main>
  );
}
