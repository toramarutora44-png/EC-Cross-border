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
    sceneTitle: "こんな時に",
    featuresTitle: "商品の特徴",
    reviewTitle: "購入者の声",
    concernTitle: "気になる点",
    safeTitle: "安心ポイント",
    safe1: "中国製＝高品質。検品済みの商品のみをお届けします",
    safe2: "安全な梱包材で丁寧に発送",
    safe3: "明らかな不良品は返品・交換対応",
    addCart: "カートに追加する",
    added: "カートに追加しました",
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
    safe1: "中国制造=高品质。仅配送经质检的商品",
    safe2: "使用安全包装材料，精心发货",
    safe3: "明显不良品支持退换货",
    addCart: "加入购物车",
    added: "已加入购物车",
  },
  en: {
    back: "Back",
    shipping: "Shipping included",
    noPrice: "Price TBD",
    trendTitle: "Why it's popular",
    sceneTitle: "When to use",
    featuresTitle: "Product features",
    reviewTitle: "Customer reviews",
    concernTitle: "Things to note",
    safeTitle: "Shop with confidence",
    safe1: "Made in China = Quality. Only inspected items shipped.",
    safe2: "Carefully packed with safe materials",
    safe3: "Returns & exchanges for defective items",
    addCart: "Add to cart",
    added: "Added to cart",
  },
};

export default function ProductPage() {
  const params = useParams();
  const idArr = Array.isArray(params.id) ? params.id : [params.id];
  const id = idArr.join("/");

  const [lang, setLang] = useState<"ja" | "zh" | "en">("ja");
  const l = t[lang];

  const [product, setProduct] = useState<any>(null);
  const [filled, setFilled] = useState<any>({});
  const [imgIndex, setImgIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const { addItem, count } = useCart();

  // スワイプ検出
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(async (list: any[]) => {
        const found = list.find(p => p.id === id);
        if (!found) return setProduct(null);
        setProduct(found);

        const needsFill =
          !found.trend_reason || !found.use_scene || !found.good_review || !found.features;
        if (needsFill) {
          try {
            const res = await fetch("/api/fill", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: found.name_ja || found.name,
                category: found.category,
                trend_reason: found.trend_reason,
                use_scene: found.use_scene,
                good_review: found.good_review,
                features: found.features,
              }),
            });
            if (res.ok) setFilled(await res.json());
          } catch {}
        }
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-300 text-sm">読み込み中...</p>
      </div>
    );
  }

  const images: string[] = product.images || [];
  const price = product.sale_price || product.price;
  const name = product.name_ja || product.name;
  const trendReason = product.trend_reason || filled.trend_reason;
  const useScene = product.use_scene || filled.use_scene;
  const goodReview = product.good_review || filled.good_review;
  const badReview = product.bad_review;
  const features = product.features || filled.features;

  const prevImg = () => setImgIndex(i => (i - 1 + images.length) % images.length);
  const nextImg = () => setImgIndex(i => (i + 1) % images.length);

  return (
    <main className="max-w-md mx-auto bg-white text-black pb-28">

      {/* ヘッダー */}
      <div className="flex justify-between items-center px-4 py-3">
        <a href="/" className="text-sm text-gray-400">← {l.back}</a>
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5 text-[10px] bg-gray-100 px-0.5 py-0.5 rounded-full">
            {(["ja", "zh", "en"] as const).map(code => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`px-2 py-1 rounded-full transition ${lang === code ? "bg-black text-white" : "text-gray-500"}`}
              >
                {code === "ja" ? "JP" : code === "zh" ? "CN" : "EN"}
              </button>
            ))}
          </div>
          <a href="/cart" className="relative text-xl">
            🛒
            {count > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </a>
        </div>
      </div>

      {/* 画像スライダー */}
      {images.length > 0 ? (
        <div className="relative select-none">
          <div
            className="overflow-hidden"
            onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={e => {
              if (touchStartX.current === null) return;
              const diff = touchStartX.current - e.changedTouches[0].clientX;
              if (diff > 40) nextImg();
              else if (diff < -40) prevImg();
              touchStartX.current = null;
            }}
          >
            <img
              src={images[imgIndex]}
              alt={name}
              className="w-full aspect-square object-cover"
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={prevImg}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center shadow text-gray-600 text-sm"
              >
                ‹
              </button>
              <button
                onClick={nextImg}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center shadow text-gray-600 text-sm"
              >
                ›
              </button>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition ${i === imgIndex ? "bg-white" : "bg-white/50"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="w-full aspect-square flex items-center justify-center text-5xl bg-pink-50">🎀</div>
      )}

      {/* 商品名・価格 */}
      <div className="px-4 pt-5">
        {product.category && (
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{product.category}</span>
        )}
        <h1 className="text-xl font-bold mt-1 leading-snug">{name}</h1>
        {price ? (
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black" style={{ color: "#C9637A" }}>¥{price.toLocaleString()}</span>
            <span className="text-xs text-gray-400">{l.shipping}</span>
          </div>
        ) : (
          <p className="text-gray-400 mt-2 text-sm">{l.noPrice}</p>
        )}
      </div>

      {/* 区切り */}
      <div className="mx-4 mt-6 border-t border-gray-100" />

      {/* 人気の理由 */}
      {trendReason && (
        <div className="px-4 pt-5">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">{l.trendTitle}</p>
          <p className="text-sm text-gray-700 leading-relaxed">{trendReason}</p>
        </div>
      )}

      {/* 使用シーン */}
      {useScene && (
        <div className="px-4 pt-5">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">{l.sceneTitle}</p>
          <p className="text-sm text-gray-700 leading-relaxed">{useScene}</p>
        </div>
      )}

      {/* 特徴 */}
      {features && (
        <div className="px-4 pt-5">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">{l.featuresTitle}</p>
          <p className="text-sm text-gray-700 leading-relaxed">{features}</p>
        </div>
      )}

      {/* 口コミ */}
      {(goodReview || badReview) && (
        <>
          <div className="mx-4 mt-6 border-t border-gray-100" />
          <div className="px-4 pt-5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">{l.reviewTitle}</p>
            {goodReview && (
              <div className="bg-rose-50 rounded-2xl p-4 mb-3">
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
                <p className="text-xs font-semibold text-gray-400 mb-1">{l.concernTitle}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{badReview}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* 安心ポイント */}
      <div className="mx-4 mt-6 border-t border-gray-100" />
      <div className="px-4 pt-5">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">{l.safeTitle}</p>
        <div className="flex flex-col gap-2.5">
          {[l.safe1, l.safe2, l.safe3].map((text, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-green-500 text-xs font-bold mt-0.5">✔</span>
              <span className="text-xs text-gray-500 leading-relaxed">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 固定CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 max-w-md mx-auto" style={{ left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "448px" }}>
        <button
          onClick={handleAdd}
          className="w-full py-4 rounded-2xl font-bold text-sm transition"
          style={{ background: added ? "#22c55e" : "#1a1a1a", color: "#fff" }}
        >
          {added ? l.added : l.addCart}
        </button>
      </div>

    </main>
  );
}
