"use client";

export default function Home() {
  return (
    <main className="bg-white text-gray-900">

      {/* HERO */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6">
        <h1 className="text-2xl md:text-4xl font-bold max-w-xl leading-relaxed">
          中国トレンドを、日本で最適に届ける
        </h1>

        <p className="mt-6 text-lg">
          現地で選び、日本基準で検品。
        </p>

        <p className="text-lg font-semibold">
          安くても、ちゃんと良い。
        </p>

        <div className="mt-10">
          <p className="text-sm text-gray-500 mb-2">
            中国で今売れている商品を厳選して配信中
          </p>
          <button className="px-8 py-4 rounded-xl text-white font-bold bg-gradient-to-r from-red-500 to-orange-500">
            LINEで最新トレンドを受け取る
          </button>
        </div>
      </section>

      {/* 信頼 */}
      <section className="py-14 text-center bg-gray-50">
        <h2 className="text-xl font-bold mb-6">安心して選べる理由</h2>
        <p>✔ 海外営業20年の経験</p>
        <p>✔ 日本基準で検品</p>
        <p>✔ 不良品は交換対応</p>
      </section>

      {/* 運営者 */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-6">
          なぜ安心できるのか
        </h2>

        <p className="max-w-2xl mx-auto text-gray-600">
          約20年にわたり海外営業・国際取引に携わってきた経験をもとに、
          商品の品質・価格・信頼性を重視しています。
        </p>

        <p className="mt-6 max-w-2xl mx-auto text-gray-600">
          中国現地には信頼できるパートナーが在籍し、
          商品選定から検品まで一貫して管理しています。
        </p>

        <p className="mt-6 font-semibold">
          安さだけでなく「安心して使えること」まで責任を持ちます。
        </p>
      </section>

      {/* 重慶 */}
      <section className="py-16 px-6 bg-gray-50 text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-6">
          中国・重慶から直接お届け
        </h2>

        <p className="max-w-2xl mx-auto text-gray-600">
          中国5大都市の一つ・重慶を拠点に、
          現地で商品を直接選定しています。
        </p>

        <p className="mt-6 max-w-2xl mx-auto text-gray-600">
          洪崖洞の幻想的な街並みのように、
          リアルな文化とトレンドが集まる場所です。
        </p>

        <p className="mt-6 font-semibold">
          現地で選び、現地で確かめ、日本へ届ける
        </p>
      </section>

      {/* 商品 */}
      <section className="py-14 px-6">
        <h2 className="text-xl font-bold text-center mb-8">人気商品</h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-4 shadow rounded-xl text-center">
            <div className="h-32 bg-gray-200 mb-3"></div>
            <p>高見えバッグ</p>
            <p className="font-bold">¥3,980</p>
          </div>

          <div className="p-4 shadow rounded-xl text-center">
            <div className="h-32 bg-gray-200 mb-3"></div>
            <p>ギフト人形</p>
            <p className="font-bold">¥1,500</p>
          </div>

          <div className="p-4 shadow rounded-xl text-center">
            <div className="h-32 bg-gray-200 mb-3"></div>
            <p>雑貨</p>
            <p className="font-bold">¥2,200</p>
          </div>
        </div>
      </section>

      {/* 納期 */}
      <section className="py-10 text-center text-sm text-gray-500">
        ご注文後、約7〜10日でお届けします（現地検品・国際配送のため）
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <p className="text-sm text-gray-500 mb-2">
          中国で今売れている商品を厳選配信中
        </p>

        <button className="px-8 py-4 rounded-xl text-white font-bold bg-gradient-to-r from-red-500 to-orange-500">
          LINEで最新トレンドを受け取る
        </button>
      </section>

    </main>
  );
}