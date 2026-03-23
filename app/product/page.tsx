"use client";

export default function Product() {
  return (
    <main className="bg-white text-black">

      {/* メイン */}
      <img src="/products/doll/doll1/main.jpg" className="w-full" />

      <div className="text-center mt-4 font-bold text-xl">
        これ、可愛すぎて無理
      </div>

      {/* 詳細 */}
      <div className="p-4 space-y-6">
        <img src="/products/doll/doll1/detail.jpg" className="rounded-xl" />
        <img src="/products/doll/doll1/set.jpg" className="rounded-xl" />
        <img src="/products/doll/doll1/after.png" className="rounded-xl" />
      </div>

      {/* 口コミ */}
      <div className="p-4 text-sm space-y-1">
        <p>・思ったよりしっかりしてる</p>
        <p>・プレゼントで喜ばれた</p>
        <p>・毎日使ってる</p>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 w-full bg-black p-4">
        <a href="https://lin.ee/wuKhILR" target="_blank">
          <button className="w-full bg-white py-3 rounded-xl font-bold">
            LINEで購入する
          </button>
        </a>
      </div>

    </main>
  );
}