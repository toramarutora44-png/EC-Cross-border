import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const SITE_URL = "https://ec-crossborder.vercel.app";
const LINE_URL = "https://line.me/R/ti/p/@143xkgim";

async function fetchTrends(): Promise<string> {
  try {
    const res = await fetch("https://trends.google.co.jp/trending/rss?geo=JP");
    const text = await res.text();
    const titles = text.match(/<title>(?!Daily Search Trends)(.*?)<\/title>/g) || [];
    return titles.map((t) => t.replace(/<\/?title>/g, "")).slice(0, 10).join(", ");
  } catch {
    return "";
  }
}

async function fetchSNSInsights(productName: string, category: string): Promise<string> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;
  if (!apiKey || !cseId) return "";

  try {
    const query = encodeURIComponent(`${productName} ${category} cute kawaii trending`);
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${query}&num=5&lr=lang_ja`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.items) return "";
    return data.items
      .map((item: any) => `・${item.title}: ${item.snippet || ""}`)
      .join("\n")
      .slice(0, 800);
  } catch {
    return "";
  }
}

function buildPrompt(product: any, trends: string, lang: string, snsInsights: string): string {
  const productUrl = `${SITE_URL}/product/${product.id}`;
  const langLabel = lang === "ja" ? "日本語" : lang === "zh" ? "中国語" : "英語";

  return `あなたはSNSマーケティングの専門家です。以下の商品について、${langLabel}で、TikTok・Instagram・X・Threadsそれぞれに最適化した投稿を生成してください。

【最重要：トレンド分析に基づく生成】
以下のデータを分析し、投稿の構成・デザイン・文言に反映すること。

[2025年のSNSトレンド]
TikTok: UGC風、冒頭0.5秒テキストオーバーレイ、Before/After形式、ASMR開封、3秒ルール、ナレーション+テキスト同時表示
Instagram: カルーセル教育コンテンツ、テキスト多めリール、ミニVlog、問題→解決構成、「保存してね」が最強CTA
X: 実体験ベース、比較画像、数字インパクト、引用RT狙い、スレッド形式
Threads: 会話的トーン、日常の気づき、短いストーリー、コミュニティ対話型

[日本のGoogle Trendsトップキーワード]
${trends || "取得中"}

[SNS上の関連投稿・バズコンテンツ調査結果]
${snsInsights || "取得中"}

[LP/ECデザイントレンド2025]
- ファーストビューに動画/GIF
- 口コミ・UGCセクション強化
- 在庫表示で緊急性
- CTAボタンだけ目立つ色（赤/オレンジ）
- 生活感のあるシーン写真

【生成ルール】
- ${langLabel}のネイティブ表現で書くこと（翻訳調NG）
- "いいね"ではなく"売上（CVR）"を最優先
- 冒頭フックは上記トレンドのパターンを使うこと
- 投稿文の中にLP URL（${productUrl}）を自然に含めること
- DM/LINE（${LINE_URL}）からの注文導線も入れること
- ハッシュタグは${langLabel}圏で実際に使われているものを選ぶこと

【推奨投稿時間】
TikTok: ${lang === "ja" ? "12:00, 18:00-21:00 JST" : lang === "zh" ? "12:00, 19:00-22:00 CST" : "17:00-21:00 local"}
Instagram: ${lang === "ja" ? "7:00-8:00, 12:00, 20:00-22:00 JST" : lang === "zh" ? "7:00, 12:00, 20:00 CST" : "11:00, 14:00 local"}
X: ${lang === "ja" ? "7:00-8:00, 12:00, 20:00-23:00 JST" : lang === "zh" ? "8:00, 12:00, 21:00 CST" : "9:00, 12:00 local"}
Threads: ${lang === "ja" ? "8:00, 12:00, 21:00 JST" : lang === "zh" ? "9:00, 12:00, 21:00 CST" : "10:00, 19:00 local"}

【商品情報】
商品名: ${product.name_ja || product.name}
価格: ${product.sale_price ? `¥${product.sale_price.toLocaleString()}` : product.price ? `¥${product.price.toLocaleString()}` : "未設定"}
流行理由: ${product.trend_reason || "未入力"}
使用シーン: ${product.use_scene || "未入力"}
良い口コミ: ${product.good_review || "未入力"}
悪い口コミ: ${product.bad_review || "未入力"}
特徴: ${product.features || "未入力"}
商品ページURL: ${productUrl}

【出力形式】JSON配列のみ。他のテキスト不要。
[
  {
    "platform": "TikTok",
    "caption": "投稿文（${langLabel}、末尾にLP+DM誘導）",
    "hashtags": "#タグ1 #タグ2 ...（${langLabel}圏タグ）",
    "hook": "冒頭0.5秒フレーズ",
    "structure": "秒単位の動画構成",
    "thumbnail_text": "サムネテキスト（6字以内）",
    "music_style": "推奨BGM",
    "best_time": "推奨投稿時間",
    "design_tips": "画像/動画のデザインアドバイス（フォント・色・レイアウト）"
  },
  {
    "platform": "Instagram",
    "caption": "投稿文（${langLabel}、保存誘導+LP+DM）",
    "hashtags": "#タグ1 #タグ2 ...（${langLabel}圏タグ）",
    "hook": "冒頭フレーズ",
    "structure": "カルーセル/リール構成",
    "thumbnail_text": "画像テキスト",
    "music_style": "推奨BGM",
    "best_time": "推奨投稿時間",
    "design_tips": "デザインアドバイス"
  },
  {
    "platform": "X",
    "caption": "投稿文（${langLabel}、140字以内）",
    "hashtags": "#タグ1 #タグ2",
    "hook": "冒頭フレーズ",
    "structure": "スレッド構成",
    "thumbnail_text": "画像テキスト",
    "music_style": "N/A",
    "best_time": "推奨投稿時間",
    "design_tips": "デザインアドバイス"
  },
  {
    "platform": "Threads",
    "caption": "投稿文（${langLabel}、会話的、500字以内）",
    "hashtags": "#タグ1 #タグ2",
    "hook": "冒頭フレーズ",
    "structure": "投稿構成",
    "thumbnail_text": "画像テキスト",
    "music_style": "N/A",
    "best_time": "推奨投稿時間",
    "design_tips": "デザインアドバイス"
  }
]`;
}

export async function POST(req: NextRequest) {
  try {
    const { productId, lang = "ja" } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "商品IDが必要です" }, { status: 400 });
    }
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini APIキーが設定されていません。" },
        { status: 500 }
      );
    }

    const [productRes, trends] = await Promise.all([
      supabase.from("products").select("*").eq("id", productId).single(),
      fetchTrends(),
    ]);

    const snsInsights = await fetchSNSInsights(
      productRes.data?.name_ja || productRes.data?.name || "",
      productRes.data?.category || ""
    );

    if (productRes.error || !productRes.data) {
      return NextResponse.json({ error: "商品が見つかりません" }, { status: 404 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "あなたはSNSマーケティングの専門家です。2025年最新のトレンド分析に基づいて、売上に直結する投稿を生成します。JSON配列のみを返してください。\n\n" + buildPrompt(productRes.data, trends, lang, snsInsights)
            }]
          }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 4000 },
        }),
      }
    );

    const aiData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: aiData.error?.message || "AI生成に失敗しました" },
        { status: 500 }
      );
    }

    const content = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "生成結果の解析に失敗しました" }, { status: 500 });
    }

    const results = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ results, trends_used: trends, sns_insights_used: snsInsights });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "エラーが発生しました" }, { status: 500 });
  }
}
