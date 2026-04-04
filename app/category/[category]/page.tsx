"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

const categoryData: Record<string, {
  ja: string; zh: string; en: string;
  items: { id: string; image: string; ja: string; zh: string; en: string }[];
}> = {
  doll: {
    ja: "ドール",
    zh: "玩偶",
    en: "Doll",
    items: [
      {
        id: "doll/doll1",
        image: "/products/doll/doll1/main.jpg",
        ja: "これ、可愛すぎ",
        zh: "太可爱了",
        en: "Too cute",
      },
    ],
  },
  bag: {
    ja: "バッグ",
    zh: "包包",
    en: "Bag",
    items: [
      {
        id: "bag/bag1",
        image: "/products/bag/bag1/main.jpg",
        ja: "おしゃれバッグ",
        zh: "时尚包包",
        en: "Stylish Bag",
      },
    ],
  },
  clothes: {
    ja: "洋服",
    zh: "服装",
    en: "Clothes",
    items: [
      {
        id: "clothes/clothes1",
        image: "/products/clothes/clothes1/main.jpg",
        ja: "トレンド服",
        zh: "流行服装",
        en: "Trendy Clothes",
      },
    ],
  },
  goods: {
    ja: "雑貨",
    zh: "杂货",
    en: "Goods",
    items: [
      {
        id: "goods/goods1",
        image: "/products/goods/goods1/main.jpg",
        ja: "かわいい雑貨",
        zh: "可爱杂货",
        en: "Cute Goods",
      },
    ],
  },
};

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const [lang, setLang] = useState<"ja" | "zh" | "en">("ja");

  const data = categoryData[category];

  if (!data) {
    return (
      <main className="bg-white text-black text-center mt-20">
        <p>カテゴリが見つかりません</p>
        <a href="/" className="underline text-sm mt-4 inline-block">トップへ戻る</a>
      </main>
    );
  }

  return (
    <main className="bg-white text-black">

      {/* 言語切替 */}
      <div className="fixed top-4 right-4 z-50 text-xs bg-white/90 px-3 py-1 rounded-full flex gap-2 shadow">
        <button onClick={() => setLang("ja")}>JP</button>
        <button onClick={() => setLang("zh")}>CN</button>
        <button onClick={() => setLang("en")}>EN</button>
      </div>

      {/* ヘッダー */}
      <div className="text-center mt-10 mb-6">
        <a href="/" className="text-xs text-gray-400 block mb-2">← HaoHao</a>
        <h1 className="text-xl font-bold">{data[lang]}</h1>
      </div>

      {/* 商品一覧 */}
      <section className="p-4 space-y-6">
        {data.items.map((item) => (
          <a key={item.id} href={`/product/${item.id}`} className="block">
            <img src={item.image} className="rounded-xl w-full mb-2" />
            <p className="font-bold">{item[lang]}</p>
          </a>
        ))}
      </section>

    </main>
  );
}
