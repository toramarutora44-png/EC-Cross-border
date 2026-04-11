"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  price: number | null;
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
  best_time: string;
  design_tips: string;
};

const LANGS = [
  { value: "ja", label: "日本語" },
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
];

const PLATFORM_COLORS: Record<string, string> = {
  TikTok: "bg-black text-white",
  Instagram: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  X: "bg-gray-900 text-white",
  Threads: "bg-gray-800 text-white",
};

export default function GeneratePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedLang, setSelectedLang] = useState("ja");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedContent[]>([]);
  const [trendsUsed, setTrendsUsed] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, images")
        .order("created_at", { ascending: false });
      if (data) setProducts(data);
    }
    load();
  }, []);

  async function handleGenerate() {
    if (!selectedId) { setError("商品を選択してください"); return; }
    setGenerating(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedId, lang: selectedLang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成に失敗しました");
      setResults(data.results);
      setTrendsUsed(data.trends_used || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  function copyAll(r: GeneratedContent) {
    const text = `${r.caption}\n\n${r.hashtags}`;
    navigator.clipboard.writeText(text);
    setCopied(r.platform);
    setTimeout(() => setCopied(""), 2000);
  }

  function copyImageUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopied("img-" + url);
    setTimeout(() => setCopied(""), 2000);
  }

  const selected = products.find((p) => p.id === selectedId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto p-4 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <a href="/admin" className="text-sm text-gray-400">&#8592; 管理画面</a>
          <h1 className="text-xl font-bold">SNS投稿生成</h1>
          <div />
        </div>

        {/* Product Select */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h2 className="font-bold mb-3 text-sm">商品を選択</h2>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm"
          >
            <option value="">-- 選択 --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.price ? `¥${p.price.toLocaleString()}` : ""}
              </option>
            ))}
          </select>
          {selected && selected.images && selected.images.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2">商品画像（タップでコピー）</p>
              <div className="flex gap-2 overflow-x-auto">
                {selected.images.map((url, i) => (
                  <div key={i} className="relative flex-shrink-0">
                    <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg" />
                    <button
                      onClick={() => copyImageUrl(url)}
                      className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center text-white text-xs font-bold opacity-0 hover:opacity-100 transition-opacity"
                    >
                      {copied === "img-" + url ? "✓" : "URL\nコピー"}
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">※ SNS投稿時は画像を直接ダウンロードして添付してください</p>
            </div>
          )}
        </div>

        {/* Language Select */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h2 className="font-bold mb-3 text-sm">投稿言語</h2>
          <div className="flex gap-2">
            {LANGS.map((l) => (
              <button
                key={l.value}
                onClick={() => setSelectedLang(l.value)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${
                  selectedLang === l.value ? "bg-black text-white" : "bg-gray-100"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !selectedId}
          className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 mb-4"
        >
          {generating ? "トレンド分析 + 生成中..." : "4媒体分を生成（TikTok / IG / X / Threads）"}
        </button>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        {/* Trends Info */}
        {trendsUsed && (
          <div className="bg-blue-50 rounded-xl p-3 mb-4">
            <p className="text-xs text-blue-600 font-bold mb-1">Google Trends（日本）反映済み</p>
            <p className="text-xs text-blue-500">{trendsUsed}</p>
          </div>
        )}

        {/* Results */}
        {results.map((r, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
            {/* Platform Header */}
            <div className={`px-4 py-3 flex items-center justify-between ${PLATFORM_COLORS[r.platform] || "bg-gray-800 text-white"}`}>
              <h3 className="font-bold">{r.platform}</h3>
              <button
                onClick={() => copyAll(r)}
                className="text-xs bg-white/20 px-3 py-1 rounded-full"
              >
                {copied === r.platform ? "Copied!" : "Copy All"}
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Hook */}
              <div>
                <p className="text-[10px] text-gray-400 mb-1">HOOK（冒頭0.5秒）</p>
                <p className="bg-yellow-50 p-3 rounded-lg text-sm font-bold">{r.hook}</p>
              </div>

              {/* Caption */}
              <div>
                <p className="text-[10px] text-gray-400 mb-1">投稿文</p>
                <p className="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-wrap">{r.caption}</p>
              </div>

              {/* Hashtags */}
              <div>
                <p className="text-[10px] text-gray-400 mb-1">ハッシュタグ</p>
                <p className="text-sm text-blue-600">{r.hashtags}</p>
              </div>

              {/* Structure */}
              <div>
                <p className="text-[10px] text-gray-400 mb-1">構成</p>
                <p className="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-wrap">{r.structure}</p>
              </div>

              {/* Design Tips */}
              {r.design_tips && (
                <div>
                  <p className="text-[10px] text-gray-400 mb-1">デザインアドバイス</p>
                  <p className="bg-purple-50 p-3 rounded-lg text-sm whitespace-pre-wrap">{r.design_tips}</p>
                </div>
              )}

              {/* Bottom Row */}
              <div className="flex gap-2 text-xs">
                {r.thumbnail_text && (
                  <span className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full font-bold">
                    サムネ: {r.thumbnail_text}
                  </span>
                )}
                {r.best_time && (
                  <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
                    {r.best_time}
                  </span>
                )}
              </div>

              {r.music_style && r.music_style !== "N/A" && (
                <p className="text-xs text-gray-400">BGM: {r.music_style}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
