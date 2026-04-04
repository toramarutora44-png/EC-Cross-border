"use client";

import { useState, useMemo } from "react";
import { pinyin } from "pinyin-pro";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  { value: "clothes", cn: "服装", en: "Clothes" },
  { value: "bags", cn: "包包", en: "Bags" },
  { value: "dolls", cn: "玩偶", en: "Dolls" },
  { value: "accessories", cn: "饰品", en: "Accessories" },
  { value: "goods", cn: "杂货", en: "Goods" },
];

const t = {
  cn: {
    title: "添加商品",
    step1: "上传图片/视频",
    step1sub: "最多5个文件（图片或视频）",
    tap: "点击选择图片/视频",
    step2: "基本信息",
    required: "* = 必填",
    productName: "商品名",
    productNameEx: "例: 毛绒小熊挂件",
    category: "分类",
    priceCNY: "进货价（元）",
    priceEx: "例: 89",
    autoPrice: "自动计算日本售价",
    exchangeRate: "汇率",
    customs: "关税+消费税",
    ems: "EMS运费（中国→日本）",
    domestic: "日本国内运费",
    profit: "利润率",
    estimatedJPY: "预估日本售价",
    step3: "详细信息",
    step3sub: "写得越详细，生成效果越好",
    trendReason: "为什么流行?",
    trendReasonEx: "例: 小红书上很火，很多明星同款，适合送礼",
    useScene: "使用场景",
    useSceneEx: "例: 约会、逛街、日常通勤都可以背",
    goodReview: "好评",
    goodReviewEx: "例: 质量很好，手感柔软，颜色跟图片一样",
    badReview: "差评",
    badReviewEx: "例: 有点小，比想象中的小一号",
    features: "特点",
    featuresEx: "例: 纯手工制作，限量款，可以刻字定制",
    submit: "提交",
    uploading: "上传中...",
    success: "上传成功!",
    addMore: "继续添加",
    error: "请填写商品名并上传图片",
  },
  en: {
    title: "Add Product",
    step1: "Upload Photos / Videos",
    step1sub: "Up to 5 files (photos or videos)",
    tap: "Tap to select photos/videos",
    step2: "Basic Info",
    required: "* = required",
    productName: "Product Name",
    productNameEx: "e.g. Plush bear keychain",
    category: "Category",
    priceCNY: "Cost Price (CNY)",
    priceEx: "e.g. 89",
    autoPrice: "Auto-calculate Japan price",
    exchangeRate: "Exchange rate",
    customs: "Customs + tax",
    ems: "EMS (China→Japan)",
    domestic: "Japan domestic shipping",
    profit: "Profit margin",
    estimatedJPY: "Estimated Japan price",
    step3: "Details",
    step3sub: "More detail = better AI results",
    trendReason: "Why is it trending?",
    trendReasonEx: "e.g. Viral on Xiaohongshu, celebrity favorite",
    useScene: "When to use?",
    useSceneEx: "e.g. Dates, shopping, daily commute",
    goodReview: "Good reviews",
    goodReviewEx: "e.g. Great quality, soft texture",
    badReview: "Bad reviews",
    badReviewEx: "e.g. A bit small, smaller than expected",
    features: "Key features",
    featuresEx: "e.g. Handmade, limited edition",
    submit: "Submit",
    uploading: "Uploading...",
    success: "Upload Complete!",
    addMore: "Add More",
    error: "Please enter product name and upload images",
  },
};

const DEFAULT_RATE = 21.0;
const DEFAULT_CUSTOMS = 0.16;
const DEFAULT_EMS = 2000;
const DEFAULT_DOMESTIC = 800;
const DEFAULT_PROFIT = 0.30;

export default function UploadPage() {
  const [lang, setLang] = useState<"cn" | "en">("cn");
  const l = t[lang];

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("goods");
  const [priceCNY, setPriceCNY] = useState("");
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_RATE.toString());
  const [customsRate, setCustomsRate] = useState((DEFAULT_CUSTOMS * 100).toString());
  const [emsCost, setEmsCost] = useState(DEFAULT_EMS.toString());
  const [domesticCost, setDomesticCost] = useState(DEFAULT_DOMESTIC.toString());
  const [profitRate, setProfitRate] = useState((DEFAULT_PROFIT * 100).toString());
  const [trendReason, setTrendReason] = useState("");
  const [useScene, setUseScene] = useState("");
  const [goodReview, setGoodReview] = useState("");
  const [badReview, setBadReview] = useState("");
  const [features, setFeatures] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; isVideo: boolean }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [doneProductId, setDoneProductId] = useState("");
  const [snsGenerating, setSnsGenerating] = useState(false);
  const [snsImages, setSnsImages] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState("");
  const [showPriceDetail, setShowPriceDetail] = useState(false);

  const estimatedJPY = useMemo(() => {
    const cny = parseFloat(priceCNY);
    if (!cny || cny <= 0) return 0;
    const rate = parseFloat(exchangeRate) || DEFAULT_RATE;
    const customs = (parseFloat(customsRate) || 0) / 100;
    const ems = parseFloat(emsCost) || 0;
    const domestic = parseFloat(domesticCost) || 0;
    const profit = (parseFloat(profitRate) || 0) / 100;
    const base = cny * rate * (1 + customs) + ems + domestic;
    const total = base * (1 + profit);
    return Math.ceil(total / 100) * 100;
  }, [priceCNY, exchangeRate, customsRate, emsCost, profitRate]);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []).slice(0, 5);
    setFiles(selected);
    setPreviews(
      selected.map((f) => ({
        url: URL.createObjectURL(f),
        isVideo: f.type.startsWith("video/"),
      }))
    );
  }

  function removeFile(index: number) {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || files.length === 0) {
      setError(l.error);
      return;
    }
    setUploading(true);
    setError("");
    try {
      // 1. 3言語翻訳を先に生成（失敗してもアップロードは続行）
      let translations = {};
      try {
        const fillRes = await fetch("/api/fill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            category,
            trend_reason: trendReason || null,
            use_scene: useScene || null,
            good_review: goodReview || null,
            features: features || null,
          }),
        });
        if (fillRes.ok) translations = await fillRes.json();
      } catch {}

      // 2. 商品をDBに保存（翻訳込み）
      const { data: product, error: dbError } = await supabase
        .from("products")
        .insert({
          name_ja: name,
          slug: slug || null,
          category,
          sale_price: estimatedJPY || null,
          trend_reason: trendReason || null,
          use_scene: useScene || null,
          good_review: goodReview || null,
          bad_review: badReview || null,
          features: features || null,
          translations,
        })
        .select()
        .single();
      if (dbError) throw dbError;
      const productId = product.id;

      // 3. 画像をStorageにアップロード
      const imageUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop() || "jpg";
        const filePath = `${productId}/${i + 1}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("products")
          .getPublicUrl(filePath);
        imageUrls.push(urlData.publicUrl);
      }

      // 4. 画像URLを更新
      const { error: updateError } = await supabase
        .from("products")
        .update({ images: imageUrls })
        .eq("id", productId);
      if (updateError) throw updateError;

      setDoneProductId(productId);
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setUploading(false);
    }
  }

  function reset() {
    setName("");
    setSlug("");
    setCategory("goods");
    setPriceCNY("");
    setTrendReason("");
    setUseScene("");
    setGoodReview("");
    setBadReview("");
    setFeatures("");
    setFiles([]);
    setPreviews([]);
    setDone(false);
    setError("");
  }

  async function handleGenerateSnsImages() {
    setSnsGenerating(true);
    try {
      const res = await fetch("/api/sns-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: doneProductId }),
      });
      const data = await res.json();
      if (res.ok) setSnsImages(data.sns_images);
      else setError(data.error || "SNS画像生成エラー");
    } catch {
      setError("SNS画像生成エラー");
    } finally {
      setSnsGenerating(false);
    }
  }

  if (done) {
    const platformLabels: Record<string, string> = {
      instagram: "Instagram", tiktok: "TikTok", x: "X", threads: "Threads"
    };
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto text-center">
          <div className="text-5xl mb-3 text-green-500">&#10003;</div>
          <h2 className="text-xl font-bold mb-1">{l.success}</h2>
          {estimatedJPY > 0 && (
            <p className="text-gray-400 text-sm mb-4">
              {lang === "cn" ? "日本售价" : "Japan price"}: ¥{estimatedJPY.toLocaleString()}
            </p>
          )}

          {/* SNS画像生成 */}
          {!snsImages ? (
            <button
              onClick={handleGenerateSnsImages}
              disabled={snsGenerating}
              className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold mb-3 disabled:opacity-50"
            >
              {snsGenerating ? "生成中..." : "📸 SNS用画像を生成する"}
            </button>
          ) : (
            <div className="mb-4">
              <p className="text-sm font-bold text-gray-600 mb-3">SNS用画像</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(snsImages).map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                    className="block border rounded-xl overflow-hidden">
                    <img src={url} alt={platform} className="w-full aspect-square object-cover" />
                    <p className="text-xs text-center py-1 text-gray-500">{platformLabels[platform] || platform}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

          <button onClick={reset} className="w-full bg-black text-white py-3 rounded-xl font-bold">
            {l.addMore}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4 pb-20">
        <div className="flex items-center justify-between pt-4 pb-4">
          <div />
          <h1 className="text-xl font-bold">{l.title}</h1>
          <button
            type="button"
            onClick={() => setLang(lang === "cn" ? "en" : "cn")}
            className="bg-gray-200 text-xs font-bold px-3 py-1.5 rounded-full"
          >
            {lang === "cn" ? "EN" : "CN"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="font-bold mb-1">1. {l.step1}</h2>
            <p className="text-xs text-gray-400 mb-3">{l.step1sub}</p>
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {previews.map((p, i) => (
                  <div key={i} className="relative">
                    {p.isVideo ? (
                      <video src={p.url} className="w-full aspect-square object-cover rounded-lg" />
                    ) : (
                      <img src={p.url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                    )}
                    {p.isVideo && (
                      <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">VIDEO</div>
                    )}
                    <button type="button" onClick={() => removeFile(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center">x</button>
                  </div>
                ))}
              </div>
            )}
            {files.length < 5 && (
              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-black transition">
                <div className="text-3xl text-gray-300 mb-1">+</div>
                <span className="text-gray-400 text-sm">{l.tap}</span>
                <input type="file" accept="image/*,video/*" multiple onChange={handleFiles} className="hidden" />
              </label>
            )}
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="font-bold mb-1">2. {l.step2}</h2>
            <p className="text-xs text-gray-400 mb-3">{l.required}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{l.productName} *</label>
                <input
                  type="text"
                  placeholder={l.productNameEx}
                  value={name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setName(val);
                    const converted = pinyin(val, { toneType: "none", separator: "-" });
                    const generated = converted.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                    setSlug(generated || val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                  }}
                  maxLength={30}
                  className="w-full border rounded-xl px-4 py-3 text-sm"
                />
                <p className="text-xs text-gray-300 text-right mt-1">{name.length}/30</p>
                <div className="mt-2">
                  <label className="text-xs text-gray-400 block mb-1">URL slug * (英数字・ハイフンのみ　例: plush-bear)</label>
                  <input
                    type="text"
                    placeholder="plush-bear-keychain"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="w-full border rounded-xl px-4 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">{l.category} *</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`px-4 py-2 rounded-full text-sm transition ${
                        category === cat.value
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {lang === "cn" ? cat.cn : cat.en}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">{l.priceCNY}</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">¥</span>
                  <input type="number" placeholder={l.priceEx} value={priceCNY} onChange={(e) => setPriceCNY(e.target.value)} className="flex-1 border rounded-xl px-4 py-3 text-sm" />
                  <span className="text-xs text-gray-400">CNY</span>
                </div>
              </div>

              {priceCNY && parseFloat(priceCNY) > 0 && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">{l.estimatedJPY}</span>
                    <span className="text-lg font-bold text-blue-600">¥{estimatedJPY.toLocaleString()} JPY</span>
                  </div>
                  <button type="button" onClick={() => setShowPriceDetail(!showPriceDetail)} className="text-xs text-blue-500 underline">
                    {showPriceDetail ? (lang === "cn" ? "收起" : "Hide") : (lang === "cn" ? "查看计算明细" : "Show breakdown")}
                  </button>
                  {showPriceDetail && (
                    <div className="mt-3 space-y-2 border-t pt-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-500">{l.exchangeRate}</label>
                        <input type="number" step="0.1" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} className="w-20 border rounded-lg px-2 py-1 text-xs text-right" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-500">{l.customs}</label>
                        <div className="flex items-center gap-1">
                          <input type="number" value={customsRate} onChange={(e) => setCustomsRate(e.target.value)} className="w-16 border rounded-lg px-2 py-1 text-xs text-right" />
                          <span className="text-xs text-gray-400">%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-500">{l.ems}</label>
                        <div className="flex items-center gap-1">
                          <input type="number" value={emsCost} onChange={(e) => setEmsCost(e.target.value)} className="w-20 border rounded-lg px-2 py-1 text-xs text-right" />
                          <span className="text-xs text-gray-400">JPY</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-500">{l.domestic}</label>
                        <div className="flex items-center gap-1">
                          <input type="number" value={domesticCost} onChange={(e) => setDomesticCost(e.target.value)} className="w-20 border rounded-lg px-2 py-1 text-xs text-right" />
                          <span className="text-xs text-gray-400">JPY</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-500">{l.profit}</label>
                        <div className="flex items-center gap-1">
                          <input type="number" value={profitRate} onChange={(e) => setProfitRate(e.target.value)} className="w-16 border rounded-lg px-2 py-1 text-xs text-right" />
                          <span className="text-xs text-gray-400">%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="font-bold mb-1">3. {l.step3}</h2>
            <p className="text-xs text-gray-400 mb-3">{l.step3sub}</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{l.trendReason}</label>
                <textarea placeholder={l.trendReasonEx} value={trendReason} onChange={(e) => setTrendReason(e.target.value)} rows={2} maxLength={100} className="w-full border rounded-xl px-4 py-3 text-sm" />
                <p className="text-xs text-gray-300 text-right mt-1">{trendReason.length}/100</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{l.useScene}</label>
                <textarea placeholder={l.useSceneEx} value={useScene} onChange={(e) => setUseScene(e.target.value)} rows={2} maxLength={100} className="w-full border rounded-xl px-4 py-3 text-sm" />
                <p className="text-xs text-gray-300 text-right mt-1">{useScene.length}/100</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{l.goodReview}</label>
                <textarea placeholder={l.goodReviewEx} value={goodReview} onChange={(e) => setGoodReview(e.target.value)} rows={2} maxLength={150} className="w-full border rounded-xl px-4 py-3 text-sm" />
                <p className="text-xs text-gray-300 text-right mt-1">{goodReview.length}/150</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{l.badReview}</label>
                <textarea placeholder={l.badReviewEx} value={badReview} onChange={(e) => setBadReview(e.target.value)} rows={2} maxLength={150} className="w-full border rounded-xl px-4 py-3 text-sm" />
                <p className="text-xs text-gray-300 text-right mt-1">{badReview.length}/150</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{l.features}</label>
                <textarea placeholder={l.featuresEx} value={features} onChange={(e) => setFeatures(e.target.value)} rows={2} maxLength={100} className="w-full border rounded-xl px-4 py-3 text-sm" />
                <p className="text-xs text-gray-300 text-right mt-1">{features.length}/100</p>
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button type="submit" disabled={uploading} className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50">
            {uploading ? l.uploading : l.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
