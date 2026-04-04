"use client";
import { useState } from "react";

export default function UploadPage() {
  const [cnyPrice, setCnyPrice] = useState("");
  const [weightG, setWeightG]   = useState("500");
  const [nameJa, setNameJa]     = useState("");
  const [preview, setPreview]   = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone]         = useState<any>(null);
  const [captions, setCaptions] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  // 価格プレビュー（リアルタイム計算）
  function calcPreview(cny: number, weight: number) {
    const emsTable = [
      [500, 1500], [1000, 2200], [2000, 3200],
      [3000, 4200], [5000, 5500],
    ];
    const ems = (emsTable.find(([w]) => weight <= w) || [0, 7000])[1];
    const base    = Math.round(cny * 23);
    const sub     = base + ems;
    const tax     = Math.round(sub * 0.08);
    const total   = sub + tax + 1000;
    const sale    = Math.ceil((total * 1.33) / 100) * 100;
    setPreview({ base, ems, tax, total, sale });
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setUploading(true);

    const form = new FormData(e.target);
    const res  = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();

    setDone(data);
    setUploading(false);

    // 登録完了後、自動で文言生成
    if (data.success) {
      setGenerating(true);
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameJa,
          salePrice: data.salePrice,
          cnyPrice: parseFloat(cnyPrice),
          id: data.id,
        }),
      });
      const genData = await genRes.json();
      if (genData.captions) setCaptions(genData);
      setGenerating(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-6 bg-white text-black">
      <h1 className="text-xl font-bold mb-6">商品登録</h1>

      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">

        {/* 商品名 */}
        <div>
          <label className="text-sm font-bold block mb-1">商品名（日本語）</label>
          <input
            name="nameJa"
            value={nameJa}
            onChange={e => setNameJa(e.target.value)}
            placeholder="例：かわいいドール"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        {/* 中国価格 */}
        <div>
          <label className="text-sm font-bold block mb-1">中国仕入れ価格（CNY）</label>
          <input
            name="cnyPrice"
            type="number"
            value={cnyPrice}
            onChange={e => {
              setCnyPrice(e.target.value);
              if (e.target.value) calcPreview(parseFloat(e.target.value), parseFloat(weightG));
            }}
            placeholder="例：50"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        {/* 重量 */}
        <div>
          <label className="text-sm font-bold block mb-1">重量（g）</label>
          <select
            name="weightG"
            value={weightG}
            onChange={e => {
              setWeightG(e.target.value);
              if (cnyPrice) calcPreview(parseFloat(cnyPrice), parseFloat(e.target.value));
            }}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="300">〜300g（EMS ¥1,500）</option>
            <option value="500">〜500g（EMS ¥1,500）</option>
            <option value="800">〜1kg（EMS ¥2,200）</option>
            <option value="1500">〜2kg（EMS ¥3,200）</option>
            <option value="2500">〜3kg（EMS ¥4,200）</option>
            <option value="4000">〜5kg（EMS ¥5,500）</option>
          </select>
        </div>

        {/* 価格プレビュー */}
        {preview && (
          <div className="bg-gray-50 border rounded p-4 text-sm space-y-1">
            <p className="font-bold mb-2">価格内訳</p>
            <p>仕入れ（CNY→JPY）: ¥{preview.base.toLocaleString()}</p>
            <p>EMS送料: ¥{preview.ems.toLocaleString()}</p>
            <p>輸入税（8%）: ¥{preview.tax.toLocaleString()}</p>
            <p>国内配送: ¥1,000</p>
            <p>原価合計: ¥{preview.total.toLocaleString()}</p>
            <p className="text-lg font-bold text-rose-600 mt-2">
              販売価格: ¥{preview.sale.toLocaleString()}
            </p>
          </div>
        )}

        {/* 画像アップロード */}
        <div>
          <label className="text-sm font-bold block mb-1">商品画像・動画</label>
          <input
            type="file"
            name="images"
            multiple
            accept="image/*,video/*"
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-black text-white py-3 rounded font-bold"
        >
          {uploading ? "処理中（画像・動画変換中...）" : "登録する"}
        </button>
      </form>

      {/* 完了 */}
      {done && (
        <div className="mt-6 bg-green-50 border border-green-300 rounded p-4 text-sm">
          <p className="font-bold text-green-700 mb-2">登録完了！</p>
          <p>商品ID: {done.id}</p>
          <p className="text-lg font-bold text-rose-600">
            販売価格: ¥{done.salePrice?.toLocaleString()}
          </p>
          <details className="mt-2">
            <summary className="cursor-pointer text-gray-500">内訳を見る</summary>
            <p>仕入れ: ¥{done.breakdown?.baseCost?.toLocaleString()}</p>
            <p>EMS: ¥{done.breakdown?.emsCost?.toLocaleString()}</p>
            <p>輸入税: ¥{done.breakdown?.importTax?.toLocaleString()}</p>
            <p>国内配送: ¥1,000</p>
            <p>原価: ¥{done.breakdown?.totalCost?.toLocaleString()}</p>
          </details>
        </div>
      )}

      {/* SNS別画像プレビュー */}
      {done?.snsImages && Object.keys(done.snsImages).length > 0 && (
        <div className="mt-6">
          <h2 className="font-bold text-lg mb-3">SNS別画像（自動リサイズ済み）</h2>
          {Object.entries(done.snsImages).map(([fileKey, sizes]: any) => (
            <div key={fileKey} className="mb-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "instagram", label: "Instagram\n1080×1080" },
                  { key: "tiktok",    label: "TikTok\n1080×1920" },
                  { key: "x",         label: "X\n1200×675" },
                ].map(({ key, label }) => (
                  sizes[key] && (
                    <div key={key} className="text-center">
                      <img src={sizes[key]} className="w-full rounded border" />
                      <p className="text-xs text-gray-400 mt-1 whitespace-pre">{label}</p>
                      <a href={sizes[key]} download className="text-xs text-blue-500 underline">
                        DL
                      </a>
                    </div>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SNS別動画プレビュー */}
      {done?.snsVideos && Object.keys(done.snsVideos).length > 0 && (
        <div className="mt-6">
          <h2 className="font-bold text-lg mb-3">SNS別動画（自動変換済み）</h2>
          {Object.entries(done.snsVideos).map(([fileKey, sizes]: any) => (
            <div key={fileKey} className="space-y-2">
              {[
                { key: "tiktok",    label: "TikTok / Instagram Reels（縦型）" },
                { key: "x",         label: "X（横型）" },
              ].map(({ key, label }) => (
                sizes[key] && (
                  <div key={key} className="border rounded p-2">
                    <p className="text-xs font-bold text-gray-500 mb-1">{label}</p>
                    <video src={sizes[key]} controls className="w-full rounded" />
                    <a href={sizes[key]} download className="text-xs text-blue-500 underline mt-1 block">
                      ダウンロード
                    </a>
                  </div>
                )
              ))}
            </div>
          ))}
        </div>
      )}

      {/* 文言生成中 */}
      {generating && (
        <div className="mt-4 text-center text-sm text-gray-500">
          AI が各SNS用の文言を生成中...
        </div>
      )}

      {/* 生成済み文言 */}
      {captions && (
        <div className="mt-6 space-y-4">
          <h2 className="font-bold text-lg">SNS投稿文（自動生成）</h2>

          {[
            { key: "instagram", label: "Instagram" },
            { key: "tiktok",    label: "TikTok" },
            { key: "x",         label: "X (Twitter)" },
            { key: "line",      label: "LINE" },
            { key: "threads",   label: "Threads" },
          ].map(({ key, label }) => (
            <div key={key} className="border rounded p-3">
              <p className="text-xs font-bold text-gray-500 mb-1">{label}</p>
              <p className="text-sm whitespace-pre-wrap">{captions.captions[key]}</p>
              <button
                onClick={() => navigator.clipboard.writeText(captions.captions[key])}
                className="mt-2 text-xs text-gray-400 underline"
              >
                コピー
              </button>
            </div>
          ))}

          {captions.xUrl && (
            <a
              href={captions.xUrl}
              target="_blank"
              className="block w-full text-center bg-black text-white py-2 rounded text-sm"
            >
              Xに投稿する
            </a>
          )}
        </div>
      )}
    </main>
  );
}
