"use client";

export default function Home() {
  return (
    <main className="bg-white text-black">

      {/* HERO */}
      <section>
        <img src="/products/doll/doll1/after.jpg" className="w-full" />
        <h1 className="text-2xl font-bold text-center mt-4">
          え、これ同じ？
        </h1>
      </section>

      {/* Before After */}
      <section className="px-4 mt-6">
        <div className="flex gap-2">
          <img src="/before.jpg" className="w-1/2"/>
          <img src="/products/doll/doll1/after.jpg" className="w-1/2"/>
        </div>
        <p className="text-center mt-2">一瞬で変わる</p>
      </section>

      {/* 口コミ */}
      <section className="px-4 mt-6 text-sm">
        <p>・想像以上に可愛い</p>
        <p>・一気に雰囲気変わる</p>
        <p>・これでこの値段は安い</p>
      </section>

      {/* オファー */}
      <section className="px-4 mt-6">
        <button className="w-full bg-black text-white py-4 mb-2">
          2個セット ¥5,500
        </button>
        <button className="w-full border py-4">
          3個セット ¥7,500
        </button>
      </section>

      {/* LINE */}
      <section className="text-center mt-6">
        <a 
          href="https://line.me/R/ti/p/@143xkgim" 
          target="_blank" 
          className="underline"
        >
          詳細はこちら
        </a>
      </section>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 w-full bg-black text-white text-center py-4">
        <a href="https://line.me/R/ti/p/@143xkgim">
          今すぐチェック
        </a>
      </div>

    </main>
  );
}