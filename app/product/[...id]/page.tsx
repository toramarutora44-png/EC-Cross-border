"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCart } from "../../context/CartContext";

export default function ProductPage() {
  const params = useParams();
  const idArr = Array.isArray(params.id) ? params.id : [params.id];
  const id = idArr.join("/");

  const [product, setProduct] = useState<any>(null);
  const [filled, setFilled] = useState<any>({});
  const [imgIndex, setImgIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const { addItem, count } = useCart();

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(async (list: any[]) => {
        const found = list.find(p => p.id === id);
        if (!found) return setProduct(null);
        setProduct(found);

        // 空フィールドがある場合だけAI補完
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
            if (res.ok) {
              const aiData = await res.json();
              setFilled(aiData);
            }
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

  // 入力値 → なければAI補完値を使う
  const trendReason = product.trend_reason || filled.trend_reason;
  const useScene = product.use_scene || filled.use_scene;
  const goodReview = product.good_review || filled.good_review;
  const badReview = product.bad_review;
  const features = product.features || filled.features;

  return (
    <main className="max-w-md mx-auto bg-white text-black pb-28">

      {/* ヘッダー */}
      <div className="flex justify-between items-center px-4 py-3">
        <a href="/" className="text-sm text-gray-400">← 戻る</a>
        <a href="/cart" className="relative text-xl">
          🛒
          {count > 0 && (
            <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {count}
            </span>
          )}
        </a>
      </div>

      {/* 画像 */}
      {images.length > 0 ? (
        <div>
          <img
            src={images[imgIndex]}
            alt={name}
            className="w-full aspect-square object-cover"
          />
          {images.length > 1 && (
            <div className="flex justify-center gap-1.5 pt-3">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`w-2 h-2 rounded-full transition ${i === imgIndex ? "bg-gray-800" : "bg-gray-300"}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full aspect-square flex items-center justify-center text-5xl bg-pink-50">
          🎀
        </div>
      )}

      {/* 商品名・価格 */}
      <div className="px-4 pt-5">
        {product.category && (
          <span className="text-xs text-gray-400 uppercase tracking-wide">{product.category}</span>
        )}
        <h1 className="text-lg font-bold mt-1 leading-snug">{name}</h1>

        {price ? (
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black" style={{ color: "#C9637A" }}>
              ¥{price.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400">送料込み</span>
          </div>
        ) : (
          <p className="text-gray-400 mt-2 text-sm">価格未設定</p>
        )}
      </div>

      <div className="mx-4 mt-5 border-t border-gray-100" />

      {/* なぜ人気？ */}
      {trendReason && (
        <div className="px-4 pt-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">人気の理由</p>
          <p className="text-sm text-gray-700 leading-relaxed">{trendReason}</p>
        </div>
      )}

      {/* 使用シーン */}
      {useScene && (
        <div className="px-4 pt-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">こんな時に</p>
          <p className="text-sm text-gray-700 leading-relaxed">{useScene}</p>
        </div>
      )}

      {/* 特徴 */}
      {features && (
        <div className="px-4 pt-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">商品の特徴</p>
          <p className="text-sm text-gray-700 leading-relaxed">{features}</p>
        </div>
      )}

      {/* 口コミ */}
      {(goodReview || badReview) && (
        <>
          <div className="mx-4 mt-5 border-t border-gray-100" />
          <div className="px-4 pt-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">購入者の声</p>
            {goodReview && (
              <div className="bg-gray-50 rounded-2xl p-4 mb-3">
                <div className="flex items-center gap-0.5 mb-2">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className="text-sm" style={{ color: "#f0a0b8" }}>★</span>
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{goodReview}</p>
              </div>
            )}
            {badReview && (
              <div className="border border-gray-100 rounded-2xl p-4">
                <p className="text-xs text-gray-400 mb-1">気になる点</p>
                <p className="text-sm text-gray-500 leading-relaxed">{badReview}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* 安心ポイント */}
      <div className="mx-4 mt-5 border-t border-gray-100" />
      <div className="px-4 pt-5">
        <div className="flex flex-col gap-2">
          {[
            { text: "中国製＝高品質。検品済みの商品のみをお届けします" },
            { text: "安全な梱包材で丁寧に発送" },
            { text: "明らかな不良品は返品・交換対応" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-green-500 text-xs font-bold mt-0.5">✔</span>
              <span className="text-xs text-gray-500 leading-relaxed">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 固定CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 max-w-md mx-auto">
        <button
          onClick={handleAdd}
          className="w-full py-4 rounded-2xl font-bold text-sm transition"
          style={{
            background: added ? "#22c55e" : "#1a1a1a",
            color: "#fff",
          }}
        >
          {added ? "カートに追加しました" : "カートに追加する"}
        </button>
      </div>

    </main>
  );
}
