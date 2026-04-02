import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

const SITE_URL = "https://ec-crossborder.vercel.app";
const LINE_URL = "https://lin.ee/wuKhILR";

function buildPrompt(product: any): string {
  const imageUrl = product.images?.[0] || "";
  const productUrl = `${SITE_URL}/product/${product.id}`;

  return `あなたはSNSマーケティングの専門家です。以下の商品情報をもとに、TikTok・Instagram・Xそれぞれに最適化したバズる投稿を生成してください。

【重要ルール】
- SNSのTOP20投稿を分析した結果に基づく構成にすること
- "いいね"ではなく"売上（CVR）"を最優先にすること
- 冒頭0.5秒で止まる強烈なフックを入れること
- 各媒体の文化・アルゴリズムに合わせること

【LP誘導ルール ※必ず守ること】
- 投稿文の最後に必ず商品ページURL（${productUrl}）を含めること
- 「プロフィールのリンクから」「詳細はプロフへ」などプロフィール誘導も入れること
- DM・LINE（${LINE_URL}）からの注文も受け付ける旨を自然に入れること
- 導線は2つ：① SNS → LP（メイン）② DM/LINE → 直接注文（サブ）

【商品情報】
商品名: ${product.name}
価格: ${product.price ? `¥${product.price.toLocaleString()}` : "未設定"}
流行理由: ${product.trend_reason || "未入力"}
使用シーン: ${product.use_scene || "未入力"}
良い口コミ: ${product.good_review || "未入力"}
悪い口コミ: ${product.bad_review || "未入力"}
特徴: ${product.features || "未入力"}
画像URL: ${imageUrl}
商品ページURL: ${productUrl}
LINE: ${LINE_URL}

【出力形式】
以下のJSON配列で返してください。他のテキストは不要です。
[
  {
    "platform": "TikTok",
    "caption": "投稿文（TikTok向け、短くインパクト重視、末尾にLP誘導+DM歓迎）",
    "hashtags": "#ハッシュタグ1 #ハッシュタグ2 ...",
    "hook": "冒頭0.5秒のフレーズ（スクロールを止める一言）",
    "structure": "0-1秒: フック\\n1-5秒: 問題提起\\n5-15秒: 商品紹介\\n15-25秒: 使用シーン\\n25-30秒: CTA（プロフのリンクへ）",
    "thumbnail_text": "サムネイルに載せる短いテキスト（6文字以内）",
    "music_style": "推奨BGMのジャンル・雰囲気"
  },
  {
    "platform": "Instagram",
    "caption": "投稿文（Instagram向け、ストーリー性重視、末尾にLP誘導+DM歓迎）",
    "hashtags": "#ハッシュタグ1 #ハッシュタグ2 ...",
    "hook": "冒頭のフレーズ",
    "structure": "1枚目: フック画像\\n2枚目: 問題提起\\n3枚目: 解決策\\n4枚目: 商品紹介\\n5枚目: CTA（プロフのリンク or DM）",
    "thumbnail_text": "画像に載せるテキスト",
    "music_style": "リール用BGMの雰囲気"
  },
  {
    "platform": "X",
    "caption": "投稿文（X向け、140字以内、バズ狙い、リンク付き）",
    "hashtags": "#ハッシュタグ1 #ハッシュタグ2",
    "hook": "冒頭のフレーズ",
    "structure": "1ツイート目: フック\\n2ツイート目: 詳細+画像\\n3ツイート目: LP URL + LINE誘導",
    "thumbnail_text": "画像に載せるテキスト",
    "music_style": "N/A"
  }
]`;
}

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "商品IDが必要です" }, { status: 400 });
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI APIキーが設定されていません。.env.localにOPENAI_API_KEYを追加してください。" },
        { status: 500 }
      );
    }

    // Fetch product from DB
    const { data: product, error: dbError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (dbError || !product) {
      return NextResponse.json({ error: "商品が見つかりません" }, { status: 404 });
    }

    // Call OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "あなたはSNSマーケティングの専門家です。JSON配列のみを返してください。",
          },
          {
            role: "user",
            content: buildPrompt(product),
          },
        ],
        temperature: 0.8,
        max_tokens: 3000,
      }),
    });

    const aiData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: aiData.error?.message || "AI生成に失敗しました" },
        { status: 500 }
      );
    }

    const content = aiData.choices[0].message.content;

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "生成結果の解析に失敗しました" },
        { status: 500 }
      );
    }

    const results = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ results });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "エラーが発生しました" },
      { status: 500 }
    );
  }
}
