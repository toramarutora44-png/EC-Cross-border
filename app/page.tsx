export default function Home() {
  return (
    <main className="bg-white text-gray-900">

      {/* HERO */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6">
        <h1 className="text-2xl md:text-4xl font-bold max-w-xl leading-relaxed">
          “中国製＝微妙”って、まだ思ってる？
        </h1>

        <p className="mt-6 text-lg">
          現地で選び、日本基準で検品。
        </p>

        <p className="text-lg font-semibold">
          安いのに、ちゃんと良い。
        </p>

        <button className="mt-10 px-8 py-4 rounded-xl text-white font-bold bg-gradient-to-r from-blue-500 to-purple-500">
          無料で相談する
        </button>
      </section>

      {/* 安心 */}
      <section className="py-14 text-center bg-gray-50">
        <h2 className="text-xl font-bold mb-6">安心して選べる理由</h2>
        <p>✔ 全商品検品済み</p>
        <p>✔ 日本基準チェック</p>
        <p>✔ 不良は交換対応</p>
      </section>

      {/* 価格 */}
      <section className="py-14 text-center">
        <h2 className="text-xl font-bold mb-6">価格の違い</h2>
        <p className="text-gray-500">日本：¥6,000</p>
        <p className="text-3xl font-bold text-blue-600 mt-2">中国：¥2,000</p>
        <p className="mt-4">同じクオリティ、もっと手頃に。</p>
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

      {/* 差別化 */}
      <section className="py-14 text-center bg-gray-50">
        <h2 className="text-xl font-bold mb-4">違いは選び方</h2>
        <p className="text-gray-600">他：バズ・広告</p>
        <p className="font-semibold">自分：現地選定＋検品</p>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <button className="px-8 py-4 rounded-xl text-white font-bold bg-gradient-to-r from-blue-500 to-purple-500">
          無料で相談する
        </button>
      </section>

    </main>
  );
}