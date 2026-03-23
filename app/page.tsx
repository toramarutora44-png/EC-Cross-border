"use client";

import { useState } from "react";

export default function Home() {
  const [lang, setLang] = useState("ja");

  const t = {
    ja: {
      title: "中国トレンドを\n日本で最適に届ける",
      subtitle: "現地選定 × 日本基準検品",
      heroBtn: "LINEで最新トレンドを受け取る",
      trust: ["海外営業20年", "現地パートナー選定", "日本基準で検品"],
      chongqingTitle: "中国・重慶から直接選定",
      chongqingText: "現地のリアルなトレンドを直接届けます。",
      products: "人気商品",
      consult: "迷ったらLINEで相談できます😊",
      cta: "中国トレンドをいち早く受け取る",
      ctaBtn: "今すぐLINE登録",
      categories: ["バッグ", "洋服", "雑貨"],
    },
    zh: {
      title: "中国潮流\n带到日本",
      subtitle: "本地精选 × 日本标准检品",
      heroBtn: "通过LINE获取最新趋势",
      trust: ["20年海外经验", "本地合作伙伴", "日本标准检品"],
      chongqingTitle: "直接从重庆精选",
      chongqingText: "把中国真实流行趋势带给你。",
      products: "热门商品",
      consult: "不确定的话可以LINE咨询😊",
      cta: "第一时间获取中国潮流",
      ctaBtn: "立即添加LINE",
      categories: ["包包", "服装", "杂货"],
    },
  };

  return (
    <main className="bg-white text-gray-900">

      {/* 言語切替 */}
      <div className="fixed top-4 right-4 z-50 text-sm bg-white/80 px-3 py-1 rounded-full shadow">
        <button onClick={() => setLang("ja")} className="mr-2">JP</button>
        <button onClick={() => setLang("zh")}>CN</button>
      </div>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-6">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1549692520-acc6669e2f0c"
            className="w-full h-full object-cover opacity-60"
          />
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white whitespace-pre-line">
            {t[lang].title}
          </h1>

          <p className="mt-6 text-white text-lg">
            {t[lang].subtitle}
          </p>

          <a href="https://lin.ee/wuKhILR" target="_blank">
            <button className="mt-10 px-8 py-4 rounded-full text-white font-bold bg-gradient-to-r from-red-500 to-orange-500 shadow-lg">
              {t[lang].heroBtn}
            </button>
          </a>
        </div>
      </section>

      {/* 信頼 */}
      <section className="py-16 px-6 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {t[lang].trust.map((item, i) => (
          <div key={i} className="p-6 rounded-2xl shadow text-center">
            <p className="font-bold">{item}</p>
          </div>
        ))}
      </section>

      {/* 重慶 */}
      <section className="py-16 px-6 text-center bg-gray-50">
        <img
          src="https://images.unsplash.com/photo-1604514628550-37477afdf4e3"
          className="rounded-xl mx-auto mb-6"
        />

        <h2 className="text-2xl font-bold mb-4">
          {t[lang].chongqingTitle}
        </h2>

        <p className="text-gray-600 max-w-xl mx-auto">
          {t[lang].chongqingText}
        </p>
      </section>

      {/* 商品 */}
      <section className="py-16 px-6">
        <h2 className="text-2xl font-bold text-center mb-10">
          {t[lang].products}
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {t[lang].categories.map((item, i) => (
            <div key={i} className="rounded-xl shadow p-4 text-center">
              <img
                src="https://images.unsplash.com/photo-1585386959984-a41552231658"
                className="rounded-lg mb-3"
              />
              <p>{item}</p>
              <p className="font-bold">¥2,000〜</p>
            </div>
          ))}
        </div>

        {/* LINE誘導 */}
        <div className="text-center mt-10">
          <p className="mb-3">{t[lang].consult}</p>

          <a href="https://lin.ee/wuKhILR" target="_blank">
            <img
              src="https://scdn.line-apps.com/n/line_add_friends/btn/ja.png"
              alt="LINE"
              className="mx-auto h-12"
            />
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center bg-black text-white">
        <h2 className="text-2xl font-bold mb-4">
          {t[lang].cta}
        </h2>

        <a href="https://lin.ee/wuKhILR" target="_blank">
          <button className="mt-6 px-10 py-4 rounded-full text-white font-bold bg-gradient-to-r from-red-500 to-orange-500">
            {t[lang].ctaBtn}
          </button>
        </a>
      </section>

    </main>
  );
}