"use client";

import { useParams } from "next/navigation";

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;

  const basePath = `/products/${id}`;

  return (
    <main className="bg-white text-black">

      {/* HERO */}
      <section>
        <img src={`${basePath}/after.jpg`} className="w-full" />
        <h1 className="text-2xl font-bold text-center mt-4">
          え、これ同じ？
        </h1>
      </section>

      {/* Before After */}
      <section className="px-4 mt-6">
        <div className="flex gap-2">
          <img src={`${basePath}/main.jpg`} className="w-1/2" />
          <img src={`${basePath}/after.jpg`} className="w-1/2" />
        </div>
        <p className="text-center mt-2">一瞬で変わる</p>
      </section>

      {/* Detail */}
      <section className="px-4 mt-6">
        <img src={`${basePath}/detail.jpg`} className="w-full" />
      </section>

      {/* 口コミ */}
      <section className="px-4 mt-6 text-sm">
        <p>・想像以上に良い</p>
        <p>・すぐ使える</p>
        <p>・コスパ最強</p>
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
          href="https://lin.ee/xxxxxxx"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          詳細はこちら
        </a>
      </section>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 w-full bg-black text-white text-center py-4">
        <a
          href="https://lin.ee/xxxxxxx"
          target="_blank"
          rel="noopener noreferrer"
        >
          今すぐチェック
        </a>
      </div>

    </main>
  );
}