"use client";

import { useState } from "react";

export default function Home() {
  const [lang, setLang] = useState<"ja" | "zh" | "en">("ja");

  const t = {
    ja: {
      brand: "Trend Select",
      tagline: "中国のかわいいを発見",
      title: "今日の発見",
      items: ["これ、可愛すぎ", "え、なにこれ", "欲しくなるやつ"],
      category: ["バッグ", "洋服", "雑貨"],
    },
    zh: {
      brand: "Trend Select",
      tagline: "发现中国的可爱",
      title: "今日发现",
      items: ["太可爱了", "这是什么", "想要这个"],
      category: ["包包", "服装", "杂货"],
    },
    en: {
      brand: "Trend Select",
      tagline: "Discover cute from China",
      title: "Today's Finds",
      items: ["Too cute", "What is this?", "I want this"],
      category: ["Bag", "Clothes", "Goods"],
    },
  };

  return (
    <main className="bg-white text-black">

      {/* 言語切替 */}
      <div className="fixed top-4 right-4 z-50 text-xs bg-white/90 px-3 py-1 rounded-full flex gap-2 shadow">
        <button onClick={() => setLang("ja")}>JP</button>
        <button onClick={() => setLang("zh")}>CN</button>
        <button onClick={() => setLang("en")}>EN</button>
      </div>

      {/* ブランド */}
      <div className="text-center mt-10">
        <h1 className="text-lg font-bold">{t[lang].brand}</h1>
        <p className="text-xs text-gray-500">{t[lang].tagline}</p>
      </div>

      {/* 今日の発見 */}
      <section className="p-4 mt-4">
        <h2 className="font-bold mb-4">{t[lang].title}</h2>

        <a href="/product">
          <img src="/products/doll/doll1/main.jpg" className="rounded-xl mb-2" />
          <p className="font-bold">{t[lang].items[0]}</p>
        </a>
      </section>

      {/* フィード */}
      <section className="p-4 space-y-6">
        <a href="/product">
          <img src="/products/doll/doll1/detail.jpg" className="rounded-xl mb-2" />
          <p>{t[lang].items[1]}</p>
        </a>

        <a href="/product">
          <img src="/products/doll/doll1/set.jpg" className="rounded-xl mb-2" />
          <p>{t[lang].items[2]}</p>
        </a>

        <a href="/product">
          <img src="/products/doll/doll1/after.png" className="rounded-xl mb-2" />
          <p>{t[lang].items[0]}</p>
        </a>
      </section>

      {/* カテゴリ */}
      <section className="p-4 mt-10 space-y-6">

        <div>
          <img src="/products/bag/bag1/main.jpg" className="rounded-xl"/>
          <p className="mt-2 font-bold">{t[lang].category[0]}</p>
          <p className="text-sm text-gray-400">Coming Soon</p>
        </div>

        <div>
          <img src="/products/clothes/clothes1/main.jpg" className="rounded-xl"/>
          <p className="mt-2 font-bold">{t[lang].category[1]}</p>
          <p className="text-sm text-gray-400">Coming Soon</p>
        </div>

        <div>
          <img src="/products/goods/goods1/main.jpg" className="rounded-xl"/>
          <p className="mt-2 font-bold">{t[lang].category[2]}</p>
          <p className="text-sm text-gray-400">Coming Soon</p>
        </div>

      </section>

      {/* LINE */}
      <div className="text-center my-10">
        <a href="https://lin.ee/wuKhILR" target="_blank">
          <img
            src="https://scdn.line-apps.com/n/line_add_friends/btn/ja.png"
            className="mx-auto h-12"
          />
        </a>
      </div>

    </main>
  );
}