"use client";

export default function Home() {
  return (
    <main className="bg-white text-gray-900">

      {/* HERO（画像＋グラデーション） */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-6">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1549692520-acc6669e2f0c"
            className="w-full h-full object-cover opacity-60"
          />
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-relaxed">
            中国トレンドを<br />日本で最適に届ける
          </h1>

          <p className="mt-6 text-white text-lg">
            現地選定 × 日本基準検品
          </p>

          <button className="mt-10 px-8 py-4 rounded-full text-white font-bold bg-gradient-to-r from-red-500 to-orange-500 shadow-lg">
            LINEで最新トレンドを受け取る
          </button>
        </div>
      </section>

      {/* 信頼カード */}
      <section className="py-16 px-6 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {[
          "海外営業20年",
          "現地パートナー選定",
          "日本基準で検品",
        ].map((item, i) => (
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
          中国・重慶から直接選定
        </h2>

        <p className="text-gray-600 max-w-xl mx-auto">
          洪崖洞の幻想的な街並みのように、
          現地のリアルなトレンドを直接届けます。
        </p>
      </section>

      {/* 商品 */}
      <section className="py-16 px-6">
        <h2 className="text-2xl font-bold text-center mb-10">
          人気商品
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {["バッグ", "人形", "雑貨"].map((item, i) => (
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
      </section>

      {/* CTA */}
      <section className="py-20 text-center bg-black text-white">
        <h2 className="text-2xl font-bold mb-4">
          中国トレンドをいち早く受け取る
        </h2>

        <button className="mt-6 px-10 py-4 rounded-full text-white font-bold bg-gradient-to-r from-red-500 to-orange-500">
          今すぐLINE登録
        </button>
      </section>

    </main>
  );
}