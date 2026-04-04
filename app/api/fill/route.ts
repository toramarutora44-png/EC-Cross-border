import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { name, category, trend_reason, use_scene, good_review, features } = await req.json();

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "no key" }, { status: 500 });
    }

    const prompt = `あなたは日本向けECサイトのコピーライターです。
以下の商品情報をもとに、購買意欲を自然に高める短い文章を生成してください。
大げさな表現・感嘆符の多用・「激安」「爆売れ」などの過剰な言葉は使わないこと。
シンプルで信頼感のある文体にすること。

商品名: ${name}
カテゴリ: ${category || "未分類"}
既存の流行理由: ${trend_reason || "なし"}
既存の使用シーン: ${use_scene || "なし"}
既存の口コミ: ${good_review || "なし"}
既存の特徴: ${features || "なし"}

以下のJSONのみ返してください（他のテキスト不要）:
{
  "trend_reason": "なぜ今注目されているか（1〜2文、なければ商品名から推測）",
  "use_scene": "どんな場面で使うか（1〜2文、具体的に）",
  "good_review": "購入者が感じる良さ（1〜2文、口コミ調で）",
  "features": "商品の特徴（1〜2文、素材・デザイン・サイズ感など）"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
        }),
      }
    );

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "parse error" }, { status: 500 });

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
