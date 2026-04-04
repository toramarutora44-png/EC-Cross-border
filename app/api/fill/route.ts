import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { name, category, trend_reason, use_scene, good_review, features } = await req.json();

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "no key" }, { status: 500 });
    }

    const prompt = `あなたは日本向けECサイトのコピーライターです。
以下の商品情報をもとに、購買意欲を自然に高める短い文章を日本語・中国語・英語の3言語で生成してください。
大げさな表現・感嘆符の多用・「激安」「爆売れ」などの過剰な言葉は使わないこと。
シンプルで信頼感のある文体にすること。

商品名: ${name}
カテゴリ: ${category || "未分類"}
既存情報(trend_reason): ${trend_reason || "なし"}
既存情報(use_scene): ${use_scene || "なし"}
既存情報(good_review): ${good_review || "なし"}
既存情報(features): ${features || "なし"}

以下のJSONのみ返してください（他のテキスト不要）:
{
  "ja": {
    "trend_reason": "なぜ今注目されているか（1〜2文）",
    "use_scene": "どんな場面で使うか（1〜2文、具体的に）",
    "good_review": "購入者が感じる良さ（口コミ調で1〜2文）",
    "features": "商品の特徴（1〜2文）"
  },
  "zh": {
    "trend_reason": "为什么受关注（1〜2句）",
    "use_scene": "使用场景（1〜2句，具体）",
    "good_review": "买家感受（评价风格，1〜2句）",
    "features": "商品特点（1〜2句）"
  },
  "en": {
    "trend_reason": "Why it's trending (1-2 sentences)",
    "use_scene": "When and how to use it (1-2 sentences)",
    "good_review": "What buyers love about it (review style, 1-2 sentences)",
    "features": "Product features (1-2 sentences)"
  }
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1200 },
        }),
      }
    );

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!content) {
      return NextResponse.json({ error: "parse error", raw: JSON.stringify(data).slice(0, 300) }, { status: 500 });
    }
    const cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "parse error", raw: content.slice(0, 200) }, { status: 500 });
    }

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
