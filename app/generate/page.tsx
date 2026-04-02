"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  price: number | null;
  trend_reason: string | null;
  use_scene: string | null;
  good_review: string | null;
  bad_review: string | null;
  features: string | null;
  images: string[] | null;
};

type GeneratedContent = {
  platform: string;
  caption: string;
  hashtags: string;
  hook: string;
  structure: string;
  thumbnail_text: string;
  music_style: string;
};

export default function GeneratePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedContent[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProducts(data);
  }

  async function handleGenerate() {
    if (!selectedId) {
      setError("商品を選択してください");
      return;
    }

    setGenerating(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "生成に失敗しました");

      setResults(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  }

  const selected = products.find((p) => p.id === selectedId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto p-4 pb-20">
        <h1 className="text-xl font-bold text-center py-4">SNS投稿生成</h1>

        {/* Product Select */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h2 className="font-bold mb-3">商品を選択</h2>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm"
          >
            <option value="">-- 選択してください --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.price ? `¥${p.price.toLocaleString()}` : ""}
              </option>
            ))}
          </select>

          {selected && selected.images && selected.images.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {selected.images.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              ))}
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !selectedId}
          className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 mb-4"
        >
          {generating ? "生成中..." : "TikTok / Instagram / X 向けに生成"}
        </button>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        {/* Results */}
        {results.map((r, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">{r.platform}</h3>
              <button
                onClick={() =>
                  copyToClipboard(
                    `${r.caption}\n\n${r.hashtags}`,
                    `${r.platform}-caption`
                  )
                }
                className="text-sm bg-gray-100 px-3 py-1 rounded-lg"
              >
                {copied === `${r.platform}-caption` ? "コピー済!" : "コピー"}
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">冒頭フック（最初の0.5秒）</p>
                <p className="bg-yellow-50 p-2 rounded-lg text-sm font-bold">
                  {r.hook}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">投稿文</p>
                <p className="bg-gray-50 p-2 rounded-lg text-sm whitespace-pre-wrap">
                  {r.caption}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">ハッシュタグ</p>
                <p className="text-sm text-blue-600">{r.hashtags}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">動画構成</p>
                <p className="bg-gray-50 p-2 rounded-lg text-sm whitespace-pre-wrap">
                  {r.structure}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">サムネ・画像テキスト</p>
                <p className="bg-orange-50 p-2 rounded-lg text-sm font-bold">
                  {r.thumbnail_text}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">推奨BGM/音楽スタイル</p>
                <p className="text-sm">{r.music_style}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
