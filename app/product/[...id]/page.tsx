"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCart } from "../../context/CartContext";

export default function ProductPage() {
  const params = useParams();
  const idArr = Array.isArray(params.id) ? params.id : [params.id];
  const id = idArr.join("/");

  const [product, setProduct] = useState<any>(null);
  const [added, setAdded] = useState(false);
  const { addItem, count } = useCart();

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then((list: any[]) => {
        const found = list.find(p => p.id === id);
        setProduct(found || null);
      });
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addItem({
      id: product.id,
      nameJa: product.name_ja || product.nameJa || product.id,
      salePrice: product.sale_price || product.salePrice || 0,
      image: product.images?.[0] || `/products/${product.id}/1.jpg`,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product) return <p className="text-center mt-20 text-gray-400">読み込み中...</p>;

  return (
    <main className="max-w-md mx-auto bg-white text-black pb-24">

      {/* ヘッダー */}
      <div className="flex justify-between items-center px-4 py-3 border-b">
        <a href="/" className="text-sm text-gray-400">← 戻る</a>
        <a href="/cart" className="text-sm relative">
          🛒
          {count > 0 && (
            <span className="absolute -top-1 -right-3 bg-rose-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {count}
            </span>
          )}
        </a>
      </div>

      {/* 画像 */}
      <img
        src={product.images?.[0] || `/products/${id}/1.jpg`}
        className="w-full"
      />

      {/* 商品情報 */}
      <div className="px-4 mt-4">
        <h1 className="text-xl font-bold">{product.name_ja || product.nameJa || id}</h1>

        {(product.sale_price || product.salePrice) ? (
          <div className="mt-2">
            <p className="text-2xl font-bold text-rose-600">
              ¥{(product.sale_price || product.salePrice).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">送料込み</p>
          </div>
        ) : (
          <p className="text-gray-400 mt-2">価格未設定</p>
        )}
      </div>

      {/* カートボタン（固定） */}
      <div className="fixed bottom-0 left-0 w-full px-4 py-3 bg-white border-t">
        <button
          onClick={handleAdd}
          className="w-full bg-black text-white py-3 rounded font-bold"
        >
          {added ? "✓ カートに追加しました" : "カートに追加する"}
        </button>
      </div>
    </main>
  );
}
