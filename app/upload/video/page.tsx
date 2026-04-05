"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name_ja: string;
  name?: string;
  images: string[] | null;
  created_at: string;
  category: string | null;
};

type Captions = Record<string, { caption: string; hashtags: string }>;

const PLATFORMS = [
  { key: "instagram", label: "Instagram", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
  { key: "tiktok", label: "TikTok", color: "bg-black" },
];

const OPTIMAL_TIMES: Record<string, string> = {
  instagram: "7:00 / 12:00 / 21:00 JST",
  tiktok: "12:00 / 19:00 JST",
  x: "8:00 / 12:00 / 21:00 JST",
  threads: "8:00 / 12:00 / 21:00 JST",
};

const t = {
  zh: {
    title: "上传视频",
    selectProduct: "选择商品",
    searchProduct: "搜索商品名称...",
    noProduct: "请先在图片上传页面添加商品",
    uploadVideo: "上传视频",
    tapToSelect: "点击选择视频",
    selectPlatforms: "选择发布平台",
    generating: "AI生成文案中...",
    scheduling: "预约配信中...",
    schedule: "预约发布",
    scheduled: "预约完成！",
    addMore: "继续添加",
    error: "请选择商品、视频和至少一个平台",
    optimalTime: "最佳时间",
    back: "← 返回",
    new: "新",
  },
  ja: {
    title: "動画アップロード",
    selectProduct: "商品を選択",
    searchProduct: "商品名で検索...",
    noProduct: "先に画像アップロードページで商品を追加してください",
    uploadVideo: "動画をアップロード",
    tapToSelect: "タップして動画を選択",
    selectPlatforms: "配信プラットフォームを選択",
    generating: "AIキャプション生成中...",
    scheduling: "予約設定中...",
    schedule: "予約配信に追加",
    scheduled: "予約完了！",
    addMore: "続けて追加",
    error: "商品・動画・プラットフォームを選択してください",
    optimalTime: "最適時間",
    back: "← 戻る",
    new: "新着",
  },
};

export default function VideoUploadPage() {
  const [lang, setLang] = useState<"zh" | "ja">("zh");
  const l = t[lang];

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "tiktok"]);
  const [generating, setGenerating] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("products")
      .select("id, name_ja, name, images, created_at, category")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setProducts(data);
      });
  }, []);

  const filteredProducts = useMemo(() => {
    if (!search) return products;
    return products.filter((p) =>
      (p.name_ja || p.name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  function handleVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  }

  function togglePlatform(key: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  }

  function isNew(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    return diff < 3 * 24 * 60 * 60 * 1000;
  }

  async function handleSubmit() {
    if (!selectedProduct || !videoFile || selectedPlatforms.length === 0) {
      setError(l.error);
      return;
    }
    setError("");
    setGenerating(true);

    try {
      // 1. キャプション生成
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          lang: lang === "zh" ? "zh" : "ja",
        }),
      });
      const genData = await genRes.json();
      const captions: Captions = {};
      if (genRes.ok && genData.results) {
        for (const r of genData.results) {
          captions[r.platform.toLowerCase()] = {
            caption: r.caption,
            hashtags: r.hashtags,
          };
        }
      }

      setGenerating(false);
      setScheduling(true);

      // 2. 動画をSupabaseにアップロード
      const ext = videoFile.name.split(".").pop() || "mp4";
      const videoPath = `${selectedProduct.id}/video_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(videoPath, videoFile, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("products")
        .getPublicUrl(videoPath);
      const videoUrl = urlData.publicUrl;

      // 3. 予約投稿を作成
      const res = await fetch("/api/scheduled-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          platforms: selectedPlatforms,
          captions,
          video_url: videoUrl,
          image_url: selectedProduct.images?.[0] || null,
        }),
      });
      if (!res.ok) throw new Error("予約投稿の作成に失敗しました");

      setDone(true);
    } catch (err: any) {
      setError(err.message || "エラーが発生しました");
    } finally {
      setGenerating(false);
      setScheduling(false);
    }
  }

  function reset() {
    setSelectedProduct(null);
    setVideoFile(null);
    setVideoPreview(null);
    setSelectedPlatforms(["instagram", "tiktok"]);
    setDone(false);
    setError("");
    setSearch("");
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4 text-green-500">✓</div>
          <h2 className="text-xl font-bold mb-2">{l.scheduled}</h2>
          <p className="text-sm text-gray-400 mb-6">{selectedProduct?.name_ja}</p>
          <div className="space-y-2 mb-6">
            {selectedPlatforms.map((p) => {
              const platform = PLATFORMS.find((pl) => pl.key === p);
              return (
                <div key={p} className={`${platform?.color} text-white rounded-xl px-4 py-2 text-sm flex justify-between`}>
                  <span>{platform?.label}</span>
                  <span className="text-white/70 text-xs">{OPTIMAL_TIMES[p]}</span>
                </div>
              );
            })}
          </div>
          <button onClick={reset} className="w-full bg-black text-white py-3 rounded-xl font-bold">
            {l.addMore}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <a href="/upload" className="text-sm text-gray-400">{l.back}</a>
          <h1 className="text-xl font-bold">{l.title}</h1>
          <button
            onClick={() => setLang(lang === "zh" ? "ja" : "zh")}
            className="bg-gray-200 text-xs font-bold px-3 py-1.5 rounded-full"
          >
            {lang === "zh" ? "JA" : "CN"}
          </button>
        </div>

        {/* Step 1: 商品選択 */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h2 className="font-bold mb-3 text-sm">1. {l.selectProduct}</h2>
          <input
            type="text"
            placeholder={l.searchProduct}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-xl px-4 py-2 text-sm mb-3"
          />
          {selectedProduct ? (
            <div className="relative inline-block">
              <img
                src={selectedProduct.images?.[0] || ""}
                alt=""
                className="w-20 h-20 object-cover rounded-xl border-4 border-black"
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >×</button>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-4">{l.noProduct}</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className="relative aspect-square"
                    >
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-xl" />
                      )}
                      {isNew(p.created_at) && (
                        <span className="absolute top-1 right-1 text-[9px] bg-red-500 text-white px-1 py-0.5 rounded-full">{l.new}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: 動画アップロード */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h2 className="font-bold mb-3 text-sm">2. {l.uploadVideo}</h2>
          {videoPreview ? (
            <div className="relative">
              <video src={videoPreview} controls className="w-full rounded-xl max-h-64 object-cover" />
              <button
                onClick={() => { setVideoFile(null); setVideoPreview(null); }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm"
              >×</button>
            </div>
          ) : (
            <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-black transition">
              <div className="text-4xl text-gray-300 mb-2">▶</div>
              <span className="text-gray-400 text-sm">{l.tapToSelect}</span>
              <input type="file" accept="video/*" onChange={handleVideo} className="hidden" />
            </label>
          )}
        </div>

        {/* Step 3: プラットフォーム選択 */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h2 className="font-bold mb-3 text-sm">3. {l.selectPlatforms}</h2>
          <div className="space-y-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.key}
                onClick={() => togglePlatform(p.key)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${
                  selectedPlatforms.includes(p.key)
                    ? `${p.color} text-white`
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <span className="font-bold text-sm">{p.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs opacity-70">{OPTIMAL_TIMES[p.key]}</span>
                  <span className="text-lg">{selectedPlatforms.includes(p.key) ? "✓" : "+"}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={generating || scheduling}
          className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50"
        >
          {generating ? l.generating : scheduling ? l.scheduling : l.schedule}
        </button>
      </div>
    </div>
  );
}
